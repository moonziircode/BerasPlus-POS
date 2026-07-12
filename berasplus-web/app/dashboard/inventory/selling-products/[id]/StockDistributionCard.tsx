import { createClient } from '@/utils/supabase/server'
import { MapPin, Warehouse, Store } from 'lucide-react'

export default async function StockDistributionCard({ skuId, stockBalance, unitWeightKg }: { skuId: string, stockBalance: any[], unitWeightKg: number }) {
  const supabase = await createClient()

  // Ambil detail lokasi untuk map nama dan tipe
  const { data: locations } = await supabase
    .from('inventory_locations')
    .select('id, name, type')

  const locationMap = new Map(locations?.map(l => [l.id, l]) || [])

  // Gabungkan balance dengan nama lokasi
  const distribution = stockBalance.map(sb => {
    const loc = locationMap.get(sb.location_id) || { name: 'Unknown', type: 'STORE' }
    const kg = parseFloat(sb.current_stock_kg || '0')
    const qty = Math.floor(kg / unitWeightKg)
    return { ...sb, locationName: loc.name, locationType: loc.type, kg, qty }
  }).filter(d => d.kg > 0) // Hanya tampilkan yang ada stoknya

  const totalKg = distribution.reduce((sum, item) => sum + item.kg, 0)

  if (distribution.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm h-full flex flex-col justify-center items-center">
        <MapPin className="h-6 w-6 text-zinc-400 mb-2" />
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Belum ada sebaran stok. Stok kosong.</span>
      </div>
    )
  }

  // Urutkan dari stok terbanyak
  distribution.sort((a, b) => b.kg - a.kg)

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-5 w-5 text-amber-500" />
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Sebaran Lokasi Stok</h3>
      </div>

      <div className="space-y-4">
        {distribution.map((item, idx) => {
          const percentage = totalKg > 0 ? (item.kg / totalKg) * 100 : 0
          
          return (
            <div key={item.location_id || idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.locationType === 'WAREHOUSE' ? (
                    <Warehouse className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <Store className="h-4 w-4 text-zinc-500" />
                  )}
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.locationName}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.kg} Kg</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.qty} Pcs</div>
                </div>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
