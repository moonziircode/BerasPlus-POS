'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FileText, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, Activity, Package } from 'lucide-react'

interface ReportsClientProps {
  data: {
    movements: any[]
    balances: any[]
    stats: {
      totalStockIn: number
      totalStockOut: number
      totalLoss: number
      movementCount: number
    }
  }
}

export default function ReportsClient({ data }: ReportsClientProps) {
  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Filtered movements
  const filteredMovements = data.movements.filter(m => {
    const matchesType = filterType === 'ALL' || m.productType === filterType
    const matchesSearch = m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // Get data for Stock Balance Chart (Top 10 highest stock items)
  const chartData = [...data.balances]
    .sort((a, b) => Number(b.current_stock_kg) - Number(a.current_stock_kg))
    .slice(0, 10)
    .map(b => ({
      name: b.product_name,
      stock: Number(b.current_stock_kg)
    }))

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">Laporan & Ledger</h1>
        <p className="mt-1 text-sm text-slate-400">Analisis mutasi inventori, riwayat ledger masuk/keluar, dan status sisa stok.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Total Stok Masuk</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {data.stats.totalStockIn.toLocaleString('id-ID')} Kg
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Dari penerimaan barang & output produksi</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Total Stok Keluar</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {data.stats.totalStockOut.toLocaleString('id-ID')} Kg
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Digunakan untuk bahan baku & kemasan mixing</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Penyusutan (Loss)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {data.stats.totalLoss.toLocaleString('id-ID')} Kg
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Total penyusutan terdeteksi</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Total Mutasi Ledger</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {data.stats.movementCount} Transaksi
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Total mutasi ledger tercatat</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top 10 Stocks Chart */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 lg:col-span-2">
          <h3 className="font-semibold text-slate-200 mb-6">Top 10 Sisa Stok Terbesar (Kg)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar name="Stok (Kg)" dataKey="stock" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <h3 className="font-semibold text-slate-200 mb-6">Ringkasan Sisa Stok</h3>
          <div className="space-y-4 overflow-y-auto max-h-80 pr-1">
            {data.balances.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <Package className="w-12 h-12 mx-auto mb-2 stroke-1" />
                <span className="text-xs">Tidak ada data stok</span>
              </div>
            ) : (
              data.balances.map((b, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200 block">{b.product_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{b.product_code || b.product_type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold font-mono text-slate-100 block">{Number(b.current_stock_kg).toLocaleString('id-ID')} Kg</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${Number(b.current_stock_kg) <= 10 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {Number(b.current_stock_kg) <= 10 ? 'Stok Rendah' : 'Aman'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="font-semibold text-slate-200">Ledger Mutasi Fisik</h3>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari produk atau jenis mutasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700 w-full md:w-64"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700 w-full md:w-auto"
            >
              <option value="ALL">Semua Jenis Produk</option>
              <option value="RAW_MATERIAL">Bahan Baku (Raw)</option>
              <option value="SELLING_PRODUCT">Produk Jual (Finished)</option>
              <option value="PACKAGING">Kemasan (Packaging)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                <th className="pb-3 pl-2">Waktu</th>
                <th className="pb-3">Produk</th>
                <th className="pb-3">Tipe</th>
                <th className="pb-3">Lokasi</th>
                <th className="pb-3">Jenis Mutasi</th>
                <th className="pb-3 text-right pr-2">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ada mutasi yang cocok dengan filter Anda.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isIn = ['GOODS_RECEIPT', 'PRODUCTION_OUTPUT'].includes(mov.type)
                  return (
                    <tr key={mov.id} className="hover:bg-slate-800/20 text-slate-300">
                      <td className="py-4 pl-2 text-slate-400">{mov.date}</td>
                      <td className="py-4 font-semibold text-slate-200">{mov.productName}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">
                          {mov.productType}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400">{mov.location}</td>
                      <td className="py-4 font-mono font-medium text-slate-300">{mov.type}</td>
                      <td className={`py-4 text-right pr-2 font-mono font-semibold ${isIn ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isIn ? '+' : ''}{mov.quantity.toLocaleString('id-ID')} Kg
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
