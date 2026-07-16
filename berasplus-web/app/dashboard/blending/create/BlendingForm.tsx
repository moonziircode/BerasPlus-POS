'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, Package, Box } from 'lucide-react'
import Link from 'next/link'
import { createBlendingBatch } from '../actions'

export default function BlendingForm({ products }: { products: any[] }) {
  const [type, setType] = useState('KEMASAN') // KEMASAN or CURAH
  const [inputs, setInputs] = useState([{ id: Date.now(), product_id: '', qty: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const berasProducts = products.filter(p => p.product_type === 'BERAS')
  const kemasanProducts = products.filter(p => p.product_type === 'KEMASAN')

  const addInput = () => {
    setInputs([...inputs, { id: Date.now(), product_id: '', qty: '' }])
  }

  const removeInput = (id: number) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter(i => i.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createBlendingBatch(formData)

    if (result.success) {
      router.push('/dashboard/blending')
    } else {
      setError(result.error || 'Terjadi kesalahan')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
          {error}
        </div>
      )}

      {/* 1. Tipe Blending */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          1. Pilih Jenis Hasil Blending
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setType('KEMASAN')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-6 transition-all ${
              type === 'KEMASAN'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-emerald-600'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
            }`}
          >
            <Box className="h-8 w-8 mb-2" />
            <span className="font-semibold text-lg">Produk Kemasan</span>
            <span className="text-xs text-center px-4 opacity-80">
              Memasukkan beras curah ke dalam karung/plastik. Stok karung akan berkurang.
            </span>
          </button>
          
          <button
            type="button"
            onClick={() => setType('CURAH')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-6 transition-all ${
              type === 'CURAH'
                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 ring-1 ring-blue-600'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
            }`}
          >
            <Package className="h-8 w-8 mb-2" />
            <span className="font-semibold text-lg">Produk Curah</span>
            <span className="text-xs text-center px-4 opacity-80">
              Mencampur beras menjadi beras curah/literan. Tidak menggunakan kemasan.
            </span>
          </button>
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      {/* 2. Produk Hasil */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          2. Produk yang Dihasilkan
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Pilih Produk Hasil <span className="text-rose-500">*</span>
            </label>
            <select
              name="result_product_id"
              required
              className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
            >
              <option value="">-- Pilih Produk --</option>
              {berasProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.unit_of_measure})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Jumlah Hasil {type === 'KEMASAN' ? '(Pcs/Karung)' : '(Kg/Liter)'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="result_quantity"
              required
              className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
              placeholder={type === 'KEMASAN' ? 'Contoh: 15' : 'Contoh: 50.5'}
            />
          </div>

          {type === 'KEMASAN' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Gunakan Kemasan <span className="text-rose-500">*</span>
              </label>
              <select
                name="packaging_product_id"
                required={type === 'KEMASAN'}
                className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
              >
                <option value="">-- Pilih Karung / Plastik --</option>
                {kemasanProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bahan Campuran */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            3. Bahan Curah yang Digunakan
          </h2>
          <button
            type="button"
            onClick={addInput}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            <Plus className="h-4 w-4" />
            Tambah Bahan
          </button>
        </div>

        <div className="space-y-4">
          {inputs.map((input, idx) => (
            <div key={input.id} className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-medium text-zinc-500">Pilih Beras (Bahan)</label>
                <select
                  name={`input_product_${input.id}`}
                  required
                  className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
                >
                  <option value="">-- Pilih --</option>
                  {berasProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-32 space-y-2">
                <label className="block text-xs font-medium text-zinc-500">Jumlah (Kg)</label>
                <input
                  type="number"
                  step="0.01"
                  name={`input_qty_${input.id}`}
                  required
                  className="block w-full rounded-xl border-0 py-2.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div className="pt-7">
                <button
                  type="button"
                  onClick={() => removeInput(input.id)}
                  disabled={inputs.length === 1}
                  className="rounded-lg p-2.5 text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Link
          href="/dashboard/blending"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Memproses...' : 'Proses Blending & HPP'}
        </button>
      </div>
    </form>
  )
}
