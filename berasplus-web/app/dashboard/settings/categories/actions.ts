'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: {
  name: string
  description?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .insert([
      {
        name: formData.name,
        description: formData.description || null,
      },
    ])

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/settings/categories')
}

export async function updateCategory(
  id: string,
  formData: {
    name: string
    description?: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({
      name: formData.name,
      description: formData.description || null,
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/settings/categories')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  // Note: we might need to handle foreign key constraints
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Gagal menghapus kategori. Mungkin ada data bahan/produk yang terkait. Detail: ${error.message}`)
  }

  revalidatePath('/dashboard/settings/categories')
}
