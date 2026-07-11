'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Coins, Box, Maximize2, ShieldAlert } from 'lucide-react'
import { createPackagingMaterialDP } from '../actions'

interface PackagingMaterial {
  id: string
  name: string
  packaging_code: string
}

interface AddPackagingDPModalProps {
  onPackagingAdded: (pkg: PackagingMaterial) => void
  isOpen?: boolean
  onClose?: () => void
  initialName?: string
}

export default function AddPackagingDPModal({
  onPackagingAdded,
  isOpen: externalIsOpen,
  onClose,
  initialName = ''
}: AddPackagingDPModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = (val: boolean) => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(val)
    }
    if (!val && onClose) {
      onClose()
    }
  }

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState(initialName)
  const [sizeDimension, setSizeDimension] = useState('')
  const [buyPrice, setBuyPrice] = useState('0')

  useEffect(() => {
    setName(initialName)
  }, [initialName])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const data = await createPackagingMaterialDP({
        name,
        size_dimension: sizeDimension || undefined,
        buy_price_per_pcs: parseFloat(buyPrice) || 0,
      })

      // Notify parent
      onPackagingAdded(data)

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
      {externalIsOpen === undefined && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-500/50 bg-emerald-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/5 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Kemasan Baru</span>
        </button>
      )}

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
                    Tambah Material Kemasan Baru
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Masukkan detail material kemasan (plastik, karung sack) untuk transaksi pembelian
                  </p>
                </div>
              </div>
              <button
                type="button"
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

            {/* Form Container */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nama Kemasan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Plastik Klip Ramos 5Kg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Maximize2 className="h-3 w-3" />
                    <span>Ukuran / Dimensi</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 30x45 cm"
                    value={sizeDimension}
                    onChange={(e) => setSizeDimension(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    <span>Harga Beli Standar (Pcs)</span>
                  </label>
                  <input
                    type="number"
                    step="50"
                    required
                    placeholder="Contoh: 1200"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Kemasan</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
