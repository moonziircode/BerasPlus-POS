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
import { updateDirectPurchase } from '../actions'
import AddSupplierModal from './AddSupplierModal'
import { createRawMaterialDP, createPackagingMaterialDP } from '../actions'
import ItemCombobox from './ItemCombobox'

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
  conversion_factor?: any
}

interface PackagingOption {
  id: string
  name: string
  packaging_code: string
}

interface CategoryOption {
  id: string
  name: string
}

export interface InitialData {
  id: string
  store_id: string
  supplier_id: string
  purchase_date: string
  notes: string | null
  items: Array<{
    id: string
    item_type: 'RAW_MATERIAL' | 'PACKAGING'
    raw_material_id: string | null
    packaging_material_id: string | null
    quantity: number
    price_per_unit: number
  }>
}

interface DPEditFormProps {
  stores: StoreOption[]
  suppliers: SupplierOption[]
  rawMaterials: RawMaterialOption[]
  packagingMaterials: PackagingOption[]
  categories: CategoryOption[]
  initialData: InitialData
}

export default function DPEditForm({
  stores,
  suppliers,
  rawMaterials,
  packagingMaterials,
  categories,
  initialData,
}: DPEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')



  // Form Header States
  const [storeId, setStoreId] = useState(initialData.store_id)
  const [supplierId, setSupplierId] = useState(initialData.supplier_id)
  const [purchaseDate, setPurchaseDate] = useState(initialData.purchase_date)
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>(suppliers)
  const [rawMaterialOptions, setRawMaterialOptions] = useState<RawMaterialOption[]>(rawMaterials)
  const [packagingMaterialOptions, setPackagingMaterialOptions] = useState<PackagingOption[]>(packagingMaterials)
  const [notes, setNotes] = useState(initialData.notes || '')

  // Dynamic Array for DP Items
  const [items, setItems] = useState<Array<{
    composite_key: string
    item_type: 'RAW_MATERIAL' | 'PACKAGING' | ''
    item_id: string
    quantity: string
    price_per_unit: string
  }>>(
    initialData.items.map(item => {
      const itemId = item.item_type === 'RAW_MATERIAL' ? item.raw_material_id : item.packaging_material_id
      return {
        composite_key: `${item.item_type}:${itemId}`,
        item_type: item.item_type,
        item_id: itemId as string,
        quantity: item.quantity.toString(),
        price_per_unit: item.price_per_unit.toString()
      }
    })
  )

  // Combine items for select options
  const itemOptions = [
    ...rawMaterialOptions.map(rm => ({
      key: `RAW_MATERIAL:${rm.id}`,
      name: `${rm.name} (Bahan Baku)`,
      code: rm.rm_code,
      item_type: 'RAW_MATERIAL' as const,
      id: rm.id,
      conversion_factor: parseFloat(rm.conversion_factor) || 1
    })),
    ...packagingMaterialOptions.map(pkg => ({
      key: `PACKAGING:${pkg.id}`,
      name: `${pkg.name} (Kemasan)`,
      code: pkg.packaging_code,
      item_type: 'PACKAGING' as const,
      id: pkg.id,
      conversion_factor: 0
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

  // Calculate DP Grand Total
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

    if (!purchaseDate) {
      setErrorMsg('Pilih tanggal pembelian terlebih dahulu.')
      return
    }

    if (items.length === 0) {
      setErrorMsg('Pembelian harus memiliki minimal 1 item.')
      return
    }

    const hasEmptyItem = items.some(row => !row.item_id || !row.quantity || !row.price_per_unit)
    if (hasEmptyItem) {
      setErrorMsg('Lengkapi atau hapus baris item pembelian yang belum lengkap.')
      return
    }

    setLoading(true)

    try {
      await updateDirectPurchase(initialData.id, {
        store_id: storeId,
        supplier_id: supplierId,
        purchase_date: purchaseDate,
        notes: notes || undefined,
        items: items.map(row => ({
          item_type: row.item_type as 'RAW_MATERIAL' | 'PACKAGING',
          item_id: row.item_id,
          quantity: parseFloat(row.quantity),
          price_per_unit: parseFloat(row.price_per_unit),
        }))
      })

      router.push(`/dashboard/procurement/direct-purchase/${initialData.id}`)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan Pembelian Langsung.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/procurement/direct-purchase/${initialData.id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Edit Pembelian Langsung
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Ubah data pembelian yang masih dalam status Waiting Delivery.
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
        {/* Section 1: Header */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-50">
            <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>1. Header Pembelian Langsung</span>
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {/* Store Destination */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Toko / Cabang Penerima
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

            {/* Supplier Selector */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Supplier / Pemasok
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

            {/* Purchase Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Tanggal Pembelian
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Items Table */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-50">
              <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Daftar Item Pembelian</span>
            </h2>
            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Table Header */}
            {items.length > 0 && (
              <div className="hidden md:flex items-center gap-3 pr-10 pl-7 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <div className="flex-1 grid gap-4 grid-cols-7">
                  <div className="col-span-2">Nama Item</div>
                  <div>Jumlah (Qty)</div>
                  <div>Total (Kg)</div>
                  <div>Harga Satuan</div>
                  <div className="col-span-2 pl-2">Subtotal</div>
                </div>
              </div>
            )}

            {items.map((row, index) => {
              const qty = parseFloat(row.quantity) || 0
              const price = parseFloat(row.price_per_unit) || 0
              const subtotal = qty * price
              const selectedOption = itemOptions.find(opt => opt.key === row.composite_key)
              const conversion = selectedOption?.conversion_factor || 0
              const totalKg = row.item_type === 'RAW_MATERIAL' ? (qty * conversion) : 0

              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-zinc-400 w-4">
                    {index + 1}.
                  </span>
                  <div className="flex-1 grid gap-4 grid-cols-7">
                    <div className="col-span-2">
                      <ItemCombobox
                        options={itemOptions}
                        value={row.composite_key}
                        onChange={(val) => handleRowChange(index, 'composite_key', val)}
                        onAddNewRawMaterial={async (query) => {
                          const defaultCategory = categories[0]?.id
                          if (!defaultCategory) {
                            alert('Harap buat Kategori master terlebih dahulu sebelum menambah bahan baku otomatis.')
                            return
                          }
                          try {
                            const newRm = await createRawMaterialDP({
                              name: query,
                              category_id: defaultCategory,
                              conversion_factor: 50 // default
                            })
                            setRawMaterialOptions(prev => [...prev, newRm])
                            handleRowChange(index, 'composite_key', `RAW_MATERIAL:${newRm.id}`)
                          } catch (e: any) {
                            alert(e.message || 'Gagal membuat bahan baku baru')
                          }
                        }}
                        onAddNewPackaging={async (query) => {
                          try {
                            const newPkg = await createPackagingMaterialDP({
                              name: query,
                              buy_price_per_pcs: 0
                            })
                            setPackagingMaterialOptions(prev => [...prev, newPkg])
                            handleRowChange(index, 'composite_key', `PACKAGING:${newPkg.id}`)
                          } catch (e: any) {
                            alert(e.message || 'Gagal membuat kemasan baru')
                          }
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="Jumlah"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="text"
                        readOnly
                        value={row.item_type === 'RAW_MATERIAL' ? `${totalKg.toFixed(2)} Kg` : '-'}
                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-100 py-2 px-3 text-sm text-zinc-500 cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-400"
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

                    <div className="flex items-center pl-2 col-span-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
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
                Total Biaya Pembelian
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono block mt-1">
                {formatRupiah(calculateGrandTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Notes & Actions */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Catatan / Keterangan Pembelian (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Contoh: Nota pembelian pasar grosir Karawang, beras kualitas bagus."
              className="mt-2 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href={`/dashboard/procurement/direct-purchase/${initialData.id}`}
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
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
