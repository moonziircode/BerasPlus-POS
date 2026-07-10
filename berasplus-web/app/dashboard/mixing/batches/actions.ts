'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface InputItem {
  raw_material_id: string
  quantity_kg: number
}

interface PackagingItem {
  packaging_material_id: string
  quantity: number
}

export async function executeProduction(formData: {
  store_id: string
  recipe_id: string
  batch_number: string
  notes?: string
  output_item: {
    selling_product_id: string
    quantity: number
    total_weight_kg: number
  }
  inputs: InputItem[]
  packaging: PackagingItem[]
}) {
  const supabase = await createClient()

  // 1. Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User tidak terautentikasi.')
  }

  // 2. Fetch HPP for inputs based on last PO history
  const preparedInputs = []
  for (const input of formData.inputs) {
    // Get last purchase price
    const { data: lastPOItem } = await supabase
      .from('purchase_order_items')
      .select('price_per_unit')
      .eq('item_id', input.raw_material_id)
      .eq('item_type', 'RAW_MATERIAL')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Get raw material conversion factor
    const { data: rm } = await supabase
      .from('raw_materials')
      .select('conversion_factor')
      .eq('id', input.raw_material_id)
      .single()

    const conversion = rm ? parseFloat(rm.conversion_factor) || 1 : 1
    const pricePerUnit = lastPOItem ? parseFloat(lastPOItem.price_per_unit) || 0 : 0
    const hppPerKg = pricePerUnit / conversion

    preparedInputs.push({
      raw_material_id: input.raw_material_id,
      quantity_kg: input.quantity_kg,
      hpp_per_kg: hppPerKg,
    })
  }

  // 3. Fetch HPP/buy price for packaging based on last PO or base properties
  const preparedPackaging = []
  for (const pkg of formData.packaging) {
    const { data: lastPOItem } = await supabase
      .from('purchase_order_items')
      .select('price_per_unit')
      .eq('item_id', pkg.packaging_material_id)
      .eq('item_type', 'PACKAGING')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: pm } = await supabase
      .from('packaging_materials')
      .select('buy_price_per_pcs')
      .eq('id', pkg.packaging_material_id)
      .single()

    const fallbackPrice = pm ? parseFloat(pm.buy_price_per_pcs) || 0 : 0
    const buyPricePerPcs = lastPOItem ? parseFloat(lastPOItem.price_per_unit) || fallbackPrice : fallbackPrice

    preparedPackaging.push({
      packaging_material_id: pkg.packaging_material_id,
      quantity: pkg.quantity,
      buy_price_per_pcs: buyPricePerPcs,
    })
  }

  // 4. Build JSON structure matching execute_production_batch payload
  const preparedJson = {
    store_id: formData.store_id,
    recipe_id: formData.recipe_id,
    batch_number: formData.batch_number,
    notes: formData.notes || null,
    created_by: user.id,
    output_item: {
      selling_product_id: formData.output_item.selling_product_id,
      quantity_produced: formData.output_item.quantity,
      total_weight_kg: formData.output_item.total_weight_kg,
    },
    input_items: preparedInputs,
    packaging_items: preparedPackaging,
  }

  // 5. Invoke Supabase RPC
  const { data: batchId, error: rpcError } = await supabase.rpc(
    'execute_production_batch',
    { payload: preparedJson }
  )

  if (rpcError) {
    throw new Error(rpcError.message || 'Gagal mengeksekusi batch produksi.')
  }

  // 6. Revalidate pages
  revalidatePath('/dashboard/mixing/batches')
  revalidatePath('/dashboard/inventory/raw-materials')
  revalidatePath('/dashboard/inventory/packaging')
  revalidatePath('/dashboard/inventory/selling-products')

  return batchId
}
