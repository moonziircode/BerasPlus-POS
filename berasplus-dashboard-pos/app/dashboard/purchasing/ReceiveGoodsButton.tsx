'use client'

import { useState } from 'react'
import { receiveGoods } from './actions'
import { Loader2, ArrowDownCircle, ShieldAlert } from 'lucide-react'

interface ReceiveGoodsButtonProps {
  poId: string
  storeId: string
  poNumber: string
}

export default function ReceiveGoodsButton({ poId, storeId, poNumber }: ReceiveGoodsButtonProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleReceive = async () => {
    const confirmReceive = window.confirm(
      `Apakah Anda yakin telah menerima fisik barang untuk PO ${poNumber}? Tindakan ini akan mengupdate stok gudang.`
    )
    if (!confirmReceive) return

    setLoading(true)
    setErrorMsg('')

    try {
      await receiveGoods(poId, storeId)
      // Success will trigger page revalidation
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses penerimaan barang.')
      alert(err.message || 'Gagal memproses penerimaan barang.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-end">
      <button
        onClick={handleReceive}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Menerima...</span>
          </>
        ) : (
          <>
            <ArrowDownCircle className="h-3.5 w-3.5" />
            <span>Terima Barang</span>
          </>
        )}
      </button>
      {errorMsg && (
        <span className="mt-1 text-[10px] font-semibold text-rose-500 max-w-[150px] text-right truncate">
          Gagal: {errorMsg}
        </span>
      )}
    </div>
  )
}
