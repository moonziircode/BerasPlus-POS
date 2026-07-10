'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Tags, ShieldAlert } from 'lucide-react'
import { createCategoryDP } from '../actions'

interface Category {
  id: string
  name: string
}

interface AddCategoryDPModalProps {
  onCategoryAdded: (cat: Category) => void
}

export default function AddCategoryDPModal({
  onCategoryAdded,
}: AddCategoryDPModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const data = await createCategoryDP({
        name,
        description: description || undefined,
      })

      // Notify parent
      onCategoryAdded(data)

      // Reset & Close
      setName('')
      setDescription('')
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan kategori baru.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        <Plus className="h-3 w-3" />
        <span>Kategori Baru</span>
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
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <Tags className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    Tambah Kategori Baru
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Container */}
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beras Curah, Karung Plastik"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Keterangan (Opsional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Kategori untuk semua beras curah yang dibeli langsung."
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Kategori</span>
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
