'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface POItemInput {
  item_type: 'RAW_MATERIAL' | 'PACKAGING'
  item_id: string
  quantity: number
  price_per_unit: number
}

export async function createPO(formData: {
  store_id: string
  supplier_id: string
  po_number: string
  items: POItemInput[]
}) {
  const supabase = await createClient()

  if (formData.items.length === 0) {
    throw new Error('PO harus memiliki minimal 1 item.')
  }

  // Calculate total amount
  const totalAmount = formData.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price_per_unit)
  }, 0)

  // 1. Insert Purchase Order Header
  const { data: poData, error: poError } = await supabase
    .from('purchase_orders')
    .insert([
      {
        store_id: formData.store_id,
        supplier_id: formData.supplier_id,
        po_number: formData.po_number,
        status: 'Submitted', // Default to Submitted when created
        total_amount: totalAmount,
      },
    ])
    .select('id')
    .single()

  if (poError) {
    if (poError.code === '23505') {
      throw new Error('Nomor PO sudah terdaftar (harus unik).')
    }
    throw new Error(`Gagal membuat PO: ${poError.message}`)
  }

  const poId = poData.id

  try {
    // 2. Insert Purchase Order Items
    const itemsInsert = formData.items.map((item) => ({
      po_id: poId,
      item_type: item.item_type,
      item_id: item.item_id,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
      subtotal: item.quantity * item.price_per_unit,
    }))

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsInsert)

    if (itemsError) {
      throw new Error(`Gagal menyimpan item PO: ${itemsError.message}`)
    }
  } catch (err: any) {
    // Rollback PO header on failure
    await supabase.from('purchase_orders').delete().eq('id', poId)
    throw err
  }

  revalidatePath('/dashboard/purchasing')
}

export async function receiveGoods(poId: string, storeId: string) {
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

  // 2. Fetch all PO items
  const { data: poItems, error: itemsError } = await supabase
    .from('purchase_order_items')
    .select('*')
    .eq('po_id', poId)

  if (itemsError || !poItems || poItems.length === 0) {
    throw new Error('Gagal memproses penerimaan: Item Purchase Order tidak ditemukan.')
  }

  // 3. Process each item movement sequentially
  for (const item of poItems) {
    let quantityKg = parseFloat(item.quantity)
    let hppAtTime = parseFloat(item.price_per_unit)

    // For Raw Materials, we must convert quantity to Kg and calculate price per Kg
    if (item.item_type === 'RAW_MATERIAL') {
      const { data: rawMaterial, error: rmError } = await supabase
        .from('raw_materials')
        .select('conversion_factor')
        .eq('id', item.item_id)
        .single()

      if (rmError || !rawMaterial) {
        throw new Error(`Gagal memproses penerimaan: Informasi bahan baku ID ${item.item_id} tidak ditemukan.`)
      }

      const conversion = parseFloat(rawMaterial.conversion_factor) || 1
      quantityKg = quantityKg * conversion
      hppAtTime = hppAtTime / conversion
    }

    // Call process_inventory_movement RPC
    const { error: rpcError } = await supabase.rpc('process_inventory_movement', {
      p_location_id: locationId,
      p_product_type: item.item_type,
      p_product_id: item.item_id,
      p_quantity_kg: quantityKg,
      p_movement_type: 'GOODS_RECEIPT',
      p_reference_id: poId,
      p_hpp_at_time: hppAtTime,
    })

    if (rpcError) {
      throw new Error(`Gagal mencatat mutasi stok item ${item.item_id}: ${rpcError.message}`)
    }
  }

  // 4. Update PO status to Completed
  const { error: poUpdateError } = await supabase
    .from('purchase_orders')
    .update({ status: 'Completed' })
    .eq('id', poId)

  if (poUpdateError) {
    throw new Error(`Mutasi stok berhasil dicatat, namun gagal memperbarui status PO: ${poUpdateError.message}`)
  }

  revalidatePath('/dashboard/purchasing')
  revalidatePath('/dashboard/inventory/raw-materials')
  revalidatePath('/dashboard/inventory/packaging')
}

export async function createSupplier(formData: {
  name: string
  contact_person?: string
  phone?: string
  address?: string
  bank_account_details?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('suppliers')
    .insert([
      {
        name: formData.name,
        contact_person: formData.contact_person || null,
        phone: formData.phone || null,
        address: formData.address || null,
        bank_account_details: formData.bank_account_details || null,
      },
    ])
    .select('id, name')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/purchasing/create')
  return data
}

