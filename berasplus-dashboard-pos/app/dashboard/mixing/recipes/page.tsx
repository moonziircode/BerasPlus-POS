import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Blend, Plus, ArrowRight, ShieldAlert, Award } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RecipesPage() {
  const supabase = await createClient()

  // Fetch recipes with target selling product details
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select(`
      id,
      recipe_code,
      name,
      standard_loss_pct,
      selling_products!recipes_target_product_id_fkey (
        id,
        sku,
        name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Formulasi Resep (Mixing Recipes)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola formula pencampuran (mixing) dan pengemasan beras curah menjadi produk eceran SKU.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/mixing/recipes/create"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Resep Baru</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data resep: {error.message}
        </div>
      )}

      {/* Recipes Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {recipes && recipes.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Kode Resep</th>
                  <th scope="col" className="px-6 py-4">Nama Resep</th>
                  <th scope="col" className="px-6 py-4">Produk Target (SKU)</th>
                  <th scope="col" className="px-6 py-4">Toleransi Susut (%)</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recipes.map((recipe) => {
                  const targetProduct = recipe.selling_products && !Array.isArray(recipe.selling_products)
                    ? (recipe.selling_products as any)
                    : null

                  return (
                    <tr
                      key={recipe.id}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {recipe.recipe_code}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <Blend className="h-4 w-4" />
                          </div>
                          <Link 
                            href={`/dashboard/mixing/recipes/${recipe.id}`}
                            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            {recipe.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {targetProduct ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {targetProduct.name}
                            </span>
                            <span className="text-xs font-mono text-zinc-400">
                              SKU: {targetProduct.sku}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600 italic">Tidak ada produk</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                            {parseFloat(recipe.standard_loss_pct).toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link 
                          href={`/dashboard/mixing/recipes/${recipe.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span>Lihat Detail</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <Blend className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum ada resep pencampuran
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Mulai dengan merumuskan resep produk retail pertama Anda.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/mixing/recipes/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Resep Pertama</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
