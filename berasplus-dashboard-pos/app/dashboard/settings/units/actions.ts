'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- UNIT TYPES ACTIONS ---

export async function createUnitType(formData: { name: string; description?: string; is_active?: boolean }) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('unit_types')
    .insert([{ 
      name: formData.name, 
      description: formData.description || null,
      is_active: formData.is_active !== undefined ? formData.is_active : true 
    }])

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings/units')
}

export async function updateUnitType(id: string, formData: { name: string; description?: string; is_active?: boolean }) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('unit_types')
    .update({ 
      name: formData.name, 
      description: formData.description || null,
      is_active: formData.is_active !== undefined ? formData.is_active : true
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings/units')
}

export async function deleteUnitType(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('unit_types').delete().eq('id', id)

  if (error) throw new Error(`Gagal menghapus satuan (mungkin sedang digunakan). Detail: ${error.message}`)
  revalidatePath('/dashboard/settings/units')
}

// --- CONVERSION FACTORS ACTIONS ---

export async function createConversionFactor(formData: { name: string; factor_to_kg: number }) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('conversion_factors')
    .insert([{ name: formData.name, factor_to_kg: formData.factor_to_kg }])

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings/units')
}

export async function updateConversionFactor(id: string, formData: { name: string; factor_to_kg: number }) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('conversion_factors')
    .update({ name: formData.name, factor_to_kg: formData.factor_to_kg })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings/units')
}

export async function deleteConversionFactor(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('conversion_factors').delete().eq('id', id)

  if (error) throw new Error(`Gagal menghapus konversi (mungkin sedang digunakan). Detail: ${error.message}`)
  revalidatePath('/dashboard/settings/units')
}
