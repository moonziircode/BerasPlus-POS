'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPOSData(storeId: string) {
  const supabase = await createClient()

  // 1. Get Selling Products
  const { data: products, error: productsError } = await supabase
    .from('selling_products')
    .select('*')
    .eq('status', 'Active')

  if (productsError) {
    console.error('Error fetching selling products:', productsError)
    return { error: productsError.message, products: [], customers: [] }
  }

  // 2. Get Stock Balances
  const { data: stocks, error: stocksError } = await supabase
    .from('inventory_balances_view')
    .select('*')
    .eq('product_type', 'SELLING_PRODUCT')
    .eq('store_id', storeId) 

  if (stocksError) {
    console.error('Error fetching stocks:', stocksError)
  }

  // 3. Map stocks to products
  const productsWithStock = products?.map((product) => {
    const stockInfo = stocks?.find((s) => s.product_id === product.id)
    return {
      ...product,
      current_stock: stockInfo ? Number(stockInfo.current_stock_kg) : 0,
    }
  }) || []

  // 4. Get Customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  if (customersError) {
    console.error('Error fetching customers:', customersError)
  }

  return { 
    products: productsWithStock, 
    customers: customers || [] 
  }
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  if (!name) return { error: 'Name is required' }

  const { data, error } = await supabase
    .from('customers')
    .insert([{ name, phone, address }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/sales')
  return { success: true, customer: data }
}

export async function processCheckout(payload: {
  store_id: string,
  customer_id: string | null,
  subtotal: number,
  discount: number,
  tax: number,
  total: number,
  notes: string,
  payment_method: string,
  payment_amount: number,
  items: Array<{
    selling_product_id: string,
    quantity: number,
    price_per_unit: number,
    hpp_per_unit: number,
    subtotal: number,
    discount: number,
    total: number
  }>
}) {
  const supabase = await createClient()

  // Get current user (cashier)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const { data: transactionId, error } = await supabase.rpc('process_pos_transaction', {
      p_store_id: payload.store_id,
      p_cashier_id: user.id,
      p_customer_id: payload.customer_id,
      p_subtotal: payload.subtotal,
      p_discount: payload.discount,
      p_tax: payload.tax,
      p_total: payload.total,
      p_notes: payload.notes,
      p_payment_method: payload.payment_method,
      p_payment_amount: payload.payment_amount,
      p_items: payload.items
    })

    if (error) {
      console.error('Checkout error:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard') // Update dashboard stats
    return { success: true, transactionId }
  } catch (err: any) {
    console.error('Checkout unexpected error:', err)
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function getSalesTransactions(filters: {
  search?: string,
  dateStart?: string,
  dateEnd?: string,
  storeId?: string,
  paymentMethod?: string,
  status?: string,
  sortBy?: 'latest' | 'oldest',
  page?: number,
  pageSize?: number
}) {
  const supabase = await createClient()

  // Base query
  let query = supabase
    .from('sales_transactions')
    .select(`
      id,
      created_at,
      transaction_number,
      total,
      subtotal,
      discount,
      tax,
      payment_method,
      status,
      notes,
      stores ( name ),
      users ( full_name ),
      customers ( name ),
      sales_transaction_items (
        id,
        quantity,
        price_per_unit,
        hpp_per_unit,
        subtotal,
        discount,
        total,
        selling_products ( name )
      )
    `, { count: 'exact' })

  // Apply filters
  if (filters.storeId) {
    query = query.eq('store_id', filters.storeId)
  }
  if (filters.paymentMethod) {
    query = query.eq('payment_method', filters.paymentMethod)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.dateStart) {
    query = query.gte('created_at', filters.dateStart)
  }
  if (filters.dateEnd) {
    query = query.lte('created_at', filters.dateEnd)
  }
  if (filters.search) {
    query = query.or(`transaction_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
  }

  // Sorting
  const isAscending = filters.sortBy === 'oldest'
  query = query.order('created_at', { ascending: isAscending })

  // Pagination
  const page = filters.page || 1
  const pageSize = filters.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching sales transactions:', error)
    return { data: [], count: 0, error: error.message }
  }

  return { data: data || [], count: count || 0 }
}

export async function getStores() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stores')
    .select('id, name')
    .order('name')
  if (error) return []
  return data || []
}

