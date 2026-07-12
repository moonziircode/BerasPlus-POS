'use client'

import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, History } from 'lucide-react'

interface LedgerEntry {
  id: string
  timestamp: string
  location_id: string
  locations: { name: string } | null
  quantity_kg: string | number
  movement_type: string
  reference_id: string
  hpp_at_time: string | number
}

interface StockHistoryTableProps {
  ledger: LedgerEntry[]
  type: string
}

export default function StockHistoryTable({ ledger, type }: StockHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const totalPages = Math.ceil(ledger.length / itemsPerPage)
  const currentData = ledger.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  const unit = type === 'PACKAGING' ? 'Pcs' : 'Kg'

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        {ledger.length > 0 ? (
          <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
            <thead className="bg-zinc-50 font-semibold text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Lokasi</th>
                <th className="px-4 py-3">Jenis Mutasi</th>
                <th className="px-4 py-3">Ref ID</th>
                <th className="px-4 py-3 text-right">Jumlah ({unit})</th>
                <th className="px-4 py-3 text-right">HPP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {currentData.map((item) => {
                const qty = parseFloat(item.quantity_kg as string) || 0
                const isPositive = qty > 0
                const isNegative = qty < 0

                let qtyClass = 'text-zinc-900 dark:text-zinc-100'
                if (isPositive) qtyClass = 'text-emerald-600 dark:text-emerald-400'
                if (isNegative) qtyClass = 'text-rose-600 dark:text-rose-400'

                return (
                  <tr key={item.id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(item.timestamp))}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {item.locations?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {item.movement_type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-500">
                      {item.reference_id?.split('-')[0]}...
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right font-mono font-semibold ${qtyClass}`}>
                      <div className="flex items-center justify-end gap-1">
                        {isPositive && <ArrowDownRight className="h-3 w-3" />}
                        {isNegative && <ArrowUpRight className="h-3 w-3" />}
                        {isPositive ? '+' : ''}{qty.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-zinc-500">
                      {item.hpp_at_time ? formatRupiah(parseFloat(item.hpp_at_time as string)) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
              <History className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Belum ada transaksi
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Riwayat mutasi stok untuk produk ini akan muncul di sini.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
