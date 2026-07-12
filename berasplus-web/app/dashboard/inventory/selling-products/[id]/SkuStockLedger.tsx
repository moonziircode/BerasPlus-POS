import { createClient } from '@/utils/supabase/server'
import { Activity, ArrowDownRight, ArrowUpRight, History } from 'lucide-react'

export default async function SkuStockLedger({ skuId, unitWeightKg }: { skuId: string, unitWeightKg: number }) {
  const supabase = await createClient()

  // Fetch last 10 ledger entries for this SKU
  const { data: ledger, error } = await supabase
    .from('inventory_ledger')
    .select(`
      *,
      locations (
        name
      )
    `)
    .eq('product_id', skuId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/30 dark:bg-rose-950/20">
        <p className="text-sm text-rose-600 dark:text-rose-400">Gagal memuat histori stok.</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-100 p-5 dark:border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
          <Activity className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Histori Pergerakan Stok</h3>
      </div>

      <div className="p-5">
        {!ledger || ledger.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-500">Belum ada pergerakan stok.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ledger.map((entry) => {
              const isOut = ['SALES', 'ADJUSTMENT_OUT', 'PRODUCTION_OUT'].includes(entry.transaction_type)
              const icon = isOut ? <ArrowUpRight className="h-4 w-4 text-rose-500" /> : <ArrowDownRight className="h-4 w-4 text-emerald-500" />
              const sign = isOut ? '-' : '+'
              const qty = Math.floor(Math.abs(entry.quantity_kg) / unitWeightKg)
              
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-zinc-100 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isOut ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {entry.transaction_type}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                        <span>{formatDate(entry.created_at)}</span>
                        <span>•</span>
                        <span>{entry.locations?.name || 'Unknown Location'}</span>
                      </div>
                      {entry.reference_id && (
                        <p className="mt-1 text-xs font-mono text-zinc-400">Ref: {entry.reference_id}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${isOut ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {sign}{qty} Pcs
                    </p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      ({sign}{Math.abs(entry.quantity_kg)} Kg)
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
