import { createClient } from '@/utils/supabase/server'
import { Box, Maximize2, Coins, CheckCircle, XCircle } from 'lucide-react'
import AddPackagingModal from './AddPackagingModal'

export const dynamic = 'force-dynamic'

export default async function PackagingPage() {
  const supabase = await createClient()

  // Fetch Packaging Materials
  const { data: packagingMaterials, error } = await supabase
    .from('packaging_materials')
    .select('*')
    .order('created_at', { ascending: false })

  // Rupiah formatting helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Material Kemasan (Packaging)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola persediaan karung sack, kantong plastik beras, dan perlengkapan pengemasan retail.
          </p>
        </div>
        <div>
          <AddPackagingModal />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data kemasan: {error.message}
        </div>
      )}

      {/* Packaging Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {packagingMaterials && packagingMaterials.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Kode</th>
                  <th scope="col" className="px-6 py-4">Nama Kemasan</th>
                  <th scope="col" className="px-6 py-4">Dimensi / Ukuran</th>
                  <th scope="col" className="px-6 py-4">Harga Beli / Pcs</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {packagingMaterials.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {pkg.packaging_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          <Box className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {pkg.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {pkg.size_dimension ? (
                        <div className="flex items-center gap-2">
                          <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{pkg.size_dimension}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Coins className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                          {formatRupiah(parseFloat(pkg.buy_price_per_pcs))}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {pkg.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400">
                          <XCircle className="h-3 w-3" />
                          <span>Non-Aktif</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <Box className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum ada data kemasan
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Silakan tambahkan data kemasan pertama Anda untuk melengkapi stok retail.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
