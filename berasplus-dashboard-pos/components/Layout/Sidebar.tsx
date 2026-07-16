'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  Blend, 
  Scale, 
  Coins, 
  BarChart3, 
  Settings, 
  X,
  Leaf,
  Store,
  Tags,
  ChevronDown,
  ChevronRight,
  PackageOpen,
  Box,
  History,
  Truck,
  Users
} from 'lucide-react'

interface SubItem {
  name: string
  path: string
  icon: any
}

interface MenuItem {
  name: string
  icon: any
  path: string
  subItems?: SubItem[]
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { 
    name: 'Procurement', 
    icon: Truck, 
    path: '/dashboard/procurement',
    subItems: [
      { name: 'Pembelian Langsung', path: '/dashboard/procurement/direct-purchase', icon: ShoppingBag }
    ]
  },
  { 
    name: 'Inventory', 
    icon: Package, 
    path: '/dashboard/inventory',
    subItems: [
      { name: 'Master Produk', path: '/dashboard/inventory', icon: PackageOpen },
      { name: 'Sisa Stok', path: '/dashboard/inventory/stock-balance', icon: Scale },
    ]
  },
  { 
    name: 'Blending (Racikan)', 
    icon: Blend, 
    path: '/dashboard/blending'
  },
  { 
    name: 'Sales (Penjualan)', 
    icon: ShoppingBag, 
    path: '/dashboard/sales',
    subItems: [
      { name: 'POS Kasir', path: '/dashboard/sales/pos', icon: ShoppingBag },
      { name: 'Histori Penjualan', path: '/dashboard/sales', icon: History }
    ]
  },
  { name: 'Finance', icon: Coins, path: '/dashboard/finance' },
  { name: 'Reports', icon: BarChart3, path: '/dashboard/reports' },
  { 
    name: 'Settings', 
    icon: Settings, 
    path: '/dashboard/settings',
    subItems: [
      { name: 'Cabang Toko', path: '/dashboard/settings/stores', icon: Store },
      { name: 'Kategori Produk', path: '/dashboard/settings/categories', icon: Tags },
      { name: 'Manajemen Karyawan', path: '/dashboard/settings/users', icon: Users },
      { name: 'Satuan & Konversi', path: '/dashboard/settings/units', icon: Scale },
      { name: 'Pengaturan Global', path: '/dashboard/settings/global', icon: Settings },
    ]
  },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const [procurementOpen, setProcurementOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [salesOpen, setSalesOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Auto-open settings/inventory/sales/procurement sub-menus if currently on their routes
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/inventory')) {
      setInventoryOpen(true)
    }
    if (pathname?.startsWith('/dashboard/sales')) {
      setSalesOpen(true)
    }
    if (pathname?.startsWith('/dashboard/settings')) {
      setSettingsOpen(true)
    }
    if (pathname?.startsWith('/dashboard/procurement')) {
      setProcurementOpen(true)
    }
  }, [pathname])

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white px-4 py-6 transition-transform duration-300 lg:static lg:translate-x-0 dark:border-slate-800 dark:bg-black/50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header/Logo */}
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span>Ramos Beras</span>
          </Link>
          <button 
            className="rounded-lg p-1.5 hover:bg-zinc-100 lg:hidden dark:hover:bg-slate-800"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5 text-zinc-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const hasSubItems = !!item.subItems
            const isParentActive = 
              pathname === item.path || 
              (hasSubItems && pathname?.startsWith(item.path))
            const isMenuOpen = 
              item.name === 'Inventory' ? inventoryOpen : 
              item.name === 'Settings' ? settingsOpen : 
              item.name === 'Sales (Penjualan)' ? salesOpen : 
              item.name === 'Procurement' ? procurementOpen : false
            
            const handleToggle = () => {
              if (item.name === 'Inventory') setInventoryOpen(!inventoryOpen)
              if (item.name === 'Settings') setSettingsOpen(!settingsOpen)
              if (item.name === 'Sales (Penjualan)') setSalesOpen(!salesOpen)
              if (item.name === 'Procurement') setProcurementOpen(!procurementOpen)
            }

            if (hasSubItems) {
              return (
                <div key={item.name} className="space-y-1">
                  {/* Collapsible Trigger */}
                  <button
                    onClick={handleToggle}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                      isParentActive && !isMenuOpen
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {isMenuOpen ? (
                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    )}
                  </button>

                  {/* Sub Items */}
                  {isMenuOpen && (
                    <div className="ml-4 pl-4 border-l border-zinc-100 space-y-1 dark:border-slate-800">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = pathname === subItem.path
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.path}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                              isSubActive
                                ? 'bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isParentActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
