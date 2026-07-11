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
import { convertToKg } from '@/utils/conversion'

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
  base_unit?: string
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
  amount_paid: number
  transport_cost: number
  transport_note: string | null
  transfer_checked: boolean
  items: Array<{
    id: string
    item_type: 'RAW_MATERIAL' | 'PACKAGING'
    raw_material_id: string | null
    packaging_material_id: string | null
    quantity: number
    total_kg: number | null
    price_per_unit: number
  }>
}

interface DPEditFormProps {
  stores: StoreOption[]
  suppliers: SupplierOption[]
  rawMaterials: RawMaterialOption[]
  packagingMaterials: PackagingOption[]
  categories: CategoryOption[]
  conversionFactors: any[]
  initialData: InitialData
}

export default function DPEditForm({
  stores,
  suppliers,
  rawMaterials,
  packagingMaterials,
  categories,
  conversionFactors,
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
  const [amountPaid, setAmountPaid] = useState(initialData.amount_paid.toString())
  const [transportCost, setTransportCost] = useState(initialData.transport_cost.toString())
  const [transportNote, setTransportNote] = useState(initialData.transport_note || '')
  const [transferChecked, setTransferChecked] = useState(initialData.transfer_checked)

  // Dynamic Array for DP Items
  const [items, setItems] = useState<Array<{
    composite_key: string
    item_type: 'RAW_MATERIAL' | 'PACKAGING' | ''
    item_id: string
    quantity: string
    total_kg: string
    price_per_unit: string
  }>>(
    initialData.items.map(item => {
      const itemId = item.item_type === 'RAW_MATERIAL' ? item.raw_material_id : item.packaging_material_id
      return {
        composite_key: `${item.item_type}:${itemId}`,
        item_type: item.item_type,
        item_id: itemId as string,
        quantity: item.quantity.toString(),
        total_kg: item.total_kg ? item.total_kg.toString() : '',
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
      conversion_factor: parseFloat(rm.conversion_factor) || 1,
      base_unit: rm.base_unit || 'Kg'
    })),
    ...packagingMaterialOptions.map(pkg => ({
      key: `PACKAGING:${pkg.id}`,
      name: `${pkg.name} (Kemasan)`,
      code: pkg.packaging_code,
      item_type: 'PACKAGING' as const,
      id: pkg.id,
      conversion_factor: 0,
      base_unit: 'Pcs'
    }))
  ]

  // Handlers for rows
  const addRow = () => {
    setItems([...items, { composite_key: '', item_type: '', item_id: '', quantity: '', total_kg: '', price_per_unit: '' }])
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
      const opt = itemOptions.find(o => o.key === value)
      const conv = opt?.conversion_factor || 50
      const qty = parseFloat(updated[index].quantity) || 0
      updated[index] = {
        ...updated[index],
        composite_key: value,
        item_type: type as any,
        item_id: id,
        total_kg: type === 'RAW_MATERIAL' ? (qty * conv).toString() : ''
      }
    } else if (field === 'quantity') {
      const qty = parseFloat(value) || 0
      const opt = itemOptions.find(o => o.key === updated[index].composite_key)
      const conv = opt?.conversion_factor || 50
      updated[index] = {
        ...updated[index],
        quantity: value,
        total_kg: updated[index].item_type === 'RAW_MATERIAL' ? (qty * conv).toString() : ''
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
        amount_paid: parseFloat(amountPaid) || 0,
        transport_cost: parseFloat(transportCost) || 0,
        transport_note: transportNote || undefined,
        transfer_checked: transferChecked,
        items: items.map(row => ({
          item_type: row.item_type as 'RAW_MATERIAL' | 'PACKAGING',
          item_id: row.item_id,
          quantity: parseFloat(row.quantity),
          total_kg: row.item_type === 'RAW_MATERIAL' ? parseFloat(row.total_kg) : undefined,
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 font-sans">
            Edit Pembelian Langsung
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-sans">
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
          <div className="mt-4 grid gap-6 sm:grid-cols-3 items-end">
            {/* Store Destination */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Toko / Cabang Penerima
              </label>
              <div className="relative">
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
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Supplier / Pemasok
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
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
                <AddSupplierModal
                  onSupplierAdded={(newSupplier) => {
                    setSupplierOptions((prev) => [...prev, newSupplier])
                    setSupplierId(newSupplier.id)
                  }}
                />
              </div>
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Tanggal Pembelian
              </label>
              <div className="relative">
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
                        onAddNew={async (query) => {
                          const normalized = query.toLowerCase()
                          const isPkg = normalized.includes('pack') || 
                                        normalized.includes('kemasan') || 
                                        normalized.includes('plastik') || 
                                        normalized.includes('karung kosong') ||
                                        normalized.includes('sak') ||
                                        normalized.includes('pcs')

                          if (isPkg) {
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
                          } else {
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

                    <div>
                      <input
                        type="number"
                        step="any"
                        disabled={row.item_type !== 'RAW_MATERIAL'}
                        required={row.item_type === 'RAW_MATERIAL'}
                        placeholder="Total Kg"
                        value={row.total_kg}
                        onChange={(e) => handleRowChange(index, 'total_kg', e.target.value)}
                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:disabled:bg-zinc-850 dark:disabled:text-zinc-500"
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

          <div className="mt-4 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
            >
              <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tambah Baris Baru</span>
            </button>
          </div>

          {/* Grand Total Display */}
          <div className="mt-6 flex flex-col md:flex-row md:justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800 gap-4">
            <div className="text-left bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl flex-1 border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Ringkasan Biaya
              </span>
              <div className="mt-2 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal Item:</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{formatRupiah(calculateGrandTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Biaya Transportasi:</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{formatRupiah(parseFloat(transportCost) || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-1.5 font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">Total Keseluruhan:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">{formatRupiah(calculateGrandTotal() + (parseFloat(transportCost) || 0))}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col justify-end">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Total Biaya Pembelian
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono block mt-1">
                {formatRupiah(calculateGrandTotal() + (parseFloat(transportCost) || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Payment & Transport */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>3. Informasi Pembayaran & Biaya Transportasi</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nominal Dibayar (Rupiah)
                </label>
                <input
                  type="number"
                  step="500"
                  required
                  placeholder="Contoh: 1500000"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

              <div>
                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-850 p-3 rounded-lg border border-zinc-150 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status Pembayaran Otomatis</span>
                  {(() => {
                    const total = calculateGrandTotal() + (parseFloat(transportCost) || 0)
                    const paid = parseFloat(amountPaid) || 0
                    if (paid === 0) {
                      return <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold uppercase text-rose-600 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950 dark:text-rose-455">Belum Dibayar</span>
                    } else if (paid < total) {
                      return <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold uppercase text-amber-600 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950 dark:text-amber-455">Dibayar Sebagian</span>
                    } else {
                      return <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase text-emerald-600 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-455">Lunas</span>
                    }
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="transfer_checked"
                  checked={transferChecked}
                  onChange={(e) => setTransferChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-emerald-500"
                />
                <label htmlFor="transfer_checked" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 select-none">
                  Saya sudah melakukan transfer kepada supplier.
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Biaya Transportasi / Ongkir (Opsional)
                </label>
                <input
                  type="number"
                  step="500"
                  placeholder="Contoh: 100000"
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Keterangan Transportasi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ekspedisi JNE / Kurir Supplier"
                  value={transportNote}
                  onChange={(e) => setTransportNote(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Notes & Actions */}
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
