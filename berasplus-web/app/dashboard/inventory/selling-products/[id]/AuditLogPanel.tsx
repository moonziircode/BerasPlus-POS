import { createClient } from '@/utils/supabase/server'
import { ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function AuditLogPanel({ skuId }: { skuId: string }) {
  const supabase = await createClient()

  // Ambil history dari ledger untuk mendapatkan referensi
  const { data: ledger } = await supabase
    .from('inventory_ledger')
    .select(`
      id,
      transaction_type,
      reference_id,
      change_kg,
      created_at
    `)
    .eq('product_id', skuId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!ledger || ledger.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm h-full">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList className="h-5 w-5 text-indigo-500" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Audit Log Transaksi</h3>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">Belum ada catatan log transaksi.</p>
      </div>
    )
  }

  // Mengumpulkan data pengguna dari referensi terkait (production_batches atau sales_transactions)
  // Untuk kesederhanaan dan efisiensi, kita map reference_id ini
  const batchIds = ledger.filter(l => ['MIXING', 'REPACKING', 'PRODUCTION'].includes(l.transaction_type)).map(l => l.reference_id)
  const salesIds = ledger.filter(l => ['SALE', 'SALES'].includes(l.transaction_type)).map(l => l.reference_id)

  let batchUsers = new Map<string, any>()
  let salesUsers = new Map<string, any>()

  if (batchIds.length > 0) {
    const { data: batches } = await supabase
      .from('production_batches')
      .select('id, batch_number, created_by:users(full_name)')
      .in('id', batchIds)
    if (batches) {
      batches.forEach(b => batchUsers.set(b.id, b))
    }
  }

  // Jika ada tabel sales_transactions
  if (salesIds.length > 0) {
    const { data: sales } = await supabase
      .from('sales_transactions')
      .select('id, transaction_number, created_by:users(full_name)')
      .in('id', salesIds)
    if (sales) {
      sales.forEach(s => salesUsers.set(s.id, s))
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-5 w-5 text-indigo-500" />
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Audit Log Transaksi</h3>
      </div>

      <div className="space-y-4">
        {ledger.map(entry => {
          let user = 'System/Unknown'
          let refText = entry.reference_id || '-'

          if (['MIXING', 'REPACKING', 'PRODUCTION'].includes(entry.transaction_type)) {
            const b = batchUsers.get(entry.reference_id)
            if (b) {
              user = b.created_by?.full_name || user
              refText = b.batch_number
            }
          } else if (['SALE', 'SALES'].includes(entry.transaction_type)) {
            const s = salesUsers.get(entry.reference_id)
            if (s) {
              user = s.created_by?.full_name || user
              refText = s.transaction_number
            }
          }

          const isPositive = parseFloat(entry.change_kg) > 0
          const actionText = isPositive ? 'Menambah Stok via' : 'Mengurangi Stok via'

          return (
            <div key={entry.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{format(new Date(entry.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
              </div>
              <div className="text-zinc-600 dark:text-zinc-400 text-xs">
                {actionText} <strong className="text-zinc-800 dark:text-zinc-200">{entry.transaction_type}</strong>
              </div>
              <div className="text-zinc-500 dark:text-zinc-500 text-xs mt-1">
                Ref: {refText} ({isPositive ? '+' : ''}{entry.change_kg} Kg)
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
