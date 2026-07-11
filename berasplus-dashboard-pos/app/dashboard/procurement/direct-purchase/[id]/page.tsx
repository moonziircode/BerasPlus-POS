import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Store, User, FileText, CheckCircle, Clock, Truck } from 'lucide-react'
import ReceiveDPGoodsModal from '../ReceiveDPGoodsModal'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DirectPurchaseDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch direct purchase header
  const { data: purchase, error: purchaseError } = await supabase
    .from('direct_purchases')
    .select(`
      id,
      purchase_date,
      status,
      total_amount,
      notes,
      created_at,
      store_id,
      stores (
        id,
        name,
        store_code
      ),
      suppliers (
        id,
        name,
        contact_person,
        phone,
        address
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (purchaseError || !purchase) {
    notFound()
  }

  // 2. Fetch direct purchase items
  const { data: items, error: itemsError } = await supabase
    .from('direct_purchase_items')
    .select(`
      id,
      quantity,
      price_per_unit,
      subtotal,
      total_kg,
      raw_materials (
        id,
        name,
        rm_code,
        base_unit
      ),
      packaging_materials (
        id,
        name,
        packaging_code
      )
    `)
    .eq('dp_id', id)

  // Rupiah formatting helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  // Date formatting helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const storeName = purchase.stores
    ? Array.isArray(purchase.stores)
      ? purchase.stores[0]?.name
      : (purchase.stores as any).name
    : 'Gudang Cabang'

  const supplierName = purchase.suppliers
    ? Array.isArray(purchase.suppliers)
      ? purchase.suppliers[0]?.name
      : (purchase.suppliers as any).name
    : 'Pemasok Umum'

  const supplierContact = purchase.suppliers
    ? Array.isArray(purchase.suppliers)
      ? (purchase.suppliers[0] as any).contact_person || (purchase.suppliers[0] as any).phone || '-'
      : (purchase.suppliers as any).contact_person || (purchase.suppliers as any).phone || '-'
    : '-'

  const supplierAddress = purchase.suppliers
    ? Array.isArray(purchase.suppliers)
      ? (purchase.suppliers[0] as any).address || '-'
      : (purchase.suppliers as any).address || '-'
    : '-'

  const isWaiting = purchase.status === 'Waiting Delivery'

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* Back Button & Action Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/procurement/direct-purchase"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {isWaiting && (
          <div className="flex gap-2">
            <Link
              href={`/dashboard/procurement/direct-purchase/${purchase.id}/edit`}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Edit Pembelian
            </Link>
            <ReceiveDPGoodsModal
              dpId={purchase.id}
              storeId={purchase.store_id}
              supplierName={supplierName}
              purchaseDate={formatDate(purchase.purchase_date)}
              items={items || []}
            />
          </div>
        )}
      </div>

      {/* Invoice Card */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        
        {/* Invoice Top Bar */}
        <div className="bg-emerald-600 px-8 py-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-emerald-100" />
              <span className="text-sm font-semibold tracking-wider uppercase text-emerald-100">Direct Purchase</span>
            </div>
            <h2 className="text-xl font-mono mt-1 font-bold">NOTA: {purchase.id.slice(0, 8).toUpperCase()}</h2>
          </div>
          <div>
            {purchase.status === 'Received' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 text-xs font-bold text-emerald-100">
                <CheckCircle className="h-4 w-4" />
                <span>RECEIVED (SUDAH MASUK STOK)</span>
              </span>
            ) : isWaiting ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1.5 text-xs font-bold text-amber-100">
                <Clock className="h-4 w-4 animate-pulse" />
                <span>WAITING DELIVERY</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/20 border border-zinc-400/30 px-3 py-1.5 text-xs font-bold text-zinc-100">
                <span>{purchase.status.toUpperCase()}</span>
              </span>
            )}
          </div>
        </div>

        {/* Invoice Info Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10">
          {/* Supplier Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-600" />
              <span>SUPPLIER / PEMASOK</span>
            </h3>
            <div>
              <div className="font-bold text-zinc-900 dark:text-zinc-50 text-base">{supplierName}</div>
              <div className="text-xs text-zinc-500 mt-1">Kontak: {supplierContact}</div>
              <div className="text-xs text-zinc-500 mt-1 max-w-sm">Alamat: {supplierAddress}</div>
            </div>
          </div>

          {/* Delivery & Date Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-emerald-600" />
              <span>PENGIRIMAN & TANGGAL</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-zinc-400 block">Toko Tujuan</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">{storeName}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Tanggal Transaksi</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{formatDate(purchase.purchase_date)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <h3 className="text-xs font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mb-4">
            DAFTAR ITEM YANG DIBELANJAKAN
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400 border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs font-semibold">
                  <th className="py-3 font-semibold">Nama Item</th>
                  <th className="py-3 font-semibold">Kode SKU</th>
                  <th className="py-3 font-semibold text-center">Jumlah (Qty)</th>
                  <th className="py-3 font-semibold text-center">Total Kg</th>
                  <th className="py-3 font-semibold text-right">Harga Satuan</th>
                  <th className="py-3 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items && items.length > 0 ? (
                  items.map((item) => {
                    const isRaw = item.raw_materials !== null
                    const name = isRaw 
                      ? Array.isArray(item.raw_materials) ? item.raw_materials[0]?.name : (item.raw_materials as any).name
                      : Array.isArray(item.packaging_materials) ? item.packaging_materials[0]?.name : (item.packaging_materials as any).name
                    
                    const code = isRaw 
                      ? Array.isArray(item.raw_materials) ? item.raw_materials[0]?.rm_code : (item.raw_materials as any).rm_code
                      : Array.isArray(item.packaging_materials) ? item.packaging_materials[0]?.packaging_code : (item.packaging_materials as any).packaging_code

                    const unit = isRaw
                      ? Array.isArray(item.raw_materials) ? item.raw_materials[0]?.base_unit : (item.raw_materials as any).base_unit
                      : 'Pcs'

                    return (
                      <tr key={item.id} className="text-zinc-900 dark:text-zinc-100">
                        <td className="py-4 font-medium">{name}</td>
                        <td className="py-4 font-mono text-xs text-zinc-500">{code}</td>
                        <td className="py-4 text-center font-semibold">
                          {parseFloat(item.quantity)} {unit}
                        </td>
                        <td className="py-4 text-center font-semibold">
                          {isRaw && item.total_kg ? `${parseFloat(item.total_kg)} Kg` : '-'}
                        </td>
                        <td className="py-4 text-right font-mono">
                          {formatRupiah(parseFloat(item.price_per_unit))}
                        </td>
                        <td className="py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatRupiah(parseFloat(item.subtotal))}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400">
                      Tidak ada item dalam nota ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total */}
          <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6 flex justify-end">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Total Keseluruhan</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {formatRupiah(parseFloat(purchase.total_amount))}
                </span>
              </div>
            </div>
          </div>

          {/* Catatan / Notes */}
          {purchase.notes && (
            <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5 mb-2">
                <FileText className="h-3.5 w-3.5" />
                <span>CATATAN PEMBELIAN</span>
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-850 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/30">
                "{purchase.notes}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
