'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Store, UserCheck, Clock, CheckCircle, Truck, FileText, ArrowRight } from 'lucide-react'

interface PurchaseRecord {
  id: string
  purchase_date: string
  status: string
  total_amount: any
  notes: string | null
  store_id: string
  stores: any
  suppliers: any
}

interface DirectPurchaseTabsProps {
  purchases: PurchaseRecord[]
}

export default function DirectPurchaseTabs({ purchases }: DirectPurchaseTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  // 1. Separate Active vs History
  const activePurchases = useMemo(() => {
    return purchases.filter(
      (p) => p.status === 'Waiting Delivery' || p.status === 'Partially Received'
    )
  }, [purchases])

  const historyPurchases = useMemo(() => {
    return purchases.filter(
      (p) => p.status === 'Received' || p.status === 'Cancelled'
    )
  }, [purchases])

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
    })
  }

  const currentList = activeTab === 'active' ? activePurchases : historyPurchases

  return (
    <div className="space-y-6">
      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          <span>Pembelian Aktif</span>
          <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
            activeTab === 'active'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
          }`}>
            {activePurchases.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          <span>Riwayat Pembelian</span>
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {historyPurchases.length}
          </span>
        </button>
      </div>

      {/* Purchases Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {currentList.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Tanggal Beli</th>
                  <th scope="col" className="px-6 py-4">Toko Tujuan</th>
                  <th scope="col" className="px-6 py-4">Supplier</th>
                  <th scope="col" className="px-6 py-4">Total Biaya</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {currentList.map((purchase) => {
                  const storeName = purchase.stores
                    ? Array.isArray(purchase.stores)
                      ? purchase.stores[0]?.name
                      : (purchase.stores as any).name
                    : 'Gudang Cabang'

                  const supplierName = purchase.suppliers
                    ? Array.isArray(purchase.suppliers)
                      ? purchase.suppliers[0]?.name
                      : (purchase.suppliers as any).name
                    : 'Pemasok Umum'

                  const isReceived = purchase.status === 'Received'
                  const isWaiting = purchase.status === 'Waiting Delivery'

                  return (
                    <tr
                      key={purchase.id}
                      onClick={() => router.push(`/dashboard/procurement/direct-purchase/${purchase.id}`)}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 cursor-pointer"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <span>{formatDate(purchase.purchase_date)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-zinc-400" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{storeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-zinc-400" />
                          <span className="text-zinc-900 dark:text-zinc-100">{supplierName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatRupiah(parseFloat(purchase.total_amount))}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {isReceived ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Received</span>
                          </span>
                        ) : isWaiting ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                            <Clock className="h-3.5 w-3.5 animate-pulse" />
                            <span>Waiting Delivery</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-750">
                            <span>{purchase.status}</span>
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-500 font-semibold group-hover:text-emerald-600 transition-colors">
                          <span>Detail</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tidak ada data pembelian
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {activeTab === 'active' 
                  ? 'Semua barang pembelian sudah diterima.' 
                  : 'Belum ada pembelian yang terselesaikan.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
