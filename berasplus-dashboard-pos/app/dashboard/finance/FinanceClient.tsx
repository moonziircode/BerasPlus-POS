'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { Plus, Check, AlertCircle, TrendingUp, TrendingDown, DollarSign, Wallet, FileText, Settings, ShieldAlert, CircleDollarSign } from 'lucide-react'
import { createExpense, approveExpense } from './actions'
import { useRouter } from 'next/navigation'

interface FinanceClientProps {
  storeId: string
  metrics: {
    totalIncome: number
    totalDiscounts: number
    totalTax: number
    totalExpenses: number
    totalApprovedExpenses: number
    netProfit: number
    voidCount: number
    pendingExpenseCount: number
  }
  recentExpenses: any[]
  paymentBreakdown: any[]
  chartData: any[]
  isOwner: boolean
}

export default function FinanceClient({
  storeId,
  metrics,
  recentExpenses,
  paymentBreakdown,
  chartData,
  isOwner
}: FinanceClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<'Listrik & Air' | 'Retribusi Keamanan' | 'Pembelian ATK' | 'Lain-lain'>('Lain-lain')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createExpense({
        store_id: storeId,
        amount: Number(amount),
        category,
        description
      })
      setShowAddModal(false)
      setAmount('')
      setDescription('')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setLoading(true)
    try {
      await approveExpense(id)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Keuangan Toko</h1>
          <p className="mt-1 text-sm text-slate-400">Kelola pemasukan, pengeluaran operasional, dan profitabilitas cabang.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl px-4 py-2.5 shadow-lg shadow-emerald-600/10 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" /> Catat Pengeluaran
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pemasukan */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Pemasukan (Gross)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            Rp {metrics.totalIncome.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Pajak terkumpul: Rp {metrics.totalTax.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Pengeluaran */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Pengeluaran Setuju</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            Rp {metrics.totalApprovedExpenses.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Total diajukan: Rp {metrics.totalExpenses.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Profit Bersih */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Profit Bersih</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            Rp {metrics.netProfit.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Pemasukan - Pengeluaran Setuju
          </p>
        </div>

        {/* Void & Pengajuan */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Butuh Approval Owner</span>
            <div className={`p-2 rounded-lg ${metrics.pendingExpenseCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700/20 text-slate-400'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {metrics.pendingExpenseCount} Pengajuan
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Void Transactions: {metrics.voidCount}
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income vs Expenses Chart */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 lg:col-span-2">
          <h3 className="font-semibold text-slate-200 mb-6">Tren Pemasukan vs Pengeluaran (Ribu Rp)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" name="Pemasukan" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" name="Pengeluaran" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
          <h3 className="font-semibold text-slate-200 mb-6">Metode Pembayaran</h3>
          <div className="h-80 flex flex-col justify-between">
            {paymentBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Wallet className="w-12 h-12 mb-2 stroke-1" />
                <span className="text-xs">Tidak ada data transaksi</span>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                {paymentBreakdown.map((item, idx) => {
                  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-amber-500', 'bg-purple-500']
                  const total = paymentBreakdown.reduce((sum, i) => sum + i.value, 0)
                  const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{item.name}</span>
                        <span className="font-mono text-slate-400">Rp {item.value.toLocaleString('id-ID')} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[idx % colors.length]}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Expenses List */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-200">Riwayat Pengeluaran Operasional</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                  <th className="pb-3 pl-2">Tanggal</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Deskripsi</th>
                  <th className="pb-3">Nominal</th>
                  <th className="pb-3">Status Approval</th>
                  {isOwner && <th className="pb-3 text-right pr-2">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs">
                {recentExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Belum ada pengeluaran operasional yang dicatat.
                    </td>
                  </tr>
                ) : (
                  recentExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/20 text-slate-300">
                      <td className="py-4.5 pl-2 text-slate-400">
                        {new Date(exp.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-4.5 max-w-xs truncate">
                        {exp.description || '-'}
                      </td>
                      <td className="py-4.5 font-mono font-semibold text-slate-100">
                        Rp {Number(exp.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="py-4.5">
                        {exp.is_approved_by_owner ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <Check className="w-3.5 h-3.5" /> Disetujui Owner
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Menunggu Approval
                          </span>
                        )}
                      </td>
                      {isOwner && (
                        <td className="py-4.5 text-right pr-2">
                          {!exp.is_approved_by_owner && (
                            <button
                              onClick={() => handleApprove(exp.id)}
                              disabled={loading}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Setujui
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-slate-200 text-sm">Catat Pengeluaran Operasional</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200 text-xs">Tutup</button>
            </div>
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Nominal Pengeluaran (Rp)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold text-xs">Rp</div>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Kategori</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                >
                  <option value="Listrik & Air">Listrik & Air</option>
                  <option value="Retribusi Keamanan">Retribusi Keamanan</option>
                  <option value="Pembelian ATK">Pembelian ATK</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Deskripsi / Keperluan (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Pembayaran listrik bulanan toko..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
