'use client'

import { useState } from 'react'
import Sidebar from '@/components/Layout/Sidebar'
import Topbar from '@/components/Layout/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar (Left panel) */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main panel (Right panel) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
