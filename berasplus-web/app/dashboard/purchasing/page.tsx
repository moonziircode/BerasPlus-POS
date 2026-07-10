import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ShoppingCart, Plus, CheckCircle, Clock, Calendar, Store, UserCheck } from 'lucide-react'
import ReceiveGoodsButton from './ReceiveGoodsButton'

export const dynamic = 'force-dynamic'

export default async function PurchasingPage() {
  const supabase = await createClient()

  // Fetch Purchase Orders
  const { data: purchaseOrders, error } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      po_number,
      status,
      total_amount,
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
    .order('created_at', { ascending: false })

  // Rupiah formatting helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

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
            Purchase Orders (Pengadaan)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola pengadaan barang (bahan baku & kemasan) dari supplier dan catat penerimaannya di gudang toko.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/purchasing/create"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Buat PO Baru</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data purchase order: {error.message}
        </div>
      )}

      {/* PO Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {purchaseOrders && purchaseOrders.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Nomor PO</th>
                  <th scope="col" className="px-6 py-4">Toko Tujuan</th>
                  <th scope="col" className="px-6 py-4">Supplier</th>
                  <th scope="col" className="px-6 py-4">Total Biaya</th>
                  <th scope="col" className="px-6 py-4">Tanggal Buat</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi Penerimaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {purchaseOrders.map((po) => {
                  const storeName = po.stores && !Array.isArray(po.stores)
                    ? (po.stores as any).name
                    : 'Tidak Diketahui'
                  const supplierName = po.suppliers && !Array.isArray(po.suppliers)
                    ? (po.suppliers as any).name
                    : 'Tidak Diketahui'

                  return (
                    <tr
                      key={po.id}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {po.po_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-zinc-450 shrink-0" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{storeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-zinc-450 shrink-0" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{supplierName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                        {formatRupiah(parseFloat(po.total_amount))}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{formatDate(po.created_at)}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {po.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            <span>Selesai</span>
                          </span>
                        ) : po.status === 'Submitted' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                            <Clock className="h-3 w-3 animate-pulse" />
                            <span>Dikirim</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400">
                            <span>{po.status}</span>
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        {po.status === 'Submitted' ? (
                          <ReceiveGoodsButton
                            poId={po.id}
                            storeId={po.store_id}
                            poNumber={po.po_number}
                          />
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-600 font-medium italic">
                            Telah Diterima
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum ada Purchase Order (PO)
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Mulai dengan membuat Purchase Order baru ke supplier Anda.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/purchasing/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat PO Pertama</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
