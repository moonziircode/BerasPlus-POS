'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { FileSpreadsheet, FileText, Loader2, Calendar, Download } from 'lucide-react'
import { fetchExportData } from './actions'
import { exportToExcel } from '@/utils/exportExcel'
import { exportToPdf } from '@/utils/exportPdf'

export default function ExportDataPage() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleExportExcel = async () => {
    setIsExportingExcel(true)
    setErrorMsg('')
    try {
      const result = await fetchExportData(startDate, endDate)
      if (!result.success) throw new Error(result.error)
      exportToExcel(result.data, startDate, endDate)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengekspor data ke Excel')
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleExportPdf = async () => {
    setIsExportingPdf(true)
    setErrorMsg('')
    try {
      const result = await fetchExportData(startDate, endDate)
      if (!result.success) throw new Error(result.error)
      exportToPdf(result.data, startDate, endDate)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengekspor data ke PDF')
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Ekspor Data Keseluruhan</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Tarik rekapitulasi data penjualan, pembelian, produksi, dan mutasi stok.
          </p>
        </div>
      </div>

      <div className="max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-6 flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          Filter Rentang Tanggal
        </h2>
        
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Tanggal Mulai</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 dark:text-zinc-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Tanggal Akhir</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 dark:text-zinc-200"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel || isExportingPdf}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isExportingExcel ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
            Ekspor Excel
          </button>
          
          <button
            onClick={handleExportPdf}
            disabled={isExportingExcel || isExportingPdf}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isExportingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            Ekspor PDF
          </button>
        </div>
        
        <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400 text-center text-justify px-4">
          Catatan: Menarik data secara keseluruhan dapat memakan waktu beberapa detik tergantung besarnya rentang tanggal. Laporan Excel akan dipisah menjadi multi-sheet, dan laporan PDF akan di-format rapih secara memanjang (landscape).
        </div>
      </div>
    </div>
  )
}
