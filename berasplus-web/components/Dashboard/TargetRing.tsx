'use client'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Tercapai', value: 78 },
  { name: 'Sisa', value: 22 },
];
const COLORS = ['#10b981', '#1e293b'];

export default function TargetRing() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
      <h3 className="font-semibold text-slate-200 mb-6">Target Bulan Mei 2025</h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-4 text-sm w-full max-w-[200px]">
          <div className="flex justify-between text-slate-400">
            <span>Target Bulan</span>
            <span className="text-slate-200 font-medium">Rp 100.000.000</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Realisasi</span>
            <span className="text-slate-200 font-medium">Rp 78.000.000</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Sisa Target</span>
            <span className="text-slate-200 font-medium">Rp 22.000.000</span>
          </div>
        </div>
        
        <div className="h-32 w-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={60}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold text-slate-50">78%</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center text-xs text-slate-400 border-t border-slate-700/50 pt-4">
        <div><span className="font-bold text-emerald-400">78%</span> tercapai</div>
        <div>12 hari lagi</div>
      </div>
    </div>
  )
}
