'use client'

import { useState } from 'react'
import { Plus, X, Package, Box } from 'lucide-react'
import { addProduct } from './actions'
import { useRouter } from 'next/navigation'

export default function AddProductModal({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [productType, setProductType] = useState('BERAS')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await addProduct(formData)

    if (result.success) {
      setIsOpen(false)
      router.refresh()
    } else {
      setError(result.error || 'Terjadi kesalahan')
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
      >
        <Plus className="h-4 w-4" />
        Tambah Produk Baru
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Tambah Produk Master
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                  {error}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Product Type selection */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Tipe Produk
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setProductType('BERAS')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                        productType === 'BERAS'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 ring-1 ring-blue-600'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      <Package className="h-5 w-5" />
                      <span className="font-medium">Beras</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductType('KEMASAN')}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                        productType === 'KEMASAN'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-emerald-600'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      <Box className="h-5 w-5" />
                      <span className="font-medium">Kemasan</span>
                    </button>
                  </div>
                  <input type="hidden" name="product_type" value={productType} />
                </div>

                {/* Form fields */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Kode Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_code"
                    required
                    className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
                    placeholder="Contoh: B-RM-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Nama Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
                    placeholder="Beras Rumah Minang 10 Kg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Kategori
                  </label>
                  <select
                    name="category_id"
                    className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Barcode / SKU (Opsional)
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
                    placeholder="Scan atau ketik barcode"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Satuan (Unit of Measure) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="unit_of_measure"
                    required
                    className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
                  >
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Pcs">Pcs / Karung</option>
                    <option value="Liter">Liter</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Berat per Satuan (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight_per_unit_kg"
                    defaultValue="0"
                    className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
                    placeholder="0 jika kemasan kosong"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Harga Jual Default (Rp)
                  </label>
                  <input
                    type="number"
                    name="sell_price"
                    defaultValue="0"
                    className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
                  />
                  <p className="text-xs text-zinc-500">Isi 0 jika ini bahan/kemasan yang tidak dijual ecer.</p>
                </div>

              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
