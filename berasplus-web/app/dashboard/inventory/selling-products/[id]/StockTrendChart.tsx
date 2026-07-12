'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { TrendingUp, Loader2 } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { id } from 'date-fns/locale'

export default function StockTrendChart({ skuId }: { skuId: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Tentukan rentang 30 hari terakhir
      const endDate = new Date()
      const startDate = subDays(endDate, 29)
      
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
      
      // Ambil ledger untuk produk ini dalam 30 hari terakhir (atau sebelumnya untuk inisial)
      const { data: ledger } = await supabase
        .from('inventory_ledger')
        .select('created_at, change_kg')
        .eq('product_id', skuId)
        .order('created_at', { ascending: true })

      if (!ledger) {
        setLoading(false)
        return
      }

      // Hitung stok harian kumulatif
      let currentStock = 0
      const stockByDate = new Map<string, number>()

      // 1. Hitung base stok sebelum rentang waktu (jika ada)
      ledger.forEach(entry => {
        const entryDate = new Date(entry.created_at)
        if (entryDate < startDate) {
          currentStock += parseFloat(entry.change_kg)
        }
      })

      // 2. Loop melalui ledger yang masuk dalam rentang waktu
      ledger.forEach(entry => {
        const entryDate = new Date(entry.created_at)
        if (entryDate >= startDate && entryDate <= endDate) {
          const dateStr = format(entryDate, 'yyyy-MM-dd')
          currentStock += parseFloat(entry.change_kg)
          stockByDate.set(dateStr, currentStock)
        }
      })

      // 3. Bangun data untuk chart
      let lastKnownStock = 0
      // Set base stock
      ledger.forEach(entry => {
        const entryDate = new Date(entry.created_at)
        if (entryDate < startDate) {
          lastKnownStock += parseFloat(entry.change_kg)
        }
      })

      const chartData = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        if (stockByDate.has(dateStr)) {
          lastKnownStock = stockByDate.get(dateStr)!
        }
        return {
          date: format(date, 'dd MMM', { locale: id }),
          fullDate: dateStr,
          stock: lastKnownStock
        }
      })

      setData(chartData)
      setLoading(false)
    }

    fetchData()
  }, [skuId, supabase])

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Tren Stok (30 Hari Terakhir)</h3>
      </div>

      <div className="flex-grow w-full h-[300px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-zinc-500">
            Tidak ada data stok.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#71717a' }}
                minTickGap={20}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#71717a' }}
                tickFormatter={(value) => `${value} Kg`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#10b981' }}
                formatter={(value: any) => [`${Number(value || 0).toFixed(1)} Kg`, 'Stok']}
                labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="stock" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorStock)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
