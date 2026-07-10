'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createStore(formData: {
  store_code: string
  name: string
  address: string
  phone?: string
}) {
  const supabase = await createClient()

  // A. Insert the store and select its ID
  const { data: storeData, error: storeError } = await supabase
    .from('stores')
    .insert([
      {
        store_code: formData.store_code,
        name: formData.name,
        address: formData.address || null,
        phone: formData.phone || null,
        status: 'Active',
      },
    ])
    .select('id, name')
    .single()

  if (storeError) {
    throw new Error(storeError.message)
  }

  // B. Auto-create matching inventory location of type STORE
  const { error: locationError } = await supabase
    .from('inventory_locations')
    .insert([
      {
        name: `Gudang Utama - ${storeData.name}`,
        location_type: 'STORE',
        store_id: storeData.id,
      },
    ])

  if (locationError) {
    // Non-blocking but logged or thrown
    throw new Error(`Toko berhasil dibuat, namun gagal membuat lokasi inventaris: ${locationError.message}`)
  }

  revalidatePath('/dashboard/settings/stores')
}

export async function updateStore(
  id: string,
  formData: {
    store_code: string
    name: string
    address: string
    phone?: string
    status: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('stores')
    .update({
      store_code: formData.store_code,
      name: formData.name,
      address: formData.address || null,
      phone: formData.phone || null,
      status: formData.status,
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/settings/stores')
}

export async function deleteStore(id: string) {
  const supabase = await createClient()

  // Note: we might need to handle foreign key constraints
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Gagal menghapus toko. Mungkin ada data transaksi yang terkait. Detail: ${error.message}`)
  }

  revalidatePath('/dashboard/settings/stores')
}
