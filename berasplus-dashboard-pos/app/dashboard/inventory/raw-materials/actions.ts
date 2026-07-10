'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRawMaterial(formData: {
  rm_code?: string
  name: string
  category_id: string
  conversion_factor: number
}) {
  const supabase = await createClient()

  const insertData: any = {
    name: formData.name,
    category_id: formData.category_id,
    conversion_factor: formData.conversion_factor,
    base_unit: 'Kg',
    status: 'Active',
  }

  if (formData.rm_code) {
    insertData.rm_code = formData.rm_code
  }

  const { error } = await supabase
    .from('raw_materials')
    .insert([insertData])

  if (error) {
    if (error.code === '23505') {
      throw new Error('Kode bahan baku sudah terdaftar (harus unik).')
    }
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/inventory/raw-materials')
}
