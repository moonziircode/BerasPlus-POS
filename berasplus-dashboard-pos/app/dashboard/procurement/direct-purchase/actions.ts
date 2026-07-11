'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface DPItemInput {
  item_type: 'RAW_MATERIAL' | 'PACKAGING'
  item_id: string
  quantity: number
  price_per_unit: number
  total_kg?: number
  unit_weight_kg?: number
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
  let paymentStatus = 'Belum Dibayar'
  if (formData.amount_paid > 0) {
    if (formData.amount_paid >= totalAmount) {
      paymentStatus = 'Lunas'
    } else {
      paymentStatus = 'Dibayar Sebagian'
    }
  }

  // 1. Insert Direct Purchase Header (Default status: Waiting Delivery)
  const { data: dpData, error: dpError } = await supabase
    .from('direct_purchases')
    .insert([
      {
        store_id: formData.store_id,
        supplier_id: formData.supplier_id,
        purchase_date: formData.purchase_date,
        status: 'Waiting Delivery',
        total_amount: totalAmount,
        notes: formData.notes || null,
        created_by: user.id,
        payment_status: paymentStatus,
        amount_paid: formData.amount_paid || 0,
        transport_cost: formData.transport_cost || 0,
        transport_note: formData.transport_note || null,
        transfer_checked: formData.transfer_checked || false,
        payment_date: paymentStatus === 'Lunas' ? new Date().toISOString() : null,
      },
    ])
    .select('id')
    .single()

  if (dpError) {
    throw new Error(`Gagal mencatat pembelian: ${dpError.message}`)
  }

  const dpId = dpData.id

  try {
    // 2. Insert Direct Purchase Items (using unit_weight_kg and total_weight_kg)
    const itemsInsert = formData.items.map((item) => {
      const isRaw = item.item_type === 'RAW_MATERIAL'
      const unitWeight = isRaw ? (item.unit_weight_kg || 0) : 0
      const totalWeight = isRaw ? (item.quantity * unitWeight) : 0
      return {
        dp_id: dpId,
        raw_material_id: isRaw ? item.item_id : null,
        packaging_material_id: item.item_type === 'PACKAGING' ? item.item_id : null,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        subtotal: item.quantity * item.price_per_unit,
        total_kg: isRaw ? totalWeight : null,
        unit_price: item.price_per_unit,
        unit_weight_kg: unitWeight,
        total_weight_kg: totalWeight,
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

export async function updateDirectPurchase(
  dpId: string,
  formData: {
    store_id: string
    supplier_id: string
    purchase_date: string
    notes?: string
    amount_paid: number
    transport_cost: number
    transport_note?: string
    transfer_checked: boolean
    items: DPItemInput[]
  }
) {
  const supabase = await createClient()

  if (formData.items.length === 0) {
    throw new Error('Pembelian harus memiliki minimal 1 item.')
  }

  // Calculate items subtotal
  const itemsSubtotal = formData.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price_per_unit)
  }, 0)

  // Total amount includes transport cost
  const totalAmount = itemsSubtotal + (formData.transport_cost || 0)

  // Determine payment status
  let paymentStatus = 'Belum Dibayar'
  if (formData.amount_paid > 0) {
    if (formData.amount_paid >= totalAmount) {
      paymentStatus = 'Lunas'
    } else {
      paymentStatus = 'Dibayar Sebagian'
    }
  }

  // 1. Update Direct Purchase Header
  const { error: dpError } = await supabase
    .from('direct_purchases')
    .update({
      store_id: formData.store_id,
      supplier_id: formData.supplier_id,
      purchase_date: formData.purchase_date,
      total_amount: totalAmount,
      notes: formData.notes || null,
      payment_status: paymentStatus,
      amount_paid: formData.amount_paid || 0,
      transport_cost: formData.transport_cost || 0,
      transport_note: formData.transport_note || null,
      transfer_checked: formData.transfer_checked || false,
      payment_date: paymentStatus === 'Lunas' ? new Date().toISOString() : null,
    })
    .eq('id', dpId)
    .eq('status', 'Waiting Delivery') // Ensure it can only be updated if Waiting Delivery

  if (dpError) {
    throw new Error(`Gagal memperbarui pembelian: ${dpError.message}`)
  }

  // 2. Delete existing items
  const { error: deleteError } = await supabase
    .from('direct_purchase_items')
    .delete()
    .eq('dp_id', dpId)

  if (deleteError) {
    throw new Error(`Gagal menghapus item pembelian lama: ${deleteError.message}`)
  }

  // 3. Insert new items
  const itemsInsert = formData.items.map((item) => {
    const isRaw = item.item_type === 'RAW_MATERIAL'
    const unitWeight = isRaw ? (item.unit_weight_kg || 0) : 0
    const totalWeight = isRaw ? (item.quantity * unitWeight) : 0
    return {
      dp_id: dpId,
      raw_material_id: isRaw ? item.item_id : null,
      packaging_material_id: item.item_type === 'PACKAGING' ? item.item_id : null,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
      subtotal: item.quantity * item.price_per_unit,
      total_kg: isRaw ? totalWeight : null,
      unit_price: item.price_per_unit,
      unit_weight_kg: unitWeight,
      total_weight_kg: totalWeight,
    }
  })

  const { error: itemsError } = await supabase
    .from('direct_purchase_items')
    .insert(itemsInsert)

  if (itemsError) {
    throw new Error(`Gagal menyimpan item pembelian baru: ${itemsError.message}`)
  }

  revalidatePath('/dashboard/procurement/direct-purchase')
  revalidatePath(`/dashboard/procurement/direct-purchase/${dpId}`)
}

export async function receiveDPGoods(
  dpId: string, 
  storeId: string,
  actuals: { id: string; actualQty: number; discrepancyReasonId?: string | null; discrepancyNote?: string | null }[]
) {
  const supabase = await createClient()

  // 1. Fetch direct purchase details including payment status and transport cost
  const { data: purchase, error: purchaseError } = await supabase
    .from('direct_purchases')
    .select('payment_status, transport_cost')
    .eq('id', dpId)
    .single()

  if (purchaseError || !purchase) {
    throw new Error('Gagal memproses penerimaan: Data pembelian tidak ditemukan.')
  }

  if (purchase.payment_status !== 'Lunas') {
    throw new Error('Gagal memproses penerimaan: Barang tidak boleh diterima sebelum pembayaran lunas.')
  }

  const transportCost = parseFloat(purchase.transport_cost || '0')

  // 2. Fetch the corresponding inventory location for this store of type 'STORE'
  const { data: locationData, error: locError } = await supabase
    .from('inventory_locations')
    .select('id')
    .eq('store_id', storeId)
    .eq('location_type', 'STORE')
    .single()

  if (locError || !locationData) {
    throw new Error(`Gagal memproses penerimaan: Lokasi Gudang Utama ('STORE') untuk toko ini tidak ditemukan.`)
  }

  const locationId = locationData.id

  // 3. Fetch all direct purchase items
  const { data: dpItems, error: itemsError } = await supabase
    .from('direct_purchase_items')
    .select('*')
    .eq('dp_id', dpId)

  if (itemsError || !dpItems || dpItems.length === 0) {
    throw new Error('Gagal memproses penerimaan: Item pembelian tidak ditemukan.')
  }

  if (actuals.length !== dpItems.length) {
    throw new Error('Data aktual tidak sesuai dengan jumlah item pesanan.')
  }

  // Calculate total subtotal of all items to allocate transport cost proportionally
  const totalSubtotal = dpItems.reduce((sum, item) => sum + parseFloat(item.subtotal || '0'), 0)

  // 4. Process each item movement sequentially
  for (const item of dpItems) {
    const actual = actuals.find(a => a.id === item.id)
    if (!actual) throw new Error('Data aktual tidak lengkap untuk item tertentu.')

    const isRaw = item.raw_material_id !== null
    const productId = isRaw ? item.raw_material_id : item.packaging_material_id
    const productType = isRaw ? 'RAW_MATERIAL' : 'PACKAGING'

    const unitWeight = parseFloat(item.unit_weight_kg || '0')
    const orderedQty = parseFloat(item.quantity || '0')
    const itemSubtotal = parseFloat(item.subtotal || '0')

    let quantityKg = actual.actualQty
    let receivedTotalWeightKg = 0

    if (isRaw) {
      receivedTotalWeightKg = actual.actualQty * unitWeight
      quantityKg = receivedTotalWeightKg
    }

    // Allocate transport cost proportionally based on item's subtotal
    const allocatedTransport = totalSubtotal > 0 ? (itemSubtotal / totalSubtotal) * transportCost : 0
    const receivedItemSubtotal = orderedQty > 0 ? (actual.actualQty / orderedQty) * itemSubtotal : 0
    const landedCost = receivedItemSubtotal + allocatedTransport

    let hppAtTime = 0
    if (isRaw) {
      hppAtTime = receivedTotalWeightKg > 0 ? landedCost / receivedTotalWeightKg : 0
    } else {
      hppAtTime = actual.actualQty > 0 ? landedCost / actual.actualQty : 0
    }

    const shrinkageKg = isRaw ? (parseFloat(item.total_weight_kg || '0') - receivedTotalWeightKg) : 0

    // Update actual values to direct_purchase_items
    const { error: updateError } = await supabase
      .from('direct_purchase_items')
      .update({
        actual_quantity: actual.actualQty,
        received_qty: actual.actualQty,
        received_quantity: actual.actualQty,
        actual_total_kg: isRaw ? receivedTotalWeightKg : null,
        received_total_weight_kg: isRaw ? receivedTotalWeightKg : null,
        shrinkage_kg: shrinkageKg,
        discrepancy_reason_id: actual.discrepancyReasonId || null,
        discrepancy_note: actual.discrepancyNote || null
      })
      .eq('id', item.id)

    if (updateError) {
      throw new Error(`Gagal memperbarui nilai aktual: ${updateError.message}`)
    }

    // Call process_inventory_movement RPC
    const { error: rpcError } = await supabase.rpc('process_inventory_movement', {
      p_location_id: locationId,
      p_product_type: productType,
      p_product_id: productId,
      p_quantity_kg: quantityKg,
      p_movement_type: 'GOODS_RECEIPT',
      p_reference_id: dpId,
      p_hpp_at_time: hppAtTime,
    })

    if (rpcError) {
      throw new Error(`Gagal mencatat mutasi stok item ${productId}: ${rpcError.message}`)
    }
  }

  // 5. Update status to Received
  const { error: statusError } = await supabase
    .from('direct_purchases')
    .update({ status: 'Received' })
    .eq('id', dpId)

  if (statusError) {
    throw new Error(`Mutasi stok berhasil dicatat, namun gagal memperbarui status pembelian: ${statusError.message}`)
  }

  revalidatePath('/dashboard/procurement/direct-purchase')
  revalidatePath(`/dashboard/procurement/direct-purchase/${dpId}`)
  revalidatePath('/dashboard/inventory/raw-materials')
  revalidatePath('/dashboard/inventory/packaging')
  revalidatePath('/dashboard/inventory/stock-balance')
}

export async function createRawMaterialDP(formData: {
  rm_code?: string
  name: string
  category_id: string
  conversion_factor: number
}) {
  const supabase = await createClient()

  const insertData: any = {
    name: formData.name,
    category_id: formData.category_id,
    conversion_factor: formData.conversion_factor,
    base_unit: 'Kg',
    status: 'Active',
  }

  if (formData.rm_code) {
    insertData.rm_code = formData.rm_code
  }

  const { data, error } = await supabase
    .from('raw_materials')
    .insert([insertData])
    .select('id, name, rm_code')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Kode bahan baku sudah terdaftar (harus unik).')
    }
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/inventory/raw-materials')
  return data
}

export async function createPackagingMaterialDP(formData: {
  packaging_code?: string
  name: string
  size_dimension?: string
  buy_price_per_pcs: number
}) {
  const supabase = await createClient()

  const insertData: any = {
    name: formData.name,
    size_dimension: formData.size_dimension || null,
    buy_price_per_pcs: formData.buy_price_per_pcs,
    status: 'Active',
  }

  if (formData.packaging_code) {
    insertData.packaging_code = formData.packaging_code
  }

  const { data, error } = await supabase
    .from('packaging_materials')
    .insert([insertData])
    .select('id, name, packaging_code')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('Kode kemasan sudah terdaftar (harus unik).')
    }
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/inventory/packaging')
  return data
}

export async function createCategoryDP(formData: {
  name: string
  description?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        name: formData.name,
        description: formData.description || null,
      },
    ])
    .select('id, name')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/settings/categories')
  return data
}

export async function createDiscrepancyReason(reasonText: string) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('discrepancy_reasons')
    .select('id')
    .eq('reason_text', reasonText)
    .maybeSingle()

  if (existing) {
    return existing.id
  }

  const { data, error } = await supabase
    .from('discrepancy_reasons')
    .insert([{ reason_text: reasonText }])
    .select('id')
    .single()

  if (error) {
    throw new Error(`Gagal membuat alasan selisih baru: ${error.message}`)
  }

  return data.id
}


