import { createClient } from '@/utils/supabase/server'
import { Scale, RefreshCw, Plus } from 'lucide-react'
import AddUnitModal from './AddUnitModal'
import EditUnitModal from './EditUnitModal'
import AddConversionModal from './AddConversionModal'
import EditConversionModal from './EditConversionModal'

export const dynamic = 'force-dynamic'

export default async function UnitsPage() {
  const supabase = await createClient()

  const { data: units } = await supabase
    .from('unit_types')
    .select('*')
    .order('name')

  const { data: conversions } = await supabase
    .from('conversion_factors')
    .select('*')
    .order('factor_to_kg', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Satuan & Konversi
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Atur tipe satuan dasar dan faktor konversi berat untuk standarisasi POS.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* TABEL UNIT TYPES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Tipe Satuan Dasar
            </h3>
            <AddUnitModal />
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Nama Satuan</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {units?.map((unit) => (
                  <tr key={unit.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {unit.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {unit.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <EditUnitModal unit={unit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABEL CONVERSION FACTORS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              <RefreshCw className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Faktor Konversi (ke Kg)
            </h3>
            <AddConversionModal />
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Nama Konversi</th>
                  <th className="px-6 py-4">Nilai (Kg)</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {conversions?.map((conv) => (
                  <tr key={conv.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {conv.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-400">
                      {conv.factor_to_kg} Kg
                    </td>
                    <td className="px-6 py-4 text-right">
                      <EditConversionModal conversion={conv} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
