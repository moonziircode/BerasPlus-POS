'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { createDirectPurchase } from '../actions'

interface Product {
  id: string
  name: string
  product_code: string
  unit_of_measure: string
  product_type: string
  weight_per_unit_kg: number
}

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

interface Store {
  id: string
  name: string
}

function ProductCombobox({
  products,
  value,
  onChange,
  onAddNew
}: {
  products: Product[]
  value: string // product id
  onChange: (id: string) => void
  onAddNew: (name: string) => void
}) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const selected = products.find(p => p.id === value)
    if (selected) {
      setQuery(selected.name)
    }
  }, [value, products])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        const selected = products.find(p => p.id === value)
        if (selected) {
          setQuery(selected.name)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value, products])

  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
  const exactMatch = products.some(p => p.name.toLowerCase() === query.toLowerCase())

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            if (value) onChange('')
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-lg border-zinc-300 pr-8 dark:border-zinc-700 dark:bg-zinc-800 text-sm"
          placeholder="Cari produk..."
          required={!value}
        />
        {query && !value && (
          <button type="button" onClick={() => { setQuery(''); onChange(''); setIsOpen(true); }} className="absolute right-2 top-1.5 p-1 text-zinc-400 hover:text-zinc-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && query && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <div
                key={p.id}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
                onClick={() => {
                  onChange(p.id)
                  setQuery(p.name)
                  setIsOpen(false)
                }}
              >
                {p.name} <span className="text-zinc-500 text-xs">({p.product_type === 'RICE' ? 'Beras' : 'Kemasan'})</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-zinc-500">Produk tidak ditemukan</div>
          )}
          
          {!exactMatch && query.trim() !== '' && (
            <div
              className="cursor-pointer border-t border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => {
                onAddNew(query.trim())
                setIsOpen(false)
              }}
            >
              + Tambah "{query.trim()}" sebagai produk baru
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DPCreateForm({
  stores,
  suppliers,
  products,
  categories
}: {
  stores: Store[]
  suppliers: Supplier[]
  products: Product[]
  categories?: Category[]
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [storeId, setStoreId] = useState(stores[0]?.id || '')
  const [supplierId, setSupplierId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')

  const [amountPaid, setAmountPaid] = useState<string>('')
  const [transportCost, setTransportCost] = useState<string>('')

  const [items, setItems] = useState([{ 
    id: Date.now(), 
    product_id: '', 
    isNew: false,
    newName: '',
    newType: 'BERAS',
    newCategoryId: '',
    newWeight: '',
    quantity: '', 
    price_per_unit: '' 
  }])

  const addItem = () => setItems([...items, { id: Date.now(), product_id: '', isNew: false, newName: '', newType: 'BERAS', newCategoryId: '', newWeight: '', quantity: '', price_per_unit: '' }])
  
  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id))
  }
  
  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const itemsSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity || '0') * parseFloat(item.price_per_unit || '0')), 0)
  const totalAmount = itemsSubtotal + parseFloat(transportCost || '0')
  const isPartial = parseFloat(amountPaid || '0') < totalAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    for (const item of items) {
      if (item.isNew) {
        if (!item.newCategoryId) {
          setError('Pilih kategori untuk produk baru.')
          setIsSubmitting(false)
          return
        }
        if (item.newType === 'BERAS' && (!item.newWeight || parseFloat(item.newWeight) <= 0)) {
          setError('Masukkan berat per kemasan yang valid untuk beras baru.')
          setIsSubmitting(false)
          return
        }
      }
    }

    const payload = {
      store_id: storeId,
      supplier_id: supplierId,
      purchase_date: purchaseDate,
      notes: notes,
      amount_paid: parseFloat(amountPaid || '0'),
      transport_cost: parseFloat(transportCost || '0'),
      transfer_checked: false,
      items: items
        .filter((i) => (i.product_id || i.isNew) && i.quantity && i.price_per_unit)
        .map((i) => ({
          product_id: i.product_id,
          is_new: i.isNew,
          new_name: i.newName,
          new_type: i.newType,
          new_category_id: i.newCategoryId,
          new_weight: parseFloat(i.newWeight || '0'),
          quantity: parseFloat(i.quantity),
          price_per_unit: parseFloat(i.price_per_unit)
        }))
    }

    try {
      if (payload.items.length === 0) throw new Error('Minimal 1 item dengan data valid diperlukan')
      await createDirectPurchase(payload as any)
      router.push('/dashboard/procurement/direct-purchase')
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/procurement/direct-purchase"
          className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Buat Pembelian Baru</h1>
          <p className="text-sm text-zinc-500">Mencatat pembelian barang ke Supplier</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-200">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Toko / Gudang Tujuan</label>
              <select value={storeId} onChange={(e) => setStoreId(e.target.value)} required className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm">
                <option value="">Pilih Toko / Gudang</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Supplier</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm">
                <option value="">Pilih Supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tanggal Pembelian</label>
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Catatan Tambahan</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                rows={2}
                placeholder="Misal: Pembelian urgent, atau nomor faktur vendor..."
                className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 resize-none text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Daftar Item</h2>
            <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100">
              <Plus className="h-4 w-4" /> Tambah Item
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="flex flex-col gap-4 p-4 border border-zinc-200 rounded-xl dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium text-zinc-500">Pilih Produk</label>
                    <ProductCombobox 
                      products={products} 
                      value={item.product_id}
                      onChange={(id) => {
                        updateItem(item.id, 'product_id', id)
                        updateItem(item.id, 'isNew', false)
                      }}
                      onAddNew={(name) => {
                        updateItem(item.id, 'isNew', true)
                        updateItem(item.id, 'newName', name)
                        updateItem(item.id, 'product_id', '')
                      }}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <label className="text-xs font-medium text-zinc-500">Jumlah (Pcs)</label>
                    <input type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} required className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
                  </div>
                  <div className="w-36 space-y-2">
                    <label className="text-xs font-medium text-zinc-500">Harga per Pcs (Rp)</label>
                    <input type="number" value={item.price_per_unit} onChange={(e) => updateItem(item.id, 'price_per_unit', e.target.value)} required className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
                  </div>
                  <div className="w-36 space-y-2">
                    <label className="text-xs font-medium text-zinc-500">Subtotal</label>
                    <div className="pt-2 font-medium text-sm">Rp {((parseFloat(item.quantity) || 0) * (parseFloat(item.price_per_unit) || 0)).toLocaleString('id-ID')}</div>
                  </div>
                  <div className="pt-7">
                    <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-50">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {item.isNew && (
                  <div className="flex gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg mt-2">
                    <div className="space-y-2 flex-1">
                      <label className="text-xs font-medium text-blue-700 dark:text-blue-400">Kategori</label>
                      <select value={item.newCategoryId} onChange={(e) => updateItem(item.id, 'newCategoryId', e.target.value)} required className="w-full rounded-lg border-blue-200 dark:border-zinc-700 dark:bg-zinc-800 text-sm">
                        <option value="">-- Pilih Kategori --</option>
                        {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 w-32">
                      <label className="text-xs font-medium text-blue-700 dark:text-blue-400">Tipe Produk</label>
                      <select value={item.newType} onChange={(e) => updateItem(item.id, 'newType', e.target.value)} className="w-full rounded-lg border-blue-200 dark:border-zinc-700 dark:bg-zinc-800 text-sm">
                        <option value="BERAS">Beras</option>
                        <option value="KEMASAN">Kemasan</option>
                      </select>
                    </div>
                    {item.newType === 'BERAS' && (
                      <div className="space-y-2 w-32">
                        <label className="text-xs font-medium text-blue-700 dark:text-blue-400">Berat (Kg)</label>
                        <input type="number" step="0.01" placeholder="Misal: 50" value={item.newWeight} onChange={(e) => updateItem(item.id, 'newWeight', e.target.value)} required className="w-full rounded-lg border-blue-200 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 border-b pb-2">Informasi Pembayaran</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">Biaya Transportasi (Rp)</label>
                <input type="number" value={transportCost} onChange={(e) => setTransportCost(e.target.value)} placeholder="0" className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500">Nominal Bayar (Rp)</label>
                <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0" required className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
              </div>
            </div>
            
            {isPartial && parseFloat(amountPaid) > 0 && (
              <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 text-sm text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400">
                ⚠️ Nominal bayar kurang dari Total Tagihan. Pembelian ini akan dicatat sebagai <strong>Belum Lunas (Parsial)</strong>.
              </div>
            )}
            {!amountPaid && (
              <div className="rounded-lg bg-rose-50 p-3 border border-rose-200 text-sm text-rose-700 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400">
                Silakan isi nominal yang Anda bayarkan saat ini (isi 0 jika belum dibayar sama sekali).
              </div>
            )}
          </div>

          <div className="bg-zinc-50 rounded-xl p-6 dark:bg-zinc-800/50 flex flex-col justify-center space-y-4">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Subtotal Item</span>
              <span>Rp {itemsSubtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500 border-b border-zinc-200 dark:border-zinc-700 pb-4">
              <span>Biaya Transportasi</span>
              <span>Rp {parseFloat(transportCost || '0').toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-zinc-900 dark:text-white pt-2">
              <span>Total Tagihan</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/procurement/direct-purchase" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-100">Batal</Link>
          <button type="submit" disabled={isSubmitting || amountPaid === ''} className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50">
            {isSubmitting ? 'Menyimpan...' : 'Simpan Pembelian'}
          </button>
        </div>
      </form>
    </div>
  )
}
