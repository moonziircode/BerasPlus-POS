import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Blend, Store, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProductionBatchesPage() {
  const supabase = await createClient()

  // Fetch production batches with stores and recipes
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
      stores (
        id,
        name
      ),
      recipes (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Date formatting helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Batch Produksi (Mixing & Repacking)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Pantau riwayat pencampuran bahan baku beras curah dan pengemasan produk jadi siap jual.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/mixing/batches/create"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Jalankan Produksi Baru</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data batch produksi: {error.message}
        </div>
      )}

      {/* Batches Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {batches && batches.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">No Batch</th>
                  <th scope="col" className="px-6 py-4">Toko</th>
                  <th scope="col" className="px-6 py-4">Resep</th>
                  <th scope="col" className="px-6 py-4">Total Input</th>
                  <th scope="col" className="px-6 py-4">Total Output</th>
                  <th scope="col" className="px-6 py-4">Susut (Loss)</th>
                  <th scope="col" className="px-6 py-4">Tanggal Eksekusi</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {batches.map((batch) => {
                  const storeName = batch.stores
                    ? Array.isArray(batch.stores)
                      ? batch.stores[0]?.name
                      : (batch.stores as any).name
                    : 'Gudang Utama'

                  const recipeName = batch.recipes
                    ? Array.isArray(batch.recipes)
                      ? batch.recipes[0]?.name
                      : (batch.recipes as any).name
                    : 'Custom Formula'

                  const isCompleted = batch.status === 'Completed'

                  return (
                    <tr
                      key={batch.id}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {batch.batch_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-zinc-400" />
                          <span className="font-medium text-zinc-950 dark:text-zinc-50">{storeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Blend className="h-4 w-4 text-emerald-500" />
                          <span className="text-zinc-900 dark:text-zinc-100">{recipeName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-zinc-900 dark:text-zinc-100">
                        {parseFloat(batch.total_input_weight_kg).toLocaleString('id-ID')} Kg
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-zinc-900 dark:text-zinc-100">
                        {parseFloat(batch.total_output_weight_kg).toLocaleString('id-ID')} Kg
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`font-semibold font-mono ${
                          parseFloat(batch.loss_percentage) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {parseFloat(batch.loss_percentage).toFixed(2)}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {formatDate(batch.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                            <CheckCircle className="h-3 w-3" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                            <AlertTriangle className="h-3 w-3 animate-pulse" />
                            <span>Pending Approval</span>
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link href={`/dashboard/mixing/batches/${batch.id}`} className="inline-flex items-center justify-center rounded-lg bg-zinc-100 p-2 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <Blend className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum ada batch produksi
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Jalankan sesi mixing/repacking pertama untuk memproduksi produk jual dari bahan baku gudang.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/mixing/batches/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Jalankan Produksi Pertama</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
