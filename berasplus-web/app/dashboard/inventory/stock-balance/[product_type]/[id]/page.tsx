import { createClient } from '@/utils/supabase/server'
import { Package, PackageOpen, Box, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import StockHistoryTable from './StockHistoryTable'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    product_type: string
    id: string
  }>
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { product_type, id } = await params
  const supabase = await createClient()

  const dbProductType = product_type.toUpperCase()
  if (!['RAW_MATERIAL', 'PACKAGING'].includes(dbProductType)) {
    notFound()
  }

  // Fetch product details
  let product = null
  if (dbProductType === 'RAW_MATERIAL') {
    const { data } = await supabase.from('raw_materials').select('*').eq('id', id).single()
    if (data) {
      product = {
        code: data.code,
        name: data.name,
        category: data.category || 'Bahan Baku',
        price: data.hpp,
        unit_weight_kg: data.conversion_factor,
        min_stock: data.min_stock_level,
        typeLabel: 'Bahan Baku',
        Icon: PackageOpen
      }
    }
  } else if (dbProductType === 'PACKAGING') {
    const { data } = await supabase.from('packaging_materials').select('*').eq('id', id).single()
    if (data) {
      product = {
        code: data.code,
        name: data.name,
        category: data.type || 'Kemasan',
        price: data.buy_price_per_pcs,
        unit_weight_kg: 1, // virtual
        min_stock: data.min_stock_level,
        typeLabel: 'Kemasan',
        Icon: Box
      }
    }
  }

  if (!product) {
    notFound()
  }

  // Fetch ledger history
  const { data: ledger } = await supabase
    .from('inventory_ledger')
    .select(`
      *,
      locations ( name )
    `)
    .eq('product_id', id)
    .order('timestamp', { ascending: false })

  // Calculate current total stock across all locations
  const { data: balances } = await supabase
    .from('inventory_balances_view')
    .select('current_stock_kg')
    .eq('product_id', id)
  
  const totalStock = (balances || []).reduce((acc, curr) => acc + (parseFloat(curr.current_stock_kg) || 0), 0)
  const totalQty = Math.floor(totalStock / (product.unit_weight_kg || 1))

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/inventory/stock-balance"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm border border-zinc-200 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans flex items-center gap-2">
              <product.Icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <span>Detail {product.typeLabel}</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
              Informasi produk dan riwayat mutasi (Inventory Ledger).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Info Card */}
        <div className="col-span-1 md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Informasi Produk</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Kode</p>
              <p className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{product.code || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Kategori</p>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.category}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Nama Produk</p>
              <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{product.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Harga / HPP</p>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatRupiah(product.price || 0)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Berat Satuan</p>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {dbProductType === 'PACKAGING' ? '-' : `${product.unit_weight_kg} Kg`}
              </p>
            </div>
          </div>
        </div>

        {/* Stock Summary Card */}
        <div className="col-span-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4">Total Sisa Stok</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Stok (Kg)</p>
              <p className="mt-1 font-mono text-3xl font-bold text-emerald-950 dark:text-emerald-50">
                {dbProductType === 'PACKAGING' ? '-' : `${totalStock.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Kg`}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Estimasi Qty</p>
              <p className="mt-1 font-mono text-xl font-bold text-emerald-800 dark:text-emerald-300">
                {dbProductType === 'PACKAGING' 
                  ? `${totalStock.toLocaleString('id-ID')} Pcs` 
                  : `${totalQty.toLocaleString('id-ID')} Karung`}
              </p>
            </div>
            {product.min_stock > 0 && (
              <div className="pt-4 border-t border-emerald-200 dark:border-emerald-900/50">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Minimum Stok: {product.min_stock} {dbProductType === 'PACKAGING' ? 'Pcs' : 'Kg'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ledger History */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Riwayat Transaksi (Ledger)</h2>
        </div>
        <StockHistoryTable ledger={ledger || []} type={dbProductType} />
      </div>
    </div>
  )
}
