import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ReportsClient from '@/components/POS/ReportsClient'
import { getReportsData } from './actions'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createClient()

  // Get logged-in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch store user is assigned to
  const { data: userStore } = await supabase
    .from('user_stores')
    .select('store_id')
    .eq('user_id', user.id)
    .single()

  if (!userStore) {
    return (
      <div className="p-8 text-center text-slate-400">
        <h2 className="text-lg font-bold mb-2">Akses Terbatas</h2>
        <p className="text-xs">User Anda tidak terhubung ke cabang toko manapun.</p>
      </div>
    )
  }

  const data = await getReportsData(userStore.store_id)

  return <ReportsClient data={data} />
}
