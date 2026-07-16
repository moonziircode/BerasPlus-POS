import { createClient } from '@/utils/supabase/server'
import { getSalesTransactions, getStores } from './actions'
import SalesHistory from '@/components/Sales/SalesHistory'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SalesHistoryPage() {
  const supabase = await createClient()

  // Get active user and their store
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial sales transactions
  const result = await getSalesTransactions({
    page: 1,
    pageSize: 10,
    sortBy: 'latest'
  })

  // Fetch stores list for filtering
  const stores = await getStores()

  return (
    <SalesHistory 
      initialTransactions={result.data || []} 
      initialCount={result.count || 0}
      stores={stores}
    />
  )
}
