'use client'

import { useState } from 'react'
import { X, CreditCard, Banknote, QrCode } from 'lucide-react'

export default function PaymentModal({
  total,
  onClose,
  onConfirm,
  isProcessing
}: {
  total: number
  onClose: () => void
  onConfirm: (data: any) => void
  isProcessing: boolean
}) {
  const [method, setMethod] = useState<'Cash' | 'Transfer' | 'QRIS' | 'Debit' | 'Kredit'>('Cash')
  const [amountReceived, setAmountReceived] = useState<number>(total)
  const [notes, setNotes] = useState('')

  const change = Math.max(0, amountReceived - total)
  const isValid = amountReceived >= total

  // Quick cash amounts
  const quickAmounts = [total, 50000, 100000, 200000, 500000].filter(a => a >= total)
  
  // To avoid duplicates if total is exactly one of the quick amounts
  const uniqueQuickAmounts = Array.from(new Set(quickAmounts)).sort((a,b) => a-b)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <h2 className="text-lg font-bold text-slate-200">Pembayaran</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-[400px]">
          {/* Left side - Methods */}
          <div className="w-1/3 border-r border-slate-800 p-4 bg-slate-950/50 flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Metode</div>
            
            <MethodButton 
              active={method === 'Cash'} 
              onClick={() => { setMethod('Cash'); setAmountReceived(total) }}
              icon={<Banknote className="w-5 h-5" />}
              label="Tunai / Cash"
            />
            <MethodButton 
              active={method === 'QRIS'} 
              onClick={() => { setMethod('QRIS'); setAmountReceived(total) }}
              icon={<QrCode className="w-5 h-5" />}
              label="QRIS"
            />
            <MethodButton 
              active={method === 'Transfer'} 
              onClick={() => { setMethod('Transfer'); setAmountReceived(total) }}
              icon={<CreditCard className="w-5 h-5" />}
              label="Transfer Bank"
            />
            
            <div className="mt-auto">
              <label className="text-xs text-slate-500 block mb-1">Catatan Transaksi</label>
              <textarea 
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 h-24 resize-none"
                placeholder="Catatan..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Right side - Amounts */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="text-center mb-8">
              <div className="text-sm text-slate-400 mb-1">Total Tagihan</div>
              <div className="text-4xl font-black text-emerald-400">Rp {total.toLocaleString('id-ID')}</div>
            </div>

            {method === 'Cash' ? (
              <>
                <div className="mb-4">
                  <label className="text-sm text-slate-400 block mb-2">Uang Diterima</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    <input 
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-2xl font-bold text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {uniqueQuickAmounts.map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setAmountReceived(amt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        amountReceived === amt 
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>

                <div className="mt-auto p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Kembalian</span>
                  <span className={`text-2xl font-bold ${change > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                    Rp {change.toLocaleString('id-ID')}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    {method === 'QRIS' ? <QrCode className="w-8 h-8" /> : <CreditCard className="w-8 h-8" />}
                  </div>
                  <h3 className="text-lg font-medium text-slate-200 mb-2">Menunggu Pembayaran {method}</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">
                    Pastikan pelanggan telah berhasil melakukan pembayaran sebesar <strong className="text-slate-300">Rp {total.toLocaleString('id-ID')}</strong> sebelum melanjutkan.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => onConfirm({ method, amount: amountReceived, notes })}
            disabled={!isValid || isProcessing}
            className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isProcessing ? 'Memproses...' : 'Selesaikan Pembayaran'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MethodButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        active 
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
          : 'bg-transparent text-slate-400 border border-transparent hover:bg-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
