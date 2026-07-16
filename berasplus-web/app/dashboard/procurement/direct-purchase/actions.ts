'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface DPItemInput {
  product_id: string
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
  transport_note?: string
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

  // Determine payment status
  // Note: V2 schema might not have all these columns on direct_purchases depending on what we migrated
  // But let's assume we use the ones that exist. Looking at V2 schema:
  // store_id, supplier_id, total_amount, status, purchase_date, created_by, created_at
  // If we dropped payment_status, amount_paid, transport_cost, transfer_checked, we need to adapt.
  // Wait, I should just use what is in V2 schema.
  
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
    const itemsInsert = formData.items.map((item) => {
      return {
        purchase_id: dpId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price_per_unit,
        total_price: item.quantity * item.price_per_unit,
      }
    })

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
    const itemSubtotal = parseFloat(item.total_price || '0')
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
  transport_note?: string
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

  const itemsSubtotal = formData.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price_per_unit)
  }, 0)

  const totalAmount = itemsSubtotal + (formData.transport_cost || 0)

  // 1. Update Direct Purchase Header
  const { error: dpError } = await supabase
    .from('direct_purchases')
    .update({
      store_id: formData.store_id,
      supplier_id: formData.supplier_id || null,
      purchase_date: formData.purchase_date,
      total_amount: totalAmount,
    })
    .eq('id', dpId)

  if (dpError) {
    throw new Error(`Gagal memperbarui pembelian: ${dpError.message}`)
  }

  // 2. Delete existing items
  const { error: deleteError } = await supabase
    .from('direct_purchase_items')
    .delete()
    .eq('purchase_id', dpId)

  if (deleteError) {
    throw new Error(`Gagal menghapus item lama: ${deleteError.message}`)
  }

  // 3. Insert new items
  const itemsInsert = formData.items.map((item) => {
    return {
      purchase_id: dpId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price_per_unit,
      total_price: item.quantity * item.price_per_unit,
    }
  })

  const { error: itemsError } = await supabase
    .from('direct_purchase_items')
    .insert(itemsInsert)

  if (itemsError) {
    throw new Error(`Gagal menyimpan item baru: ${itemsError.message}`)
  }

  revalidatePath('/dashboard/procurement/direct-purchase')
  revalidatePath(`/dashboard/procurement/direct-purchase/${dpId}`)
}

export async function createCategoryDP(formData: { name: string; description?: string }) {
  const supabase = await createClient()

  // Ensure category is uppercase and trimmed for consistency
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
