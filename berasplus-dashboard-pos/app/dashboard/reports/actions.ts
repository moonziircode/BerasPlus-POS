'use server'

import { createClient } from '@/utils/supabase/server'

export async function getReportsData(storeId: string) {
  const supabase = await createClient()

  // 1. Fetch recent inventory ledger movements for this store
  const { data: movements, error: movErr } = await supabase
    .from('inventory_ledger')
    .select(`
      id,
      created_at,
      product_id,
      quantity,
      movement_type,
      hpp_at_time,
      products (
        name,
        product_type,
        sell_price
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (movErr) {
    console.error('Error fetching ledger for reports:', movErr)
  }

  const formattedMovements = (movements || []).map((m: any) => {
    // Map V2 movement types to V1 UI types
    let mappedType = m.movement_type
    if (m.movement_type === 'PURCHASE') {
      mappedType = 'GOODS_RECEIPT'
    } else if (m.movement_type === 'BLENDING_IN') {
      mappedType = 'PRODUCTION_OUTPUT'
    } else if (m.movement_type === 'BLENDING_OUT') {
      mappedType = 'PRODUCTION_INPUT_RAW'
    }

    // Map product type for UI
    let mappedProductType = 'RAW_MATERIAL'
    if (m.products?.product_type === 'KEMASAN') {
      mappedProductType = 'PACKAGING'
    } else if (m.products?.sell_price > 0) {
      mappedProductType = 'SELLING_PRODUCT'
    }

    return {
      id: m.id,
      date: new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      productName: m.products?.name || 'Unknown Product',
      productType: mappedProductType,
      quantity: Number(m.quantity),
      type: mappedType,
      location: 'Gudang/Toko'
    }
  })

  // 3. Fetch current inventory balances from view
  const { data: balances } = await supabase
    .from('inventory_balances_view')
    .select('*')
    .eq('store_id', storeId)

  // 4. Summarize stats
  const totalStockIn = formattedMovements
    .filter(m => ['GOODS_RECEIPT', 'PRODUCTION_OUTPUT'].includes(m.type))
    .reduce((sum, m) => sum + m.quantity, 0)

  const totalStockOut = formattedMovements
    .filter(m => ['PRODUCTION_INPUT_RAW', 'PRODUCTION_INPUT_PKG', 'SALE'].includes(m.type))
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0)

  const totalLoss = formattedMovements
    .filter(m => m.type === 'PRODUCTION_LOSS')
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0)

  return {
    movements: formattedMovements,
    balances: balances || [],
    stats: {
      totalStockIn,
      totalStockOut,
      totalLoss,
      movementCount: movements?.length || 0
    }
  }
}
