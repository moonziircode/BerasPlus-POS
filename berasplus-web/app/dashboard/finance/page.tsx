'use client'

import { Construction } from 'lucide-react'

export default function FinancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Finance Module</h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
        Modul Finance sedang dalam tahap pengembangan. Fitur pencatatan arus kas, piutang, dan hutang akan segera hadir.
      </p>
    </div>
  )
}
