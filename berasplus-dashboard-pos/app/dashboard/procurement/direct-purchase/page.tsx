import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Truck } from 'lucide-react'
import DirectPurchaseTabs from './DirectPurchaseTabs'

export const dynamic = 'force-dynamic'

export default async function DirectPurchasePage() {
  const supabase = await createClient()

  // Fetch Direct Purchases
  const { data: purchases, error } = await supabase
    .from('direct_purchases')
    .select(`
      id,
      purchase_date,
      status,
      total_amount,
      notes,
      created_at,
      store_id,
      stores (
        id,
        name
      ),
      suppliers (
        id,
        name
      )
    `)
    .order('purchase_date', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans flex items-center gap-2">
            <Truck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <span>Pembelian Langsung (Spot Purchase)</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Catat pembelian beras curah dan kemasan plastik secara langsung di lapangan dan terima barangnya ke stok toko.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/procurement/direct-purchase/create"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Catat Pembelian Langsung</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data pembelian langsung: {error.message}
        </div>
      )}

      {/* Render Tabs and List */}
      <DirectPurchaseTabs purchases={purchases || []} />
    </div>
  )
}
