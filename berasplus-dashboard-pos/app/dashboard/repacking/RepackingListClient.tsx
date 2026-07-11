'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Calendar, 
  Store, 
  Filter, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowUpDown,
  History,
  Package
} from 'lucide-react'

interface StoreOption {
  id: string
  name: string
}

interface UserOption {
  id: string
  full_name: string | null
}

interface BatchItem {
  id: string
  batch_number: string
  total_input_weight_kg: number | null
  total_output_weight_kg: number | null
  loss_percentage: number | null
  status: string
  notes: string | null
  created_at: string
  created_by: string
  type: string
  stores: {
    id: string
    name: string
  } | null
  production_batch_outputs: Array<{
    id: string
    quantity_pcs: number
    total_weight_kg: number
    selling_products: {
      id: string
      name: string
      sku: string
    } | null
  }> | null
}

interface RepackingListClientProps {
  initialBatches: BatchItem[]
  stores: StoreOption[]
  users: UserOption[]
}

export default function RepackingListClient({
  initialBatches,
  stores,
  users
}: RepackingListClientProps) {
  // State variables for searching/filtering
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Sorting state
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, batch_asc, batch_desc, product_asc, product_desc, qty_desc

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Helper to map creator ID to name
  const getUserName = (userId: string) => {
    const u = users.find(x => x.id === userId)
    return u?.full_name || 'System / Unknown'
  }

  // Filter batches client side
  const filteredBatches = useMemo(() => {
    return initialBatches.filter((batch) => {
      // 1. Search Query (Batch Number, Product Name)
      const outputItem = batch.production_batch_outputs?.[0]
      const productName = outputItem?.selling_products?.name || ''
      const productSku = outputItem?.selling_products?.sku || ''
      
      const matchesSearch = 
        batch.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        productSku.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      // 2. Store filter
      if (selectedStore && batch.stores?.id !== selectedStore) return false

      // 3. Status filter
      if (selectedStatus && batch.status !== selectedStatus) return false

      // 4. User filter
      if (selectedUser && batch.created_by !== selectedUser) return false

      // 5. Date filter
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        if (new Date(batch.created_at) < start) return false
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(batch.created_at) > end) return false
      }

      return true
    })
  }, [initialBatches, searchQuery, selectedStore, selectedStatus, selectedUser, startDate, endDate])

  // Sort batches client side
  const sortedBatches = useMemo(() => {
    const copy = [...filteredBatches]
    return copy.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'batch_asc':
          return a.batch_number.localeCompare(b.batch_number)
        case 'batch_desc':
          return b.batch_number.localeCompare(a.batch_number)
        case 'product_asc': {
          const nameA = a.production_batch_outputs?.[0]?.selling_products?.name || ''
          const nameB = b.production_batch_outputs?.[0]?.selling_products?.name || ''
          return nameA.localeCompare(nameB)
        }
        case 'product_desc': {
          const nameA = a.production_batch_outputs?.[0]?.selling_products?.name || ''
          const nameB = b.production_batch_outputs?.[0]?.selling_products?.name || ''
          return nameB.localeCompare(nameA)
        }
        case 'qty_desc': {
          const qtyA = a.production_batch_outputs?.[0]?.quantity_pcs || 0
          const qtyB = b.production_batch_outputs?.[0]?.quantity_pcs || 0
          return qtyB - qtyA
        }
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [filteredBatches, sortBy])

  // Pagination calculation
  const totalItems = sortedBatches.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const paginatedBatches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedBatches.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedBatches, currentPage])

  // Reset pagination when filter changes
  const handleFilterChange = (setter: any, value: any) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedStore('')
    setSelectedStatus('')
    setSelectedUser('')
    setStartDate('')
    setEndDate('')
    setSortBy('newest')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">
            <Filter className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            <span>Filter & Cari Riwayat</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs text-zinc-500 hover:text-emerald-600 font-semibold dark:text-zinc-400 dark:hover:text-emerald-400 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Search bar */}
          <div className="col-span-1 sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nama produk, nomor batch..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
            />
          </div>

          {/* Store filter */}
          <div>
            <select
              value={selectedStore}
              onChange={(e) => handleFilterChange(setSelectedStore, e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
            >
              <option value="">Semua Toko / Gudang</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
            >
              <option value="">Semua Status</option>
              <option value="Completed">Selesai</option>
              <option value="Pending Approval">Butuh Approval</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 pt-1">
          {/* User filter */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => handleFilterChange(setSelectedUser, e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
            >
              <option value="">Semua User / Operator</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || 'User Tanpa Nama'}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
            >
              <option value="newest">Urutkan: Terbaru</option>
              <option value="oldest">Urutkan: Terlama</option>
              <option value="batch_asc">Nomor Batch (A-Z)</option>
              <option value="batch_desc">Nomor Batch (Z-A)</option>
              <option value="product_asc">Nama Produk (A-Z)</option>
              <option value="product_desc">Nama Produk (Z-A)</option>
              <option value="qty_desc">Jumlah Produksi Terbanyak</option>
            </select>
          </div>

          {/* Date range picker */}
          <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 px-3 pl-9 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-emerald-500"
                placeholder="Mulai Tanggal"
              />
            </div>
            <span className="text-zinc-400 text-xs">s/d</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 px-3 pl-9 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-emerald-500"
                placeholder="Sampai Tanggal"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {paginatedBatches.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">No Batch</th>
                  <th scope="col" className="px-6 py-4">Toko / Gudang</th>
                  <th scope="col" className="px-6 py-4">Operator</th>
                  <th scope="col" className="px-6 py-4">Produk Hasil</th>
                  <th scope="col" className="px-6 py-4 text-right">Total Input</th>
                  <th scope="col" className="px-6 py-4 text-center">Hasil Pack</th>
                  <th scope="col" className="px-6 py-4 text-center">Susut (Loss)</th>
                  <th scope="col" className="px-6 py-4">Tanggal</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedBatches.map((batch) => {
                  const storeName = batch.stores?.name || 'Gudang Utama'
                  const operatorName = getUserName(batch.created_by)

                  // Output item details
                  const outputItem = batch.production_batch_outputs?.[0]
                  const productName = outputItem?.selling_products?.name || 'Produk Tidak Ditemukan'
                  const productSku = outputItem?.selling_products?.sku || ''
                  const packsCount = outputItem?.quantity_pcs ? Number(outputItem.quantity_pcs) : 0
                  
                  const inputWeight = batch.total_input_weight_kg ? Number(batch.total_input_weight_kg) : 0
                  const lossPct = batch.loss_percentage ? Number(batch.loss_percentage) : 0

                  return (
                    <tr
                      key={batch.id}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                        <Link 
                          href={`/dashboard/repacking/${batch.id}`}
                          className="text-emerald-600 hover:text-emerald-500 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300 font-bold"
                        >
                          {batch.batch_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{storeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{operatorName}</span>
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
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                        {inputWeight.toFixed(2)} Kg
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          {packsCount} Pack
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`font-semibold ${
                            lossPct > 2
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {lossPct.toFixed(2)}%
                          </span>
                          {lossPct > 2 && (
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4 animate-pulse" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Belum ada riwayat repacking</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                Ubah filter Anda atau daftarkan transaksi repacking baru.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="relative inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="relative ml-3 inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Menampilkan <span className="font-semibold text-zinc-800 dark:text-zinc-200">{(currentPage - 1) * itemsPerPage + 1}</span> hingga{' '}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  dari <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalItems}</span> data
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="relative inline-flex items-center rounded-l-lg border border-zinc-200 bg-white px-2 py-2 text-zinc-400 hover:bg-zinc-50 focus:z-20 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1
                    const isCurrent = pageNum === currentPage
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-3.5 py-2 text-xs font-semibold focus:z-20 ${
                          isCurrent
                            ? 'z-10 bg-emerald-600 text-white dark:bg-emerald-600'
                            : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="relative inline-flex items-center rounded-r-lg border border-zinc-200 bg-white px-2 py-2 text-zinc-400 hover:bg-zinc-50 focus:z-20 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
