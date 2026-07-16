'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addProduct(formData: FormData) {
  const supabase = await createClient()

  const product_code = formData.get('product_code') as string
  const barcode = formData.get('barcode') as string
  const name = formData.get('name') as string
  const product_type = formData.get('product_type') as string
  const category_id = formData.get('category_id') as string
  const unit_of_measure = formData.get('unit_of_measure') as string
  const weight_per_unit_kg = formData.get('weight_per_unit_kg') as string
  const sell_price = formData.get('sell_price') as string

  const { error } = await supabase
    .from('products')
    .insert({
      product_code,
      barcode: barcode || null,
      name,
      product_type,
      category_id: category_id || null,
      unit_of_measure,
      weight_per_unit_kg: parseFloat(weight_per_unit_kg || '0'),
      sell_price: parseFloat(sell_price || '0'),
      is_active: true
    })

  if (error) {
    console.error('Add product error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/inventory')
  return { success: true }
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/inventory')
  return { success: true }
}
