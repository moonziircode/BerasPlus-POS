'use server'

import { createClient } from '@/utils/supabase/server'

export async function getReportsData(storeId: string) {
  const supabase = await createClient()

  // 1. Fetch recent inventory ledger movements for this store
  // Join with inventory_locations to filter by store_id
  const { data: movements, error: movErr } = await supabase
    .from('inventory_ledger')
    .select(`
      id,
      timestamp,
      product_type,
      product_id,
      quantity_kg,
      movement_type,
      hpp_at_time,
      inventory_locations!inner(store_id, location_name)
    `)
    .eq('inventory_locations.store_id', storeId)
    .order('timestamp', { ascending: false })
    .limit(100)

  if (movErr) {
    console.error('Error fetching ledger for reports:', movErr)
  }

  // 2. Fetch product names to match IDs
  const { data: rawMaterials } = await supabase.from('raw_materials').select('id, name')
  const { data: sellingProducts } = await supabase.from('selling_products').select('id, name')
  const { data: packagingMaterials } = await supabase.from('packaging_materials').select('id, name')

  const productMap: Record<string, string> = {}
  rawMaterials?.forEach(r => { productMap[r.id] = r.name })
  sellingProducts?.forEach(p => { productMap[p.id] = p.name })
  packagingMaterials?.forEach(p => { productMap[p.id] = p.name })

  const formattedMovements = (movements || []).map((m: any) => ({
    id: m.id,
    date: new Date(m.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    productName: productMap[m.product_id] || 'Unknown Product',
    productType: m.product_type,
    quantity: Number(m.quantity_kg),
    type: m.movement_type,
    location: m.inventory_locations?.location_name || 'Gudang'
  }))

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
    .filter(m => ['PRODUCTION_INPUT_RAW', 'PRODUCTION_INPUT_PKG'].includes(m.type))
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
