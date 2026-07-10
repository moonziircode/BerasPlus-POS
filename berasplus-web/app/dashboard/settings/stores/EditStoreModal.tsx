'use client'

import { useState } from 'react'
import { Pencil, X, Loader2, Store, MapPin, Phone, ShieldAlert, Trash2 } from 'lucide-react'
import { updateStore, deleteStore } from './actions'

interface StoreData {
  id: string
  store_code: string
  name: string
  address: string | null
  phone: string | null
  status: string
}

export default function EditStoreModal({ store }: { store: StoreData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [storeCode, setStoreCode] = useState(store.store_code)
  const [name, setName] = useState(store.name)
  const [address, setAddress] = useState(store.address || '')
  const [phone, setPhone] = useState(store.phone || '')
  const [status, setStatus] = useState(store.status)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await updateStore(store.id, {
        store_code: storeCode,
        name,
        address,
        phone: phone || undefined,
        status
      })
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah data toko.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus toko ini? Data yang terhubung mungkin akan mencegah penghapusan.')) {
      return
    }
    setErrorMsg('')
    setDeleteLoading(true)

    try {
      await deleteStore(store.id)
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus cabang toko.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
        title="Edit Toko"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Edit Cabang Toko
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Ubah detail cabang toko Anda
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Status Cabang
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-3 text-sm text-zinc-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                >
                  <option value="Active">Aktif</option>
                  <option value="Tutup Sementara">Tutup Sementara</option>
                  <option value="Inactive">Non-Aktif</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Kode Cabang / Toko
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <span className="text-xs font-mono font-bold text-zinc-400">#</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={storeCode}
                    onChange={(e) => setStoreCode(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-8 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nama Cabang
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Store className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nomor Telepon
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Alamat Lengkap
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute left-3 top-3 text-zinc-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              <div className="flex justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  {deleteLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>Hapus</span>
                </button>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
