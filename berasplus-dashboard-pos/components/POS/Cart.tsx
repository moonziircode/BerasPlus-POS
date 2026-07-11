'use client'

import { Trash2, UserPlus, Minus, Plus } from 'lucide-react'
import { CartItem, Customer } from './POSClient'

export default function Cart({
  cart,
  updateItem,
  removeItem,
  clearCart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  subtotal,
  totalDiscount,
  total,
  onCheckout
}: {
  cart: CartItem[]
  updateItem: (id: string, updates: Partial<CartItem>) => void
  removeItem: (id: string) => void
  clearCart: () => void
  customers: Customer[]
  selectedCustomer: Customer | null
  setSelectedCustomer: (c: Customer | null) => void
  subtotal: number
  totalDiscount: number
  total: number
  onCheckout: () => void
}) {

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Customer Selection */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <select 
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const cust = customers.find(c => c.id === e.target.value) || null
              setSelectedCustomer(cust)
            }}
          >
            <option value="">-- Walk-in Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
            ))}
          </select>
          <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors">
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600">
            <ShoppingCartIcon className="w-16 h-16 opacity-10 mb-4" />
            <p className="text-sm font-medium">Keranjang masih kosong</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 relative group">
              <div className="flex justify-between items-start pr-6">
                <div className="font-medium text-sm text-slate-200 leading-tight">{item.product.name}</div>
              </div>
              <button 
                onClick={() => removeItem(item.product.id)}
                className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 bg-slate-900 rounded-lg border border-slate-800">
                  <button 
                    onClick={() => updateItem(item.product.id, { quantity: Math.max(1, item.quantity - 1) })}
                    className="p-1.5 text-slate-400 hover:text-slate-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input 
                    type="number" 
                    className="w-10 bg-transparent text-center text-sm font-medium text-slate-200 focus:outline-none"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.product.id, { quantity: Number(e.target.value) || 1 })}
                  />
                  <button 
                    onClick={() => updateItem(item.product.id, { quantity: item.quantity + 1 })}
                    className="p-1.5 text-slate-400 hover:text-slate-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">
                    Rp {((item.quantity * item.price_per_unit) - item.discount).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Rp {item.price_per_unit.toLocaleString('id-ID')} / unit
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm text-rose-400">
            <span>Diskon</span>
            <span>- Rp {totalDiscount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-200 pt-2 border-t border-slate-800">
            <span>Total</span>
            <span className="text-emerald-400">Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={clearCart}
            disabled={cart.length === 0}
            className="py-3 px-4 rounded-xl font-medium text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Batalkan
          </button>
          <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Bayar
          </button>
        </div>
      </div>
    </div>
  )
}

function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
