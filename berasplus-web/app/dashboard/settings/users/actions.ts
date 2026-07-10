'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: {
  email: string
  password?: string
  full_name: string
  role: string
  store_id?: string
}) {
  const adminAuthClient = createAdminClient()
  const supabase = await createClient()

  // 1. Create User di auth.users via Admin API
  const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
    email: formData.email,
    password: formData.password || 'Berasplus123!', // Default password jika kosong
    email_confirm: true,
    user_metadata: {
      full_name: formData.full_name,
      role: formData.role
    }
  })

  if (authError) {
    throw new Error(`Gagal membuat autentikasi user: ${authError.message}`)
  }

  const userId = authData.user.id

  // 2. Insert ke public.users
  const { error: dbError } = await supabase
    .from('users')
    .insert([
      {
        id: userId,
        full_name: formData.full_name,
        role: formData.role,
        store_id: formData.store_id || null,
        email: formData.email
      }
    ])

  if (dbError) {
    // Rollback auth user
    await adminAuthClient.auth.admin.deleteUser(userId)
    throw new Error(`Gagal menyimpan profil user: ${dbError.message}`)
  }

  revalidatePath('/dashboard/settings/users')
}

export async function updateUser(
  id: string,
  formData: {
    email: string
    full_name: string
    role: string
    store_id?: string
    new_password?: string
  }
) {
  const adminAuthClient = createAdminClient()
  const supabase = await createClient()

  // 1. Update password atau email jika ada perubahan
  const authUpdates: any = {}
  if (formData.new_password) {
    authUpdates.password = formData.new_password
  }
  if (formData.email) {
    authUpdates.email = formData.email
  }
  
  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await adminAuthClient.auth.admin.updateUserById(
      id,
      authUpdates
    )
    if (authError) {
      throw new Error(`Gagal mengupdate autentikasi: ${authError.message}`)
    }
  }

  // 2. Update public.users
  const { error: dbError } = await supabase
    .from('users')
    .update({
      full_name: formData.full_name,
      role: formData.role,
      store_id: formData.store_id || null,
      email: formData.email
    })
    .eq('id', id)

  if (dbError) {
    throw new Error(`Gagal mengupdate profil user: ${dbError.message}`)
  }

  revalidatePath('/dashboard/settings/users')
}

export async function deleteUser(id: string) {
  const adminAuthClient = createAdminClient()
  const supabase = await createClient()

  // Hapus dari public schema terlebih dahulu
  const { error: dbError } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (dbError) {
    throw new Error(`Gagal menghapus profil user: ${dbError.message}`)
  }

  // Hapus dari auth.users
  const { error: authError } = await adminAuthClient.auth.admin.deleteUser(id)
  
  if (authError) {
    throw new Error(`Gagal menghapus autentikasi user: ${authError.message}`)
  }

  revalidatePath('/dashboard/settings/users')
}
