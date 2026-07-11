import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Package, Store, CheckCircle, Clock, AlertTriangle, History } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RepackingPage() {
  const supabase = await createClient()

  // Fetch production batches of type 'REPACKING'
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

      {/* Batches Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {batches && batches.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">No Batch</th>
                  <th scope="col" className="px-6 py-4">Toko</th>
                  <th scope="col" className="px-6 py-4">Produk Hasil</th>
                  <th scope="col" className="px-6 py-4">Total Input (Kg)</th>
                  <th scope="col" className="px-6 py-4">Hasil Pack</th>
                  <th scope="col" className="px-6 py-4">Susut (Loss)</th>
                  <th scope="col" className="px-6 py-4">Tanggal</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {batches.map((batch) => {
                  const storeName = batch.stores
                    ? Array.isArray(batch.stores)
                      ? batch.stores[0]?.name
                      : (batch.stores as any).name
                    : 'Gudang Utama'

                  // Output item details
                  const outputItem = batch.production_batch_outputs && Array.isArray(batch.production_batch_outputs)
                    ? batch.production_batch_outputs[0]
                    : batch.production_batch_outputs

                  const productName = outputItem?.selling_products
                    ? Array.isArray(outputItem.selling_products)
                      ? outputItem.selling_products[0]?.name
                      : (outputItem.selling_products as any).name
                    : 'Produk Tidak Ditemukan'

                  const productSku = outputItem?.selling_products
                    ? Array.isArray(outputItem.selling_products)
                      ? outputItem.selling_products[0]?.sku
                      : (outputItem.selling_products as any).sku
                    : ''

                  const packsCount = outputItem ? parseFloat(outputItem.quantity_pcs) : 0

                  return (
                    <tr
                      key={batch.id}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                        {batch.batch_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{storeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {productName}
                          </div>
                          <div className="text-xs text-zinc-400 font-mono">{productSku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {parseFloat(batch.total_input_weight_kg).toFixed(2)} Kg
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          {packsCount} Pack
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${
                            parseFloat(batch.loss_percentage) > 2
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {parseFloat(batch.loss_percentage).toFixed(2)}%
                          </span>
                          {parseFloat(batch.loss_percentage) > 2 && (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-zinc-500">
                        {formatDate(batch.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {batch.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            <span>Selesai</span>
                          </span>
                        ) : batch.status === 'Pending Approval' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                            <Clock className="h-3 w-3" />
                            <span>Butuh Approval</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            <span>{batch.status}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4 animate-pulse" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Belum ada riwayat repacking</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                Klik tombol di atas untuk memulai pengemasan ulang beras curah pertama Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
