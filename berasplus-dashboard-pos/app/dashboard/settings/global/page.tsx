'use client'

import { useState, useEffect } from 'react'
import { Settings, Percent, Check } from 'lucide-react'
import { getGlobalSetting, updateGlobalSetting } from './actions'

export default function GlobalSettingsPage() {
  const [taxEnabled, setTaxEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  useEffect(() => {
    async function load() {
      try {
        const val = await getGlobalSetting('tax_enabled')
        setTaxEnabled(val === 'true')
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      await updateGlobalSetting('tax_enabled', taxEnabled ? 'true' : 'false')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      alert('Gagal menyimpan pengaturan: ' + e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pengaturan Global
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Kelola fitur aplikasi POS secara global dari Owner Dashboard.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Konfigurasi Aplikasi POS
          </h3>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-emerald-600" />
                Aktifkan Tax / PPN (11%)
              </label>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Jika diaktifkan, PPN 11% akan otomatis ditambahkan ke tagihan kasir dan dicetak pada struk penjualan.
              </p>
            </div>
            <button
              onClick={() => setTaxEnabled(!taxEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                taxEnabled ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  taxEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            {success && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-4 w-4" /> Pengaturan berhasil disimpan
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
