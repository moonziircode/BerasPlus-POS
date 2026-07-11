'use client'

import { useState } from 'react'
import { receiveDPGoods, createDiscrepancyReason } from './actions'
import { Loader2, ArrowDownCircle, X, CheckCircle, Package, Check, HelpCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DPItem {
  id: string
  quantity: string
  total_kg: string | null
  unit_weight_kg?: string | null
  raw_materials: any
  packaging_materials: any
}

interface ReceiveDPGoodsModalProps {
  dpId: string
  storeId: string
  supplierName: string
  purchaseDate: string
  items: DPItem[]
  discrepancyReasons: { id: string; reason_text: string }[]
}

export default function ReceiveDPGoodsModal({
  dpId,
  storeId,
  supplierName,
  purchaseDate,
  items,
  discrepancyReasons: initialReasons,
}: ReceiveDPGoodsModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [reasons, setReasons] = useState(initialReasons)

  // State to track actuals: actualQty, discrepancyReasonId, discrepancyNote, customReason
  const [actuals, setActuals] = useState<Record<string, { 
    actualQty: string
    discrepancyReasonId: string
    discrepancyNote: string
    customReason: string
  }>>(() => {
    const initial: Record<string, { actualQty: string, discrepancyReasonId: string, discrepancyNote: string, customReason: string }> = {}
    items.forEach(item => {
      initial[item.id] = {
        actualQty: parseFloat(item.quantity).toString(),
        discrepancyReasonId: '',
        discrepancyNote: '',
        customReason: '',
      }
    })
    return initial
  })

  const handleActualChange = (itemId: string, field: string, value: string) => {
    setActuals(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const handleAutoFill = (itemId: string, orderedQty: string) => {
    setActuals(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        actualQty: parseFloat(orderedQty).toString(),
        discrepancyReasonId: '',
        discrepancyNote: '',
        customReason: ''
      }
    }))
  }

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const payload = []

      for (const item of items) {
        const state = actuals[item.id]
        const actualQty = parseFloat(state.actualQty || '0')
        const orderedQty = parseFloat(item.quantity || '0')
        
        let finalReasonId = state.discrepancyReasonId || null

        // If discrepancy occurs, validate reason
        if (actualQty !== orderedQty) {
          if (!finalReasonId) {
            throw new Error(`Item ${isRawItem(item) ? 'Bahan Baku' : 'Kemasan'} mengalami selisih kuantitas. Harap pilih alasan selisih.`)
          }
          if (finalReasonId === 'new') {
            if (!state.customReason.trim()) {
              throw new Error(`Harap isi alasan baru untuk item yang berselisih.`)
            }
            // Create the new reason in DB
            const newId = await createDiscrepancyReason(state.customReason.trim())
            // Add to local list to keep UI updated
            setReasons(prev => [...prev, { id: newId, reason_text: state.customReason.trim() }])
            finalReasonId = newId
          }
        } else {
          // If no discrepancy, reason is null
          finalReasonId = null
        }

        payload.push({
          id: item.id,
          actualQty,
          discrepancyReasonId: finalReasonId,
          discrepancyNote: state.discrepancyNote || null,
        })
      }

      await receiveDPGoods(dpId, storeId, payload)
      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses penerimaan barang.')
    } finally {
      setLoading(false)
    }
  }

  const isRawItem = (item: DPItem) => item.raw_materials !== null

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
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 shrink-0">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                Konfirmasi Penerimaan Barang (Direct Purchase)
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
                  <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 font-medium">
                    {errorMsg}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400 border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Nama Item</th>
                        <th className="py-3 px-4 text-center">Tipe</th>
                        <th className="py-3 px-4 text-right">Qty Dipesan</th>
                        <th className="py-3 px-4 text-center">Berat Satuan</th>
                        <th className="py-3 px-4">Aktual Qty Diterima</th>
                        <th className="py-3 px-4">Alasan & Catatan Selisih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {items.map((item) => {
                        const isRaw = isRawItem(item)
                        const name = isRaw 
                          ? Array.isArray(item.raw_materials) ? item.raw_materials[0]?.name : (item.raw_materials as any).name
                          : Array.isArray(item.packaging_materials) ? item.packaging_materials[0]?.name : (item.packaging_materials as any).name
                        
                        const unit = isRaw
                          ? Array.isArray(item.raw_materials) ? item.raw_materials[0]?.base_unit : (item.raw_materials as any).base_unit
                          : 'Pcs'

                        const state = actuals[item.id]
                        const orderedQty = parseFloat(item.quantity)
                        const actualQty = parseFloat(state.actualQty || '0')
                        const hasDiscrepancy = actualQty !== orderedQty
                        const unitWeight = item.unit_weight_kg ? parseFloat(item.unit_weight_kg) : 0

                        return (
                          <tr key={item.id} className="text-zinc-900 dark:text-zinc-100 align-top">
                            <td className="py-4 px-4 font-semibold text-sm max-w-xs">{name}</td>
                            <td className="py-4 px-4 text-center">
                              {isRaw ? (
                                <span className="inline-flex rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400">Bahan Baku</span>
                              ) : (
                                <span className="inline-flex rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400">Kemasan</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-zinc-550 dark:text-zinc-400 font-mono">
                              {orderedQty} {unit}
                            </td>
                            <td className="py-4 px-4 text-center font-medium text-zinc-550 dark:text-zinc-400 font-mono">
                              {isRaw && unitWeight > 0 ? `${unitWeight} Kg` : '-'}
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    step="any"
                                    required
                                    value={state.actualQty}
                                    onChange={(e) => handleActualChange(item.id, 'actualQty', e.target.value)}
                                    className="block w-28 rounded-lg border border-zinc-200 bg-white py-1.5 px-3 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                                  />
                                  <span className="text-xs text-zinc-500 font-semibold">{unit}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAutoFill(item.id, item.quantity)}
                                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-0.5 transition-all"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Sudah Sesuai</span>
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {hasDiscrepancy ? (
                                <div className="space-y-2 max-w-xs">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                                      Pilih Alasan Selisih
                                    </label>
                                    <select
                                      required
                                      value={state.discrepancyReasonId}
                                      onChange={(e) => handleActualChange(item.id, 'discrepancyReasonId', e.target.value)}
                                      className="block w-full rounded-lg border border-zinc-200 bg-white py-1.5 px-3 text-xs text-zinc-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                                    >
                                      <option value="">-- Pilih Alasan --</option>
                                      {reasons.map(r => (
                                        <option key={r.id} value={r.id}>{r.reason_text}</option>
                                      ))}
                                      <option value="new">+ Lainnya (Buat Baru)</option>
                                    </select>
                                  </div>

                                  {state.discrepancyReasonId === 'new' && (
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                                        Alasan Selisih Baru
                                      </label>
                                      <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Basah di jalan"
                                        value={state.customReason}
                                        onChange={(e) => handleActualChange(item.id, 'customReason', e.target.value)}
                                        className="block w-full rounded-lg border border-zinc-200 bg-white py-1.5 px-3 text-xs text-zinc-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                                      />
                                    </div>
                                  )}

                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                                      Keterangan Tambahan (Opsional)
                                    </label>
                                    <textarea
                                      rows={2}
                                      placeholder="Keterangan detail selisih..."
                                      value={state.discrepancyNote}
                                      onChange={(e) => handleActualChange(item.id, 'discrepancyNote', e.target.value)}
                                      className="block w-full rounded-lg border border-zinc-200 bg-white py-1.5 px-3 text-xs text-zinc-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-zinc-400 italic flex items-center gap-1">
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Jumlah sesuai pesanan</span>
                                </span>
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
