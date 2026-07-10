'use client'

import { useState } from 'react'
import { Plus, X, Loader2, UserPlus, Phone, MapPin, CreditCard, ShieldAlert } from 'lucide-react'
import { createSupplier } from '@/app/dashboard/purchasing/actions'

interface Supplier {
  id: string
  name: string
}

interface AddSupplierModalProps {
  onSupplierAdded: (supplier: Supplier) => void
}

export default function AddSupplierModal({ onSupplierAdded }: AddSupplierModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [bankAccount, setBankAccount] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const data = await createSupplier({
        name,
        contact_person: contactPerson || undefined,
        phone: phone || undefined,
        address: address || undefined,
        bank_account_details: bankAccount || undefined,
      })
      
      // Notify parent
      onSupplierAdded(data)

      // Reset & Close
      setName('')
      setContactPerson('')
      setPhone('')
      setAddress('')
      setBankAccount('')
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan supplier baru.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger icon button next to select dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-500/50 bg-emerald-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/5 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Supplier Baru</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Card Body */}
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Tambah Supplier Baru
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Daftarkan kontak supplier baru untuk pengadaan barang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Wrapper */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nama Supplier / Perusahaan
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT. Ramos Indotani Makmur"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Bambang"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
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
                      placeholder="Contoh: 08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Rekening Bank (Info Pembayaran)
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: BCA 123456789 a.n PT. Ramos Indotani"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Alamat Lengkap Kantor/Gudang
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute left-3 top-3 text-zinc-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    placeholder="Contoh: Kawasan Pergudangan Karawang Elok Blok C No. 5"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Supplier</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
