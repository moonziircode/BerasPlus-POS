'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Scale, ShieldAlert } from 'lucide-react'
import { createUnitType } from './actions'

export default function AddUnitModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await createUnitType({ name, description })
      setIsOpen(false)
      setName('')
      setDescription('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan satuan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Tambah</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Tambah Satuan Dasar</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 flex gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500">Nama Satuan</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Kg, Pcs, Liter"
                  className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500">Deskripsi (Opsional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Misal: Satuan Kilogram untuk berat"
                  className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Batal</button>
                <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
