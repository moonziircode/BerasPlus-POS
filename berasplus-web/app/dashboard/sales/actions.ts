'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPOSData(storeId: string) {
  const supabase = await createClient()

  // 1. Get Selling Products (Any product with sell_price > 0 and is_active)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .gt('sell_price', 0)

  if (productsError) {
    console.error('Error fetching products:', productsError)
    return { error: productsError.message, products: [], customers: [] }
  }

  // 2. Get Stock Balances from ledger
  const { data: ledgers, error: ledgersError } = await supabase
    .from('inventory_ledger')
    .select('product_id, quantity')
    .eq('store_id', storeId) 

  if (ledgersError) {
    console.error('Error fetching ledgers:', ledgersError)
  }

  const stockMap: Record<string, number> = {}
  if (ledgers) {
    ledgers.forEach(l => {
      stockMap[l.product_id] = (stockMap[l.product_id] || 0) + Number(l.quantity)
    })
  }

  // 3. Map stocks to products
  const productsWithStock = products?.map((product) => {
    return {
      ...product,
      current_stock: stockMap[product.id] || 0,
    }
  }) || []

  // 4. Get Customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  if (customersError) {
    console.error('Error fetching customers:', customersError)
  }

  return { 
    products: productsWithStock, 
    customers: customers || [] 
  }
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  if (!name) return { error: 'Name is required' }

  const { data, error } = await supabase
    .from('customers')
    .insert([{ name, phone, address }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/sales')
  return { success: true, customer: data }
}

export async function processCheckout(payload: {
  store_id: string,
  customer_id: string | null,
  subtotal: number,
  discount: number,
  tax: number,
  total: number,
  notes: string,
  payment_method: string,
  payment_amount: number,
  items: Array<{
    product_id: string,
    quantity: number,
    price_per_unit: number,
    hpp_per_unit: number,
    subtotal: number,
    discount: number,
    total: number
  }>
}) {
  const supabase = await createClient()

  // Get current user (cashier)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // We process transaction directly since we removed RPC process_pos_transaction in V2
    // Generate transaction number
    const transactionNumber = 'TRX-' + new Date().toISOString().replace(/[-:.TZ]/g, '').slice(2, 14)

    // 1. Insert Sales Transaction
    const { data: transaction, error: trxError } = await supabase
      .from('sales_transactions')
      .insert({
        store_id: payload.store_id,
        cashier_id: user.id,
        transaction_number: transactionNumber,
        total_amount: payload.total,
        payment_method: payload.payment_method,
        amount_paid: payload.payment_amount,
        change_amount: payload.payment_amount - payload.total,
        status: 'Completed'
      })
      .select('id')
      .single()

    if (trxError) {
      console.error('Checkout error:', trxError)
      return { error: trxError.message }
    }

    const transactionId = transaction.id

    // 2. Insert Sales Items and Update Ledger
    for (const item of payload.items) {
      // Insert sales item
      const { error: itemError } = await supabase
        .from('sales_items')
        .insert({
          transaction_id: transactionId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price_per_unit,
          subtotal: item.total, // After discount
          hpp_at_time: item.hpp_per_unit
        })

      if (itemError) {
        throw new Error(`Failed to insert item: ${itemError.message}`)
      }

      // Update ledger
      const { error: ledgerError } = await supabase.rpc('process_inventory_movement', {
        p_store_id: payload.store_id,
        p_product_id: item.product_id,
        p_movement_type: 'SALE',
        p_quantity: -item.quantity, // Negative for sale
        p_reference_id: transactionId,
        p_user_id: user.id
      })

      if (ledgerError) {
        throw new Error(`Failed to update ledger: ${ledgerError.message}`)
      }
    }

    revalidatePath('/dashboard/sales')
    revalidatePath('/dashboard') // Update dashboard stats
    return { success: true, transactionId }
  } catch (err: any) {
    console.error('Checkout unexpected error:', err)
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function getSalesTransactions(filters: {
  search?: string,
  dateStart?: string,
  dateEnd?: string,
  storeId?: string,
  paymentMethod?: string,
  status?: string,
  sortBy?: 'latest' | 'oldest',
  page?: number,
  pageSize?: number
}) {
  const supabase = await createClient()

  // Base query
  let query = supabase
    .from('sales_transactions')
    .select(`
      id,
      created_at,
      transaction_number,
      total_amount,
      payment_method,
      amount_paid,
      change_amount,
      status,
      stores ( name ),
      sales_items (
        id,
        quantity,
        unit_price,
        hpp_at_time,
        subtotal,
        products ( name, unit_of_measure )
      )
    `, { count: 'exact' })

  // Apply filters
  if (filters.storeId) {
    query = query.eq('store_id', filters.storeId)
  }
  if (filters.paymentMethod) {
    query = query.eq('payment_method', filters.paymentMethod)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.dateStart) {
    query = query.gte('created_at', filters.dateStart)
  }
  if (filters.dateEnd) {
    query = query.lte('created_at', filters.dateEnd)
  }
  if (filters.search) {
    query = query.or(`transaction_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
  }

  // Sorting
  const isAscending = filters.sortBy === 'oldest'
  query = query.order('created_at', { ascending: isAscending })

  // Pagination
  const page = filters.page || 1
  const pageSize = filters.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching sales transactions:', error)
    return { data: [], count: 0, error: error.message }
  }

  return { data: data || [], count: count || 0 }
}

export async function getStores() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stores')
    .select('id, name')
    .order('name')
  if (error) return []
  return data || []
}

