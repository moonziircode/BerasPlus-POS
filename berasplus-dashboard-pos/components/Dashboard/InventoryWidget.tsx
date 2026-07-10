'use client'
export default function InventoryWidget() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 col-span-2">
      <h3 className="font-semibold text-slate-200 mb-6">Inventory Overview</h3>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="text-xs font-medium text-slate-400 mb-4 border-b border-slate-700 pb-2">Raw Material (Bahan Baku)</div>
          <div className="space-y-4">
            <Bar label="Premium" value="1.200 Kg" pct={90} color="bg-emerald-500" />
            <Bar label="Medium" value="420 Kg" pct={40} color="bg-emerald-500" />
            <Bar label="Broken" value="900 Kg" pct={70} color="bg-emerald-500" />
            <Bar label="Pandan Wangi" value="120 Kg" pct={15} color="bg-emerald-500" />
            <Bar label="Ketan Putih" value="180 Kg" pct={25} color="bg-emerald-500" />
          </div>
          <button className="w-full mt-5 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-700">Lihat Semua Bahan Baku</button>
        </div>
        
        <div>
          <div className="text-xs font-medium text-slate-400 mb-4 border-b border-slate-700 pb-2">Finished Goods (Produk Jadi)</div>
          <div className="space-y-4">
            <Bar label="Ciranjang" value="150 Kg" pct={80} color="bg-emerald-500" />
            <Bar label="Rumah Minang" value="320 Kg" pct={95} color="bg-emerald-500" />
            <Bar label="Ramos Bandung" value="210 Kg" pct={60} color="bg-emerald-500" />
            <Bar label="Beras Pulen" value="90 Kg" pct={40} color="bg-emerald-500" />
            <Bar label="BMW" value="80 Kg" pct={35} color="bg-emerald-500" />
          </div>
          <button className="w-full mt-5 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-700">Lihat Semua Produk Jadi</button>
        </div>
      </div>
    </div>
  )
}

function Bar({label, value, pct, color}: any) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-300 mb-1.5">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-600 block"></span> {label}</span>
        <span className="font-mono text-slate-400">{value}</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full ${color}`} style={{width: `${pct}%`}}></div>
      </div>
    </div>
  )
}
