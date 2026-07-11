'use client'

import { useState, useMemo } from 'react'
import ProductGrid from './ProductGrid'
import Cart from './Cart'
import PaymentModal from './PaymentModal'
import Receipt from './Receipt'
import { processCheckout } from '@/app/dashboard/sales/actions'

export type Product = {
  id: string
  name: string
  sku: string
  barcode: string | null
  sell_price: number
  wholesale_price: number
  hpp_average: number
  current_stock: number
  image_url: string | null
}

export type Customer = {
  id: string
  name: string
  phone: string | null
  address: string | null
  loyalty_points: number
}

export type CartItem = {
  product: Product
  quantity: number
  price_per_unit: number // Default to sell_price, but can be changed or wholesale
  discount: number
}

export default function POSClient({
  storeId,
  initialProducts,
  initialCustomers
}: {
  storeId: string
  initialProducts: any[]
  initialCustomers: any[]
}) {
  const [products] = useState<Product[]>(initialProducts)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<any>(null)

  // Add to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1, price_per_unit: product.sell_price, discount: 0 }]
    })
  }

  const updateCartItem = (productId: string, updates: Partial<CartItem>) => {
    setCart((prev) => prev.map(item => item.product.id === productId ? { ...item, ...updates } : item))
  }

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter(item => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
  const cartDiscount = cart.reduce((sum, item) => sum + item.discount, 0)
  const cartTotal = cartSubtotal - cartDiscount

  const handleCheckout = async (paymentFormData: any) => {
    setIsProcessing(true)
    setPaymentData(paymentFormData)
    try {
      const payload = {
        store_id: storeId,
        customer_id: selectedCustomer?.id || null,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        tax: 0,
        total: cartTotal,
        notes: paymentFormData.notes || '',
        payment_method: paymentFormData.method,
        payment_amount: paymentFormData.amount,
        items: cart.map(item => ({
          selling_product_id: item.product.id,
          quantity: item.quantity,
          price_per_unit: item.price_per_unit,
          hpp_per_unit: item.product.hpp_average,
          subtotal: item.quantity * item.price_per_unit,
          discount: item.discount,
          total: (item.quantity * item.price_per_unit) - item.discount
        }))
      }

      const res = await processCheckout(payload)
      if (res.error) {
        alert('Gagal memproses transaksi: ' + res.error)
      } else {
        setIsPaymentModalOpen(false)
        setTransactionId(res.transactionId)
        setShowReceipt(true)
      }
    } catch (e) {
      alert('Terjadi kesalahan yang tidak terduga')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    clearCart()
    setTransactionId(null)
  }

  return (
    <div className="flex h-full bg-black text-slate-200">
      <div className="flex-1 flex flex-col h-full border-r border-slate-800">
        <ProductGrid 
          products={products} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddToCart={addToCart}
        />
      </div>
      <div className="w-96 flex flex-col h-full bg-slate-950">
        <Cart 
          cart={cart}
          updateItem={updateCartItem}
          removeItem={removeCartItem}
          clearCart={clearCart}
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          subtotal={cartSubtotal}
          totalDiscount={cartDiscount}
          total={cartTotal}
          onCheckout={() => setIsPaymentModalOpen(true)}
        />
      </div>

      {isPaymentModalOpen && (
        <PaymentModal
          total={cartTotal}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleCheckout}
          isProcessing={isProcessing}
        />
      )}

      {showReceipt && (
        <Receipt 
          transactionId={transactionId}
          cart={cart}
          subtotal={cartSubtotal}
          discount={cartDiscount}
          total={cartTotal}
          paymentMethod={paymentData?.method}
          paymentAmount={paymentData?.amount}
          customerName={selectedCustomer?.name}
          cashierName="Kasir"
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  )
}
