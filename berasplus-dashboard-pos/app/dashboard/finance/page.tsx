import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FinanceClient from './FinanceClient'
import { getFinanceMetrics, getRecentExpenses, getPaymentMethodBreakdown, getFinanceChartData } from './actions'

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const supabase = await createClient()

  // Get logged-in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const isOwner = roleData?.role === 'OWNER'

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

  const storeId = userStore.store_id

  // Fetch data
  const metrics = await getFinanceMetrics(storeId)
  const recentExpenses = await getRecentExpenses(storeId)
  const paymentBreakdown = await getPaymentMethodBreakdown(storeId)
  const chartData = await getFinanceChartData(storeId)

  return (
    <FinanceClient
      storeId={storeId}
      metrics={metrics}
      recentExpenses={recentExpenses}
      paymentBreakdown={paymentBreakdown}
      chartData={chartData}
      isOwner={isOwner}
    />
  )
}
