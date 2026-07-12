import { createClient } from '@/utils/supabase/server'
import { ShoppingBag, Coins, Tags, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import AddSellingProductModal from './AddSellingProductModal'
import SellingProductsTable from './SellingProductsTable'

export const dynamic = 'force-dynamic'

export default async function SellingProductsPage() {
  const supabase = await createClient()

  // Fetch Selling Products
  const { data: sellingProducts, error } = await supabase
    .from('selling_products')
    .select(`
      id,
      sku,
      name,
      sell_price,
      hpp_average,
      min_stock_level,
      unit_weight_kg,
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
            Produk Jual (SKU)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola katalog produk retail yang dipajang di kasir, lengkap dengan harga jual dan aturan batas stok.
          </p>
        </div>
        <div>
          <AddSellingProductModal categories={categories || []} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data produk jual: {error.message}
        </div>
      )}

      {!error && (
        <SellingProductsTable products={sellingProducts || []} categories={categories || []} />
      )}
    </div>
  )
}
