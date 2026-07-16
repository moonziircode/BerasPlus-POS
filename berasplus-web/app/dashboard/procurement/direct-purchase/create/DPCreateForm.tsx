'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createDirectPurchase } from '../actions'

interface Product {
  id: string
  name: string
  product_code: string
  unit_of_measure: string
  product_type: string
}

interface Supplier {
  id: string
  name: string
}

interface Store {
  id: string
  name: string
}

export default function DPCreateForm({
  stores,
  suppliers,
  products
}: {
  stores: Store[]
  suppliers: Supplier[]
  products: Product[]
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [storeId, setStoreId] = useState(stores[0]?.id || '')
  const [supplierId, setSupplierId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10))

  const [items, setItems] = useState([{ id: Date.now(), product_id: '', quantity: '', price_per_unit: '' }])

  const addItem = () => setItems([...items, { id: Date.now(), product_id: '', quantity: '', price_per_unit: '' }])
  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id))
  }
  const updateItem = (id: number, field: string, value: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const itemsSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity || '0') * parseFloat(item.price_per_unit || '0')), 0)
  const totalAmount = itemsSubtotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const payload = {
      store_id: storeId,
      supplier_id: supplierId,
      purchase_date: purchaseDate,
      amount_paid: 0,
      transport_cost: 0,
      transfer_checked: false,
      items: items
        .filter((i) => i.product_id && i.quantity && i.price_per_unit)
        .map((i) => ({
          product_id: i.product_id,
          quantity: parseFloat(i.quantity),
          price_per_unit: parseFloat(i.price_per_unit)
        }))
    }

    try {
      if (payload.items.length === 0) throw new Error('Minimal 1 item dengan data valid diperlukan')
      await createDirectPurchase(payload)
      router.push('/dashboard/procurement/direct-purchase')
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6 pb-20">
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

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Toko / Gudang</label>
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} required className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800">
              <option value="">Pilih Toko</option>
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Supplier</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800">
              <option value="">Pilih Supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tanggal Pembelian</label>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800" />
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
              <div key={item.id} className="flex items-start gap-4 p-4 border border-zinc-200 rounded-xl dark:border-zinc-800">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-zinc-500">Pilih Produk (Beras / Kemasan)</label>
                  <select value={item.product_id} onChange={(e) => updateItem(item.id, 'product_id', e.target.value)} required className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm">
                    <option value="">-- Pilih --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.unit_of_measure})</option>
                    ))}
                  </select>
                </div>
                <div className="w-24 space-y-2">
                  <label className="text-xs font-medium text-zinc-500">Jumlah</label>
                  <input type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} required className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
                </div>
                <div className="w-40 space-y-2">
                  <label className="text-xs font-medium text-zinc-500">Harga Satuan (Rp)</label>
                  <input type="number" value={item.price_per_unit} onChange={(e) => updateItem(item.id, 'price_per_unit', e.target.value)} required className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
                </div>
                <div className="w-40 space-y-2">
                  <label className="text-xs font-medium text-zinc-500">Subtotal</label>
                  <div className="pt-2 font-medium">Rp {((parseFloat(item.quantity) || 0) * (parseFloat(item.price_per_unit) || 0)).toLocaleString('id-ID')}</div>
                </div>
                <div className="pt-7">
                  <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-50">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex justify-end">
          <div className="bg-zinc-50 rounded-xl p-6 dark:bg-zinc-800/50 flex flex-col justify-center space-y-4 w-80">
            <div className="flex justify-between text-xl font-bold text-zinc-900 dark:text-white">
              <span>Total Tagihan</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/procurement/direct-purchase" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-100">Batal</Link>
          <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50">
            {isSubmitting ? 'Menyimpan...' : 'Simpan Pembelian'}
          </button>
        </div>
      </form>
    </div>
  )
}
