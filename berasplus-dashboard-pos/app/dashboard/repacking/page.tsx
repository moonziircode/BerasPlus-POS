import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'
import RepackingListClient from './RepackingListClient'

export const dynamic = 'force-dynamic'

export default async function RepackingPage() {
  const supabase = await createClient()

  // 1. Fetch production batches of type 'REPACKING'
  const { data: batches, error } = await supabase
    .from('production_batches')
    .select(`
      id,
      batch_number,
      total_input_weight_kg,
      total_output_weight_kg,
      loss_percentage,
      status,
      notes,
      created_at,
      created_by,
      type,
      stores (
        id,
        name
      ),
      production_batch_outputs (
        id,
        quantity_pcs,
        total_weight_kg,
        selling_products (
          id,
          name,
          sku
        )
      )
    `)
    .eq('type', 'REPACKING')
    .order('created_at', { ascending: false })

  // 2. Fetch all stores for filter option
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .order('name')

  // 3. Fetch all user profiles for operator/creator filter option
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name')
    .order('full_name')

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans flex items-center gap-2.5">
            <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <span>Riwayat Repacking</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola dan pantau proses pengemasan ulang beras curah (Bahan Baku) ke kemasan produk retail eceran.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/repacking/create"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Jalankan Repacking Baru</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data riwayat repacking: {error.message}
        </div>
      )}

      {/* Render the Client List Component */}
      <RepackingListClient
        initialBatches={(batches as any) || []}
        stores={stores || []}
        users={users || []}
      />
    </div>
  )
}
