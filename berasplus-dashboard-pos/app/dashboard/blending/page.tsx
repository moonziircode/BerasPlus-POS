import { createClient } from '@/utils/supabase/server'
import { Plus, CheckCircle, PackageSearch, PackageOpen, Box } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/utils/conversion'

export const dynamic = 'force-dynamic'

export default async function BlendingPage() {
  const supabase = await createClient()

  // Get Store ID
  const { data: { user } } = await supabase.auth.getUser()
  const { data: storeRole } = await supabase
    .from('user_stores')
    .select('store_id')
    .eq('user_id', user?.id || '')
    .single()
    
  const storeId = storeRole?.store_id

  const { data: batches, error } = await supabase
    .from('blending_batches')
    .select(`
      id,
      batch_number,
      type,
      result_quantity,
      status,
      created_at,
      products!blending_batches_result_product_id_fkey (
        name,
        unit_of_measure,
        hpp
      ),
      packaging:products!blending_batches_packaging_product_id_fkey (
        name
      ),
      blending_batch_inputs (
        quantity,
        hpp_per_unit,
        products (
          name
        )
      )
    `)
    .eq('store_id', storeId || '')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Blending & Produksi
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Ubah bahan curah menjadi beras kemasan atau beras curah campuran. HPP dikalkulasi otomatis.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/blending/create"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
          >
            <Plus className="h-4 w-4" />
            Buat Blending Baru
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
          Gagal mengambil data blending: {error.message}
        </div>
      )}

      {/* Batches Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {batches && batches.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">No. Batch</th>
                  <th scope="col" className="px-6 py-4">Tipe & Hasil</th>
                  <th scope="col" className="px-6 py-4">Komposisi Bahan</th>
                  <th scope="col" className="px-6 py-4">HPP Hasil</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {batches.map((b) => {
                  const resultProduct = b.products && !Array.isArray(b.products) ? (b.products as any) : {}
                  const packagingProduct = b.packaging && !Array.isArray(b.packaging) ? (b.packaging as any) : null

                  return (
                    <tr
                      key={b.id}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {b.batch_number}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`w-fit inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            b.type === 'KEMASAN' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                          }`}>
                            {b.type === 'KEMASAN' ? <Box className="h-3 w-3" /> : <PackageOpen className="h-3 w-3" />}
                            {b.type}
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                            {b.result_quantity} {resultProduct.unit_of_measure} - {resultProduct.name}
                          </span>
                          {packagingProduct && (
                            <span className="text-xs text-zinc-500">
                              Menggunakan: {packagingProduct.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="list-disc list-inside text-xs text-zinc-500 space-y-1">
                          {b.blending_batch_inputs?.map((input: any, idx: number) => {
                            const inputProd = input.products && !Array.isArray(input.products) ? (input.products as any) : {}
                            return (
                              <li key={idx}>
                                {input.quantity} Kg {inputProd.name}
                              </li>
                            )
                          })}
                        </ul>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {formatRupiah(resultProduct.hpp)}
                        </span>
                        <span className="text-xs text-zinc-500 ml-1">/{resultProduct.unit_of_measure}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>{b.status}</span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <PackageSearch className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum ada aktivitas blending
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Mulai buat batch blending pertama Anda untuk meracik produk.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
