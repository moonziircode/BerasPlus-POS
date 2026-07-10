const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components/Dashboard');

if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// 1. TopKPIs.tsx
const topKpisCode = `'use client'
import { ArrowUpRight, TrendingUp, ShoppingBag, Users, Package, AlertTriangle, Blend, Calculator } from 'lucide-react'

export default function TopKPIs() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 8 KPI Cards according to design */}
      <KpiCard title="Penjualan Hari Ini" value="Rp 12.500.000" trend="+15% dari kemarin" icon={<TrendingUp />} bg="bg-slate-800" color="text-emerald-400" />
      <KpiCard title="Profit Hari Ini" value="Rp 3.250.000" trend="Margin 26%" icon={<ArrowUpRight />} bg="bg-slate-800" color="text-emerald-400" />
      <KpiCard title="Order" value="84" trend="+8% dari kemarin" icon={<ShoppingBag />} bg="bg-slate-800" color="text-blue-400" />
      <KpiCard title="Customer" value="61" trend="18 Repeat" icon={<Users />} bg="bg-slate-800" color="text-orange-400" />
      <KpiCard title="Nilai Persediaan" value="Rp 2.850.000.000" trend="" icon={<Package />} bg="bg-slate-800" color="text-purple-400" />
      <KpiCard title="Stok Menipis" value="24 SKU" trend="" icon={<AlertTriangle />} bg="bg-rose-950/40" color="text-rose-400" border="border-rose-900/50" />
      <KpiCard title="Batch Mixing" value="5 Batch" trend="" icon={<Blend />} bg="bg-slate-800" color="text-emerald-400" />
      <KpiCard title="Estimasi HPP" value="Rp 11.820 /kg" trend="" icon={<Calculator />} bg="bg-slate-800" color="text-amber-400" />
    </div>
  )
}

function KpiCard({ title, value, trend, icon, bg, color, border = "border-slate-800" }: any) {
  return (
    <div className={\`p-5 rounded-2xl border \${border} \${bg} flex flex-col gap-2\`}>
      <div className="flex items-center gap-3">
        <div className={\`p-2.5 rounded-xl bg-slate-900/80 \${color}\`}>{icon}</div>
        <div className="text-sm font-medium text-slate-400">{title}</div>
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-50">{value}</div>
      {trend && <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> {trend}</div>}
    </div>
  )
}
`;

// 2. QuickActions.tsx
const quickActionsCode = `'use client'
import { Plus, Diamond, Settings } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { label: 'Penjualan Baru', color: 'text-emerald-400 border-emerald-900 bg-emerald-950/30 hover:bg-emerald-900/50' },
    { label: 'Pembelian', color: 'text-blue-400 border-blue-900 bg-blue-950/30 hover:bg-blue-900/50' },
    { label: 'Mixing (Blending)', color: 'text-purple-400 border-purple-900 bg-purple-950/30 hover:bg-purple-900/50' },
    { label: 'Repacking', color: 'text-amber-400 border-amber-900 bg-amber-950/30 hover:bg-amber-900/50' },
    { label: 'Tambah Supplier', color: 'text-teal-400 border-teal-900 bg-teal-950/30 hover:bg-teal-900/50' },
    { label: 'Tambah Produk', color: 'text-indigo-400 border-indigo-900 bg-indigo-950/30 hover:bg-indigo-900/50' },
  ]

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-slate-400 mb-3">Quick Action</div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, i) => (
          <button key={i} className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border \${action.color}\`}>
            <Plus className="w-4 h-4" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
`;

// 3. SalesChart.tsx
const salesChartCode = `'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
  { date: '23 Apr', sales: 5 },
  { date: '26 Apr', sales: 9 },
  { date: '30 Apr', sales: 7 },
  { date: '3 Mei', sales: 11 },
  { date: '7 Mei', sales: 13 },
  { date: '10 Mei', sales: 10 },
  { date: '14 Mei', sales: 14 },
  { date: '17 Mei', sales: 12 },
  { date: '21 Mei', sales: 15 },
];

export default function SalesChart() {
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
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => \`\${value}t\`} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
            <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
`;

// 4. TargetRing.tsx
const targetRingCode = `'use client'
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
                  <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
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
`;

// 5. InventoryWidget.tsx
const inventoryWidgetCode = `'use client'
export default function InventoryWidget() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 col-span-2">
      <h3 className="font-semibold text-slate-200 mb-6">Inventory Overview</h3>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="text-xs font-medium text-slate-400 mb-4 border-b border-slate-700 pb-2">Raw Material (Bahan Baku)</div>
          <div className="space-y-4">
            <Bar label="Premium" value="1.200 Kg" pct={90} color="bg-emerald-500" />
            <Bar label="Medium" value="420 Kg" pct={40} color="bg-emerald-500" />
            <Bar label="Broken" value="900 Kg" pct={70} color="bg-emerald-500" />
            <Bar label="Pandan Wangi" value="120 Kg" pct={15} color="bg-emerald-500" />
            <Bar label="Ketan Putih" value="180 Kg" pct={25} color="bg-emerald-500" />
          </div>
          <button className="w-full mt-5 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-700">Lihat Semua Bahan Baku</button>
        </div>
        
        <div>
          <div className="text-xs font-medium text-slate-400 mb-4 border-b border-slate-700 pb-2">Finished Goods (Produk Jadi)</div>
          <div className="space-y-4">
            <Bar label="Ciranjang" value="150 Kg" pct={80} color="bg-emerald-500" />
            <Bar label="Rumah Minang" value="320 Kg" pct={95} color="bg-emerald-500" />
            <Bar label="Ramos Bandung" value="210 Kg" pct={60} color="bg-emerald-500" />
            <Bar label="Beras Pulen" value="90 Kg" pct={40} color="bg-emerald-500" />
            <Bar label="BMW" value="80 Kg" pct={35} color="bg-emerald-500" />
          </div>
          <button className="w-full mt-5 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-700">Lihat Semua Produk Jadi</button>
        </div>
      </div>
    </div>
  )
}

function Bar({label, value, pct, color}: any) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-300 mb-1.5">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-600 block"></span> {label}</span>
        <span className="font-mono text-slate-400">{value}</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div className={\`h-1.5 rounded-full \${color}\`} style={{width: \`\${pct}%\`}}></div>
      </div>
    </div>
  )
}
`;

const listsCode = `'use client'
import { AlertTriangle, TrendingUp, TrendingDown, Minus, CheckCircle, Clock, ChevronDown, ChevronRight, PackageOpen } from 'lucide-react'

export function StokMenipisWidget() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-200">Stok Menipis (Perlu Dibeli)</h3>
        <span className="text-xs text-emerald-400 cursor-pointer">Lihat Semua</span>
      </div>
      <div className="space-y-3">
        <AlertItem name="Broken" pack="Sisa 40 Kg" alert="Estimasi habis" days="2 Hari" type="critical" />
        <AlertItem name="Pandan Wangi" pack="Sisa 15 Kg" alert="" days="3 Hari" type="danger" />
        <AlertItem name="Premium" pack="Sisa 60 Kg" alert="" days="4 Hari" type="warning" />
        <AlertItem name="Ketan Putih" pack="Sisa 25 Kg" alert="" days="5 Hari" type="danger" />
      </div>
    </div>
  )
}

function AlertItem({name, pack, alert, days, type}: any) {
  const isDanger = type === 'danger' || type === 'critical';
  return (
    <div className={\`flex items-center justify-between p-3 rounded-xl \${type === 'critical' ? 'bg-rose-950/20 border border-rose-900/30' : 'bg-slate-900/50'}\`}>
      <div className="flex items-center gap-3">
        <div className={\`p-1.5 rounded-lg \${isDanger ? 'bg-rose-950/50 text-rose-500' : 'bg-amber-950/50 text-amber-500'}\`}><PackageOpen className="w-4 h-4" /></div>
        <div>
          <div className="text-sm font-medium text-slate-200">{name}</div>
          <div className="text-xs text-slate-400">{pack}</div>
        </div>
      </div>
      <div className="text-right">
        {alert && <div className="text-[10px] text-rose-400">{alert}</div>}
        <div className={\`text-sm font-bold \${isDanger ? 'text-rose-400' : 'text-amber-400'}\`}>{days}</div>
      </div>
    </div>
  )
}

export function ProdukTerlaris() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-200 text-sm">Produk Terlaris</h3>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded px-2 py-1 cursor-pointer">
          30 Hari Terakhir <ChevronDown className="w-3 h-3" />
        </div>
      </div>
      <div className="space-y-4 mt-6">
        <RankItem rank={1} name="Ramos Bandung" val="620 Kg" pct={90} />
        <RankItem rank={2} name="Rumah Minang" val="520 Kg" pct={75} />
        <RankItem rank={3} name="Premium 13K" val="410 Kg" pct={60} />
        <RankItem rank={4} name="BMW" val="350 Kg" pct={50} />
        <RankItem rank={5} name="Petrok" val="300 Kg" pct={40} />
      </div>
      <button className="w-full mt-5 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-700">Lihat Semua Produk</button>
    </div>
  )
}

function RankItem({rank, name, val, pct}: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-4 text-xs font-mono text-slate-500 text-right">{rank}</div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-slate-300 mb-1.5">
          <span className={rank <= 2 ? 'bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded' : ''}>{name}</span>
          <span className="font-mono text-slate-400">{val}</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
          <div className="h-1 rounded-full bg-blue-500" style={{width: \`\${pct}%\`}}></div>
        </div>
      </div>
    </div>
  )
}

export function SupplierIntelligence() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-200 text-sm">Supplier Intelligence</h3>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded px-2 py-1 cursor-pointer">
          Harga Hari Ini <ChevronDown className="w-3 h-3" />
        </div>
      </div>
      <div className="space-y-4">
        <SuppItem name="IR Ahmad" sub="Medium" price="Rp 725.000" trend="+ 2%" up={false} />
        <SuppItem name="Petrok" sub="BMW" price="Rp 780.000" trend="+ 5%" up={false} />
        <SuppItem name="Jeruk Garut" sub="Pandan Wangi" price="Rp 760.000" trend="+ 1%" up={false} />
        <SuppItem name="Rojolele" sub="Rojolele" price="Rp 810.000" trend="- 0%" up={null} />
      </div>
      <button className="w-full mt-5 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-700">Lihat Semua Supplier</button>
    </div>
  )
}

function SuppItem({name, sub, price, trend, up}: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 uppercase">{name.substring(0,2)}</div>
        <div>
          <div className="text-slate-200 text-xs font-medium">{name}</div>
          <div className="text-slate-500 text-[10px]">{sub}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-slate-300 font-mono text-xs">{price}</div>
        <div className={\`flex items-center gap-1 text-[10px] \${up === null ? 'text-slate-500' : up ? 'text-emerald-400' : 'text-rose-400'}\`}>
          {up === null ? <Minus className="w-3 h-3" /> : up ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          {trend}
        </div>
      </div>
    </div>
  )
}

export function MarginProduk() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-200 text-sm">Margin Produk</h3>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded px-2 py-1 cursor-pointer">
          30 Hari Terakhir <ChevronDown className="w-3 h-3" />
        </div>
      </div>
      <div className="space-y-4 mt-6">
        <RankItem rank="" name="Ciranjang" val="26%" pct={90} />
        <RankItem rank="" name="Rumah Minang" val="22%" pct={75} />
        <RankItem rank="" name="Ramos Bandung" val="21%" pct={70} />
        <RankItem rank="" name="Premium 13K" val="17%" pct={50} />
        <RankItem rank="" name="BMW" val="18%" pct={55} />
      </div>
      <button className="w-full mt-5 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-700">Lihat Analisis Lengkap</button>
    </div>
  )
}

export function MixingHariIni() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-200 text-sm">Mixing Hari Ini</h3>
        <span className="text-[10px] flex items-center text-emerald-400 cursor-pointer">Lihat Semua <ChevronRight className="w-3 h-3" /></span>
      </div>
      <div className="space-y-4">
        <MixItem id="#120" name="Rumah Minang" qty="120 Kg" status="Selesai" time="08:30" icon={<CheckCircle className="w-4 h-4 text-emerald-400" />} bg="bg-emerald-950/30 border-emerald-900/50" />
        <MixItem id="#121" name="Ciranjang" qty="80 Kg" status="Proses" time="09:15" icon={<Clock className="w-4 h-4 text-amber-400" />} bg="bg-amber-950/30 border-amber-900/50" />
        <MixItem id="#122" name="Ramos Bandung" qty="150 Kg" status="Menunggu" time="10:00" icon={<Clock className="w-4 h-4 text-blue-400" />} bg="bg-blue-950/30 border-blue-900/50" />
      </div>
    </div>
  )
}

function MixItem({id, name, qty, status, time, icon, bg}: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={\`p-2 rounded-xl border \${bg}\`}>{icon}</div>
        <div>
          <div className="text-slate-200 text-xs font-medium">Batch {id}</div>
          <div className="text-slate-400 text-[10px]">{name} • {qty}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={\`text-xs \${status === 'Selesai' ? 'text-emerald-400' : status === 'Proses' ? 'text-amber-400' : 'text-blue-400'}\`}>{status}</div>
        <div className="text-slate-500 text-[10px]">{time}</div>
      </div>
    </div>
  )
}
`;

const extraWidgetsCode = `'use client'
import { Sparkles, MapPin, TrendingUp, CheckCircle, Clock, ChevronRight } from 'lucide-react'

export function AiAssistant() {
  return (
    <div className="p-5 rounded-2xl border border-emerald-900/50 bg-slate-900/80 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-900/20 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-slate-200 text-sm">AI Business Assistant</h3>
          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">Beta</span>
        </div>
      </div>
      <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-4 mb-5 relative z-10">
        <li>Hari ini penjualan naik 12% dibanding kemarin.</li>
        <li>Produk Premium 13K hampir habis (sisa 60 Kg).</li>
        <li>Saya menyarankan membeli:
          <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
            <li>Medium 500 Kg</li>
            <li>Broken 300 Kg</li>
            <li>Pandan Wangi 100 Kg</li>
          </ul>
        </li>
        <li>Prediksi stok cukup hingga Minggu.</li>
        <li>Margin minggu ini turun 2%.</li>
        <li>Penyebab utama: harga Premium naik.</li>
      </ul>
      <div className="flex gap-2 relative z-10">
        <button className="flex-1 py-2 text-xs font-semibold text-emerald-950 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors">Generate Purchase Order</button>
        <button className="flex-1 py-2 text-xs font-medium text-slate-300 bg-slate-900 rounded-lg border border-emerald-900/50 hover:bg-slate-800 transition-colors">Analisis Lengkap</button>
      </div>
    </div>
  )
}

export function DeliveryWidget() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-200 text-sm">Pengiriman Hari Ini</h3>
        <span className="text-[10px] text-emerald-400 cursor-pointer flex items-center">Lihat Semua <ChevronRight className="w-3 h-3" /></span>
      </div>
      <div className="flex justify-between text-center mb-5">
        <div>
          <div className="text-xl font-bold text-slate-200">14</div>
          <div className="text-[10px] text-slate-400">Total Pengiriman</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-400">3</div>
          <div className="text-[10px] text-slate-400">Dalam Perjalanan</div>
        </div>
        <div>
          <div className="text-xl font-bold text-emerald-400">11</div>
          <div className="text-[10px] text-slate-400">Selesai</div>
        </div>
      </div>
      <div className="h-40 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* Radar Map Mockup */}
        <div className="absolute w-64 h-64 border border-emerald-900/20 rounded-full"></div>
        <div className="absolute w-48 h-48 border border-emerald-900/30 rounded-full"></div>
        <div className="absolute w-32 h-32 border border-emerald-900/50 rounded-full"></div>
        <div className="absolute w-16 h-16 border border-emerald-500/30 rounded-full bg-emerald-950/20"></div>
        
        {/* Center dot */}
        <div className="absolute w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)]"></div>
        
        <div className="absolute bottom-2 left-3 text-[9px] text-emerald-500/70 font-mono">Radius 5 km</div>
        
        {/* Points - pulse animation for active ones */}
        <div className="absolute top-10 left-12 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse"></div>
        <div className="absolute bottom-10 right-16 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse"></div>
        <div className="absolute top-16 right-12 w-2 h-2 rounded-full bg-emerald-500 opacity-50"></div>
        <div className="absolute bottom-14 left-16 w-2 h-2 rounded-full bg-emerald-500 opacity-50"></div>
      </div>
    </div>
  )
}

export function ForecastWidget() {
  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
        <h3 className="font-semibold text-slate-200 text-sm mb-1">Forecast Penjualan</h3>
        <div className="text-[10px] text-slate-400 mb-4">Berdasarkan data historis & tren</div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Besok</span>
            <span className="font-mono text-slate-200">Rp 13.200.000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Minggu Ini</span>
            <span className="font-mono text-slate-200">Rp 84.000.000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Bulan Ini</span>
            <span className="font-mono text-emerald-400 font-bold">Rp 390.000.000</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-200 text-sm">Financial Snapshot</h3>
          <span className="text-[10px] text-emerald-400 cursor-pointer flex items-center">Lihat Detail <ChevronRight className="w-3 h-3" /></span>
        </div>
        
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500 block shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span> Kas</span>
            <span className="font-mono text-slate-200">Rp 35.000.000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-rose-500 block shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span> Piutang</span>
            <span className="font-mono text-slate-200">Rp 12.000.000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-rose-700 block"></span> Hutang Supplier</span>
            <span className="font-mono text-slate-200">Rp 48.000.000</span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
            <span className="flex items-center gap-2 font-medium text-slate-300"><span className="w-2 h-2 rounded-full bg-blue-500 block shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span> Laba Bersih <span className="font-normal text-[10px] text-slate-500">(Bulan Ini)</span></span>
            <span className="font-mono text-emerald-400 font-bold">Rp 31.000.000</span>
          </div>
        </div>
      </div>
    </div>
  )
}
`;

const transactionsCode = `'use client'
import { CheckCircle, ChevronRight } from 'lucide-react'

export function RecentTransactions() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 col-span-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-200 text-sm">Transaksi Terbaru</h3>
        <span className="text-[10px] text-emerald-400 cursor-pointer flex items-center">Lihat Semua <ChevronRight className="w-3 h-3" /></span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-400">
          <thead className="text-[10px] uppercase border-b border-slate-700">
            <tr>
              <th className="pb-3 font-medium">Waktu</th>
              <th className="pb-3 font-medium">No. Transaksi</th>
              <th className="pb-3 font-medium">Jenis</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Produk</th>
              <th className="pb-3 font-medium">Qty</th>
              <th className="pb-3 font-medium">Total</th>
              <th className="pb-3 font-medium">Metode</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            <TrxRow time="11:30" id="TRX-250523-0082" type="Penjualan" cust="Pak Haji" prod="Ramos Bandung" qty="20 Kg" total="Rp 260.000" meth="QRIS" />
            <TrxRow time="11:15" id="TRX-250523-0081" type="Penjualan" cust="Bu Ani" prod="Premium 13K" qty="10 Kg" total="Rp 135.000" meth="Tunai" />
            <TrxRow time="10:45" id="TRX-250523-0080" type="Mixing" cust="-" prod="Ciranjang" qty="80 Kg" total="-" meth="-" />
            <TrxRow time="10:20" id="TRX-250523-0079" type="Pembelian" cust="IR Ahmad" prod="Medium" qty="500 Kg" total="Rp 3.625.000" meth="Transfer" />
            <TrxRow time="09:50" id="TRX-250523-0078" type="Penjualan" cust="Warung Padang" prod="Rumah Minang" qty="20 Kg" total="Rp 260.000" meth="QRIS" />
          </tbody>
        </table>
      </div>
      <button className="w-full mt-4 py-2.5 text-xs font-medium text-slate-300 bg-slate-900 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">Lihat Semua Transaksi</button>
    </div>
  )
}

function TrxRow({time, id, type, cust, prod, qty, total, meth}: any) {
  return (
    <tr className="hover:bg-slate-800/30 transition-colors">
      <td className="py-3">{time}</td>
      <td className="py-3 text-slate-300">{id}</td>
      <td className="py-3">{type}</td>
      <td className="py-3">{cust}</td>
      <td className="py-3">{prod}</td>
      <td className="py-3">{qty}</td>
      <td className="py-3 font-mono text-slate-300">{total}</td>
      <td className="py-3">{meth}</td>
      <td className="py-3">
        <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /> Selesai</span>
      </td>
    </tr>
  )
}
`;


fs.writeFileSync(path.join(componentsDir, 'TopKPIs.tsx'), topKpisCode);
fs.writeFileSync(path.join(componentsDir, 'QuickActions.tsx'), quickActionsCode);
fs.writeFileSync(path.join(componentsDir, 'SalesChart.tsx'), salesChartCode);
fs.writeFileSync(path.join(componentsDir, 'TargetRing.tsx'), targetRingCode);
fs.writeFileSync(path.join(componentsDir, 'InventoryWidget.tsx'), inventoryWidgetCode);
fs.writeFileSync(path.join(componentsDir, 'Lists.tsx'), listsCode);
fs.writeFileSync(path.join(componentsDir, 'ExtraWidgets.tsx'), extraWidgetsCode);
fs.writeFileSync(path.join(componentsDir, 'Transactions.tsx'), transactionsCode);
console.log("Components created");
