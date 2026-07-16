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
    
  // 4. Batch Blending Today
  const { count: batchCount } = await supabase
    .from('blending_batches')
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
  // Simply join products hpp with stocks
  const { data: products } = await supabase
    .from('products')
    .select('id, hpp')
    
  let nilaiPersediaan = 0
  if (stocks && products) {
    stocks.forEach(stock => {
      const p = products.find(p => p.id === stock.product_id)
      if (p) {
        nilaiPersediaan += Number(stock.current_stock_kg) * Number(p.hpp)
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
      transaction_number,
      total_amount,
      created_at,
      payment_method,
      status
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) return []

  return data.map(tx => {
    const time = new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return {
      id: tx.transaction_number,
      customer: 'Walk-in Customer',
      amount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(tx.total_amount)),
      status: tx.status === 'Completed' ? 'success' : 'pending',
      time
    }
  })
}

export async function getChartData(storeId: string) {
  const supabase = await createClient()

  // Past 7 days
  const d = new Date()
  d.setDate(d.getDate() - 7)

  const { data, error } = await supabase
    .from('sales_transactions')
    .select('total_amount, created_at')
    .eq('store_id', storeId)
    .gte('created_at', d.toISOString())
    .order('created_at', { ascending: true })

  if (error) return []

  // Group by date string
  const grouped: Record<string, number> = {}
  data?.forEach(tx => {
    const dateStr = new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    grouped[dateStr] = (grouped[dateStr] || 0) + Number(tx.total_amount)
  })

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
      sales_items (
        quantity,
        products (name)
      )
    `)
    .eq('store_id', storeId)
    .gte('created_at', d.toISOString())

  if (error) return []

  const prodCount: Record<string, number> = {}
  data?.forEach(tx => {
    tx.sales_items?.forEach((item: any) => {
      const name = item.products?.name
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
    .from('blending_batches')
    .select(`
      batch_number,
      status,
      created_at,
      result_quantity,
      products:result_product_id (name)
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
      name: (batch.products as any)?.name || 'Racikan',
      qty: `${batch.result_quantity} Pcs/Kg`,
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
