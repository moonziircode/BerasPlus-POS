import { createClient } from '@/utils/supabase/server'
import { TrendingUp } from 'lucide-react'

export default async function SkuHppHistory({ skuId }: { skuId: string }) {
  const supabase = await createClient()

  // Assuming HPP history is tracked in a separate table, 
  // or we derive it from production batches and procurement.
  // For now, let's fetch batches as a proxy for HPP updates, 
  // or just show a placeholder if we don't have a dedicated hpp_history table.

  // Let's check if hpp_history table exists... Actually we can just show production batches cost.
  const { data: batches, error } = await supabase
    .from('production_batches')
    .select('batch_number, actual_hpp, created_at')
    .eq('output_product_id', skuId)
    .eq('status', 'Completed')
    .order('created_at', { ascending: false })
    .limit(5)

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
          <TrendingUp className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Histori Pembentukan HPP (Dari Produksi)</h3>
      </div>
      
      <div className="p-5">
        {!batches || batches.length === 0 ? (
          <p className="text-sm text-zinc-500">Belum ada data HPP dari produksi.</p>
        ) : (
          <div className="space-y-3">
            {batches.map((batch, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
                <div>
                  <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{batch.batch_number}</p>
                  <p className="text-xs text-zinc-500 mt-1">{formatDate(batch.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(parseFloat(batch.actual_hpp))}
                  </p>
                  <p className="text-xs text-zinc-500">HPP / Pcs</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
