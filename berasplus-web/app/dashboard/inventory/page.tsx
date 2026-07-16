import { createClient } from '@/utils/supabase/server'
import { PackageOpen, Tags, Scale, CheckCircle, XCircle, Search, Filter } from 'lucide-react'
import AddProductModal from './AddProductModal'
import { formatRupiah } from '@/utils/conversion'

export const dynamic = 'force-dynamic'

export default async function InventoryPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // Get Store ID
  const { data: { user } } = await supabase.auth.getUser()
  const { data: storeRole } = await supabase
    .from('user_stores')
    .select('store_id')
    .eq('user_id', user?.id || '')
    .single()
    
  const storeId = storeRole?.store_id

  // Fetch Categories for modal dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  // Build query for Products
  let query = supabase
    .from('products')
    .select(`
      id,
      product_code,
      barcode,
      name,
      product_type,
      unit_of_measure,
      weight_per_unit_kg,
      sell_price,
      hpp,
      status:is_active,
      categories (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Filtering
  const filterType = searchParams?.type as string
  if (filterType && filterType !== 'ALL') {
    query = query.eq('product_type', filterType)
  }

  const { data: products, error } = await query

  // Fetch Stock Balances
  // A simple view or RPC would be better, but we can also map via get_current_stock or grouping
  // For simplicity since it's a server component, we fetch all ledger entries for this store and group them.
  const { data: ledgers } = await supabase
    .from('inventory_ledger')
    .select('product_id, quantity')
    .eq('store_id', storeId || '')
  
  const stockMap: Record<string, number> = {}
  if (ledgers) {
    ledgers.forEach(l => {
      stockMap[l.product_id] = (stockMap[l.product_id] || 0) + Number(l.quantity)
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Inventaris Produk
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola seluruh persediaan barang, baik beras curah, beras kemasan, maupun karung.
          </p>
        </div>
        <div>
          <AddProductModal categories={categories || []} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
          Gagal mengambil data inventaris: {error.message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <a href="/dashboard/inventory" className={`px-4 py-2 text-sm font-medium rounded-lg ${!filterType || filterType === 'ALL' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>
          Semua Produk
        </a>
        <a href="/dashboard/inventory?type=BERAS" className={`px-4 py-2 text-sm font-medium rounded-lg ${filterType === 'BERAS' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>
          Beras
        </a>
        <a href="/dashboard/inventory?type=KEMASAN" className={`px-4 py-2 text-sm font-medium rounded-lg ${filterType === 'KEMASAN' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>
          Kemasan Kosong
        </a>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {products && products.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Produk</th>
                  <th scope="col" className="px-6 py-4">Tipe / Kategori</th>
                  <th scope="col" className="px-6 py-4">Harga / HPP</th>
                  <th scope="col" className="px-6 py-4">Stok Saat Ini</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {products.map((p) => {
                  const catName = p.categories && !Array.isArray(p.categories) ? (p.categories as any).name : '-'
                  const stock = stockMap[p.id] || 0
                  
                  return (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${p.product_type === 'BERAS' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                            <PackageOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {p.name}
                            </div>
                            <div className="text-xs font-mono text-zinc-500 mt-0.5">
                              {p.product_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`w-fit inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.product_type === 'BERAS' 
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}>
                            {p.product_type}
                          </span>
                          <span className="text-xs flex items-center gap-1.5 text-zinc-500">
                            <Tags className="h-3 w-3" /> {catName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm">
                          <div><span className="text-zinc-400 text-xs">Jual: </span><span className="font-medium text-zinc-900 dark:text-zinc-100">{formatRupiah(p.sell_price)}</span></div>
                          <div><span className="text-zinc-400 text-xs">HPP: </span><span className="font-medium text-zinc-600 dark:text-zinc-300">{formatRupiah(p.hpp)}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-zinc-400" />
                          <span className="text-lg font-bold text-zinc-900 dark:text-white">
                            {stock}
                          </span>
                          <span className="text-sm font-medium text-zinc-500">
                            {p.unit_of_measure}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {p.status ? (
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
                Belum ada produk
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Tambahkan produk master pertama Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
