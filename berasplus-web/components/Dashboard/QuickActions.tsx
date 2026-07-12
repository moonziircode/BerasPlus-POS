'use client'
import { Plus, Diamond, Settings } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { label: 'Penjualan Baru', color: 'text-emerald-400 border-emerald-900 bg-emerald-950/30 hover:bg-emerald-900/50' },
    { label: 'Pembelian', color: 'text-blue-400 border-blue-900 bg-blue-950/30 hover:bg-blue-900/50' },
    { label: 'Mixing (Blending)', color: 'text-purple-400 border-purple-900 bg-purple-950/30 hover:bg-purple-900/50' },
    { label: 'Repacking', color: 'text-amber-400 border-amber-900 bg-amber-950/30 hover:bg-amber-900/50' },
    { label: 'Tambah Supplier', color: 'text-teal-400 border-teal-900 bg-teal-950/30 hover:bg-teal-900/50' },
    { label: 'Tambah Produk', color: 'text-indigo-400 border-indigo-900 bg-indigo-950/30 hover:bg-indigo-900/50' },
  ]

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Quick Action</div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, i) => (
          <button key={i} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${action.color}`}>
            <Plus className="w-4 h-4" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
