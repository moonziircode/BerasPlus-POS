'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Box, ShieldAlert, Store, Package, PackageOpen } from 'lucide-react'

interface StockBalance {
  location_id: string
  store_id: string | null
  location_name: string
  product_type: 'RAW_MATERIAL' | 'PACKAGING' | 'SELLING_PRODUCT'
  product_id: string
  product_name: string
  product_code: string
  current_stock_kg: string | number
  unit_weight_kg?: number
  price?: number
}

interface StockBalanceTableProps {
  balances: StockBalance[]
}

export default function StockBalanceTable({ balances }: StockBalanceTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [hideZero, setHideZero] = useState(true)

  // 1. Get unique locations for filter options
  const locations = useMemo(() => {
    const unique = new Map<string, string>()
    balances.forEach((b) => {
      unique.set(b.location_id, b.location_name)
    })
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
  }, [balances])

  // 2. Filter logic
  const filteredBalances = useMemo(() => {
    return balances.filter((item) => {
      const stock = parseFloat(item.current_stock_kg as string) || 0
      
      // Zero Stock Filter
      if (hideZero && stock === 0) return false

      // Location Filter
      if (locationFilter !== 'ALL' && item.location_id !== locationFilter) return false

      // Product Type Filter
      if (typeFilter !== 'ALL' && item.product_type !== typeFilter) return false

      // Search Query
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchesName = item.product_name?.toLowerCase().includes(query)
        const matchesCode = item.product_code?.toLowerCase().includes(query)
        if (!matchesName && !matchesCode) return false
      }

      return true
    })
  }, [balances, search, locationFilter, typeFilter, hideZero])

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Search Input */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Cari Produk / Kode
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Contoh: Ramos, RM-001..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
            />
          </div>
        </div>

        {/* Location Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Lokasi Toko/Gudang
          </label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
          >
            <option value="ALL">Semua Lokasi</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Type Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Tipe Produk
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="RAW_MATERIAL">Bahan Baku (Raw Material)</option>
            <option value="PACKAGING">Kemasan (Packaging)</option>
          </select>
        </div>

        {/* Checkbox: Hide Zero Stocks */}
        <div className="sm:col-span-4 flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="hideZero"
            checked={hideZero}
            onChange={(e) => setHideZero(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-offset-zinc-900"
          />
          <label htmlFor="hideZero" className="text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
            Sembunyikan produk dengan sisa stok kosong (0)
          </label>
        </div>
      </div>

      {/* Stock Balance Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {filteredBalances.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Lokasi</th>
                  <th scope="col" className="px-6 py-4">Tipe</th>
                  <th scope="col" className="px-6 py-4">Kode Produk</th>
                  <th scope="col" className="px-6 py-4">Nama Produk</th>
                  <th scope="col" className="px-6 py-4 text-right">Harga / HPP</th>
                  <th scope="col" className="px-6 py-4 text-right">Sisa Stok (Kg)</th>
                  <th scope="col" className="px-6 py-4 text-right">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredBalances.map((item) => {
                  const stock = parseFloat(item.current_stock_kg as string) || 0
                  
                  let typeLabel = 'Bahan Baku'
                  let typeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30'
                  let Icon = PackageOpen
                  let qtyStr = ''
                  let stockStr = ''

                  if (item.product_type === 'PACKAGING') {
                    typeLabel = 'Kemasan'
                    typeClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30'
                    Icon = Box
                    stockStr = '-'
                    qtyStr = `${stock.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Pcs`
                  } else {
                    const unitW = item.unit_weight_kg || 1
                    const qty = Math.floor(stock / unitW)
                    stockStr = `${stock.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Kg`
                    qtyStr = `${qty.toLocaleString('id-ID')} Karung`
                  }

                  return (
                    <tr
                      key={`${item.location_id}-${item.product_type}-${item.product_id}`}
                      onClick={() => router.push(`/dashboard/inventory/stock-balance/${item.product_type.toLowerCase()}/${item.product_id}`)}
                      className="group transition-colors hover:bg-zinc-50/50 cursor-pointer dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-zinc-400" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {item.location_name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeClass}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.product_code || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-zinc-950 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.product_name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-zinc-500 dark:text-zinc-400">
                        {formatRupiah(item.price || 0)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-zinc-500 dark:text-zinc-400">
                        {stockStr}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                        {qtyStr}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tidak ada data stok
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Tidak ada sisa stok yang cocok dengan kriteria filter aktif saat ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
