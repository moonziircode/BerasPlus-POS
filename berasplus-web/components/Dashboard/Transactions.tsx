'use client'
import { CheckCircle, ChevronRight } from 'lucide-react'

export function RecentTransactions({ transactions }: { transactions: any[] }) {
  if (!transactions) return null;
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-800/50 col-span-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Transaksi Terbaru</h3>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 cursor-pointer flex items-center">Lihat Semua <ChevronRight className="w-3 h-3" /></span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
          <thead className="text-[10px] uppercase border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              <th className="pb-3 font-medium">Waktu</th>
              <th className="pb-3 font-medium">No. Transaksi</th>
              <th className="pb-3 font-medium">Jenis</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Produk</th>
              <th className="pb-3 font-medium">Qty</th>
              <th className="pb-3 font-medium">Total</th>
              <th className="pb-3 font-medium">Metode</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
            {transactions.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-4 text-zinc-500">Belum ada transaksi</td></tr>
            ) : (
              transactions.map((trx, i) => (
                <TrxRow key={i} {...trx} />
              ))
            )}
          </tbody>
        </table>
      </div>
      <button className="w-full mt-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Lihat Semua Transaksi</button>
    </div>
  )
}

function TrxRow({time, id, type, cust, prod, qty, total, meth}: any) {
  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-3">{time}</td>
      <td className="py-3 text-zinc-700 dark:text-zinc-300">{id}</td>
      <td className="py-3">{type}</td>
      <td className="py-3">{cust}</td>
      <td className="py-3">{prod}</td>
      <td className="py-3">{qty}</td>
      <td className="py-3 font-mono text-zinc-700 dark:text-zinc-300">{total}</td>
      <td className="py-3">{meth}</td>
      <td className="py-3">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /> Selesai</span>
      </td>
    </tr>
  )
}
