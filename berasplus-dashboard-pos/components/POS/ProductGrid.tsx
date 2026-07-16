'use client'

import { Search, ShoppingCart, AlertCircle } from 'lucide-react'
import { Product } from './POSClient'

export default function ProductGrid({
  products,
  searchQuery,
  setSearchQuery,
  onAddToCart
}: {
  products: Product[]
  searchQuery: string
  setSearchQuery: (val: string) => void
  onAddToCart: (p: Product) => void
}) {
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchQuery))
  )

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Cari produk berdasarkan nama, SKU, atau barcode..." 
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(p => (
            <div 
              key={p.id} 
              onClick={() => onAddToCart(p)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800 transition-all group flex flex-col h-full"
            >
              <div className="w-full aspect-square bg-slate-950 rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-slate-800">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <ShoppingCart className="w-10 h-10 text-slate-700" />
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="text-xs text-slate-500 mb-1">{p.sku}</div>
                <div className="font-semibold text-slate-200 mb-2 line-clamp-2 leading-tight flex-1">{p.name}</div>
                
                <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-800/50">
                  <div className="text-emerald-400 font-bold">
                    Rp {p.sell_price.toLocaleString('id-ID')}
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-md ${p.current_stock <= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                    {p.current_stock}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
              <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
              <p>Produk tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
