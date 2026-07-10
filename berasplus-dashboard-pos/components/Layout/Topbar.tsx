'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Menu, Bell, Search, LogOut, Loader2 } from 'lucide-react'

interface TopbarProps {
  onMenuToggle: () => void
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-4">
        {/* Burger menu for mobile */}
        <button 
          className="rounded-lg p-1.5 hover:bg-zinc-100 lg:hidden dark:hover:bg-slate-800"
          onClick={onMenuToggle}
        >
          <Menu className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
        </button>

        {/* Search Bar */}
        <div className="relative hidden w-64 md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <Search className="h-4 w-4" />
          </span>
          <input 
            type="text" 
            placeholder="Cari..." 
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-3 text-sm placeholder-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button className="relative rounded-lg p-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        {/* User Info / Role Indicator */}
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Owner</span>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </>
          )}
        </button>
      </div>
    </header>
  )
}
