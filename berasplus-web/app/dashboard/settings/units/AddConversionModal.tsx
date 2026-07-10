'use client'

import { useState } from 'react'
import { Plus, X, Loader2, RefreshCw, ShieldAlert } from 'lucide-react'
import { createConversionFactor } from './actions'

export default function AddConversionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [factorToKg, setFactorToKg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await createConversionFactor({ name, factor_to_kg: parseFloat(factorToKg) })
      setIsOpen(false)
      setName('')
      setFactorToKg('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan konversi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-indigo-700 active:scale-95"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Tambah</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Tambah Konversi</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 flex gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500">Nama Faktor (Label)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Karung 50 Kg"
                  className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500">Nilai (dalam KG)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  required
                  value={factorToKg}
                  onChange={(e) => setFactorToKg(e.target.value)}
                  placeholder="Misal: 50"
                  className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-zinc-600">Batal</button>
                <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
