'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Trash2, 
  Loader2, 
  ShoppingCart, 
  Store, 
  UserCheck, 
  Coins, 
  ShieldAlert, 
  ArrowLeft,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { createPO } from '../actions'
import AddSupplierModal from './AddSupplierModal'

interface StoreOption {
  id: string
  name: string
}

interface SupplierOption {
  id: string
  name: string
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

interface POCreateFormProps {
  stores: StoreOption[]
  suppliers: SupplierOption[]
  rawMaterials: RawMaterialOption[]
  packagingMaterials: PackagingOption[]
}

export default function POCreateForm({
  stores,
  suppliers,
  rawMaterials,
  packagingMaterials,
}: POCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Generate default PO Number: PO-YYYYMMDD-XXXX
  const generateDefaultPONumber = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `PO-${yyyy}${mm}${dd}-${randomSuffix}`
  }

  // Form Header States
  const [storeId, setStoreId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [poNumber, setPoNumber] = useState(generateDefaultPONumber())
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>(suppliers)

  // Dynamic Array for PO Items
  const [items, setItems] = useState<Array<{
    composite_key: string // helper to map select changes (item_type:item_id)
    item_type: 'RAW_MATERIAL' | 'PACKAGING' | ''
    item_id: string
    quantity: string
    price_per_unit: string
  }>>([
    { composite_key: '', item_type: '', item_id: '', quantity: '', price_per_unit: '' }
  ])

  // Combine items for select options
  const itemOptions = [
    ...rawMaterials.map(rm => ({
      key: `RAW_MATERIAL:${rm.id}`,
      name: `${rm.name} (Bahan Baku)`,
      code: rm.rm_code,
      item_type: 'RAW_MATERIAL' as const,
      id: rm.id
    })),
    ...packagingMaterials.map(pkg => ({
      key: `PACKAGING:${pkg.id}`,
      name: `${pkg.name} (Kemasan)`,
      code: pkg.packaging_code,
      item_type: 'PACKAGING' as const,
      id: pkg.id
    }))
  ]

  // Handlers for rows
  const addRow = () => {
    setItems([...items, { composite_key: '', item_type: '', item_id: '', quantity: '', price_per_unit: '' }])
  }

  const removeRow = (index: number) => {
    const updated = [...items]
    updated.splice(index, 1)
    setItems(updated)
  }

  const handleRowChange = (index: number, field: string, value: string) => {
    const updated = [...items]
    
    if (field === 'composite_key') {
      const [type, id] = value.split(':')
      updated[index] = {
        ...updated[index],
        composite_key: value,
        item_type: type as any,
        item_id: id
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      }
    }
    
    setItems(updated)
  }

  // Calculate PO Grand Total
  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price_per_unit) || 0
      return sum + (qty * price)
    }, 0)
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!storeId) {
      setErrorMsg('Pilih toko tujuan terlebih dahulu.')
      return
    }

    if (!supplierId) {
      setErrorMsg('Pilih supplier terlebih dahulu.')
      return
    }

    if (items.length === 0) {
      setErrorMsg('PO harus memiliki minimal 1 item.')
      return
    }

    const hasEmptyItem = items.some(row => !row.item_id || !row.quantity || !row.price_per_unit)
    if (hasEmptyItem) {
      setErrorMsg('Lengkapi atau hapus baris item PO yang belum lengkap.')
      return
    }

    setLoading(true)

    try {
      await createPO({
        store_id: storeId,
        supplier_id: supplierId,
        po_number: poNumber,
        items: items.map(row => ({
          item_type: row.item_type as 'RAW_MATERIAL' | 'PACKAGING',
          item_id: row.item_id,
          quantity: parseFloat(row.quantity),
          price_per_unit: parseFloat(row.price_per_unit),
        }))
      })

      router.push('/dashboard/purchasing')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan Purchase Order.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/purchasing"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Buat PO Baru (Purchase Order)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Catat pesanan barang masuk baru ke supplier. Status default akan terbuat sebagai 'Dikirim' (Submitted).
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
            <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>1. Header Purchase Order</span>
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Nomor PO (Unik)
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PO-2026-001"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Toko / Cabang Tujuan
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Store className="h-4 w-4" />
                </div>
                <select
                  required
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                >
                  <option value="" disabled>-- Pilih Cabang --</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Supplier
                </label>
                <AddSupplierModal
                  onSupplierAdded={(newSupplier) => {
                    setSupplierOptions((prev) => [...prev, newSupplier])
                    setSupplierId(newSupplier.id)
                  }}
                />
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <UserCheck className="h-4 w-4" />
                </div>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                >
                  <option value="" disabled>-- Pilih Supplier --</option>
                  {supplierOptions.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Items Table */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-50">
              <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Daftar Item Pengadaan</span>
            </h2>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Item</span>
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {items.map((row, index) => {
              const qty = parseFloat(row.quantity) || 0
              const price = parseFloat(row.price_per_unit) || 0
              const subtotal = qty * price

              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-zinc-400 w-4">
                    {index + 1}.
                  </span>
                  <div className="flex-1 grid gap-4 grid-cols-6">
                    <div className="col-span-3">
                      <select
                        required
                        value={row.composite_key}
                        onChange={(e) => handleRowChange(index, 'composite_key', e.target.value)}
                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      >
                        <option value="" disabled>-- Pilih Item (Bahan / Kemasan) --</option>
                        {itemOptions.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="number"
                        step="0.0001"
                        required
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        step="50"
                        required
                        placeholder="Harga Satuan"
                        value={row.price_per_unit}
                        onChange={(e) => handleRowChange(index, 'price_per_unit', e.target.value)}
                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      />
                    </div>

                    <div className="flex items-center pl-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={items.length === 1}
                    onClick={() => removeRow(index)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Grand Total Display */}
          <div className="mt-6 flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="text-right">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Total Nilai PO
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-sans block mt-1">
                {formatRupiah(calculateGrandTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/purchasing"
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
                <span>Menyimpan PO...</span>
              </>
            ) : (
              <span>Simpan Purchase Order</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
