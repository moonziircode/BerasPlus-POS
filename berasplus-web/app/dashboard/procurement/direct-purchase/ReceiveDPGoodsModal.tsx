'use client'

import { useState } from 'react'
import { receiveDPGoods } from './actions'
import { Loader2, ArrowDownCircle, X, CheckCircle, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DPItem {
  id: string
  quantity: string
  total_kg: string | null
  raw_materials: any
  packaging_materials: any
}

interface ReceiveDPGoodsModalProps {
  dpId: string
  storeId: string
  supplierName: string
  purchaseDate: string
  items: DPItem[]
}

export default function ReceiveDPGoodsModal({
  dpId,
  storeId,
  supplierName,
  purchaseDate,
  items,
}: ReceiveDPGoodsModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // State to track actuals
  const [actuals, setActuals] = useState<Record<string, { actual_quantity: string, actual_total_kg: string }>>(() => {
    const initial: Record<string, { actual_quantity: string, actual_total_kg: string }> = {}
    items.forEach(item => {
      initial[item.id] = {
        actual_quantity: parseFloat(item.quantity).toString(),
        actual_total_kg: item.total_kg ? parseFloat(item.total_kg).toString() : '',
      }
    })
    return initial
  })

  const handleActualChange = (itemId: string, field: 'actual_quantity' | 'actual_total_kg', value: string) => {
    setActuals(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const payload = items.map(item => ({
        item_id: item.id,
        actual_quantity: parseFloat(actuals[item.id].actual_quantity || '0'),
        actual_total_kg: actuals[item.id].actual_total_kg ? parseFloat(actuals[item.id].actual_total_kg) : null
      }))

      await receiveDPGoods(dpId, storeId, payload)
      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses penerimaan barang.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        <ArrowDownCircle className="h-4 w-4" />
        <span>Terima Barang</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm dark:bg-zinc-950/80 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 shrink-0">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                Konfirmasi Penerimaan Barang
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReceive} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Periksa kembali jumlah aktual barang yang diterima dari supplier <strong className="text-zinc-900 dark:text-zinc-50">{supplierName}</strong> (Tgl: {purchaseDate}).
                </p>
                {errorMsg && (
                  <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400">
                    {errorMsg}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs font-semibold uppercase">
                        <th className="py-2 px-3 font-semibold">Nama Item</th>
                        <th className="py-2 px-3 font-semibold text-center">Tipe</th>
                        <th className="py-2 px-3 font-semibold text-right">Qty PO</th>
                        <th className="py-2 px-3 font-semibold text-right">Total Kg PO</th>
                        <th className="py-2 px-3 font-semibold">Aktual Qty Diterima</th>
                        <th className="py-2 px-3 font-semibold">Aktual Total Kg</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {items.map((item) => {
                        const isRaw = item.raw_materials !== null
                        const name = isRaw 
                          ? Array.isArray(item.raw_materials) ? item.raw_materials[0]?.name : (item.raw_materials as any).name
                          : Array.isArray(item.packaging_materials) ? item.packaging_materials[0]?.name : (item.packaging_materials as any).name
                        
                        const unit = isRaw
                          ? Array.isArray(item.raw_materials) ? item.raw_materials[0]?.base_unit : (item.raw_materials as any).base_unit
                          : 'Pcs'

                        return (
                          <tr key={item.id} className="text-zinc-900 dark:text-zinc-100">
                            <td className="py-3 px-3 font-medium">{name}</td>
                            <td className="py-3 px-3 text-center">
                              {isRaw ? (
                                <span className="inline-flex rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-600 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400">Bahan Baku</span>
                              ) : (
                                <span className="inline-flex rounded bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-600 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400">Kemasan</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right text-zinc-500 line-through decoration-zinc-300">
                              {parseFloat(item.quantity)} {unit}
                            </td>
                            <td className="py-3 px-3 text-right text-zinc-500 line-through decoration-zinc-300">
                              {isRaw && item.total_kg ? `${parseFloat(item.total_kg)} Kg` : '-'}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="any"
                                  required
                                  value={actuals[item.id].actual_quantity}
                                  onChange={(e) => handleActualChange(item.id, 'actual_quantity', e.target.value)}
                                  className="block w-24 rounded-md border border-zinc-200 bg-white py-1.5 px-3 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                                />
                                <span className="text-xs text-zinc-500">{unit}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {isRaw ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    step="any"
                                    required
                                    value={actuals[item.id].actual_total_kg}
                                    onChange={(e) => handleActualChange(item.id, 'actual_total_kg', e.target.value)}
                                    className="block w-24 rounded-md border border-zinc-200 bg-white py-1.5 px-3 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                                  />
                                  <span className="text-xs text-zinc-500">Kg</span>
                                </div>
                              ) : (
                                <span className="text-zinc-400">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Konfirmasi & Masukkan Stok</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
