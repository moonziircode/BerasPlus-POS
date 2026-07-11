'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface DPItemInput {
  item_type: 'RAW_MATERIAL' | 'PACKAGING'
  item_id: string
  quantity: number
  price_per_unit: number
}

export async function createDirectPurchase(formData: {
  store_id: string
  supplier_id: string
  purchase_date: string
  notes?: string
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

  // Calculate total amount
  const totalAmount = formData.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price_per_unit)
  }, 0)

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
      },
    ])
    .select('id')
    .single()

  if (dpError) {
    throw new Error(`Gagal mencatat pembelian: ${dpError.message}`)
  }

  const dpId = dpData.id

  try {
    // 2. Fetch conversion factors for raw materials to calculate total_kg
    const rawMaterialIds = formData.items
      .filter((item) => item.item_type === 'RAW_MATERIAL')
      .map((item) => item.item_id)

    let conversionMap: Record<string, number> = {}
    if (rawMaterialIds.length > 0) {
      const { data: rawMaterials, error: rmError } = await supabase
        .from('raw_materials')
        .select('id, conversion_factor')
        .in('id', rawMaterialIds)

      if (rmError) {
        throw new Error(`Gagal mengambil data konversi bahan baku: ${rmError.message}`)
      }

      rawMaterials?.forEach((rm) => {
        conversionMap[rm.id] = parseFloat(rm.conversion_factor) || 1
      })
    }

    // 3. Insert Direct Purchase Items
    const itemsInsert = formData.items.map((item) => {
      const isRaw = item.item_type === 'RAW_MATERIAL'
      const conversion = isRaw ? (conversionMap[item.item_id] || 1) : 0
      return {
        dp_id: dpId,
        raw_material_id: isRaw ? item.item_id : null,
        packaging_material_id: item.item_type === 'PACKAGING' ? item.item_id : null,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        subtotal: item.quantity * item.price_per_unit,
        total_kg: isRaw ? (item.quantity * conversion) : null,
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
    items: DPItemInput[]
  }
) {
  const supabase = await createClient()

  if (formData.items.length === 0) {
    throw new Error('Pembelian harus memiliki minimal 1 item.')
  }

  // Calculate total amount
  const totalAmount = formData.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price_per_unit)
  }, 0)

  // 1. Update Direct Purchase Header
  const { error: dpError } = await supabase
    .from('direct_purchases')
    .update({
      store_id: formData.store_id,
      supplier_id: formData.supplier_id,
      purchase_date: formData.purchase_date,
      total_amount: totalAmount,
      notes: formData.notes || null,
    })
    .eq('id', dpId)
    .eq('status', 'Waiting Delivery') // Ensure it can only be updated if Waiting Delivery

  if (dpError) {
    throw new Error(`Gagal memperbarui pembelian: ${dpError.message}`)
  }

  // 2. Fetch conversion factors for raw materials to calculate total_kg
  const rawMaterialIds = formData.items
    .filter((item) => item.item_type === 'RAW_MATERIAL')
    .map((item) => item.item_id)

  let conversionMap: Record<string, number> = {}
  if (rawMaterialIds.length > 0) {
    const { data: rawMaterials, error: rmError } = await supabase
      .from('raw_materials')
      .select('id, conversion_factor')
      .in('id', rawMaterialIds)

    if (rmError) {
      throw new Error(`Gagal mengambil data konversi bahan baku: ${rmError.message}`)
    }

    rawMaterials?.forEach((rm) => {
      conversionMap[rm.id] = parseFloat(rm.conversion_factor) || 1
    })
  }

  // 3. Delete existing items
  const { error: deleteError } = await supabase
    .from('direct_purchase_items')
    .delete()
    .eq('dp_id', dpId)

  if (deleteError) {
    throw new Error(`Gagal menghapus item pembelian lama: ${deleteError.message}`)
  }

  // 4. Insert new items
  const itemsInsert = formData.items.map((item) => {
    const isRaw = item.item_type === 'RAW_MATERIAL'
    const conversion = isRaw ? (conversionMap[item.item_id] || 1) : 0
    return {
      dp_id: dpId,
      raw_material_id: isRaw ? item.item_id : null,
      packaging_material_id: item.item_type === 'PACKAGING' ? item.item_id : null,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
      subtotal: item.quantity * item.price_per_unit,
      total_kg: isRaw ? (item.quantity * conversion) : null,
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
  actuals: { id: string; actualQty: number; actualTotalKg: number | null }[]
) {
  const supabase = await createClient()

  // 1. Fetch the corresponding inventory location for this store of type 'STORE'
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

  // 2. Fetch all direct purchase items
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

  // 3. Process each item movement sequentially
  for (const item of dpItems) {
    const actual = actuals.find(a => a.id === item.id)
    if (!actual) throw new Error('Data aktual tidak lengkap untuk item tertentu.')

    const isRaw = item.raw_material_id !== null
    const productId = isRaw ? item.raw_material_id : item.packaging_material_id
    const productType = isRaw ? 'RAW_MATERIAL' : 'PACKAGING'

    let quantityKg = actual.actualQty
    let hppAtTime = parseFloat(item.price_per_unit)

    // For Raw Materials, use actualTotalKg and calculate new HPP
    if (isRaw) {
      quantityKg = actual.actualTotalKg || 0
      hppAtTime = quantityKg > 0 ? (parseFloat(item.subtotal) / quantityKg) : 0
    }

    const shrinkageKg = isRaw ? (parseFloat(item.total_kg || 0) - quantityKg) : 0

    // Update actual values to direct_purchase_items
    const { error: updateError } = await supabase
      .from('direct_purchase_items')
      .update({
        actual_quantity: actual.actualQty,
        actual_total_kg: actual.actualTotalKg,
        shrinkage_kg: shrinkageKg
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

  // 4. Update status to Received
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


