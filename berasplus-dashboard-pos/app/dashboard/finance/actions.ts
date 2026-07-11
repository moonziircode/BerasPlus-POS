'use server'

import { createClient } from '@/utils/supabase/server'

export async function getFinanceMetrics(storeId: string) {
  const supabase = await createClient()

  // 1. Fetch total sales (income)
  const { data: sales, error: salesErr } = await supabase
    .from('sales_transactions')
    .select('total, discount, tax, status')
    .eq('store_id', storeId)

  if (salesErr) {
    console.error('Error fetching sales for finance:', salesErr)
  }

  // 2. Fetch total expenses (pengeluaran)
  const { data: expenses, error: expErr } = await supabase
    .from('store_expenses')
    .select('amount, category, is_approved_by_owner')
    .eq('store_id', storeId)

  if (expErr) {
    console.error('Error fetching expenses for finance:', expErr)
  }

  // Calculations
  const activeSales = sales?.filter(s => s.status !== 'VOID') || []
  const voidSales = sales?.filter(s => s.status === 'VOID') || []

  const totalIncome = activeSales.reduce((sum, s) => sum + Number(s.total), 0) || 0
  const totalDiscounts = activeSales.reduce((sum, s) => sum + Number(s.discount), 0) || 0
  const totalTax = activeSales.reduce((sum, s) => sum + Number(s.tax), 0) || 0

  const approvedExpenses = expenses?.filter(e => e.is_approved_by_owner) || []
  const pendingExpenses = expenses?.filter(e => !e.is_approved_by_owner) || []
  
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const totalApprovedExpenses = approvedExpenses.reduce((sum, e) => sum + Number(e.amount), 0) || 0

  const netProfit = totalIncome - totalApprovedExpenses

  return {
    totalIncome,
    totalDiscounts,
    totalTax,
    totalExpenses,
    totalApprovedExpenses,
    netProfit,
    voidCount: voidSales.length,
    pendingExpenseCount: pendingExpenses.length,
  }
}

export async function getRecentExpenses(storeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('store_expenses')
    .select(`
      id,
      amount,
      category,
      description,
      is_approved_by_owner,
      created_at
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching recent expenses:', error)
    return []
  }

  return data || []
}

export async function getPaymentMethodBreakdown(storeId: string) {
  const supabase = await createClient()

  // We can query sales_payments and join with sales_transactions
  const { data, error } = await supabase
    .from('sales_payments')
    .select(`
      amount,
      payment_method,
      sales_transactions!inner(store_id, status)
    `)
    .eq('sales_transactions.store_id', storeId)
    .neq('sales_transactions.status', 'VOID')

  if (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }

  const grouped: Record<string, number> = {}
  data?.forEach(p => {
    const method = p.payment_method || 'CASH'
    grouped[method] = (grouped[method] || 0) + Number(p.amount)
  })

  return Object.entries(grouped).map(([method, amount]) => ({
    name: method,
    value: amount
  }))
}

export async function getFinanceChartData(storeId: string) {
  const supabase = await createClient()

  // 30 Days chart
  const d = new Date()
  d.setDate(d.getDate() - 30)
  d.setHours(0,0,0,0)
  const dIso = d.toISOString()

  // Fetch sales
  const { data: sales } = await supabase
    .from('sales_transactions')
    .select('created_at, total')
    .eq('store_id', storeId)
    .neq('status', 'VOID')
    .gte('created_at', dIso)

  // Fetch expenses
  const { data: expenses } = await supabase
    .from('store_expenses')
    .select('created_at, amount')
    .eq('store_id', storeId)
    .gte('created_at', dIso)

  const dailyData: Record<string, { income: number; expense: number }> = {}

  // Initialize past 30 days keys
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    dailyData[key] = { income: 0, expense: 0 }
  }

  sales?.forEach(s => {
    const key = new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    if (dailyData[key]) {
      dailyData[key].income += Number(s.total)
    }
  })

  expenses?.forEach(e => {
    const key = new Date(e.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    if (dailyData[key]) {
      dailyData[key].expense += Number(e.amount)
    }
  })

  return Object.entries(dailyData).map(([date, val]) => ({
    date,
    income: val.income / 1000, // Show in thousands
    expense: val.expense / 1000
  }))
}

export async function createExpense(formData: {
  store_id: string
  amount: number
  category: 'Listrik & Air' | 'Retribusi Keamanan' | 'Pembelian ATK' | 'Lain-lain'
  description?: string
}) {
  const supabase = await createClient()

  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User tidak terautentikasi.')

  // Fetch store user roles to find if owner
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const isOwner = userRole?.role === 'OWNER'

  const { error } = await supabase
    .from('store_expenses')
    .insert([{
      store_id: formData.store_id,
      cashier_id: user.id,
      amount: formData.amount,
      category: formData.category,
      description: formData.description || null,
      is_approved_by_owner: isOwner // Auto-approve if created by Owner
    }])

  if (error) {
    throw new Error(`Gagal menyimpan pengeluaran: ${error.message}`)
  }
}

export async function approveExpense(expenseId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('store_expenses')
    .update({ is_approved_by_owner: true })
    .eq('id', expenseId)

  if (error) {
    throw new Error(`Gagal menyetujui pengeluaran: ${error.message}`)
  }
}
