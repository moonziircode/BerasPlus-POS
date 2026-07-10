'use client'

import { useState } from 'react'
import { Pencil, X, Loader2, Trash2, ShieldAlert } from 'lucide-react'
import { updateConversionFactor, deleteConversionFactor } from './actions'

interface ConvData {
  id: string
  name: string
  factor_to_kg: number
}

export default function EditConversionModal({ conversion }: { conversion: ConvData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState(conversion.name)
  const [factorToKg, setFactorToKg] = useState(conversion.factor_to_kg.toString())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await updateConversionFactor(conversion.id, { name, factor_to_kg: parseFloat(factorToKg) })
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah konversi.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Hapus konversi ini? Jika sedang dipakai, data tidak bisa dihapus.')) return
    setErrorMsg('')
    setDeleteLoading(true)
    try {
      await deleteConversionFactor(conversion.id)
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus konversi.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600">
        <Pencil className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Konversi</h3>
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
                  className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={handleDelete} disabled={deleteLoading} className="flex items-center gap-1.5 text-sm text-rose-600">
                  {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Hapus
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-zinc-600">Batal</button>
                  <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
