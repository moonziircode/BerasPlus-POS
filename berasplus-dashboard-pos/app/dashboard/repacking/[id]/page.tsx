import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  Printer, 
  Store, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Scale,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  User,
  Tags,
  FileText
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RepackingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch complete batch details for repacking
  const { data: batch, error } = await supabase
    .from('production_batches')
    .select(`
      *,
      stores ( name ),
      production_batch_inputs (
        id,
        quantity_kg,
        hpp_per_kg,
        raw_materials ( name, stock_kg )
      ),
      production_batch_outputs (
        id,
        quantity_pcs,
        total_weight_kg,
        hpp_per_unit,
        selling_products ( name, sku )
      ),
      production_batch_packaging (
        id,
        quantity,
        buy_price_per_pcs,
        packaging_materials ( name )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !batch || batch.type !== 'REPACKING') {
    notFound()
  }

  // 2. Fetch the operator / creator full name
  let operatorName = 'System / Unknown'
  if (batch.created_by) {
    const { data: creator } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', batch.created_by)
      .single()
    if (creator) {
      operatorName = creator.full_name || 'User Tanpa Nama'
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
  }

  const isCompleted = batch.status === 'Completed'
  const lossWeight = Number(batch.total_input_weight_kg || 0) - Number(batch.total_output_weight_kg || 0)
  const lossPercentage = batch.total_input_weight_kg 
    ? (lossWeight / Number(batch.total_input_weight_kg)) * 100 
    : 0

  const storeName = batch.stores ? (Array.isArray(batch.stores) ? batch.stores[0]?.name : (batch.stores as any).name) : 'Gudang Utama'

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/repacking"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Riwayat Repacking
        </Link>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <Printer className="h-4 w-4 text-zinc-500" />
          <span>Cetak Laporan</span>
        </button>
      </div>

      {/* Title & Badge */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Detail Repacking #{batch.batch_number}
          </h1>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30">
              <CheckCircle className="h-3.5 w-3.5" />
              Selesai
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30">
              <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
              Butuh Approval
            </span>
          )}
        </div>
      </div>

      {/* Information Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <Store className="h-5 w-5" />
            <h3 className="text-sm font-medium">Lokasi / Cabang</h3>
          </div>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{storeName}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <User className="h-5 w-5" />
            <h3 className="text-sm font-medium">Operator / Kasir</h3>
          </div>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{operatorName}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <Calendar className="h-5 w-5" />
            <h3 className="text-sm font-medium">Waktu Transaksi</h3>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatDate(batch.created_at)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <Tags className="h-5 w-5" />
            <h3 className="text-sm font-medium">Tipe Aktivitas</h3>
          </div>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Repacking / Ecer</p>
        </div>
      </div>

      {/* Production Metrics Card Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Input */}
        <div className="rounded-2xl bg-zinc-50 p-6 border border-zinc-100 dark:bg-zinc-800/30 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/50">
              <ArrowDownRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Total Input (Bahan Curah)</h3>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {Number(batch.total_input_weight_kg || 0).toLocaleString('id-ID')} <span className="text-lg text-zinc-500">Kg</span>
          </p>
        </div>

        {/* Total Output */}
        <div className="rounded-2xl bg-zinc-50 p-6 border border-zinc-100 dark:bg-zinc-800/30 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/50">
              <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Total Output (Produk Eceran)</h3>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {Number(batch.total_output_weight_kg || 0).toLocaleString('id-ID')} <span className="text-lg text-zinc-500">Kg</span>
          </p>
        </div>

        {/* Loss */}
        <div className={`rounded-2xl p-6 border ${
          lossPercentage > 2 
            ? 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30' 
            : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-800/30 dark:border-zinc-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`rounded-lg p-2 ${lossPercentage > 2 ? 'bg-rose-100 dark:bg-rose-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                <Scale className={`h-5 w-5 ${lossPercentage > 2 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Penyusutan (Loss)</h3>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <p className={`text-3xl font-bold tracking-tight ${lossPercentage > 2 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-50'}`}>
              {lossWeight.toLocaleString('id-ID')} <span className="text-lg">Kg</span>
            </p>
            <span className={`mb-1 text-sm font-semibold ${lossPercentage > 2 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500'}`}>
              ({lossPercentage.toFixed(2)}%)
            </span>
          </div>
          {lossPercentage > 2 && (
            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              ⚠️ Melebihi standar toleransi normal (2.00%)
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Materials Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Bahan Baku Utama (Input)</h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-4 py-3">Nama Bahan Baku</th>
                  <th scope="col" className="px-4 py-3 text-right">Berat Awal</th>
                  <th scope="col" className="px-4 py-3 text-right">Berat Digunakan</th>
                  <th scope="col" className="px-4 py-3 text-right">Sisa Stok</th>
                  <th scope="col" className="px-4 py-3 text-right">HPP / Kg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {batch.production_batch_inputs?.map((input: any) => {
                  const used = Number(input.quantity_kg || 0)
                  const remaining = Number(input.raw_materials?.stock_kg || 0)
                  const startWeight = used + remaining
                  return (
                    <tr key={input.id}>
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {input.raw_materials?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{startWeight.toFixed(2)} Kg</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">-{used.toFixed(2)} Kg</td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-500">{remaining.toFixed(2)} Kg</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">{formatCurrency(Number(input.hpp_per_kg || 0))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Output Products Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Hasil Repacking (Output)</h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-4 py-3">Nama Produk Hasil</th>
                  <th scope="col" className="px-4 py-3 text-center">Jumlah Kemasan</th>
                  <th scope="col" className="px-4 py-3 text-right">Berat Total</th>
                  <th scope="col" className="px-4 py-3 text-right">HPP Hasil</th>
                  <th scope="col" className="px-4 py-3 text-right">Nilai Produksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {batch.production_batch_outputs?.map((output: any) => {
                  const qty = Number(output.quantity_pcs || 0)
                  const hpp = Number(output.hpp_per_unit || 0)
                  const totalVal = qty * hpp
                  return (
                    <tr key={output.id}>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{output.selling_products?.name || 'Unknown'}</span>
                          <span className="text-xs font-mono text-zinc-400">{output.selling_products?.sku}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">+{qty} Pack</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(output.total_weight_kg || 0).toFixed(2)} Kg</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(hpp)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(totalVal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Packaging Table */}
      {batch.production_batch_packaging && batch.production_batch_packaging.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Kemasan / Material Digunakan</h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:w-1/2">
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-4 py-3">Material Kemasan</th>
                  <th scope="col" className="px-4 py-3 text-center">Qty Digunakan</th>
                  <th scope="col" className="px-4 py-3 text-right">Harga Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {batch.production_batch_packaging.map((pack: any) => (
                  <tr key={pack.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-zinc-400" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {pack.packaging_materials?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">-{Number(pack.quantity).toLocaleString('id-ID')} Pcs</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-500">
                      {formatCurrency(Number(pack.buy_price_per_pcs || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes / Comments Section */}
      {batch.notes && (
        <div className="rounded-2xl bg-amber-50/50 p-5 border border-amber-100/50 dark:bg-amber-950/10 dark:border-amber-900/20 flex gap-3">
          <FileText className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-500">Catatan Repacking / Keterangan:</h4>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{batch.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
