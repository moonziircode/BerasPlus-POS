'use client'
import { AlertTriangle, TrendingUp, TrendingDown, Minus, CheckCircle, Clock, ChevronDown, ChevronRight, PackageOpen } from 'lucide-react'

export function StokMenipisWidget({ alerts }: { alerts: any[] }) {
  if (!alerts) return null;
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-800/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Stok Menipis (Perlu Dibeli)</h3>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 cursor-pointer">Lihat Semua</span>
      </div>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center text-sm text-zinc-500 py-4">Semua stok aman</div>
        ) : (
          alerts.map((a, i) => (
            <AlertItem key={i} {...a} />
          ))
        )}
      </div>
    </div>
  )
}

function AlertItem({name, pack, alert, days, type}: any) {
  const isDanger = type === 'danger' || type === 'critical';
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${type === 'critical' ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30' : 'bg-zinc-50 dark:bg-zinc-900/50'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${isDanger ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-500' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-500'}`}><PackageOpen className="w-4 h-4" /></div>
        <div>
          <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{name}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{pack}</div>
        </div>
      </div>
      <div className="text-right">
        {alert && <div className="text-[10px] text-rose-600 dark:text-rose-400">{alert}</div>}
        <div className={`text-sm font-bold ${isDanger ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>{days}</div>
      </div>
    </div>
  )
}

export function ProdukTerlaris({ topProducts }: { topProducts: any[] }) {
  if (!topProducts) return null;
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-800/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Produk Terlaris</h3>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] rounded px-2 py-1 cursor-pointer">
          30 Hari Terakhir <ChevronDown className="w-3 h-3" />
        </div>
      </div>
      <div className="space-y-4 mt-6">
        {topProducts.length === 0 ? (
          <div className="text-center text-sm text-zinc-500 py-4">Belum ada data penjualan</div>
        ) : (
          topProducts.map((p, i) => (
            <RankItem key={i} {...p} />
          ))
        )}
      </div>
      <button className="w-full mt-5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">Lihat Semua Produk</button>
    </div>
  )
}

function RankItem({rank, name, val, pct}: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-4 text-xs font-mono text-zinc-500 text-right">{rank}</div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 mb-1.5">
          <span className={rank <= 2 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded' : ''}>{name}</span>
          <span className="font-mono text-zinc-500 dark:text-zinc-400">{val}</span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1 overflow-hidden">
          <div className="h-1 rounded-full bg-blue-500" style={{width: `${pct}%`}}></div>
        </div>
      </div>
    </div>
  )
}

export function SupplierIntelligence() {
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-800/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Supplier Intelligence</h3>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] rounded px-2 py-1 cursor-pointer">
          Harga Hari Ini <ChevronDown className="w-3 h-3" />
        </div>
      </div>
      <div className="space-y-4">
        <SuppItem name="IR Ahmad" sub="Medium" price="Rp 725.000" trend="+ 2%" up={false} />
        <SuppItem name="Petrok" sub="BMW" price="Rp 780.000" trend="+ 5%" up={false} />
        <SuppItem name="Jeruk Garut" sub="Pandan Wangi" price="Rp 760.000" trend="+ 1%" up={false} />
        <SuppItem name="Rojolele" sub="Rojolele" price="Rp 810.000" trend="- 0%" up={null} />
      </div>
      <button className="w-full mt-5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">Lihat Semua Supplier</button>
    </div>
  )
}

function SuppItem({name, sub, price, trend, up}: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">{name.substring(0,2)}</div>
        <div>
          <div className="text-zinc-800 dark:text-zinc-200 text-xs font-medium">{name}</div>
          <div className="text-zinc-500 text-[10px]">{sub}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">{price}</div>
        <div className={`flex items-center gap-1 text-[10px] ${up === null ? 'text-zinc-500' : up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {up === null ? <Minus className="w-3 h-3" /> : up ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          {trend}
        </div>
      </div>
    </div>
  )
}

export function MarginProduk() {
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-800/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Margin Produk</h3>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] rounded px-2 py-1 cursor-pointer">
          30 Hari Terakhir <ChevronDown className="w-3 h-3" />
        </div>
      </div>
      <div className="space-y-4 mt-6">
        <RankItem rank="" name="Ciranjang" val="26%" pct={90} />
        <RankItem rank="" name="Rumah Minang" val="22%" pct={75} />
        <RankItem rank="" name="Ramos Bandung" val="21%" pct={70} />
        <RankItem rank="" name="Premium 13K" val="17%" pct={50} />
        <RankItem rank="" name="BMW" val="18%" pct={55} />
      </div>
      <button className="w-full mt-5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">Lihat Analisis Lengkap</button>
    </div>
  )
}

export function MixingHariIni({ todayMixing }: { todayMixing: any[] }) {
  if (!todayMixing) return null;
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-800/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Mixing Hari Ini</h3>
        <span className="text-[10px] flex items-center text-emerald-600 dark:text-emerald-400 cursor-pointer">Lihat Semua <ChevronRight className="w-3 h-3" /></span>
      </div>
      <div className="space-y-4">
        {todayMixing.length === 0 ? (
          <div className="text-center text-sm text-zinc-500 py-4">Belum ada mixing hari ini</div>
        ) : (
          todayMixing.map((m, i) => (
            <MixItem key={i} {...m} icon={<CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />} bg="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50" />
          ))
        )}
      </div>
    </div>
  )
}

function MixItem({id, name, qty, status, time, icon, bg}: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl border ${bg}`}>{icon}</div>
        <div>
          <div className="text-zinc-800 dark:text-zinc-200 text-xs font-medium">Batch {id}</div>
          <div className="text-zinc-500 dark:text-zinc-400 text-[10px]">{name} • {qty}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xs ${status === 'Selesai' ? 'text-emerald-600 dark:text-emerald-400' : status === 'Proses' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>{status}</div>
        <div className="text-zinc-500 text-[10px]">{time}</div>
      </div>
    </div>
  )
}
