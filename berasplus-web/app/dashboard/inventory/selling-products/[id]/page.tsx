import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, PackageSearch, History, TrendingUp, Activity, Coins, ClipboardList } from 'lucide-react'

// Sub-components
import SkuHeaderInfo from './SkuHeaderInfo'
import SkuStockLedger from './SkuStockLedger'
import SkuProductionBatches from './SkuProductionBatches'
import SkuHppHistory from './SkuHppHistory'

// New Sub-components
import DetailedHPPBreakdown from './DetailedHPPBreakdown'
import MixingFormulaView from './MixingFormulaView'
import StockHistoryTimeline from './StockHistoryTimeline'
import StockDistributionCard from './StockDistributionCard'
import StockTrendChart from './StockTrendChart'
import AuditLogPanel from './AuditLogPanel'

export const dynamic = 'force-dynamic'

export default async function SkuDetailView({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // 1. Fetch SKU details
  const { data: sku, error: skuError } = await supabase
    .from('selling_products')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq('id', params.id)
    .single()

  if (skuError || !sku) {
    notFound()
  }

  // 2. Fetch current stock balance from view (global stock across all locations)
  const { data: stockBalance, error: stockError } = await supabase
    .from('inventory_balances_view')
    .select('location_id, current_stock_kg')
    .eq('product_id', params.id)

  const totalStockKg = stockBalance?.reduce((acc, curr) => acc + (curr.current_stock_kg || 0), 0) || 0
  const unitWeightKg = sku.unit_weight_kg || 1
  const totalQty = Math.floor(totalStockKg / unitWeightKg)

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/inventory/selling-products"
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-600 border border-zinc-200 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar SKU</span>
        </Link>
        
        <div className="flex gap-2">
          {/* Edit/Delete actions can be added here later */}
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-600 border border-zinc-200 shadow-sm transition-all hover:bg-zinc-50 hover:text-emerald-600 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-emerald-400">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Header Info Panel */}
      <SkuHeaderInfo sku={sku} totalStockKg={totalStockKg} totalQty={totalQty} />

      {/* Trend & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockTrendChart skuId={sku.id} />
        </div>
        <div className="lg:col-span-1">
          <StockDistributionCard skuId={sku.id} stockBalance={stockBalance || []} unitWeightKg={unitWeightKg} />
        </div>
      </div>

      {/* Production & Cost Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailedHPPBreakdown skuId={sku.id} unitWeightKg={unitWeightKg} />
        <MixingFormulaView skuId={sku.id} />
      </div>

      {/* Historical Data & Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <StockHistoryTimeline skuId={sku.id} unitWeightKg={unitWeightKg} />
        </div>
        <div className="space-y-6">
          <SkuStockLedger skuId={sku.id} unitWeightKg={unitWeightKg} />
          <AuditLogPanel skuId={sku.id} />
        </div>
      </div>
    </div>
  )
}
