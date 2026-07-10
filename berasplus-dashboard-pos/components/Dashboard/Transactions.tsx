'use client'
import { CheckCircle, ChevronRight } from 'lucide-react'

export function RecentTransactions() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 col-span-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-200 text-sm">Transaksi Terbaru</h3>
        <span className="text-[10px] text-emerald-400 cursor-pointer flex items-center">Lihat Semua <ChevronRight className="w-3 h-3" /></span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-400">
          <thead className="text-[10px] uppercase border-b border-slate-700">
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
          <tbody className="divide-y divide-slate-800/50">
            <TrxRow time="11:30" id="TRX-250523-0082" type="Penjualan" cust="Pak Haji" prod="Ramos Bandung" qty="20 Kg" total="Rp 260.000" meth="QRIS" />
            <TrxRow time="11:15" id="TRX-250523-0081" type="Penjualan" cust="Bu Ani" prod="Premium 13K" qty="10 Kg" total="Rp 135.000" meth="Tunai" />
            <TrxRow time="10:45" id="TRX-250523-0080" type="Mixing" cust="-" prod="Ciranjang" qty="80 Kg" total="-" meth="-" />
            <TrxRow time="10:20" id="TRX-250523-0079" type="Pembelian" cust="IR Ahmad" prod="Medium" qty="500 Kg" total="Rp 3.625.000" meth="Transfer" />
            <TrxRow time="09:50" id="TRX-250523-0078" type="Penjualan" cust="Warung Padang" prod="Rumah Minang" qty="20 Kg" total="Rp 260.000" meth="QRIS" />
          </tbody>
        </table>
      </div>
      <button className="w-full mt-4 py-2.5 text-xs font-medium text-slate-300 bg-slate-900 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">Lihat Semua Transaksi</button>
    </div>
  )
}

function TrxRow({time, id, type, cust, prod, qty, total, meth}: any) {
  return (
    <tr className="hover:bg-slate-800/30 transition-colors">
      <td className="py-3">{time}</td>
      <td className="py-3 text-slate-300">{id}</td>
      <td className="py-3">{type}</td>
      <td className="py-3">{cust}</td>
      <td className="py-3">{prod}</td>
      <td className="py-3">{qty}</td>
      <td className="py-3 font-mono text-slate-300">{total}</td>
      <td className="py-3">{meth}</td>
      <td className="py-3">
        <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /> Selesai</span>
      </td>
    </tr>
  )
}
