'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSellingProduct(formData: {
  sku?: string
  name: string
  category_id: string
  sell_price: number
  min_stock_level: number
}) {
  const supabase = await createClient()

  const insertData: any = {
    name: formData.name,
    category_id: formData.category_id,
    sell_price: formData.sell_price,
    min_stock_level: formData.min_stock_level,
    hpp_average: 0, // Defaults to 0 as HPP is calculated dynamically during production/purchase
    status: 'Active',
  }

  if (formData.sku) {
    insertData.sku = formData.sku
  }

  const { error } = await supabase
    .from('selling_products')
    .insert([insertData])

  if (error) {
    if (error.code === '23505') {
      throw new Error('SKU produk sudah terdaftar (harus unik).')
    }
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/inventory/selling-products')
}
