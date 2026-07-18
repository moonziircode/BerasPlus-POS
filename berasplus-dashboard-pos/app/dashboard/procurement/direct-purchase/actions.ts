'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface DPItemInput {
  product_id: string
  is_new: boolean
  new_name?: string
  new_type?: string
  new_category_id?: string
  new_weight?: number
  quantity: number
  price_per_unit: number
}

export async function createDirectPurchase(formData: {
  store_id: string
  supplier_id: string
  purchase_date: string
  notes?: string
  amount_paid: number
  transport_cost: number
  transfer_checked: boolean
  items: DPItemInput[]
}) {
  const supabase = await createClient()

  if (formData.items.length === 0) {
    throw new Error('Pembelian harus memiliki minimal 1 item.')
  }

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User tidak terautentikasi.')
  }

  // Calculate items subtotal
  const itemsSubtotal = formData.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price_per_unit)
  }, 0)

  // Total amount includes transport cost
  const totalAmount = itemsSubtotal + (formData.transport_cost || 0)

  const paymentStatus = formData.amount_paid < totalAmount ? 'PARTIAL' : 'LUNAS'
  const paymentDate = formData.amount_paid > 0 ? new Date().toISOString() : null

  // Process new products
  const processedItems = []
  
  // Fetch existing products to map weight and type
  const { data: existingProducts } = await supabase
    .from('products')
    .select('id, product_type, weight_per_unit_kg')

  const productMap = new Map()
  if (existingProducts) {
    existingProducts.forEach(p => productMap.set(p.id, p))
  }

  for (const item of formData.items) {
    let finalProductId = item.product_id
    let productType = ''
    let weightPerUnit = 0

    if (item.is_new) {
      // Generate unique product code
      const uniqueCode = `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: item.new_name,
          product_code: uniqueCode,
          product_type: item.new_type || 'BERAS',
          category_id: item.new_category_id,
          unit_of_measure: item.new_type === 'BERAS' ? 'Kg' : 'Pcs',
          weight_per_unit_kg: item.new_type === 'BERAS' ? item.new_weight : 0,
          is_active: true
        })
        .select('id, product_type, weight_per_unit_kg')
        .single()

      if (productError || !newProduct) {
        throw new Error(`Gagal membuat produk baru "${item.new_name}": ${productError?.message}`)
      }
      
      finalProductId = newProduct.id
      productType = newProduct.product_type
      weightPerUnit = newProduct.weight_per_unit_kg
    } else {
      const p = productMap.get(finalProductId)
      if (p) {
        productType = p.product_type
        weightPerUnit = p.weight_per_unit_kg
      }
    }

    // Convert to Kg if RICE
    let dbQuantity = item.quantity
    let dbUnitPrice = item.price_per_unit

    if (productType === 'BERAS' && weightPerUnit > 0) {
      dbQuantity = item.quantity * weightPerUnit
      dbUnitPrice = item.price_per_unit / weightPerUnit
    }

    processedItems.push({
      product_id: finalProductId,
      quantity: dbQuantity,
      unit_price: dbUnitPrice,
      total_price: item.quantity * item.price_per_unit // original total price is still correct
    })
  }
  
  // 1. Insert Direct Purchase Header
  const { data: dpData, error: dpError } = await supabase
    .from('direct_purchases')
    .insert([
      {
        store_id: formData.store_id,
        supplier_id: formData.supplier_id || null,
        purchase_date: formData.purchase_date,
        status: 'Waiting Delivery',
        total_amount: totalAmount,
        amount_paid: formData.amount_paid || 0,
        transport_cost: formData.transport_cost || 0,
        payment_status: paymentStatus,
        payment_date: paymentDate,
        notes: formData.notes,
        created_by: user.id,
      },
    ])
    .select('id')
    .single()

  if (dpError) {
    throw new Error(`Gagal mencatat pembelian: ${dpError.message}`)
  }

  const dpId = dpData.id

  try {
    // 2. Insert Direct Purchase Items
    const itemsInsert = processedItems.map((item) => ({
      purchase_id: dpId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    const { error: itemsError } = await supabase
      .from('direct_purchase_items')
      .insert(itemsInsert)

    if (itemsError) {
      throw new Error(`Gagal menyimpan item pembelian: ${itemsError.message}`)
    }
  } catch (err: any) {
    // Rollback header on failure
    await supabase.from('direct_purchases').delete().eq('id', dpId)
    throw err
  }

  revalidatePath('/dashboard/procurement/direct-purchase')
  return dpId
}

export async function receiveDPGoods(
  dpId: string, 
  storeId: string
) {
  const supabase = await createClient()

  // 1. Fetch direct purchase details
  const { data: purchase, error: purchaseError } = await supabase
    .from('direct_purchases')
    .select('*')
    .eq('id', dpId)
    .single()

  if (purchaseError || !purchase) {
    throw new Error('Gagal memproses penerimaan: Data pembelian tidak ditemukan.')
  }

  // Get User
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Fetch all direct purchase items
  const { data: dpItems, error: itemsError } = await supabase
    .from('direct_purchase_items')
    .select('*')
    .eq('purchase_id', dpId)

  if (itemsError || !dpItems || dpItems.length === 0) {
    throw new Error('Gagal memproses penerimaan: Item pembelian tidak ditemukan.')
  }

  // 4. Process each item movement sequentially
  for (const item of dpItems) {
    const productId = item.product_id
    const orderedQty = parseFloat(item.quantity || '0')
    const unitPrice = parseFloat(item.unit_price || '0')

    // Call process_inventory_movement RPC
    // process_inventory_movement(p_store_id, p_product_id, p_movement_type, p_quantity, p_reference_id, p_user_id, p_unit_price)
    const { error: rpcError } = await supabase.rpc('process_inventory_movement', {
      p_store_id: storeId,
      p_product_id: productId,
      p_movement_type: 'PURCHASE',
      p_quantity: orderedQty,
      p_reference_id: dpId,
      p_user_id: user?.id,
      p_unit_price: unitPrice,
    })

    if (rpcError) {
      throw new Error(`Gagal mencatat mutasi stok item ${productId}: ${rpcError.message}`)
    }
  }

  // 5. Update status to Received / COMPLETED
  const { error: statusError } = await supabase
    .from('direct_purchases')
    .update({ status: 'COMPLETED' })
    .eq('id', dpId)

  if (statusError) {
    throw new Error(`Mutasi stok berhasil dicatat, namun gagal memperbarui status pembelian: ${statusError.message}`)
  }

  revalidatePath('/dashboard/procurement/direct-purchase')
  revalidatePath(`/dashboard/procurement/direct-purchase/${dpId}`)
  revalidatePath('/dashboard/inventory')
}

export async function updateDirectPurchase(dpId: string, formData: {
  store_id: string
  supplier_id: string
  purchase_date: string
  notes?: string
  amount_paid: number
  transport_cost: number
  transfer_checked: boolean
  items: DPItemInput[]
}) {
  throw new Error('Update feature is disabled temporarily due to migration changes. Please create a new purchase instead.')
}

export async function createCategoryDP(formData: { name: string; description?: string }) {
  const supabase = await createClient()

  const normalizedName = formData.name.trim().toUpperCase()

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: normalizedName,
      description: formData.description,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Kategori "${normalizedName}" sudah ada di database.`)
    }
    throw new Error(`Gagal menambahkan kategori: ${error.message}`)
  }

  revalidatePath('/dashboard/procurement/direct-purchase')
  return data
}
