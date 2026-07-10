'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, PackageOpen, Scale, Tags, ShieldAlert } from 'lucide-react'
import { createRawMaterialDP } from '../actions'
import AddCategoryDPModal from './AddCategoryDPModal'

interface Category {
  id: string
  name: string
}

interface RawMaterial {
  id: string
  name: string
  rm_code: string
}

interface AddRawMaterialDPModalProps {
  categories: Category[]
  onRawMaterialAdded: (rm: RawMaterial) => void
}

export default function AddRawMaterialDPModal({
  categories,
  onRawMaterialAdded,
}: AddRawMaterialDPModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [conversionFactor, setConversionFactor] = useState('1.0000')
  const [categoryOptions, setCategoryOptions] = useState<Category[]>(categories)

  // Sync categoryOptions when categories prop changes
  useEffect(() => {
    setCategoryOptions(categories)
  }, [categories])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg('')

    if (!categoryId) {
      setErrorMsg('Pilih kategori produk terlebih dahulu.')
      return
    }

    setLoading(true)

    try {
      const data = await createRawMaterialDP({
        name,
        category_id: categoryId,
        conversion_factor: parseFloat(conversionFactor) || 1,
      })

      // Notify parent
      onRawMaterialAdded(data)

      // Reset & Close
      setName('')
      setCategoryId('')
      setConversionFactor('1.0000')
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan bahan baku baru.')
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
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-500/50 bg-emerald-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/5 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Bahan Baku Baru</span>
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
                  <PackageOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Tambah Bahan Baku Baru
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Daftarkan stok bahan mentah (gabah/beras curah) untuk transaksi pembelian
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
                  Nama Bahan Baku
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beras IR64 Curah Slep"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Tags className="h-3 w-3" />
                      <span>Kategori</span>
                    </label>
                    <AddCategoryDPModal
                      onCategoryAdded={(newCat) => {
                        setCategoryOptions((prev) => [...prev, newCat])
                        setCategoryId(newCat.id)
                      }}
                    />
                  </div>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  >
                    <option value="" disabled>-- Pilih Kategori --</option>
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    <span>Faktor Konversi (Kg)</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="Contoh: 1.0000"
                    value={conversionFactor}
                    onChange={(e) => setConversionFactor(e.target.value)}
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
                    <span>Simpan Bahan Baku</span>
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
