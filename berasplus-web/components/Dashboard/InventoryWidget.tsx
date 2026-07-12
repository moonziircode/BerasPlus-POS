'use client'
export default function InventoryWidget({ rawMaterials, finishedGoods }: { rawMaterials?: any[], finishedGoods?: any[] }) {
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-800/50 col-span-2">
      <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Inventory Overview</h3>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">Raw Material (Bahan Baku)</div>
          <div className="space-y-4">
            {(!rawMaterials || rawMaterials.length === 0) ? (
              <div className="text-center text-zinc-500 text-sm py-4">Belum ada bahan baku</div>
            ) : (
              rawMaterials.map((r, i) => <Bar key={i} {...r} />)
            )}
          </div>
          <button className="w-full mt-5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">Lihat Semua Bahan Baku</button>
        </div>
        
        <div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">Finished Goods (Produk Jadi)</div>
          <div className="space-y-4">
            {(!finishedGoods || finishedGoods.length === 0) ? (
              <div className="text-center text-zinc-500 text-sm py-4">Belum ada produk jadi</div>
            ) : (
              finishedGoods.map((f, i) => <Bar key={i} {...f} />)
            )}
          </div>
          <button className="w-full mt-5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">Lihat Semua Produk Jadi</button>
        </div>
      </div>
    </div>
  )
}

function Bar({label, value, pct, color}: any) {
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-700 dark:text-zinc-300 mb-1.5">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-zinc-300 dark:bg-zinc-600 block"></span> {label}</span>
        <span className="font-mono text-zinc-500 dark:text-zinc-400">{value}</span>
      </div>
      <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full ${color}`} style={{width: `${pct}%`}}></div>
      </div>
    </div>
  )
}
