'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

export default function SalesChart({ data }: { data: any[] }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-200">Penjualan 30 Hari Terakhir</h3>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-1.5 cursor-pointer">
          30 Hari <ChevronDown className="w-3 h-3" />
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}t`} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
            <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
