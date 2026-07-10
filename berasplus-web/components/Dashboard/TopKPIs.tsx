'use client'
import { ArrowUpRight, TrendingUp, ShoppingBag, Users, Package, AlertTriangle, Blend, Calculator } from 'lucide-react'

export default function TopKPIs() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 8 KPI Cards according to design */}
      <KpiCard title="Penjualan Hari Ini" value="Rp 12.500.000" trend="+15% dari kemarin" icon={<TrendingUp />} bg="bg-slate-800" color="text-emerald-400" />
      <KpiCard title="Profit Hari Ini" value="Rp 3.250.000" trend="Margin 26%" icon={<ArrowUpRight />} bg="bg-slate-800" color="text-emerald-400" />
      <KpiCard title="Order" value="84" trend="+8% dari kemarin" icon={<ShoppingBag />} bg="bg-slate-800" color="text-blue-400" />
      <KpiCard title="Customer" value="61" trend="18 Repeat" icon={<Users />} bg="bg-slate-800" color="text-orange-400" />
      <KpiCard title="Nilai Persediaan" value="Rp 2.850.000.000" trend="" icon={<Package />} bg="bg-slate-800" color="text-purple-400" />
      <KpiCard title="Stok Menipis" value="24 SKU" trend="" icon={<AlertTriangle />} bg="bg-rose-950/40" color="text-rose-400" border="border-rose-900/50" />
      <KpiCard title="Batch Mixing" value="5 Batch" trend="" icon={<Blend />} bg="bg-slate-800" color="text-emerald-400" />
      <KpiCard title="Estimasi HPP" value="Rp 11.820 /kg" trend="" icon={<Calculator />} bg="bg-slate-800" color="text-amber-400" />
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
