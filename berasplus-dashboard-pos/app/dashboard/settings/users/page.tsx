import { createClient } from '@/utils/supabase/server'
import { Users, UserPlus, Mail, Shield, Building, Clock } from 'lucide-react'
import AddUserModal from './AddUserModal'
import EditUserModal from './EditUserModal'
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()

  // Ambil data users beserta nama tokonya (jika ada)
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      *,
      stores (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error.message)
  }

  // Ambil daftar toko untuk dropdown modal
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .eq('status', 'Active')
    .order('name')

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Karyawan & Peran
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Kelola akses login, peran (role), dan penugasan cabang untuk setiap karyawan.
          </p>
        </div>
        <AddUserModal stores={stores || []} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-6 py-4">Nama & Email</th>
                <th scope="col" className="px-6 py-4">Peran (Role)</th>
                <th scope="col" className="px-6 py-4">Penugasan Toko</th>
                <th scope="col" className="px-6 py-4">Terdaftar</th>
                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users?.map((user) => (
                <tr
                  key={user.id}
                  className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {user.full_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <Mail className="h-3 w-3" />
                          {user.email || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                      user.role === 'Owner' || user.role === 'Admin' 
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400' 
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.store_id ? (
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Building className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-medium">{user.stores?.name}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600 italic">Semua Cabang / Pusat</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-400">{formatDate(user.created_at)}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <EditUserModal user={user} stores={stores || []} />
                  </td>
                </tr>
              ))}

              {!users?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                    Tidak ada data karyawan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
