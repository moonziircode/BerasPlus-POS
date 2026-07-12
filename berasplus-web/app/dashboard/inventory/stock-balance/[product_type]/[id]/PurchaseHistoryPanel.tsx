import { createClient } from '@/utils/supabase/server'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function PurchaseHistoryPanel({ productId }: { productId: string }) {
  const supabase = await createClient()

  // Ambil history dari purchase_order_items yang terhubung ke purchase_orders
  const { data: purchases } = await supabase
    .from('purchase_order_items')
    .select(`
      id,
      quantity,
      unit_price,
      received_quantity,
      purchase_order:purchase_orders (
        id,
        po_number,
        po_date,
        status,
        supplier:suppliers(name)
      )
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Filter out any items without a completed or valid PO if needed, but showing all is good for history
  // especially those with received_quantity > 0
  const validPurchases = purchases?.filter(p => p.purchase_order && (p.purchase_order as any).status !== 'CANCELLED') || []

  if (validPurchases.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Riwayat Pembelian Terakhir</h2>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">Belum ada riwayat pembelian untuk item ini.</p>
      </div>
    )
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Riwayat Pembelian Terakhir</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-l-lg">Tanggal</th>
              <th className="px-4 py-3 font-semibold">Nomor PO</th>
              <th className="px-4 py-3 font-semibold">Supplier</th>
              <th className="px-4 py-3 font-semibold text-right">Harga Satuan</th>
              <th className="px-4 py-3 font-semibold text-center">Dipesan</th>
              <th className="px-4 py-3 font-semibold text-center">Diterima</th>
              <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Total Nilai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {validPurchases.map((item: any) => {
              const po = item.purchase_order as any
              const qty = parseFloat(item.quantity)
              const received = parseFloat(item.received_quantity || '0')
              const price = parseFloat(item.unit_price)
              const total = received * price

              return (
                <tr key={item.id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {format(new Date(po.po_date), 'dd MMM yyyy', { locale: id })}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {po.po_number}
                  </td>
                  <td className="px-4 py-3">
                    {po.supplier?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatRupiah(price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {qty}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium ${received < qty ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                      {received}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(total)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
