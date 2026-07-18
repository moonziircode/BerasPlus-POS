'use client'

import { useState, useMemo } from 'react'
import { PackageOpen, Tags, Scale, CheckCircle, XCircle, Search, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/utils/conversion'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  product_code: string
  barcode: string
  name: string
  product_type: string
  unit_of_measure: string
  weight_per_unit_kg: number
  sell_price: number
  hpp: number
  status: boolean
  categories: Category | null
}

interface InventoryTableProps {
  products: Product[]
  stockMap: Record<string, number>
}

type SortField = 'name' | 'product_type' | 'price' | 'stock' | 'weight'
type SortOrder = 'asc' | 'desc'

export default function InventoryTable({ products, stockMap }: InventoryTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const filteredAndSorted = useMemo(() => {
    let result = products.filter((p) => {
      const q = search.toLowerCase()
      const catName = p.categories?.name?.toLowerCase() || ''
      return (
        p.name.toLowerCase().includes(q) ||
        p.product_code.toLowerCase().includes(q) ||
        p.product_type.toLowerCase().includes(q) ||
        catName.includes(q)
      )
    })

    result.sort((a, b) => {
      let aVal: any = a.name
      let bVal: any = b.name

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'product_type':
          aVal = a.product_type.toLowerCase()
          bVal = b.product_type.toLowerCase()
          break
        case 'price':
          aVal = a.sell_price
          bVal = b.sell_price
          break
        case 'stock':
          aVal = stockMap[a.id] || 0
          bVal = stockMap[b.id] || 0
          break
        case 'weight':
          aVal = a.weight_per_unit_kg || 0
          bVal = b.weight_per_unit_kg || 0
          break
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [products, stockMap, search, sortField, sortOrder])

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Cari produk, kode, atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-xl border border-zinc-200 bg-blue-50/50 py-2.5 pl-10 pr-3.5 text-sm text-zinc-900 placeholder-zinc-500 transition-all focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-blue-900/10 dark:text-zinc-50 dark:placeholder-zinc-400 dark:focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {filteredAndSorted.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">Produk (Nama Produk) <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort('product_type')}>
                    <div className="flex items-center gap-2">Tipe / Kategori <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-2">Harga / HPP <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort('weight')}>
                    <div className="flex items-center gap-2">Berat <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSort('stock')}>
                    <div className="flex items-center gap-2">Stok Saat Ini <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredAndSorted.map((p) => {
                  const catName = p.categories ? p.categories.name : '-'
                  const stock = stockMap[p.id] || 0
                  
                  // Status Logic
                  let statusLabel = 'Aman'
                  let statusColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  
                  if (stock === 0) {
                    statusLabel = 'Habis'
                    statusColor = 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  } else if (stock <= 10) {
                    statusLabel = 'Menipis'
                    statusColor = 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }

                  return (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/inventory/${p.id}`} className="block">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${p.product_type === 'BERAS' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                              <PackageOpen className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                                {p.name}
                              </div>
                              <div className="text-xs font-mono text-zinc-500 mt-0.5">
                                {p.product_code}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/inventory/${p.id}`} className="block">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              p.product_type === 'BERAS' 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            }`}>
                              {p.product_type}
                            </span>
                            <span className="text-xs flex items-center gap-1.5 text-zinc-500">
                              <Tags className="h-3 w-3" /> {catName}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/inventory/${p.id}`} className="block">
                          <div className="flex flex-col gap-1 text-sm">
                            <div><span className="text-zinc-400 text-xs">Jual: </span><span className="font-medium text-zinc-900 dark:text-zinc-100">{formatRupiah(p.sell_price)}</span></div>
                            <div><span className="text-zinc-400 text-xs">HPP: </span><span className="font-medium text-zinc-600 dark:text-zinc-300">{formatRupiah(p.hpp)}</span></div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/inventory/${p.id}`} className="block">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {p.product_type === 'KEMASAN' ? '-' : `${p.weight_per_unit_kg} Kg`}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/inventory/${p.id}`} className="block">
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-zinc-400" />
                            <span className="text-lg font-bold text-zinc-900 dark:text-white">
                              {stock}
                            </span>
                            <span className="text-sm font-medium text-zinc-500">
                              {p.unit_of_measure}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link href={`/dashboard/inventory/${p.id}`} className="block">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tidak ada produk
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Pencarian atau filter Anda tidak menemukan hasil.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
