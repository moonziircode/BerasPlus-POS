import { createClient } from '@/utils/supabase/server'
import { PackageOpen } from 'lucide-react'
import AddProductModal from './AddProductModal'
import InventoryTable from './InventoryTable'
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
      <InventoryTable products={(products as any) || []} stockMap={stockMap} />
    </div>
  )
}
