'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function executeRepack(formData: {
  store_id: string
  raw_material_id: string
  selling_product_id: string
  quantity_kg: number
  quantity_packs: number
  notes?: string
}) {
  const supabase = await createClient()

  // 1. Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User tidak terautentikasi.')
  }

  // 2. Fetch HPP of raw material directly from database
  const { data: rm, error: rmError } = await supabase
    .from('raw_materials')
    .select('hpp')
    .eq('id', formData.raw_material_id)
    .single()

  if (rmError || !rm) {
    throw new Error('Gagal mengambil data HPP bahan baku.')
  }

  const hppPerKg = parseFloat(rm.hpp) || 0

  // 3. Generate batch number
  const generateBatchNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(100 + Math.random() * 900)
    return `RPK-${year}${month}${date}-${random}`
  }

  const batchNumber = generateBatchNumber()

  // 4. Build payload matching execute_production_batch RPC
  const preparedJson = {
    store_id: formData.store_id,
    recipe_id: null,
    batch_number: batchNumber,
    notes: formData.notes || null,
    created_by: user.id,
    type: 'REPACKING',
    output_item: {
      selling_product_id: formData.selling_product_id,
      quantity_produced: formData.quantity_packs,
      total_weight_kg: formData.quantity_kg,
    },
    input_items: [
      {
        raw_material_id: formData.raw_material_id,
        quantity_kg: formData.quantity_kg,
        hpp_per_kg: hppPerKg,
      }
    ],
    packaging_items: [],
  }

  // 5. Invoke Supabase RPC
  const { data: batchId, error: rpcError } = await supabase.rpc(
    'execute_production_batch',
    { payload: preparedJson }
  )

  if (rpcError) {
    throw new Error(rpcError.message || 'Gagal mengeksekusi repacking.')
  }

  // 6. Revalidate pages
  revalidatePath('/dashboard/repacking')
  revalidatePath('/dashboard/inventory/raw-materials')
  revalidatePath('/dashboard/inventory/selling-products')
  revalidatePath('/dashboard/inventory/stock-balance')

  return batchId
}
