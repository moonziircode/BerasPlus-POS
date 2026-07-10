'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Blend, 
  PackageOpen, 
  Box, 
  ShoppingBag, 
  Percent, 
  ShieldAlert,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { createRecipe } from '../actions'

interface ProductOption {
  id: string
  name: string
  sku: string
}

interface RawMaterialOption {
  id: string
  name: string
  rm_code: string
}

interface PackagingOption {
  id: string
  name: string
  packaging_code: string
}

interface RecipeCreateFormProps {
  products: ProductOption[]
  rawMaterials: RawMaterialOption[]
  packagingMaterials: PackagingOption[]
}

export default function RecipeCreateForm({
  products,
  rawMaterials,
  packagingMaterials,
}: RecipeCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form Fields
  const [recipeCode, setRecipeCode] = useState('')
  const [name, setName] = useState('')
  const [targetProductId, setTargetProductId] = useState('')
  const [standardLossPct, setStandardLossPct] = useState('0.00')

  // Dynamic Array for Raw Materials (Inputs)
  const [inputs, setInputs] = useState<Array<{ raw_material_id: string; quantity_kg: string }>>([
    { raw_material_id: '', quantity_kg: '' }
  ])

  // Dynamic Array for Packaging Materials
  const [packaging, setPackaging] = useState<Array<{ packaging_material_id: string; quantity: string }>>([])

  // Handlers for Raw Materials
  const addInputRow = () => {
    setInputs([...inputs, { raw_material_id: '', quantity_kg: '' }])
  }

  const removeInputRow = (index: number) => {
    const updated = [...inputs]
    updated.splice(index, 1)
    setInputs(updated)
  }

  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...inputs]
    updated[index] = { ...updated[index], [field]: value }
    setInputs(updated)
  }

  // Handlers for Packaging
  const addPackagingRow = () => {
    setPackaging([...packaging, { packaging_material_id: '', quantity: '1' }])
  }

  const removePackagingRow = (index: number) => {
    const updated = [...packaging]
    updated.splice(index, 1)
    setPackaging(updated)
  }

  const handlePackagingChange = (index: number, field: string, value: string) => {
    const updated = [...packaging]
    updated[index] = { ...updated[index], [field]: value }
    setPackaging(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    // Validations
    if (!targetProductId) {
      setErrorMsg('Pilih target produk hasil penjualan terlebih dahulu.')
      return
    }

    if (inputs.length === 0) {
      setErrorMsg('Resep harus memiliki minimal 1 bahan baku.')
      return
    }

    // Check for empty rows in inputs
    const hasEmptyInput = inputs.some(row => !row.raw_material_id || !row.quantity_kg)
    if (hasEmptyInput) {
      setErrorMsg('Lengkapi atau hapus baris bahan baku yang kosong.')
      return
    }

    // Check for empty rows in packaging
    const hasEmptyPackaging = packaging.some(row => !row.packaging_material_id || !row.quantity)
    if (hasEmptyPackaging) {
      setErrorMsg('Lengkapi atau hapus baris kemasan yang kosong.')
      return
    }

    setLoading(true)

    try {
      await createRecipe({
        recipe_code: recipeCode,
        name,
        target_product_id: targetProductId,
        standard_loss_pct: parseFloat(standardLossPct) || 0,
        inputs: inputs.map(row => ({
          raw_material_id: row.raw_material_id,
          quantity_kg: parseFloat(row.quantity_kg),
        })),
        packaging: packaging.map(row => ({
          packaging_material_id: row.packaging_material_id,
          quantity: parseFloat(row.quantity),
        })),
      })

      // Redirect to list
      router.push('/dashboard/mixing/recipes')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan resep.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/mixing/recipes"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Recipe Builder
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Definisikan formula racikan pencampuran (mixing) dan pengemasan beras Anda.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Header / metadata */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-50">
            <Blend className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>1. Header Formula</span>
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Kode Resep (Harus Unik)
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: R-RAMOS-5K"
                value={recipeCode}
                onChange={(e) => setRecipeCode(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Nama Formula Resep
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Oplosan Ramos Premium 5Kg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Target Produk Jual (Hasil Akhir)
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <select
                  required
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                >
                  <option value="" disabled>-- Pilih Produk Jual --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Toleransi Penyusutan (%)
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Percent className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Contoh: 1.50"
                  value={standardLossPct}
                  onChange={(e) => setStandardLossPct(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Inputs (Bahan Baku) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-50">
              <PackageOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Komposisi Bahan Baku (Inputs)</span>
            </h2>
            <button
              type="button"
              onClick={addInputRow}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {inputs.map((row, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-zinc-400 w-4">
                  {index + 1}.
                </span>
                <div className="flex-1 grid gap-4 grid-cols-3">
                  <div className="col-span-2">
                    <select
                      required
                      value={row.raw_material_id}
                      onChange={(e) => handleInputChange(index, 'raw_material_id', e.target.value)}
                      className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    >
                      <option value="" disabled>-- Pilih Bahan Baku --</option>
                      {rawMaterials.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.name} ({rm.rm_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        required
                        placeholder="Jumlah"
                        value={row.quantity_kg}
                        onChange={(e) => handleInputChange(index, 'quantity_kg', e.target.value)}
                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-3 pr-8 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-xs text-zinc-400 font-bold">
                        Kg
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={inputs.length === 1}
                  onClick={() => removeInputRow(index)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Packaging (Kemasan) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-50">
              <Box className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>3. Material Kemasan (Packaging)</span>
            </h2>
            <button
              type="button"
              onClick={addPackagingRow}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>

          {packaging.length > 0 ? (
            <div className="mt-4 space-y-3">
              {packaging.map((row, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-zinc-400 w-4">
                    {index + 1}.
                  </span>
                  <div className="flex-1 grid gap-4 grid-cols-3">
                    <div className="col-span-2">
                      <select
                        required
                        value={row.packaging_material_id}
                        onChange={(e) => handlePackagingChange(index, 'packaging_material_id', e.target.value)}
                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      >
                        <option value="" disabled>-- Pilih Kemasan --</option>
                        {packagingMaterials.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} ({pkg.packaging_code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="relative">
                        <input
                          type="number"
                          step="1"
                          required
                          placeholder="Jumlah Pcs"
                          value={row.quantity}
                          onChange={(e) => handlePackagingChange(index, 'quantity', e.target.value)}
                          className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-3 pr-8 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-xs text-zinc-400 font-bold">
                          Pcs
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePackagingRow(index)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-6 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Tidak ada material kemasan ditambahkan. Resep ini akan dibuat tanpa pengemasan.
              </span>
              <button
                type="button"
                onClick={addPackagingRow}
                className="mt-2 text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Tambahkan Karung/Plastik Kemasan
              </button>
            </div>
          )}
        </div>

        {/* Submit action */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/mixing/recipes"
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Formula...</span>
              </>
            ) : (
              <span>Simpan Resep</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
