import { createClient } from '@/utils/supabase/server'
import { getPOSData } from '../actions'
import POSClient from '@/components/POS/POSClient'
import { redirect } from 'next/navigation'

export default async function SalesPOSPage() {
  const supabase = await createClient()

  // Get active user and their store
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch the store assigned to this user
  const { data: userStore } = await supabase
    .from('user_stores')
    .select('store_id')
    .eq('user_id', user.id)
    .single()

  if (!userStore) {
    return <div className="p-8 text-center text-rose-500">Akses ditolak: Anda belum ditugaskan ke cabang toko manapun.</div>
  }

  // Fetch products and customers
  const posData = await getPOSData(userStore.store_id)

  if (posData.error) {
    return <div className="p-8 text-center text-rose-500">Error: {posData.error}</div>
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <POSClient 
        storeId={userStore.store_id} 
        initialProducts={posData.products} 
        initialCustomers={posData.customers} 
      />
    </div>
  )
}
