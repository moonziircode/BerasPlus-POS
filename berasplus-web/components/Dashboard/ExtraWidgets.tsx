'use client'
import { Sparkles, MapPin, TrendingUp, CheckCircle, Clock, ChevronRight } from 'lucide-react'

export function AiAssistant() {
  return (
    <div className="p-5 rounded-2xl border border-emerald-900/50 bg-slate-900/80 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-900/20 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-slate-200 text-sm">AI Business Assistant</h3>
          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">Beta</span>
        </div>
      </div>
      <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-4 mb-5 relative z-10">
        <li>Hari ini penjualan naik 12% dibanding kemarin.</li>
        <li>Produk Premium 13K hampir habis (sisa 60 Kg).</li>
        <li>Saya menyarankan membeli:
          <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
            <li>Medium 500 Kg</li>
            <li>Broken 300 Kg</li>
            <li>Pandan Wangi 100 Kg</li>
          </ul>
        </li>
        <li>Prediksi stok cukup hingga Minggu.</li>
        <li>Margin minggu ini turun 2%.</li>
        <li>Penyebab utama: harga Premium naik.</li>
      </ul>
      <div className="flex gap-2 relative z-10">
        <button className="flex-1 py-2 text-xs font-semibold text-emerald-950 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors">Generate Purchase Order</button>
        <button className="flex-1 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-emerald-900/50 hover:bg-slate-800 transition-colors">Analisis Lengkap</button>
      </div>
    </div>
  )
}

export function DeliveryWidget() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-200 text-sm">Pengiriman Hari Ini</h3>
        <span className="text-[10px] text-emerald-400 cursor-pointer flex items-center">Lihat Semua <ChevronRight className="w-3 h-3" /></span>
      </div>
      <div className="flex justify-between text-center mb-5">
        <div>
          <div className="text-xl font-bold text-slate-200">14</div>
          <div className="text-[10px] text-slate-400">Total Pengiriman</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-400">3</div>
          <div className="text-[10px] text-slate-400">Dalam Perjalanan</div>
        </div>
        <div>
          <div className="text-xl font-bold text-emerald-400">11</div>
          <div className="text-[10px] text-slate-400">Selesai</div>
        </div>
      </div>
      <div className="h-40 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* Radar Map Mockup */}
        <div className="absolute w-64 h-64 border border-emerald-900/20 rounded-full"></div>
        <div className="absolute w-48 h-48 border border-emerald-900/30 rounded-full"></div>
        <div className="absolute w-32 h-32 border border-emerald-900/50 rounded-full"></div>
        <div className="absolute w-16 h-16 border border-emerald-500/30 rounded-full bg-emerald-950/20"></div>
        
        {/* Center dot */}
        <div className="absolute w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)]"></div>
        
        <div className="absolute bottom-2 left-3 text-[9px] text-emerald-500/70 font-mono">Radius 5 km</div>
        
        {/* Points - pulse animation for active ones */}
        <div className="absolute top-10 left-12 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse"></div>
        <div className="absolute bottom-10 right-16 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse"></div>
        <div className="absolute top-16 right-12 w-2 h-2 rounded-full bg-emerald-500 opacity-50"></div>
        <div className="absolute bottom-14 left-16 w-2 h-2 rounded-full bg-emerald-500 opacity-50"></div>
      </div>
    </div>
  )
}

export function ForecastWidget() {
  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
        <h3 className="font-semibold text-slate-200 text-sm mb-1">Forecast Penjualan</h3>
        <div className="text-[10px] text-slate-400 mb-4">Berdasarkan data historis & tren</div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Besok</span>
            <span className="font-mono text-slate-200">Rp 13.200.000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Minggu Ini</span>
            <span className="font-mono text-slate-200">Rp 84.000.000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Bulan Ini</span>
            <span className="font-mono text-emerald-400 font-bold">Rp 390.000.000</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-200 text-sm">Financial Snapshot</h3>
          <span className="text-[10px] text-emerald-400 cursor-pointer flex items-center">Lihat Detail <ChevronRight className="w-3 h-3" /></span>
        </div>
        
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500 block shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span> Kas</span>
            <span className="font-mono text-slate-200">Rp 35.000.000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-rose-500 block shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span> Piutang</span>
            <span className="font-mono text-slate-200">Rp 12.000.000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-rose-700 block"></span> Hutang Supplier</span>
            <span className="font-mono text-slate-200">Rp 48.000.000</span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
            <span className="flex items-center gap-2 font-medium text-slate-300"><span className="w-2 h-2 rounded-full bg-blue-500 block shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span> Laba Bersih <span className="font-normal text-[10px] text-slate-500">(Bulan Ini)</span></span>
            <span className="font-mono text-emerald-400 font-bold">Rp 31.000.000</span>
          </div>
        </div>
      </div>
    </div>
  )
}
