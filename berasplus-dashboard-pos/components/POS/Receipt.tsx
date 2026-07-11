'use client'

import { useEffect, useRef } from 'react'

export default function Receipt({
  transactionId,
  cart,
  subtotal,
  discount,
  total,
  paymentMethod,
  paymentAmount,
  customerName,
  cashierName,
  onClose
}: any) {
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Optionally trigger print automatically when component mounts
    // window.print()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:bg-white print:p-0 print:block">
      {/* Non-printable controls */}
      <div className="absolute top-4 right-4 flex gap-2 print:hidden">
        <button onClick={handlePrint} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600">
          Cetak Struk
        </button>
        <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700">
          Tutup
        </button>
      </div>

      {/* Printable Area - Thermal 58mm style (~200px width for 58mm, ~300px for 80mm) */}
      <div 
        ref={printRef}
        className="bg-white text-black p-4 w-full max-w-[300px] mx-auto font-mono text-xs shadow-2xl print:shadow-none print:max-w-full"
      >
        <div className="text-center mb-4">
          <h1 className="font-bold text-lg mb-1">LELE RAYA MART</h1>
          <p className="text-[10px] leading-tight">Pasar Induk Beras Cipinang<br/>Jakarta Timur</p>
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2">
          <div className="flex justify-between">
            <span>No:</span>
            <span>{transactionId?.substring(0,8) || 'INV-001'}</span>
          </div>
          <div className="flex justify-between">
            <span>Tgl:</span>
            <span>{new Date().toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Ksr:</span>
            <span>{cashierName || 'Kasir'}</span>
          </div>
          {customerName && (
            <div className="flex justify-between">
              <span>Plg:</span>
              <span>{customerName}</span>
            </div>
          )}
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2">
          {cart.map((item: any, i: number) => (
            <div key={i} className="mb-2">
              <div className="font-medium truncate">{item.product.name}</div>
              <div className="flex justify-between">
                <span>{item.quantity} x {item.price_per_unit.toLocaleString('id-ID')}</span>
                <span>{((item.quantity * item.price_per_unit) - item.discount).toLocaleString('id-ID')}</span>
              </div>
              {item.discount > 0 && (
                <div className="text-[10px] italic">Diskon: -{item.discount.toLocaleString('id-ID')}</div>
              )}
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{subtotal.toLocaleString('id-ID')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span>Diskon:</span>
              <span>-{discount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm mt-1">
            <span>TOTAL:</span>
            <span>{total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="pb-4 mb-4 space-y-1">
          <div className="flex justify-between">
            <span>{paymentMethod}:</span>
            <span>{paymentAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembali:</span>
            <span>{Math.max(0, paymentAmount - total).toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="text-center text-[10px] space-y-1">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
        </div>
      </div>
    </div>
  )
}
