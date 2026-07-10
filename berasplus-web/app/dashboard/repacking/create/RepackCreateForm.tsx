'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, 
  Store, 
  ArrowLeft, 
  Loader2, 
  AlertTriangle, 
  Scale, 
  Inbox, 
  FileText 
} from 'lucide-react'
import { executeRepack } from '../actions'

interface StoreOption {
  id: string
  store_code: string
  name: string
}

interface RawMaterial {
  id: string
  rm_code: string
  name: string
  base_unit: string
  hpp: any
}

interface SellingProduct {
  id: string
  sku: string
  name: string
  sell_price: any
}

interface StockBalance {
  store_id: string
  product_id: string
  current_stock_kg: any
}

interface RepackCreateFormProps {
  stores: StoreOption[]
  rawMaterials: RawMaterial[]
  sellingProducts: SellingProduct[]
  stockBalances: StockBalance[]
}

export default function RepackCreateForm({
  stores,
  rawMaterials,
  sellingProducts,
  stockBalances
}: RepackCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form States
  const [storeId, setStoreId] = useState('')
  const [rawMaterialId, setRawMaterialId] = useState('')
  const [sellingProductId, setSellingProductId] = useState('')
  const [quantityKg, setQuantityKg] = useState('')
  const [quantityPacks, setQuantityPacks] = useState('')
  const [notes, setNotes] = useState('')

  // 1. Get available stock for selected store & raw material
  const availableStock = useMemo(() => {
    if (!storeId || !rawMaterialId) return 0
    const match = stockBalances.find(
      (sb) => sb.store_id === storeId && sb.product_id === rawMaterialId
    )
    return match ? parseFloat(match.current_stock_kg) || 0 : 0
  }, [storeId, rawMaterialId, stockBalances])

  // 2. Form Validation
  const validationError = useMemo(() => {
    if (!storeId) return 'Pilih cabang toko terlebih dahulu.'
    if (!rawMaterialId) return 'Pilih bahan sumber curah.'
    if (!sellingProductId) return 'Pilih produk retail hasil repacking.'
    
    const kg = parseFloat(quantityKg)
    const packs = parseInt(quantityPacks)

    if (isNaN(kg) || kg <= 0) return 'Jumlah yang di-repack harus lebih dari 0 Kg.'
    if (isNaN(packs) || packs <= 0) return 'Jumlah kemasan yang dihasilkan harus lebih dari 0 pack.'
    
    if (kg > availableStock) {
      return `Stok tidak mencukupi. Tersedia: ${availableStock.toFixed(2)} Kg, diminta: ${kg.toFixed(2)} Kg.`
    }

    return ''
  }, [storeId, rawMaterialId, sellingProductId, quantityKg, quantityPacks, availableStock])

  // 3. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validationError) return

    setLoading(true)
    setErrorMsg('')

    try {
      await executeRepack({
        store_id: storeId,
        raw_material_id: rawMaterialId,
        selling_product_id: sellingProductId,
        quantity_kg: parseFloat(quantityKg),
        quantity_packs: parseInt(quantityPacks),
        notes: notes || undefined,
      })
      router.push('/dashboard/repacking')
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses repacking.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/repacking"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Jalankan Repacking Baru
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Pecah karung beras curah (Bahan Baku) ke kemasan pack retail eceran siap jual.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          {errorMsg}
        </div>
      )}

      {/* Main Form Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Toko / Cabang */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Store className="h-4 w-4 text-emerald-600" />
              <span>Cabang Toko</span>
            </label>
            <select
              value={storeId}
              onChange={(e) => {
                setStoreId(e.target.value)
                setRawMaterialId('')
              }}
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-600 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
            >
              <option value="">-- Pilih Cabang Toko --</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.store_code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bahan Sumber (Curah) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Inbox className="h-4 w-4 text-emerald-600" />
                <span>Bahan Sumber (Curah)</span>
              </label>
              <select
                value={rawMaterialId}
                onChange={(e) => setRawMaterialId(e.target.value)}
                required
                disabled={!storeId}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-600 focus:bg-white disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
              >
                <option value="">-- Pilih Bahan Baku --</option>
                {rawMaterials.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    {rm.name} ({rm.rm_code})
                  </option>
                ))}
              </select>

              {storeId && rawMaterialId && (
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1.5 bg-zinc-50 dark:bg-zinc-800/30 p-2 rounded-lg">
                  <Scale className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Stok Tersedia di Toko: {availableStock.toFixed(2)} Kg</span>
                </div>
              )}
            </div>

            {/* Produk Hasil */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                <span>Produk Hasil (Eceran)</span>
              </label>
              <select
                value={sellingProductId}
                onChange={(e) => setSellingProductId(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-600 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
              >
                <option value="">-- Pilih Produk Jual --</option>
                {sellingProducts.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name} ({sp.sku})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jumlah Repack (Kg) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Jumlah Bahan Baku Digunakan (Kg)
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-600 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
              />
            </div>

            {/* Hasil Kemasan (Pack) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Jumlah Hasil (Pcs/Pak)
              </label>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={quantityPacks}
                onChange={(e) => setQuantityPacks(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-600 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>Catatan / Keterangan</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Repacking Ramos curah menjadi kemasan retail 5kg."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-600 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-emerald-500"
            />
          </div>

          {/* Warning validation */}
          {validationError && storeId && rawMaterialId && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-4 border border-amber-100 text-sm text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>{validationError}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/dashboard/repacking"
              className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || !!validationError}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-emerald-600/10"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Proses Repacking</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
