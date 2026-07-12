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
  Info,
  Trash2
} from 'lucide-react'
import { executeProduction } from '../actions'

interface StoreOption {
  id: string
  store_code: string
  name: string
}

interface SellingProduct {
  id: string
  sku: string
  name: string
  unit_weight_kg?: number
}

interface RawMaterial {
  id: string
  rm_code: string
  name: string
}

interface PackagingMaterial {
  id: string
  packaging_code: string
  name: string
}

interface BatchCreateFormProps {
  stores: StoreOption[]
  sellingProducts: SellingProduct[]
  rawMaterials: RawMaterial[]
  packagingMaterials: PackagingMaterial[]
}

export default function BatchCreateForm({ stores, sellingProducts, rawMaterials, packagingMaterials }: BatchCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form States
  const [storeId, setStoreId] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [notes, setNotes] = useState('')
  
  const [targetProductId, setTargetProductId] = useState('')
  const [outputQty, setOutputQty] = useState('')
  const [standardLossPct, setStandardLossPct] = useState('0')

  // Dynamic lists
  const [actualInputs, setActualInputs] = useState<Array<{
    id: string
    raw_material_id: string
    quantity_kg: string
  }>>([])

  const [actualPackaging, setActualPackaging] = useState<Array<{
    id: string
    packaging_material_id: string
    quantity: string
  }>>([])

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

  // 2. Resolve Target SKU
  const targetProduct = useMemo(() => {
    return sellingProducts.find(sp => sp.id === targetProductId) || null
  }, [targetProductId, sellingProducts])

  // Computed total output weight (Kg) based on Qty and Unit Weight
  const outputTotalWeightKg = useMemo(() => {
    if (!targetProduct) return 0
    const qty = parseFloat(outputQty) || 0
    const unitWeight = targetProduct.unit_weight_kg || 1
    return qty * unitWeight
  }, [targetProduct, outputQty])

  // 4. Calculations for Real-time metrics
  const totalInputWeight = useMemo(() => {
    return actualInputs.reduce((sum, item) => sum + (parseFloat(item.quantity_kg) || 0), 0)
  }, [actualInputs])

  const calculatedLossPct = useMemo(() => {
    if (totalInputWeight <= 0) return 0
    const lossWeight = totalInputWeight - outputTotalWeightKg
    return Math.max(0, (lossWeight / totalInputWeight) * 100)
  }, [totalInputWeight, outputTotalWeightKg])

  const isLossExceeded = useMemo(() => {
    const limit = parseFloat(standardLossPct) || 0
    return calculatedLossPct > limit
  }, [standardLossPct, calculatedLossPct])

  // Dynamic Form Handlers
  const addRawMaterial = () => {
    setActualInputs([...actualInputs, { id: Math.random().toString(), raw_material_id: '', quantity_kg: '' }])
  }

  const removeRawMaterial = (id: string) => {
    setActualInputs(actualInputs.filter(item => item.id !== id))
  }

  const updateRawMaterial = (id: string, field: string, value: string) => {
    setActualInputs(actualInputs.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const addPackagingMaterial = () => {
    setActualPackaging([...actualPackaging, { id: Math.random().toString(), packaging_material_id: '', quantity: '' }])
  }

  const removePackagingMaterial = (id: string) => {
    setActualPackaging(actualPackaging.filter(item => item.id !== id))
  }

  const updatePackagingMaterial = (id: string, field: string, value: string) => {
    setActualPackaging(actualPackaging.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  // 5. Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!storeId) {
      setErrorMsg('Pilih toko cabang pelaksanaan terlebih dahulu.')
      return
    }

    if (!targetProductId) {
      setErrorMsg('Pilih produk target (SKU) terlebih dahulu.')
      return
    }

    if (!batchNumber.trim()) {
      setErrorMsg('Nomor batch tidak boleh kosong.')
      return
    }

    const outQty = parseFloat(outputQty) || 0
    if (outQty <= 0) {
      setErrorMsg('Jumlah hasil aktual (Qty) harus lebih dari 0.')
      return
    }

    if (outputTotalWeightKg <= 0) {
      setErrorMsg('Berat total hasil aktual harus lebih dari 0. Periksa berat satuan produk.')
      return
    }

    if (actualInputs.length === 0) {
      setErrorMsg('Minimal satu bahan baku harus ditambahkan.')
      return
    }

    // Check for incomplete or zero values in inputs
    const hasInvalidInput = actualInputs.some(item => !item.raw_material_id || (parseFloat(item.quantity_kg) || 0) <= 0)
    if (hasInvalidInput) {
      setErrorMsg('Semua bahan baku harus dipilih dan kuantitasnya harus lebih dari 0.')
      return
    }

    // Check packaging
    const hasInvalidPackaging = actualPackaging.some(item => !item.packaging_material_id || (parseFloat(item.quantity) || 0) <= 0)
    if (hasInvalidPackaging) {
      setErrorMsg('Semua kemasan harus dipilih dan kuantitasnya harus lebih dari 0.')
      return
    }

    setLoading(true)

    try {
      if (!targetProduct) {
        throw new Error('Produk target hasil resep tidak valid.')
      }

      await executeProduction({
        store_id: storeId,
        recipe_id: null, // No preset recipe
        batch_number: batchNumber,
        notes: notes || undefined,
        toleransi_susut_pct: parseFloat(standardLossPct) || 0,
        output_item: {
          selling_product_id: targetProduct.id,
          quantity: outQty,
          total_weight_kg: outputTotalWeightKg
        },
        inputs: actualInputs.map(item => ({
          raw_material_id: item.raw_material_id,
          quantity_kg: parseFloat(item.quantity_kg) || 0
        })),
        packaging: actualPackaging.map(item => ({
          packaging_material_id: item.packaging_material_id,
          quantity: parseFloat(item.quantity) || 0
        }))
      } as any)

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
            Eksekusi produksi dinamis (mixing/repacking) untuk memperbarui stok secara real-time.
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

              {/* Target SKU Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Produk Target (SKU)
                </label>
                <select
                  required
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                >
                  <option value="">-- Pilih SKU Hasil Jadi --</option>
                  {sellingProducts.map(sku => (
                    <option key={sku.id} value={sku.id}>
                      {sku.name} ({sku.unit_weight_kg || 1} Kg)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Batch Number */}
              <div className="col-span-1 sm:col-span-2">
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
              <div className="col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Tanggal Produksi
                </label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100/50 px-3.5 py-2.5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {targetProductId ? (
            <>
              {/* Target & Output Section */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-500" />
                  <span>Target Hasil Aktual (Output)</span>
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Output Qty */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Jumlah Hasil Aktual (Pcs/Karung)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={outputQty}
                      onChange={(e) => setOutputQty(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                      placeholder="Contoh: 100"
                    />
                  </div>

                  {/* Total Weight Kg */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Total Berat Aktual (Kg)
                    </label>
                    <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100/50 px-3.5 py-2.5 text-sm text-zinc-500 font-mono font-semibold dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300">
                      {outputTotalWeightKg.toFixed(2)} Kg
                    </div>
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
                </div>

                <div className="space-y-3">
                  {actualInputs.map((item) => (
                    <div 
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-950/30 gap-3"
                    >
                      <div className="flex-1">
                        <select
                          required
                          value={item.raw_material_id}
                          onChange={(e) => updateRawMaterial(item.id, 'raw_material_id', e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        >
                          <option value="">-- Pilih Bahan Baku --</option>
                          {rawMaterials.map(rm => (
                            <option key={rm.id} value={rm.id}>{rm.name} ({rm.rm_code})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full sm:w-auto flex items-center gap-2">
                        <input
                          type="number"
                          required
                          step="any"
                          placeholder="Jumlah"
                          value={item.quantity_kg}
                          onChange={(e) => updateRawMaterial(item.id, 'quantity_kg', e.target.value)}
                          className="w-32 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-right font-mono text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Kg</span>
                        <button type="button" onClick={() => removeRawMaterial(item.id)} className="ml-1 p-2 text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={addRawMaterial} className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-500">
                    <Plus className="h-4 w-4" />
                    Tambah Bahan Baku
                  </button>
                </div>
              </div>

              {/* Packaging Detail */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-emerald-500" />
                    <span>Kemasan Terpakai (Plastik/Karung)</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {actualPackaging.map((item) => (
                    <div 
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-950/30 gap-3"
                    >
                      <div className="flex-1">
                        <select
                          required
                          value={item.packaging_material_id}
                          onChange={(e) => updatePackagingMaterial(item.id, 'packaging_material_id', e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        >
                          <option value="">-- Pilih Kemasan --</option>
                          {packagingMaterials.map(pm => (
                            <option key={pm.id} value={pm.id}>{pm.name} ({pm.packaging_code})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full sm:w-auto flex items-center gap-2">
                        <input
                          type="number"
                          required
                          step="any"
                          placeholder="Jumlah"
                          value={item.quantity}
                          onChange={(e) => updatePackagingMaterial(item.id, 'quantity', e.target.value)}
                          className="w-32 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-right font-mono text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Pcs</span>
                        <button type="button" onClick={() => removePackagingMaterial(item.id)} className="ml-1 p-2 text-rose-500 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addPackagingMaterial} className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-500">
                    <Plus className="h-4 w-4" />
                    Tambah Kemasan
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-zinc-200 border-dashed bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <Blend className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-500" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Pilih Produk Target (SKU) terlebih dahulu untuk melanjutkan
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
                <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{outputTotalWeightKg.toFixed(2)} Kg</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Penyusutan Fisik (Loss)</span>
                <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">{(totalInputWeight - outputTotalWeightKg).toFixed(2)} Kg</span>
              </div>

              {/* Loss tolerance input */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Toleransi Susut Maksimal (%)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="any"
                  value={standardLossPct}
                  onChange={(e) => setStandardLossPct(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  placeholder="Contoh: 1.5"
                />
              </div>

              {/* Loss percentage display */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 space-y-1 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Deviasi Susut Aktual</span>
                  </span>
                  <span className={`font-bold font-mono text-sm ${isLossExceeded ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {calculatedLossPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Alert warnings */}
            {isLossExceeded && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-3.5 text-xs text-amber-700 dark:text-amber-400 leading-normal">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Deviasi Susut Melampaui Batas!</span>
                  Kadar susut aktual ({calculatedLossPct.toFixed(2)}%) melebihi toleransi ({parseFloat(standardLossPct).toFixed(2)}%). Batch produksi ini akan disimpan dengan status <strong className="underline">Pending Approval</strong>.
                </div>
              </div>
            )}

            {!isLossExceeded && targetProduct && totalInputWeight > 0 && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 p-3.5 text-xs text-emerald-700 dark:text-emerald-400 leading-normal">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Kadar Susut Normal</span>
                  Kadar susut aktual ({calculatedLossPct.toFixed(2)}%) masih di dalam batas toleransi ({parseFloat(standardLossPct).toFixed(2)}%). Status batch akan langsung ditandai <strong className="underline">Completed</strong>.
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
