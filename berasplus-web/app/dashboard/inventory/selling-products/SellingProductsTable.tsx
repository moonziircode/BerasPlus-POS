'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShoppingBag, Coins, Tags, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface SellingProduct {
  id: string
  sku: string
  name: string
  sell_price: string | number
  hpp_average: string | number
  min_stock_level: string | number
  status: string
  categories: Category | Category[] | null
  unit_weight_kg?: number
}

interface SellingProductsTableProps {
  products: SellingProduct[]
  categories: Category[]
}

export default function SellingProductsTable({ products, categories }: SellingProductsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortOption, setSortOption] = useState('NAME_ASC')

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((item) => {
      // Status Filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false

      // Category Filter
      const catId = Array.isArray(item.categories) ? item.categories[0]?.id : item.categories?.id
      if (categoryFilter !== 'ALL' && catId !== categoryFilter) return false

      // Search Query
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchesName = item.name?.toLowerCase().includes(query)
        const matchesCode = item.sku?.toLowerCase().includes(query)
        if (!matchesName && !matchesCode) return false
      }

      return true
    })

    // Sorting
    result.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase()
      const nameB = (b.name || '').toLowerCase()
      const priceA = parseFloat(a.sell_price as string) || 0
      const priceB = parseFloat(b.sell_price as string) || 0
      const hppA = parseFloat(a.hpp_average as string) || 0
      const hppB = parseFloat(b.hpp_average as string) || 0

      switch (sortOption) {
        case 'NAME_ASC':
          return nameA.localeCompare(nameB)
        case 'NAME_DESC':
          return nameB.localeCompare(nameA)
        case 'PRICE_DESC':
          return priceB - priceA
        case 'PRICE_ASC':
          return priceA - priceB
        case 'HPP_DESC':
          return hppB - hppA
        case 'HPP_ASC':
          return hppA - hppB
        default:
          return 0
      }
    })

    return result
  }, [products, search, categoryFilter, statusFilter, sortOption])

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
        <div className="sm:col-span-1 space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Cari SKU / Nama
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
            />
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Kategori
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
          >
            <option value="ALL">Semua Status</option>
            <option value="Active">Aktif</option>
            <option value="Inactive">Non-Aktif</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Urutkan
          </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
          >
            <option value="NAME_ASC">Nama A-Z</option>
            <option value="NAME_DESC">Nama Z-A</option>
            <option value="PRICE_DESC">Harga Tertinggi</option>
            <option value="PRICE_ASC">Harga Terendah</option>
            <option value="HPP_DESC">HPP Avg Tertinggi</option>
            <option value="HPP_ASC">HPP Avg Terendah</option>
          </select>
        </div>
      </div>

      {/* Selling Products Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {filteredAndSortedProducts.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">SKU / Barcode</th>
                  <th scope="col" className="px-6 py-4">Nama Produk</th>
                  <th scope="col" className="px-6 py-4">Kategori</th>
                  <th scope="col" className="px-6 py-4">Harga Jual</th>
                  <th scope="col" className="px-6 py-4">HPP Avg</th>
                  <th scope="col" className="px-6 py-4">Berat (Kg)</th>
                  <th scope="col" className="px-6 py-4">Batas Stok</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredAndSortedProducts.map((sp) => {
                  const categoryName = sp.categories && !Array.isArray(sp.categories)
                    ? (sp.categories as any).name
                    : 'Tidak Kategori'

                  return (
                    <tr
                      key={sp.id}
                      onClick={() => router.push(`/dashboard/inventory/selling-products/${sp.id}`)}
                      className="group transition-colors hover:bg-zinc-50/50 cursor-pointer dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {sp.sku}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-zinc-950 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {sp.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tags className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{categoryName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Coins className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-sans">
                            {formatRupiah(parseFloat(sp.sell_price as string))}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-zinc-500 dark:text-zinc-400 font-sans">
                          {formatRupiah(parseFloat(sp.hpp_average as string))}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-zinc-900 dark:text-zinc-100">
                        {sp.unit_weight_kg || 1} Kg
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                          <AlertTriangle className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-medium font-mono">{parseInt(sp.min_stock_level as string)} Pcs</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {sp.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400">
                            <XCircle className="h-3 w-3" />
                            <span>Non-Aktif</span>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum ada produk jual
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Silakan tambahkan produk SKU retail atau sesuaikan filter pencarian.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
