import { createClient } from '@/utils/supabase/server'
import { PackageOpen, Scale, Tags, CheckCircle, XCircle } from 'lucide-react'
import AddRawMaterialModal from './AddRawMaterialModal'

export const dynamic = 'force-dynamic'

export default async function RawMaterialsPage() {
  const supabase = await createClient()

  // Fetch Raw Materials with Category name
  const { data: rawMaterials, error } = await supabase
    .from('raw_materials')
    .select(`
      id,
      rm_code,
      name,
      conversion_factor,
      base_unit,
      status,
      categories (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Fetch Categories for modal dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Bahan Baku (Raw Materials)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola persediaan bahan baku mentah atau beras curah sebelum diolah/dicampur (mixing).
          </p>
        </div>
        <div>
          <AddRawMaterialModal categories={categories || []} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data bahan baku: {error.message}
        </div>
      )}

      {/* Raw Materials Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {rawMaterials && rawMaterials.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Kode</th>
                  <th scope="col" className="px-6 py-4">Nama Bahan Baku</th>
                  <th scope="col" className="px-6 py-4">Kategori</th>
                  <th scope="col" className="px-6 py-4">Faktor Konversi</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {rawMaterials.map((rm) => {
                  // Resolve nested categories properties
                  const categoryName = rm.categories && !Array.isArray(rm.categories)
                    ? (rm.categories as any).name
                    : 'Tidak Kategori'

                  return (
                    <tr
                      key={rm.id}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {rm.rm_code}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <PackageOpen className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {rm.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tags className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{categoryName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Scale className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {parseFloat(rm.conversion_factor).toFixed(4)} {rm.base_unit}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {rm.status === 'Active' ? (
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
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <PackageOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum ada bahan baku
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Silakan tambahkan item bahan baku pertama Anda untuk memulai inventaris.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
