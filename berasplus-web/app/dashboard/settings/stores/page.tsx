import { createClient } from '@/utils/supabase/server'
import { Store, MapPin, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import AddStoreModal from './AddStoreModal'
import EditStoreModal from './EditStoreModal'
export const dynamic = 'force-dynamic'

export default async function StoresPage() {
  const supabase = await createClient()

  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Cabang Toko
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Kelola data operasional dan alamat untuk semua cabang toko retail BerasPlus Anda.
          </p>
        </div>
        <div>
          <AddStoreModal />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
          Gagal mengambil data toko: {error.message}
        </div>
      )}

      {/* Stores Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {stores && stores.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Kode Cabang</th>
                  <th scope="col" className="px-6 py-4">Nama Toko</th>
                  <th scope="col" className="px-6 py-4">Kontak / Telepon</th>
                  <th scope="col" className="px-6 py-4">Alamat</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {stores.map((store) => (
                  <tr
                    key={store.id}
                    className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {store.store_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          <Store className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {store.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {store.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{store.phone}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {store.address ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{store.address}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {store.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>Aktif</span>
                        </span>
                      ) : store.status === 'Tutup Sementara' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Tutup Sementara</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                          <XCircle className="h-3 w-3" />
                          <span>Non-Aktif</span>
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <EditStoreModal store={store} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Belum ada cabang toko
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Mulai dengan menambahkan cabang toko retail pertama Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
