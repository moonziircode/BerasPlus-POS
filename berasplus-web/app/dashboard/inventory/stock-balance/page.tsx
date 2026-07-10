import { createClient } from '@/utils/supabase/server'
import StockBalanceTable from './StockBalanceTable'
import { Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StockBalancePage() {
  const supabase = await createClient()

  // Fetch stock balances from view
  const { data: balances, error } = await supabase
    .from('inventory_balances_view')
    .select('*')
    .order('location_name')

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans flex items-center gap-2">
          <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          <span>Sisa Saldo Stok (Stock Balance)</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
          Lihat ketersediaan sisa stok bahan baku, kemasan plastik, dan produk jual (SKU) secara real-time berdasarkan akumulasi Ledger.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data saldo stok: {error.message}
        </div>
      ) : (
        <StockBalanceTable balances={balances || []} />
      )}
    </div>
  )
}
