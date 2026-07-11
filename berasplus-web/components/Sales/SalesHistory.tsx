'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Calendar, 
  Store, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  FileSpreadsheet, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Receipt,
  User,
  ShoppingBag,
  ArrowRight
} from 'lucide-react'

interface SalesHistoryProps {
  initialTransactions: any[]
  initialCount: number
  stores: any[]
}

export default function SalesHistory({ initialTransactions, initialCount, stores }: SalesHistoryProps) {
  // Filter States
  const [search, setSearch] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [storeId, setStoreId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest')
  
  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(initialCount / pageSize)

  // Local Transactions Data (for interactive client-side filtering / or real-time simulation)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [count, setCount] = useState(initialCount)
  const [selectedTx, setSelectedTx] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch updated list from server-side action
  const fetchFilteredData = async (newPage = 1) => {
    setIsLoading(true)
    setPage(newPage)
    try {
      const { getSalesTransactions } = await import('@/app/dashboard/sales/actions')
      const result = await getSalesTransactions({
        search: search || undefined,
        dateStart: dateStart ? new Date(dateStart).toISOString() : undefined,
        dateEnd: dateEnd ? new Date(dateEnd + 'T23:59:59').toISOString() : undefined,
        storeId: storeId || undefined,
        paymentMethod: paymentMethod || undefined,
        status: status || undefined,
        sortBy,
        page: newPage,
        pageSize
      })
      if (result.data) {
        setTransactions(result.data)
        setCount(result.count)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Reset Filters
  const handleReset = () => {
    setSearch('')
    setDateStart('')
    setDateEnd('')
    setStoreId('')
    setPaymentMethod('')
    setStatus('')
    setSortBy('latest')
    setPage(1)
    // Reload original data
    setTransactions(initialTransactions)
    setCount(initialCount)
  }

  // Format Currency
  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val))
  }

  // Export to CSV
  const exportToCSV = () => {
    if (transactions.length === 0) return
    const headers = ['Nomor Invoice', 'Tanggal', 'Cabang', 'Kasir', 'Customer', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Metode Bayar', 'Status']
    const rows = transactions.map(tx => [
      tx.transaction_number,
      new Date(tx.created_at).toLocaleString('id-ID'),
      tx.stores?.name || 'Gudang Utama',
      tx.users?.full_name || '-',
      tx.customers?.name || 'Walk-in',
      tx.subtotal,
      tx.discount,
      tx.tax,
      tx.total,
      tx.payment_method,
      tx.status
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `laporan_penjualan_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Top Banner / Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 font-sans">
            Histori Penjualan
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-sans">
            Kelola dan tinjau seluruh transaksi kasir dari seluruh cabang secara real-time.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-700 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Ekspor CSV</span>
          </button>
          <Link
            href="/dashboard/sales/pos"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Buka Kasir (POS)</span>
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Transaksi</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari Invoice / Catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-slate-700"
            />
          </div>

          {/* Store Dropdown */}
          <div className="relative">
            <Store className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-300 outline-none focus:border-slate-700 appearance-none"
            >
              <option value="">Semua Cabang Toko</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-300 outline-none focus:border-slate-700 appearance-none"
            >
              <option value="">Semua Metode Bayar</option>
              <option value="Cash">Cash / Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="Transfer">Transfer Bank</option>
              <option value="Debit">Kartu Debit</option>
              <option value="Kredit">Kartu Kredit</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-300 outline-none focus:border-slate-700 appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="COMPLETED">Selesai (Completed)</option>
              <option value="PENDING">Menunggu (Pending)</option>
              <option value="VOID">Dibatalkan (Void)</option>
            </select>
          </div>
        </div>

        {/* Second Row Filters: Date & Sort */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pt-2">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Dari</span>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-300 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Sampai</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-300 outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 outline-none"
            >
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Atur Ulang
            </button>
            <button
              onClick={() => fetchFilteredData(1)}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : transactions.length > 0 ? (
            <table className="w-full border-collapse text-left text-xs text-slate-400">
              <thead className="border-b border-slate-800 bg-slate-900/50 font-semibold text-slate-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Nomor Invoice</th>
                  <th scope="col" className="px-6 py-4">Waktu</th>
                  <th scope="col" className="px-6 py-4">Toko / Cabang</th>
                  <th scope="col" className="px-6 py-4">Kasir</th>
                  <th scope="col" className="px-6 py-4">Customer</th>
                  <th scope="col" className="px-6 py-4 text-right">Total</th>
                  <th scope="col" className="px-6 py-4">Metode Bayar</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => {
                  const date = new Date(tx.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  const storeName = tx.stores?.name || 'Gudang Utama'
                  const cashierName = tx.users?.full_name || '-'
                  const customerName = tx.customers?.name || 'Walk-in'
                  
                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-200">
                        {tx.transaction_number}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{date}</td>
                      <td className="px-6 py-4">{storeName}</td>
                      <td className="px-6 py-4">{cashierName}</td>
                      <td className="px-6 py-4">{customerName}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-200">{formatCurrency(tx.total)}</td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {tx.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-900/30">
                            <CheckCircle className="h-3 w-3" />
                            <span>Selesai</span>
                          </span>
                        ) : tx.status === 'VOID' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/30 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-900/30">
                            <XCircle className="h-3 w-3" />
                            <span>Batal (Void)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-900/30">
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="inline-flex items-center justify-center rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-slate-900 border border-slate-800 p-3 text-slate-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-200">Tidak ada transaksi ditemukan</h3>
              <p className="mt-1 text-sm text-slate-500">Mulai transaksi pertama menggunakan kasir POS.</p>
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/10 px-6 py-4">
            <span className="text-xs text-slate-500">
              Menampilkan Halaman <span className="font-semibold text-slate-400">{page}</span> dari <span className="font-semibold text-slate-400">{totalPages}</span> ({count} transaksi)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => fetchFilteredData(page - 1)}
                className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => fetchFilteredData(page + 1)}
                className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal/Drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl border-l border-slate-800 bg-slate-950 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Detail Transaksi</h3>
                  <p className="text-xs text-slate-400">Invoice: {selectedTx.transaction_number}</p>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* General Metadata */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-900 bg-slate-900/20 p-4 mb-6 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block mb-1">Kasir</span>
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" /> {selectedTx.users?.full_name || '-'}</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Toko / Cabang</span>
                  <div className="flex items-center gap-2"><Store className="w-3.5 h-3.5 text-slate-400" /> {selectedTx.stores?.name || 'Gudang Utama'}</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Waktu</span>
                  <div>{new Date(selectedTx.created_at).toLocaleString('id-ID')}</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Metode / Status Bayar</span>
                  <div>{selectedTx.payment_method} / <span className="text-emerald-400 font-semibold">Selesai</span></div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Item Pembelian</h4>
                <div className="space-y-2">
                  {selectedTx.sales_transaction_items?.map((item: any) => {
                    const price = Number(item.price_per_unit)
                    const hpp = Number(item.hpp_per_unit || 0)
                    const profit = (price - hpp) * Number(item.quantity)
                    
                    return (
                      <div key={item.id} className="flex justify-between items-center rounded-xl bg-slate-900/35 border border-slate-900/60 p-3 text-xs">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-200">{item.selling_products?.name || 'Produk Habis'}</div>
                          <div className="text-slate-400">{item.quantity} Qty × {formatCurrency(price)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-200">{formatCurrency(item.total)}</div>
                          {hpp > 0 && (
                            <div className="text-[10px] text-emerald-500 font-medium flex items-center justify-end gap-1">
                              <TrendingUp className="w-3 h-3" /> Profit: {formatCurrency(profit)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Calculations and Footer */}
            <div className="border-t border-slate-900 pt-4 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedTx.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Diskon Keseluruhan</span>
                  <span>-{formatCurrency(selectedTx.discount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pajak (PPN)</span>
                  <span>{formatCurrency(selectedTx.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-2 text-sm font-bold text-slate-200">
                  <span>Total Akhir</span>
                  <span className="text-emerald-400">{formatCurrency(selectedTx.total)}</span>
                </div>
              </div>

              {selectedTx.notes && (
                <div className="rounded-lg bg-slate-900 p-3 text-xs border border-slate-800 text-slate-400">
                  <span className="text-slate-300 font-semibold block mb-1">Catatan</span>
                  {selectedTx.notes}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 py-3 text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Receipt className="w-4 h-4" /> Cetak Struk
                </button>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white py-3 text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
