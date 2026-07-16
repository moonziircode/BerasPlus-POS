'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getGlobalSetting(key: string): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) {
    return 'false'
  }
  return data.value
}

export async function updateGlobalSetting(key: string, value: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings/global')
}
