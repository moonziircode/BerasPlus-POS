import { createClient } from '@/utils/supabase/server'
import StockBalanceTable from './StockBalanceTable'
import { Package, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StockBalancePage() {
  const supabase = await createClient()

  // Fetch stock balances from view
  const { data: balances, error } = await supabase
    .from('inventory_balances_view')
    .select('*')
    .order('location_name')

  // Fetch Raw Materials
  const { data: rawMaterials } = await supabase
    .from('raw_materials')
    .select('id, conversion_factor, hpp')

  // Fetch Packaging
  const { data: packaging } = await supabase
    .from('packaging_materials')
    .select('id, buy_price_per_pcs')

  // Filter out SELLING_PRODUCT and enrich
  const enrichedBalances = (balances || [])
    .filter(b => b.product_type !== 'SELLING_PRODUCT')
    .map(b => {
      let unit_weight_kg = 0
      let price = 0

      if (b.product_type === 'RAW_MATERIAL') {
        const rm = rawMaterials?.find(r => r.id === b.product_id)
        unit_weight_kg = rm ? parseFloat(rm.conversion_factor) || 1 : 1
        price = rm ? parseFloat(rm.hpp) || 0 : 0
      } else if (b.product_type === 'PACKAGING') {
        const pkg = packaging?.find(p => p.id === b.product_id)
        unit_weight_kg = 1 // Since stock is already in pcs
        price = pkg ? parseFloat(pkg.buy_price_per_pcs) || 0 : 0
      }

      return {
        ...b,
        unit_weight_kg,
        price
      }
    })

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans flex items-center gap-2">
            <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <span>Sisa Saldo Stok</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola persediaan Bahan Baku dan Kemasan. Stok otomatis dihitung berdasarkan Inventory Ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/procurement/direct-purchase/create"
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Item via Pembelian</span>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data saldo stok: {error.message}
        </div>
      ) : (
        <StockBalanceTable balances={enrichedBalances} />
      )}
    </div>
  )
}
