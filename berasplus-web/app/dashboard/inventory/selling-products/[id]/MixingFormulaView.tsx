import { createClient } from '@/utils/supabase/server'
import { Beaker, AlertCircle } from 'lucide-react'

export default async function MixingFormulaView({ skuId }: { skuId: string }) {
  const supabase = await createClient()

  // Ambil batch terakhir bertipe MIXING
  const { data: latestBatch } = await supabase
    .from('production_batches')
    .select(`
      batch_number,
      created_at,
      batch_items (
        id,
        item_type,
        quantity_kg,
        raw_material:raw_materials(name)
      )
    `)
    .eq('output_selling_product_id', skuId)
    .eq('type', 'MIXING')
    .eq('status', 'COMPLETED')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!latestBatch) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm h-full flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-8 w-8 text-zinc-400 mb-2" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Formula Tidak Tersedia</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Produk ini belum pernah melalui proses Mixing.</p>
      </div>
    )
  }

  const inputs = latestBatch.batch_items.filter((item: any) => item.item_type === 'INPUT')
  const totalInputKg = inputs.reduce((sum: number, item: any) => sum + parseFloat(item.quantity_kg), 0)

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Beaker className="h-5 w-5 text-indigo-600" />
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Komposisi Formula (Terakhir)</h3>
      </div>

      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        Batch Referensi: <span className="font-mono text-indigo-600">{latestBatch.batch_number}</span>
      </div>

      <div className="space-y-4 flex-grow">
        {inputs.map((item: any) => {
          const kg = parseFloat(item.quantity_kg)
          const percentage = totalInputKg > 0 ? (kg / totalInputKg) * 100 : 0

          return (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.raw_material?.name}</span>
                <span className="text-zinc-600 dark:text-zinc-400">{kg} Kg ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-sm">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Total Input Curah</span>
        <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalInputKg} Kg</span>
      </div>
    </div>
  )
}
