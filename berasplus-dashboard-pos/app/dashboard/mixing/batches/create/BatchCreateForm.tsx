'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Blend, 
  Store, 
  Calendar, 
  TrendingDown, 
  Layers, 
  AlertTriangle, 
  Loader2, 
  ArrowLeft,
  Info
} from 'lucide-react'
import { executeProduction } from '../actions'

interface RawMaterial {
  id: string
  name: string
  rm_code: string
}

interface PackagingMaterial {
  id: string
  name: string
  packaging_code: string
  buy_price_per_pcs: any
}

interface RecipeInput {
  id: string
  raw_material_id: string
  quantity_kg: any
  raw_materials: any // Can be object or array
}

interface RecipePackaging {
  id: string
  packaging_material_id: string
  quantity: any
  packaging_materials: any // Can be object or array
}

interface RecipeVersion {
  id: string
  version_number: number
  recipe_version_inputs: RecipeInput[]
  recipe_version_packaging: RecipePackaging[]
}

interface Recipe {
  id: string
  recipe_code: string
  name: string
  standard_loss_pct: any
  target_product_id: string
  selling_products: any // Can be object or array
  activeVersion?: RecipeVersion
}

interface StoreOption {
  id: string
  store_code: string
  name: string
}

interface BatchCreateFormProps {
  stores: StoreOption[]
  recipes: Recipe[]
}

export default function BatchCreateForm({ stores, recipes }: BatchCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form States
  const [storeId, setStoreId] = useState('')
  const [recipeId, setRecipeId] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [outputQty, setOutputQty] = useState('')
  const [outputTotalWeightKg, setOutputTotalWeightKg] = useState('')
  const [notes, setNotes] = useState('')

  // Actual consumed raw materials & packaging (pre-filled and auto-scaled, but editable)
  const [actualInputs, setActualInputs] = useState<Array<{
    raw_material_id: string
    name: string
    rm_code: string
    base_qty_kg: number
    quantity_kg: string
  }>>([])

  const [actualPackaging, setActualPackaging] = useState<Array<{
    packaging_material_id: string
    name: string
    packaging_code: string
    base_qty: number
    quantity: string
  }>>([])

  // Helper for single object vs array from Supabase joins
  const extractSingle = <T,>(val: T | T[] | null | undefined): T | null => {
    if (!val) return null
    return Array.isArray(val) ? val[0] : val
  }

  // 1. Generate Batch Number
  const generateBatchNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(100 + Math.random() * 900)
    return `PROD-${year}${month}${date}-${random}`
  }

  useEffect(() => {
    setBatchNumber(generateBatchNumber())
  }, [])

  // 2. Resolve selected recipe details
  const selectedRecipe = useMemo(() => {
    return recipes.find(r => r.id === recipeId) || null
  }, [recipeId, recipes])

  const targetProduct = useMemo(() => {
    if (!selectedRecipe) return null
    return extractSingle(selectedRecipe.selling_products)
  }, [selectedRecipe])

  // Recipe standard values
  const recipeStandardInputs = useMemo(() => {
    if (!selectedRecipe?.activeVersion) return []
    return selectedRecipe.activeVersion.recipe_version_inputs || []
  }, [selectedRecipe])

  const recipeStandardPackaging = useMemo(() => {
    if (!selectedRecipe?.activeVersion) return []
    return selectedRecipe.activeVersion.recipe_version_packaging || []
  }, [selectedRecipe])

  // Base total quantities for scaling reference
  const baseYieldQty = useMemo(() => {
    if (recipeStandardPackaging.length === 0) return 1
    // The sum of packaging used in the recipe represents the standard yield count (e.g. 10 bags)
    return recipeStandardPackaging.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0) || 1
  }, [recipeStandardPackaging])

  const baseInputWeight = useMemo(() => {
    return recipeStandardInputs.reduce((acc, curr) => acc + (parseFloat(curr.quantity_kg) || 0), 0) || 1
  }, [recipeStandardInputs])

  // 3. Trigger auto-scaling when recipe or target output details change
  useEffect(() => {
    if (!selectedRecipe) {
      setActualInputs([])
      setActualPackaging([])
      setOutputQty('')
      setOutputTotalWeightKg('')
      return
    }

    // Set initial output qty to the base yield of the recipe
    const initialOutputQty = baseYieldQty
    const standardLoss = parseFloat(selectedRecipe.standard_loss_pct) || 0
    const initialWeight = baseInputWeight * (1 - standardLoss / 100)

    setOutputQty(String(initialOutputQty))
    setOutputTotalWeightKg(initialWeight.toFixed(2))

    // Pre-fill inputs list
    const inputsList = recipeStandardInputs.map(input => {
      const rm = extractSingle(input.raw_materials)
      const baseQty = parseFloat(input.quantity_kg) || 0
      return {
        raw_material_id: input.raw_material_id,
        name: rm?.name || 'Bahan Baku',
        rm_code: rm?.rm_code || '',
        base_qty_kg: baseQty,
        quantity_kg: String(baseQty)
      }
    })
    setActualInputs(inputsList)

    // Pre-fill packaging list
    const packagingList = recipeStandardPackaging.map(pkg => {
      const pm = extractSingle(pkg.packaging_materials)
      const baseQty = parseFloat(pkg.quantity) || 0
      return {
        packaging_material_id: pkg.packaging_material_id,
        name: pm?.name || 'Kemasan',
        packaging_code: pm?.packaging_code || '',
        base_qty: baseQty,
        quantity: String(baseQty)
      }
    })
    setActualPackaging(packagingList)
  }, [selectedRecipe, recipeStandardInputs, recipeStandardPackaging, baseYieldQty, baseInputWeight])

  // Handle scaling when output_qty changes
  const handleOutputQtyChange = (val: string) => {
    setOutputQty(val)
    const qty = parseFloat(val) || 0
    if (qty <= 0 || !selectedRecipe) return

    // Scale inputs & packaging
    const scaleFactor = qty / baseYieldQty

    const updatedInputs = actualInputs.map(item => ({
      ...item,
      quantity_kg: (item.base_qty_kg * scaleFactor).toFixed(2)
    }))
    setActualInputs(updatedInputs)

    const updatedPackaging = actualPackaging.map(item => ({
      ...item,
      quantity: Math.ceil(item.base_qty * scaleFactor).toString() // Packaging is discrete count, so round up
    }))
    setActualPackaging(updatedPackaging)

    // Estimate output weight
    const standardLoss = parseFloat(selectedRecipe.standard_loss_pct) || 0
    const estimatedWeight = (baseInputWeight * scaleFactor) * (1 - standardLoss / 100)
    setOutputTotalWeightKg(estimatedWeight.toFixed(2))
  }

  // 4. Calculations for Real-time metrics
  const totalInputWeight = useMemo(() => {
    return actualInputs.reduce((sum, item) => sum + (parseFloat(item.quantity_kg) || 0), 0)
  }, [actualInputs])

  const actualOutputWeight = parseFloat(outputTotalWeightKg) || 0

  const calculatedLossPct = useMemo(() => {
    if (totalInputWeight <= 0) return 0
    const lossWeight = totalInputWeight - actualOutputWeight
    return Math.max(0, (lossWeight / totalInputWeight) * 100)
  }, [totalInputWeight, actualOutputWeight])

  const isLossExceeded = useMemo(() => {
    if (!selectedRecipe) return false
    const limit = parseFloat(selectedRecipe.standard_loss_pct) || 0
    return calculatedLossPct > limit
  }, [selectedRecipe, calculatedLossPct])

  // 5. Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!storeId) {
      setErrorMsg('Pilih toko cabang pelaksanaan terlebih dahulu.')
      return
    }

    if (!recipeId) {
      setErrorMsg('Pilih resep mixing/repacking terlebih dahulu.')
      return
    }

    if (!batchNumber.trim()) {
      setErrorMsg('Nomor batch tidak boleh kosong.')
      return
    }

    const outQty = parseFloat(outputQty) || 0
    const outWeight = parseFloat(outputTotalWeightKg) || 0

    if (outQty <= 0) {
      setErrorMsg('Jumlah hasil aktual harus lebih dari 0.')
      return
    }

    if (outWeight <= 0) {
      setErrorMsg('Berat total hasil aktual harus lebih dari 0.')
      return
    }

    // Check for negative or empty values in inputs
    const hasInvalidInput = actualInputs.some(item => (parseFloat(item.quantity_kg) || 0) <= 0)
    if (hasInvalidInput) {
      setErrorMsg('Semua kuantitas bahan baku terpakai harus lebih besar dari 0.')
      return
    }

    setLoading(true)

    try {
      if (!targetProduct) {
        throw new Error('Produk target hasil resep tidak valid.')
      }

      await executeProduction({
        store_id: storeId,
        recipe_id: recipeId,
        batch_number: batchNumber,
        notes: notes || undefined,
        output_item: {
          selling_product_id: targetProduct.id,
          quantity: outQty,
          total_weight_kg: outWeight
        },
        inputs: actualInputs.map(item => ({
          raw_material_id: item.raw_material_id,
          quantity_kg: parseFloat(item.quantity_kg) || 0
        })),
        packaging: actualPackaging.map(item => ({
          packaging_material_id: item.packaging_material_id,
          quantity: parseFloat(item.quantity) || 0
        }))
      })

      // Success - Redirect back
      router.push('/dashboard/mixing/batches')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan dan mengeksekusi batch produksi.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/mixing/batches"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Jalankan Produksi Baru
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Eksekusi resep mixing dan repacking untuk memperbarui stok secara real-time.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Columns - Form Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header & Configuration */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-500" />
              <span>Konfigurasi Batch</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Store Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Toko Pelaksana
                </label>
                <select
                  required
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                >
                  <option value="">-- Pilih Cabang Toko --</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name} ({store.store_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipe Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Resep / Formula
                </label>
                <select
                  required
                  value={recipeId}
                  onChange={(e) => setRecipeId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                >
                  <option value="">-- Pilih Resep --</option>
                  {recipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id} disabled={!recipe.activeVersion}>
                      {recipe.name} ({recipe.recipe_code}) {!recipe.activeVersion && '(Belum ada versi aktif)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Batch Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  No Batch Produksi
                </label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                    placeholder="PROD-YYYYMMDD-XXX"
                  />
                  <button
                    type="button"
                    onClick={() => setBatchNumber(generateBatchNumber())}
                    className="rounded-xl border border-zinc-200 px-3 text-xs font-semibold hover:bg-zinc-100 active:scale-95 transition-all dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-300"
                  >
                    Acak
                  </button>
                </div>
              </div>

              {/* Date Display */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Tanggal Produksi
                </label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100/50 px-3.5 py-2.5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {selectedRecipe ? (
            <>
              {/* Target & Output Section */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-500" />
                  <span>Target Hasil Aktual (Output)</span>
                </h2>

                {targetProduct && (
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 dark:bg-zinc-950/40 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Target SKU</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{targetProduct.name}</span>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className="inline-block rounded-lg bg-zinc-200 dark:bg-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                        SKU: {targetProduct.sku}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Output Qty */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Jumlah Hasil (Pcs/Pak)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={outputQty}
                      onChange={(e) => handleOutputQtyChange(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                      placeholder="Contoh: 100"
                    />
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Meningkatkan jumlah ini otomatis menskalakan takaran resep di bawah.
                    </p>
                  </div>

                  {/* Total Weight Kg */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Total Berat Aktual (Kg)
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      value={outputTotalWeightKg}
                      onChange={(e) => setOutputTotalWeightKg(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                      placeholder="Contoh: 500"
                    />
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Berat bersih total seluruh produk jadi setelah dikurangi susut mixing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inputs Detail */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                    <Blend className="h-5 w-5 text-emerald-500" />
                    <span>Bahan Baku Terpakai (Beras Curah)</span>
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Dapat diedit jika riil berbeda</span>
                </div>

                <div className="space-y-3">
                  {actualInputs.map((item, index) => (
                    <div 
                      key={item.raw_material_id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-950/30 gap-3"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm block">
                          {item.name}
                        </span>
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                          Kode: {item.rm_code} | Standar resep: {(item.base_qty_kg * ((parseFloat(outputQty) || 0) / baseYieldQty)).toFixed(2)} Kg
                        </span>
                      </div>
                      <div className="w-full sm:w-44 flex items-center gap-2">
                        <input
                          type="number"
                          required
                          step="any"
                          value={item.quantity_kg}
                          onChange={(e) => {
                            const updated = [...actualInputs]
                            updated[index].quantity_kg = e.target.value
                            setActualInputs(updated)
                          }}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-right font-mono text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Packaging Detail */}
              {actualPackaging.length > 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                      <Plus className="h-5 w-5 text-emerald-500" />
                      <span>Kemasan Terpakai (Plastik/Karung)</span>
                    </h2>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Dapat diedit jika riil berbeda</span>
                  </div>

                  <div className="space-y-3">
                    {actualPackaging.map((item, index) => (
                      <div 
                        key={item.packaging_material_id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-950/30 gap-3"
                      >
                        <div className="flex-1">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm block">
                            {item.name}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            Kode: {item.packaging_code} | Standar resep: {Math.ceil(item.base_qty * ((parseFloat(outputQty) || 0) / baseYieldQty))} Pcs
                          </span>
                        </div>
                        <div className="w-full sm:w-44 flex items-center gap-2">
                          <input
                            type="number"
                            required
                            step="any"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...actualPackaging]
                              updated[index].quantity = e.target.value
                              setActualPackaging(updated)
                            }}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-right font-mono text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Pcs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-zinc-200 border-dashed bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <Blend className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-500" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Pilih resep terlebih dahulu untuk menampilkan data bahan baku dan output
              </p>
            </div>
          )}
        </div>

        {/* Right Columns - Metrics & Summary */}
        <div className="space-y-6 lg:col-span-1">
          {/* Real-time Production Summary Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
              Ringkasan & Validasi
            </h2>

            {/* Calculations metrics */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Total Berat Input (Beras Curah)</span>
                <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{totalInputWeight.toFixed(2)} Kg</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Total Berat Output (Jadi)</span>
                <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{actualOutputWeight.toFixed(2)} Kg</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Penyusutan Fisik (Loss)</span>
                <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{(totalInputWeight - actualOutputWeight).toFixed(2)} Kg</span>
              </div>

              {/* Loss percentage */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Deviasi Susut Aktual</span>
                  </span>
                  <span className={`font-bold font-mono text-sm ${isLossExceeded ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {calculatedLossPct.toFixed(2)}%
                  </span>
                </div>
                {selectedRecipe && (
                  <div className="flex justify-between items-center text-xxs text-zinc-400">
                    <span>Toleransi Susut Resep:</span>
                    <span className="font-semibold font-mono">{parseFloat(selectedRecipe.standard_loss_pct).toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Alert warnings */}
            {isLossExceeded && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-3.5 text-xs text-amber-700 dark:text-amber-400 leading-normal">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Deviasi Susut Melampaui Batas!</span>
                  Kadar susut aktual ({calculatedLossPct.toFixed(2)}%) melebihi toleransi resep ({parseFloat(selectedRecipe?.standard_loss_pct).toFixed(2)}%). Batch produksi ini akan disimpan dengan status <strong className="underline">Pending Approval</strong> untuk ditinjau oleh Owner.
                </div>
              </div>
            )}

            {!isLossExceeded && selectedRecipe && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 p-3.5 text-xs text-emerald-700 dark:text-emerald-400 leading-normal">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Kadar Susut Normal</span>
                  Kadar susut aktual ({calculatedLossPct.toFixed(2)}%) masih di dalam batas toleransi ({parseFloat(selectedRecipe?.standard_loss_pct).toFixed(2)}%). Status batch akan langsung ditandai <strong className="underline">Completed</strong>.
                </div>
              </div>
            )}

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Catatan Produksi (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                placeholder="Contoh: Kondisi beras mentah agak lembab, deviasi susut wajar."
              />
            </div>

            {/* Submit Actions */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-98 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-emerald-600/10 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses Produksi...</span>
                </>
              ) : (
                <span>Eksekusi Produksi Sekarang</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
