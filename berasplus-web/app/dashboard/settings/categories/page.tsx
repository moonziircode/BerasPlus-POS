import { createClient } from '@/utils/supabase/server'
import { Tags, FileText, Calendar } from 'lucide-react'
import AddCategoryModal from './AddCategoryModal'
import EditCategoryModal from './EditCategoryModal'
export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  // Date formatting helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Kategori Produk
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola kategori produk untuk membedakan Beras Premium, Beras Medium, Bahan Baku, dan Kemasan.
          </p>
        </div>
        <div>
          <AddCategoryModal />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data kategori: {error.message}
        </div>
      )}

      {/* Categories Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {categories && categories.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Nama Kategori</th>
                  <th scope="col" className="px-6 py-4">Deskripsi</th>
                  <th scope="col" className="px-6 py-4">Tanggal Dibuat</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          <Tags className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      {category.description ? (
                        <div className="flex items-start gap-2">
                          <FileText className="mt-0.5 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="line-clamp-2">{category.description}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600 italic">Tidak ada deskripsi</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{formatDate(category.created_at)}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <EditCategoryModal category={category} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <Tags className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum ada kategori
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Mulai dengan menambahkan kategori produk pertama Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
