import { createClient } from '@/utils/supabase/server'
import { PackageSearch, CheckCircle, Clock } from 'lucide-react'

export default async function SkuProductionBatches({ skuId }: { skuId: string }) {
  const supabase = await createClient()

  const { data: batches, error } = await supabase
    .from('production_batches')
    .select(`
      *,
      locations (
        name
      )
    `)
    .eq('output_product_id', skuId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-100 p-5 dark:border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
          <PackageSearch className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Batch Produksi (Repack/Mix) Terakhir</h3>
      </div>
      
      <div className="p-5">
        {!batches || batches.length === 0 ? (
          <p className="text-sm text-zinc-500">Belum ada batch produksi untuk SKU ini.</p>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{batch.batch_number}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      batch.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                    }`}>
                      {batch.status === 'Completed' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {batch.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{formatDate(batch.created_at)}</span>
                    <span>•</span>
                    <span>{batch.locations?.name || 'Unknown'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {batch.target_output_qty} Pcs
                  </p>
                  <p className="text-xs text-zinc-500">Target Qty</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
