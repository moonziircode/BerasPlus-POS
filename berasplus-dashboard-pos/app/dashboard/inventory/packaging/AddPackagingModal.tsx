'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Coins, Box, Maximize2, ShieldAlert } from 'lucide-react'
import { createPackagingMaterial } from './actions'

export default function AddPackagingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [sizeDimension, setSizeDimension] = useState('')
  const [buyPrice, setBuyPrice] = useState('0')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await createPackagingMaterial({
        name,
        size_dimension: sizeDimension || undefined,
        buy_price_per_pcs: parseFloat(buyPrice) || 0,
      })
      // Reset & Close
      setName('')
      setSizeDimension('')
      setBuyPrice('0')
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan material kemasan baru.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        <Plus className="h-4 w-4" />
        <span>Tambah Kemasan</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Card Body */}
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Tambah Material Kemasan
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Masukkan detail material kemasan (plastik, karung sack)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nama Kemasan
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Box className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Karung Ramos BerasPlus 5Kg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Dimensi / Ukuran
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Maximize2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: 30 x 45 cm (Opsional)"
                    value={sizeDimension}
                    onChange={(e) => setSizeDimension(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Harga Beli per Pcs (Rp)
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Coins className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="Contoh: 1500"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Kemasan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
