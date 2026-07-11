'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardMetrics(storeId: string) {
  const supabase = await createClient()
  
  // Today's date range
  const today = new Date()
  today.setHours(0,0,0,0)
  const todayIso = today.toISOString()
  
  // 1. Sales & Orders Today
  const { data: salesToday } = await supabase
    .from('sales_transactions')
    .select('id, total, created_at')
    .eq('store_id', storeId)
    .gte('created_at', todayIso)
    
  const penjualanHariIni = salesToday?.reduce((sum, tx) => sum + Number(tx.total), 0) || 0
  const orderCount = salesToday?.length || 0
  
  // 2. Profit Today (Needs items)
  // Since supabase doesn't easily sum deeply nested relationships in a single go without RPC, 
  // we'll fetch items for today's transactions if there are any
  let profitHariIni = 0
  if (salesToday && salesToday.length > 0) {
    const txIds = salesToday.map(tx => tx.id)
    const { data: items } = await supabase
      .from('sales_transaction_items')
      .select('quantity, price_per_unit, hpp_per_unit')
      .in('transaction_id', txIds)
      
    profitHariIni = items?.reduce((sum, item) => {
      const margin = Number(item.price_per_unit) - Number(item.hpp_per_unit)
      return sum + (margin * Number(item.quantity))
    }, 0) || 0
  }

  // 3. Customer Count (Total customers)
  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    
  // 4. Batch Mixing Today
  const { count: batchCount } = await supabase
    .from('mixing_batches')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayIso)

  // 5. Low Stock Alert (Products with stock <= 10)
  const { data: stocks } = await supabase
    .from('inventory_balances_view')
    .select('product_id, current_stock_kg')
    .eq('product_type', 'SELLING_PRODUCT')
    .eq('store_id', storeId)
    
  const lowStockCount = stocks?.filter(s => Number(s.current_stock_kg) <= 10).length || 0
  
  // 6. Nilai Persediaan (Estimated)
  // Simply join selling_products hpp_average with stocks
  const { data: products } = await supabase
    .from('selling_products')
    .select('id, hpp_average')
    
  let nilaiPersediaan = 0
  if (stocks && products) {
    stocks.forEach(stock => {
      const p = products.find(p => p.id === stock.product_id)
      if (p) {
        nilaiPersediaan += Number(stock.current_stock_kg) * Number(p.hpp_average)
      }
    })
  }

  return {
    penjualanHariIni,
    profitHariIni,
    orderCount,
    customerCount: customerCount || 0,
    batchCount: batchCount || 0,
    lowStockCount,
    nilaiPersediaan,
    // Add dummy trend strings for UI
    trends: {
      penjualan: '+0% dari kemarin',
      profit: 'Margin ' + (penjualanHariIni > 0 ? Math.round((profitHariIni/penjualanHariIni)*100) : 0) + '%',
      order: '+0% dari kemarin',
      customer: 'Total',
    }
  }
}

export async function getRecentTransactions(storeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales_transactions')
    .select(`
      id, 
      created_at, 
      total, 
      payment_method, 
      status, 
      customers (name),
      sales_transaction_items (
        quantity,
        selling_products (name)
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching recent transactions:', error)
    return []
  }

  return data.map((tx: any) => {
    const time = new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const cust = tx.customers?.name || 'Walk-in'
    
    // Just get the first product name for summary
    const firstItem = tx.sales_transaction_items?.[0]
    const prod = firstItem?.selling_products?.name || 'Multiple Products'
    const qtyCount = tx.sales_transaction_items?.reduce((sum: number, item: any) => sum + Number(item.quantity), 0) || 0

    return {
      id: tx.id,
      time,
      type: 'Penjualan',
      cust,
      prod: tx.sales_transaction_items?.length > 1 ? `${prod} +${tx.sales_transaction_items.length - 1} lainnya` : prod,
      qty: `${qtyCount}`,
      total: `Rp ${Number(tx.total).toLocaleString('id-ID')}`,
      meth: tx.payment_method || 'Tunai',
      status: tx.status
    }
  })
}

export async function getChartData(storeId: string) {
  const supabase = await createClient()

  // Past 30 days
  const d = new Date()
  d.setDate(d.getDate() - 30)
  d.setHours(0,0,0,0)

  const { data } = await supabase
    .from('sales_transactions')
    .select('created_at, total')
    .eq('store_id', storeId)
    .gte('created_at', d.toISOString())
    .order('created_at')

  const grouped: Record<string, number> = {}
  data?.forEach(tx => {
    const dateStr = new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    grouped[dateStr] = (grouped[dateStr] || 0) + Number(tx.total)
  })

  // Format into array for recharts
  // Format into array for recharts
  return Object.keys(grouped).map(date => ({
    date,
    sales: grouped[date] / 1000000 // Convert to millions for easier viewing on chart
  }))
}

export async function getLowStockAlerts(storeId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('inventory_balances_view')
    .select('product_name, current_stock_kg')
    .eq('product_type', 'SELLING_PRODUCT')
    .eq('store_id', storeId)
    .lte('current_stock_kg', 10)
    .order('current_stock_kg', { ascending: true })
    .limit(5)

  return data?.map(item => ({
    name: item.product_name,
    pack: `Sisa ${item.current_stock_kg} Kg`,
    alert: Number(item.current_stock_kg) <= 2 ? 'Kritis' : 'Hampir Habis',
    days: Number(item.current_stock_kg) <= 2 ? 'Segera isi' : 'Siapkan restock',
    type: Number(item.current_stock_kg) <= 2 ? 'critical' : 'warning'
  })) || []
}

export async function getTopProducts(storeId: string) {
  const supabase = await createClient()

  // Past 30 days
  const d = new Date()
  d.setDate(d.getDate() - 30)
  
  const { data, error } = await supabase
    .from('sales_transactions')
    .select(`
      sales_transaction_items (
        quantity,
        selling_products (name)
      )
    `)
    .eq('store_id', storeId)
    .gte('created_at', d.toISOString())

  if (error) return []

  const prodCount: Record<string, number> = {}
  data?.forEach(tx => {
    tx.sales_transaction_items?.forEach((item: any) => {
      const name = item.selling_products?.name
      if (name) {
        prodCount[name] = (prodCount[name] || 0) + Number(item.quantity)
      }
    })
  })

  const sorted = Object.entries(prodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const maxVal = sorted[0]?.[1] || 1

  return sorted.map(([name, val], index) => ({
    rank: index + 1,
    name,
    val: `${val} Qty`,
    pct: Math.round((val / maxVal) * 100)
  }))
}

export async function getTodayMixing(storeId: string) {
  const supabase = await createClient()

  const d = new Date()
  d.setHours(0,0,0,0)

  const { data, error } = await supabase
    .from('mixing_batches')
    .select(`
      batch_number,
      status,
      created_at,
      total_yield_kg,
      mixing_recipes (name)
    `)
    .eq('store_id', storeId)
    .gte('created_at', d.toISOString())
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) return []

  return data?.map(batch => {
    const time = new Date(batch.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const statusLabel = batch.status === 'COMPLETED' ? 'Selesai' : batch.status === 'IN_PROGRESS' ? 'Proses' : 'Menunggu'
    
    return {
      id: batch.batch_number,
      name: (batch.mixing_recipes as any)?.name || 'Recipe',
      qty: `${batch.total_yield_kg} Kg`,
      status: statusLabel,
      time
    }
  })
}

export async function getInventoryOverview(storeId: string) {
  const supabase = await createClient()

  const { data: rawMaterials } = await supabase
    .from('inventory_balances_view')
    .select('product_name, current_stock_kg')
    .eq('product_type', 'RAW_MATERIAL')
    .eq('store_id', storeId)
    .order('current_stock_kg', { ascending: false })
    .limit(5)

  const { data: finishedGoods } = await supabase
    .from('inventory_balances_view')
    .select('product_name, current_stock_kg')
    .eq('product_type', 'SELLING_PRODUCT')
    .eq('store_id', storeId)
    .order('current_stock_kg', { ascending: false })
    .limit(5)

  const formatList = (list: any[]) => {
    const maxVal = list && list.length > 0 ? list[0].current_stock_kg : 1
    return (list || []).map(item => ({
      label: item.product_name,
      value: `${item.current_stock_kg} Kg`,
      pct: Math.round((Number(item.current_stock_kg) / Number(maxVal)) * 100),
      color: 'bg-emerald-500'
    }))
  }

  return {
    rawMaterials: formatList(rawMaterials || []),
    finishedGoods: formatList(finishedGoods || [])
  }
}
