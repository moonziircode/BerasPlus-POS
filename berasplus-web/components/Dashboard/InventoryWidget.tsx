'use client'
export default function InventoryWidget({ rawMaterials, finishedGoods }: { rawMaterials?: any[], finishedGoods?: any[] }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 col-span-2">
      <h3 className="font-semibold text-slate-200 mb-6">Inventory Overview</h3>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="text-xs font-medium text-slate-400 mb-4 border-b border-slate-700 pb-2">Raw Material (Bahan Baku)</div>
          <div className="space-y-4">
            {(!rawMaterials || rawMaterials.length === 0) ? (
              <div className="text-center text-slate-500 text-sm py-4">Belum ada bahan baku</div>
            ) : (
              rawMaterials.map((r, i) => <Bar key={i} {...r} />)
            )}
          </div>
          <button className="w-full mt-5 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-700">Lihat Semua Bahan Baku</button>
        </div>
        
        <div>
          <div className="text-xs font-medium text-slate-400 mb-4 border-b border-slate-700 pb-2">Finished Goods (Produk Jadi)</div>
          <div className="space-y-4">
            {(!finishedGoods || finishedGoods.length === 0) ? (
              <div className="text-center text-slate-500 text-sm py-4">Belum ada produk jadi</div>
            ) : (
              finishedGoods.map((f, i) => <Bar key={i} {...f} />)
            )}
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
