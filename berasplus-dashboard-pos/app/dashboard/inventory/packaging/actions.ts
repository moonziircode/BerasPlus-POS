'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPackagingMaterial(formData: {
  packaging_code?: string
  name: string
  size_dimension?: string
  buy_price_per_pcs: number
}) {
  const supabase = await createClient()

  const insertData: any = {
    name: formData.name,
    size_dimension: formData.size_dimension || null,
    buy_price_per_pcs: formData.buy_price_per_pcs,
    status: 'Active',
  }

  if (formData.packaging_code) {
    insertData.packaging_code = formData.packaging_code
  }

  const { error } = await supabase
    .from('packaging_materials')
    .insert([insertData])

  if (error) {
    if (error.code === '23505') {
      throw new Error('Kode kemasan sudah terdaftar (harus unik).')
    }
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/inventory/packaging')
}
