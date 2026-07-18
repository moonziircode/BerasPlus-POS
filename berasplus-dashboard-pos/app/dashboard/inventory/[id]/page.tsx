import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PackageOpen, History, MapPin, Scale } from 'lucide-react'
import { formatRupiah } from '@/utils/conversion'
import moment from 'moment'
import 'moment/locale/id'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name)
    `)
    .eq('id', id)
    .single()

  if (productError || !product) {
    notFound()
  }

  // 2. Fetch Stock Balances
  const { data: balances } = await supabase
    .from('inventory_balances_view')
    .select('store_id, total_stock, store_name')
    .eq('product_id', id)

  // 3. Fetch Recent Movements (Ledger)
  const { data: ledger } = await supabase
    .from('inventory_ledger')
    .select(`
      id,
      transaction_type,
      quantity,
      balance_after,
      transaction_date,
      stores (name)
    `)
    .eq('product_id', id)
    .order('transaction_date', { ascending: false })
    .limit(20)

  const catName = product.categories ? (product.categories as any).name : '-'
  
  return (
    <div className="max-w-5xl space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/inventory"
          className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Detail Produk</h1>
          <p className="text-sm text-zinc-500">Informasi, stok, dan riwayat pergerakan barang</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${product.product_type === 'BERAS' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                <PackageOpen className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{product.name}</h2>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    product.status 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                  }`}>
                    {product.status ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Kode Produk</p>
                    <p className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{product.product_code}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Kategori</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{catName}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Tipe Produk</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{product.product_type}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Berat per Unit</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{product.weight_per_unit_kg} Kg</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Harga Jual</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">{formatRupiah(product.sell_price)}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Harga Pokok Penjualan (HPP)</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">{formatRupiah(product.hpp)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <History className="h-4 w-4" /> Riwayat Mutasi (20 Terakhir)
              </h3>
            </div>
            <div className="overflow-x-auto">
              {ledger && ledger.length > 0 ? (
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                  <thead className="bg-zinc-50 font-medium text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
                    <tr>
                      <th className="px-6 py-3">Tanggal</th>
                      <th className="px-6 py-3">Toko</th>
                      <th className="px-6 py-3">Tipe Transaksi</th>
                      <th className="px-6 py-3 text-right">Qty</th>
                      <th className="px-6 py-3 text-right">Sisa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {ledger.map((l) => (
                      <tr key={l.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-6 py-3">{moment(l.transaction_date).format('DD MMM YYYY, HH:mm')}</td>
                        <td className="px-6 py-3">{(l.stores as any)?.name || '-'}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            l.transaction_type === 'IN' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' :
                            l.transaction_type === 'OUT' ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30' :
                            'bg-blue-50 text-blue-700 dark:bg-blue-900/30'
                          }`}>
                            {l.transaction_type}
                          </span>
                        </td>
                        <td className={`px-6 py-3 text-right font-medium ${l.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {l.quantity > 0 ? '+' : ''}{l.quantity}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                          {l.balance_after}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-sm text-zinc-500">Belum ada riwayat mutasi.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stock Balance */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 dark:bg-zinc-800/50 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Stok per Lokasi
              </h3>
            </div>
            <div className="p-0">
              {balances && balances.length > 0 ? (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {balances.map((b, i) => (
                    <li key={i} className="flex items-center justify-between px-6 py-4">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{b.store_name}</span>
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                        <Scale className="h-3.5 w-3.5" />
                        <span className="font-bold">{b.total_stock}</span>
                        <span className="text-xs">{product.unit_of_measure}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-sm text-zinc-500">Stok kosong di semua lokasi.</div>
              )}
              
              {/* Total Stock */}
              {balances && balances.length > 0 && (
                <div className="bg-zinc-50 p-6 border-t border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Total Keseluruhan</span>
                  <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                    <span className="font-bold text-lg">{balances.reduce((sum, b) => sum + (Number(b.total_stock) || 0), 0)}</span>
                    <span className="text-sm text-zinc-500">{product.unit_of_measure}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
