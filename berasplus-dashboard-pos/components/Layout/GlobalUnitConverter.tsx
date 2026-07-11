'use client'

import { useState, useEffect } from 'react'
import { Scale, RefreshCw, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { convertToKg, convertFromKg, ConversionFactor } from '@/utils/conversion'

export default function GlobalUnitConverter() {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('1')
  const [fromUnit, setFromUnit] = useState('Liter')
  const [toUnit, setToUnit] = useState('Kg')
  const [result, setResult] = useState<number | null>(null)
  const [conversions, setConversions] = useState<ConversionFactor[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('conversion_factors')
      .select('id, name, factor_to_kg')
      .then(({ data }) => {
        if (data) {
          setConversions(data)
        }
      })
  }, [])

  useEffect(() => {
    const qty = parseFloat(amount) || 0
    if (qty <= 0) {
      setResult(0)
      return
    }

    // Convert from source unit to Kg, then Kg to target unit
    const kgVal = convertToKg(qty, fromUnit, conversions)
    const finalVal = convertFromKg(kgVal, toUnit, conversions)
    setResult(finalVal)
  }, [amount, fromUnit, toUnit, conversions])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-zinc-300 dark:hover:bg-slate-800"
        title="Kalkulator Konversi Satuan"
      >
        <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">Konversi Satuan</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 text-sm">
              <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin-slow" />
              Kalkulator Konversi
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400">Jumlah</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Dari</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="Liter">Liter</option>
                  <option value="Kg">Kg</option>
                  <option value="Karung">Karung (50 Kg)</option>
                  {conversions.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Ke</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="Kg">Kg</option>
                  <option value="Liter">Liter</option>
                  <option value="Karung">Karung (50 Kg)</option>
                  {conversions.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 text-center">
              <span className="text-xs text-zinc-400 block font-medium">Hasil Konversi</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {result !== null ? result.toLocaleString('id-ID', { maximumFractionDigits: 3 }) : '0'} {toUnit}
              </span>
            </div>

            {/* Quick Guide */}
            <div className="text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 p-2 rounded-lg space-y-1">
              <span className="font-bold block uppercase tracking-wider text-[9px] text-zinc-500">Panduan Konversi Standar:</span>
              <div className="flex justify-between">
                <span>1 Liter</span>
                <span>= 0.8 Kg</span>
              </div>
              <div className="flex justify-between">
                <span>1 Kg</span>
                <span>= 1.25 Liter</span>
              </div>
              <div className="flex justify-between">
                <span>1 Karung</span>
                <span>= 50 Kg</span>
              </div>
              {conversions.length > 0 && (
                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                  <span className="font-bold block text-[9px] text-zinc-500">Kustom (Owner):</span>
                  {conversions.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex justify-between">
                      <span>1 {c.name}</span>
                      <span>= {c.factor_to_kg} Kg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
