const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../../.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function runTest() {
  console.log('--- STARTING E2E TEST: SPOT PURCHASE ---')
  
  // 1. Fetch Master Data
  const { data: stores } = await supabase.from('stores').select('id, name').limit(1)
  const { data: suppliers } = await supabase.from('suppliers').select('id, name').limit(1)
  const { data: rawMaterials } = await supabase.from('raw_materials').select('id, name, conversion_factor').limit(1)
  
  const storeId = stores[0].id
  const supplierId = suppliers[0].id
  const rm = rawMaterials[0]
  
  console.log(`Using Store: ${stores[0].name}`)
  console.log(`Using Supplier: ${suppliers[0].name}`)
  console.log(`Using RM: ${rm.name} (conv: ${rm.conversion_factor})`)
  
  // 2. Check initial state
  const { data: initialStock } = await supabase.from('stock_balances')
    .select('quantity, moving_average_price')
    .eq('location_id', (await supabase.from('inventory_locations').select('id').eq('store_id', storeId).eq('location_type', 'STORE').single()).data.id)
    .eq('product_id', rm.id)
    .eq('product_type', 'RAW_MATERIAL')
    .maybeSingle()
    
  console.log('\n[BEFORE RECEIVE GOODS]')
  console.log(`Initial Stock: ${initialStock ? initialStock.quantity : 0} kg`)
  console.log(`Initial HPP: Rp ${initialStock ? initialStock.moving_average_price : 0}`)
  
  // 3. Create Direct Purchase
  console.log('\nCreating Direct Purchase (Status: Waiting Delivery)...')
  const { data: dp, error: dpErr } = await supabase.from('direct_purchases').insert({
    store_id: storeId,
    supplier_id: supplierId,
    purchase_date: new Date().toISOString().split('T')[0],
    total_amount: 10 * 50000,
    status: 'Waiting Delivery',
    notes: 'E2E Test DP'
  }).select().single()
  
  if (dpErr) throw dpErr
  
  const { data: dpItem, error: itemErr } = await supabase.from('direct_purchase_items').insert({
    dp_id: dp.id,
    raw_material_id: rm.id,
    packaging_material_id: null,
    quantity: 10,
    price_per_unit: 50000,
    subtotal: 500000
  }).select().single()
  
  if (itemErr) throw itemErr
  
  console.log(`Created DP ID: ${dp.id}`)
  
  // 4. Update / Receive DP Goods (like in server action)
  // We will simulate receiving actual qty = 9.5 (susut/kurang 0.5)
  console.log('\nReceiving Goods with Actual Qty: 9.5, Actual Total Kg: 475...')
  
  // 4a. Update items
  await supabase.from('direct_purchase_items')
    .update({
      actual_quantity: 9.5,
      actual_total_kg: 475,
      shrinkage_kg: (10 * rm.conversion_factor) - 475
    })
    .eq('id', dpItem.id)
    
  // 4b. Update DP status
  await supabase.from('direct_purchases')
    .update({ status: 'Received' })
    .eq('id', dp.id)
    
  const locationId = (await supabase.from('inventory_locations').select('id').eq('store_id', storeId).eq('location_type', 'STORE').single()).data.id
  const currentKg = initialStock ? Number(initialStock.quantity) : 0
  
  const { error: rpcErr } = await supabase.rpc('process_inventory_movement', {
    p_location_id: locationId,
    p_product_type: 'RAW_MATERIAL',
    p_product_id: rm.id,
    p_quantity_kg: 475,
    p_movement_type: 'GOODS_RECEIPT',
    p_reference_id: dp.id,
    p_hpp_at_time: 50000 / rm.conversion_factor
  })
  
  if (rpcErr) console.error('RPC Err:', rpcErr)
  
  const { data: finalStock } = await supabase.from('stock_balances')
    .select('quantity, moving_average_price')
    .eq('location_id', locationId)
    .eq('product_id', rm.id)
    .eq('product_type', 'RAW_MATERIAL')
    .maybeSingle()
    
  const { data: finalDp } = await supabase.from('direct_purchases').select('status').eq('id', dp.id).single()
  const { data: finalItem } = await supabase.from('direct_purchase_items').select('actual_quantity, actual_total_kg, shrinkage_kg').eq('id', dpItem.id).single()
  
  console.log('\n[AFTER RECEIVE GOODS]')
  console.log(`DP Status: ${finalDp.status}`)
  console.log(`Actual Qty: ${finalItem.actual_quantity}`)
  console.log(`Actual Total Kg: ${finalItem.actual_total_kg}`)
  console.log(`Shrinkage: ${finalItem.shrinkage_kg} kg`)
  
  console.log(`\nFinal Stock: ${finalStock ? finalStock.quantity : 0} kg (Expected: ${currentKg + 475} kg)`)
  console.log(`Final HPP: Rp ${finalStock ? finalStock.moving_average_price : 0}`)
  
  console.log('\n--- E2E TEST COMPLETED ---')
}

runTest().catch(console.error)
