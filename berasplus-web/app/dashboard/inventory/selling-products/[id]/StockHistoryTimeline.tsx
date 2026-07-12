import { createClient } from '@/utils/supabase/server'
import { History, ArrowRight, ArrowLeft, RefreshCcw, Package, ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function StockHistoryTimeline({ skuId, unitWeightKg }: { skuId: string, unitWeightKg: number }) {
  const supabase = await createClient()

  // Ambil history dari ledger
  const { data: ledger } = await supabase
    .from('inventory_ledger')
    .select(`
      id,
      transaction_type,
      reference_id,
      change_kg,
      created_at,
      location:inventory_locations(name, type)
    `)
    .eq('product_id', skuId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!ledger || ledger.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-zinc-600" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Timeline Riwayat Stok</h3>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">Belum ada riwayat mutasi stok.</div>
      </div>
    )
  }

  const getIcon = (type: string, changeKg: number) => {
    if (type === 'MIXING' || type === 'REPACKING' || type === 'PRODUCTION') return <Package className="h-4 w-4 text-indigo-500" />
    if (type === 'SALE' || type === 'SALES') return <ShoppingCart className="h-4 w-4 text-rose-500" />
    if (type === 'TRANSFER' || type === 'ADJUSTMENT') return <RefreshCcw className="h-4 w-4 text-amber-500" />
    return changeKg > 0 ? <ArrowRight className="h-4 w-4 text-emerald-500" /> : <ArrowLeft className="h-4 w-4 text-rose-500" />
  }

  const getLabel = (type: string) => {
    switch (type) {
      case 'MIXING': return 'Hasil Mixing'
      case 'REPACKING': return 'Hasil Repacking'
      case 'PRODUCTION': return 'Produksi (Hasil)'
      case 'SALE':
      case 'SALES': return 'Penjualan'
      case 'TRANSFER': return 'Mutasi Antar Gudang'
      case 'ADJUSTMENT': return 'Penyesuaian Stok (SO)'
      default: return type
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm h-full max-h-[500px] overflow-y-auto relative scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
      <div className="sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800 z-10">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Timeline Riwayat Stok (10 Terakhir)</h3>
        </div>
      </div>

      <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800 ml-3 pl-5 space-y-6">
        {ledger.map((item: any) => {
          const kg = parseFloat(item.change_kg)
          const qty = Math.floor(Math.abs(kg) / unitWeightKg)
          const isPositive = kg > 0
          const colorClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          const bgClass = isPositive ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30'

          return (
            <div key={item.id} className="relative">
              {/* Dot icon */}
              <div className="absolute -left-[30px] top-1 h-6 w-6 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                {getIcon(item.transaction_type, kg)}
              </div>
              
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {getLabel(item.transaction_type)}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                </span>
              </div>
              
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                Lokasi: {item.location?.name}
              </div>

              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bgClass} ${colorClass}`}>
                <span className="font-bold">{isPositive ? '+' : ''}{kg} Kg</span>
                <span className="text-xs opacity-75">({isPositive ? '+' : ''}{qty} Pcs)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
