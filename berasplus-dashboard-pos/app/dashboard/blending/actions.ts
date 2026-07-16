'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBlendingBatch(formData: FormData) {
  const supabase = await createClient()

  // Identify Store ID
  const { data: { user } } = await supabase.auth.getUser()
  const { data: storeRole } = await supabase
    .from('user_stores')
    .select('store_id')
    .eq('user_id', user?.id || '')
    .single()
    
  const storeId = storeRole?.store_id
  if (!storeId || !user?.id) return { success: false, error: 'User or Store not found' }

  const type = formData.get('type') as string // 'KEMASAN' or 'CURAH'
  const result_product_id = formData.get('result_product_id') as string
  const result_quantity = formData.get('result_quantity') as string
  const packaging_product_id = formData.get('packaging_product_id') as string

  // Parse dynamic inputs array
  const inputs: { product_id: string, quantity: number }[] = []
  const formDataEntries = Array.from(formData.entries())
  
  // Find all inputs with name starting with 'input_product_'
  const inputProducts = formDataEntries.filter(([key]) => key.startsWith('input_product_'))
  
  for (const [key, val] of inputProducts) {
    const index = key.replace('input_product_', '')
    const qty = formData.get(`input_qty_${index}`)
    if (val && qty) {
      inputs.push({
        product_id: val.toString(),
        quantity: parseFloat(qty.toString())
      })
    }
  }

  if (inputs.length === 0) {
    return { success: false, error: 'Bahan campuran tidak boleh kosong' }
  }

  // Call the new RPC
  const { data, error } = await supabase.rpc('execute_blending_batch', {
    p_store_id: storeId,
    p_user_id: user.id,
    p_type: type,
    p_result_product_id: result_product_id,
    p_result_quantity: parseFloat(result_quantity),
    p_packaging_product_id: type === 'KEMASAN' ? packaging_product_id : null,
    p_inputs: inputs
  })

  if (error) {
    console.error('Error executing blending batch:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/blending')
  revalidatePath('/dashboard/inventory')
  return { success: true }
}
