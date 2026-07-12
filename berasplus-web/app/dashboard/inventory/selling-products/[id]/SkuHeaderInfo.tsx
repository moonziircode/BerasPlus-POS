'use client'

import { ShoppingBag, Coins, Tags, AlertTriangle, Layers, TrendingUp } from 'lucide-react'

interface SkuHeaderInfoProps {
  sku: any
  totalStockKg: number
  totalQty: number
}

export default function SkuHeaderInfo({ sku, totalStockKg, totalQty }: SkuHeaderInfoProps) {
  const categoryName = sku.categories ? sku.categories.name : 'Tidak Kategori'
  
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Basic Info */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 col-span-1 md:col-span-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {sku.sku}
              </p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {sku.name}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                <Tags className="h-3.5 w-3.5" />
                <span>{categoryName}</span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="font-mono">{sku.unit_weight_kg || 1} Kg/Pcs</span>
              </div>
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              sku.status === 'Active' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
              {sku.status === 'Active' ? 'Aktif' : 'Non-Aktif'}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            <Coins className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Harga & HPP</h3>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs text-zinc-500">Harga Jual</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(parseFloat(sku.sell_price))}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xs text-zinc-500">HPP Avg</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatRupiah(parseFloat(sku.hpp_average))}</span>
          </div>
        </div>
      </div>

      {/* Stock Info */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
            <Layers className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Total Stok</h3>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs text-zinc-500">Stok (Pcs/Karung)</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-mono">{totalQty}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xs text-zinc-500">Stok Aktual (Kg)</span>
            <span className="font-semibold text-zinc-500 dark:text-zinc-400 font-mono">{totalStockKg} Kg</span>
          </div>
        </div>
      </div>
    </div>
  )
}
