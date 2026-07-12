import { createClient } from '@/utils/supabase/server'
import { Calculator, AlertCircle } from 'lucide-react'

export default async function DetailedHPPBreakdown({ skuId, unitWeightKg }: { skuId: string, unitWeightKg: number }) {
  const supabase = await createClient()

  // Ambil batch produksi terakhir untuk SKU ini yang berstatus COMPLETED
  const { data: latestBatch } = await supabase
    .from('production_batches')
    .select(`
      batch_number,
      created_at,
      batch_items (
        id,
        item_type,
        quantity_kg,
        quantity_pcs,
        hpp_per_kg,
        hpp_per_pcs,
        raw_material:raw_materials(name),
        packaging_material:packaging_materials(name)
      )
    `)
    .eq('output_selling_product_id', skuId)
    .eq('status', 'COMPLETED')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!latestBatch) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm h-full flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-8 w-8 text-zinc-400 mb-2" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Rincian HPP Tidak Tersedia</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Belum ada riwayat produksi (Mixing/Repacking) untuk SKU ini.</p>
      </div>
    )
  }

  const inputs = latestBatch.batch_items.filter((item: any) => item.item_type === 'INPUT')
  const packaging = latestBatch.batch_items.filter((item: any) => item.item_type === 'PACKAGING')
  const output = latestBatch.batch_items.find((item: any) => item.item_type === 'OUTPUT')

  const totalInputCost = inputs.reduce((sum: number, item: any) => sum + (parseFloat(item.quantity_kg) * parseFloat(item.hpp_per_kg)), 0)
  const totalPkgCost = packaging.reduce((sum: number, item: any) => sum + (parseFloat(item.quantity_pcs) * parseFloat(item.hpp_per_pcs)), 0)
  const totalCost = totalInputCost + totalPkgCost
  const outputQty = output ? parseFloat(output.quantity_pcs) : 1
  const hppPerQty = totalCost / (outputQty > 0 ? outputQty : 1)

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5 text-emerald-600" />
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Rincian Perhitungan HPP</h3>
      </div>
      
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        Berdasarkan batch produksi terakhir: <span className="font-mono text-emerald-600">{latestBatch.batch_number}</span>
      </div>

      <div className="space-y-4">
        {/* Biaya Bahan Baku */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Bahan Baku (Curah)</h4>
          <div className="space-y-2">
            {inputs.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">{item.raw_material?.name} ({item.quantity_kg} Kg)</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  Rp {(item.quantity_kg * item.hpp_per_kg).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Biaya Kemasan */}
        {packaging.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Kemasan</h4>
            <div className="space-y-2">
              {packaging.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">{item.packaging_material?.name} ({item.quantity_pcs} Pcs)</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Rp {(item.quantity_pcs * item.hpp_per_pcs).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Total Biaya Produksi</span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Rp {totalCost.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400">
          <span>Hasil Produksi</span>
          <span>{outputQty} Pcs / Karung</span>
        </div>
        
        <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">HPP per Qty (Pcs)</span>
          <span className="text-lg font-bold text-emerald-600">Rp {hppPerQty.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
    </div>
  )
}
