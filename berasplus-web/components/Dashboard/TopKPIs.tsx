
import { ArrowUpRight, TrendingUp, ShoppingBag, Users, Package, AlertTriangle, Blend, Calculator } from 'lucide-react'

export default function TopKPIs({ metrics }: { metrics: any }) {
  if (!metrics) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 8 KPI Cards according to design */}
      <KpiCard title="Penjualan Hari Ini" value={`Rp ${metrics.penjualanHariIni.toLocaleString('id-ID')}`} trend={metrics.trends.penjualan} icon={<TrendingUp />} bg="bg-slate-800" color="text-emerald-400" />
      <KpiCard title="Profit Hari Ini" value={`Rp ${metrics.profitHariIni.toLocaleString('id-ID')}`} trend={metrics.trends.profit} icon={<ArrowUpRight />} bg="bg-slate-800" color="text-emerald-400" />
      <KpiCard title="Order" value={metrics.orderCount.toString()} trend={metrics.trends.order} icon={<ShoppingBag />} bg="bg-slate-800" color="text-blue-400" />
      <KpiCard title="Customer" value={metrics.customerCount.toString()} trend={metrics.trends.customer} icon={<Users />} bg="bg-slate-800" color="text-orange-400" />
      <KpiCard title="Nilai Persediaan" value={`Rp ${metrics.nilaiPersediaan.toLocaleString('id-ID')}`} trend="" icon={<Package />} bg="bg-slate-800" color="text-purple-400" />
      <KpiCard title="Stok Menipis" value={`${metrics.lowStockCount} SKU`} trend="" icon={<AlertTriangle />} bg="bg-rose-950/40" color="text-rose-400" border="border-rose-900/50" />
      <KpiCard title="Batch Mixing" value={`${metrics.batchCount} Batch`} trend="" icon={<Blend />} bg="bg-slate-800" color="text-emerald-400" />
      <KpiCard title="Estimasi HPP" value="Live Calculation" trend="" icon={<Calculator />} bg="bg-slate-800" color="text-amber-400" />
    </div>
  )
}

function KpiCard({ title, value, trend, icon, bg, color, border = "border-slate-800" }: any) {
  return (
    <div className={`p-5 rounded-2xl border ${border} ${bg} flex flex-col gap-2`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl bg-slate-900/80 ${color}`}>{icon}</div>
        <div className="text-sm font-medium text-slate-400">{title}</div>
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-50">{value}</div>
      {trend && <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> {trend}</div>}
    </div>
  )
}
