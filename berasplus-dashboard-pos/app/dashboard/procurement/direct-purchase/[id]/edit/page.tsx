import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DPEditForm, { InitialData } from '../../create/DPEditForm'

export default async function DPEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 1. Fetch Master Data
  const [storesRes, suppliersRes, rawRes, pkgRes, catRes] = await Promise.all([
    supabase.from('stores').select('id, name').order('name'),
    supabase.from('suppliers').select('id, name').order('name'),
    supabase.from('raw_materials').select('id, name, rm_code, conversion_factor, base_unit').eq('status', 'Active').order('name'),
    supabase.from('packaging_materials').select('id, name, packaging_code').eq('status', 'Active').order('name'),
    supabase.from('categories').select('id, name').order('name'),
  ])

  // 2. Fetch DP Header
  const { data: dp, error: dpError } = await supabase
    .from('direct_purchases')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (dpError || !dp) {
    notFound()
  }

  if (dp.status !== 'Waiting Delivery') {
    // Cannot edit if not Waiting Delivery
    redirect(`/dashboard/procurement/direct-purchase/${resolvedParams.id}`)
  }

  // 3. Fetch DP Items
  const { data: dpItems, error: itemsError } = await supabase
    .from('direct_purchase_items')
    .select('*')
    .eq('dp_id', resolvedParams.id)

  if (itemsError || !dpItems) {
    notFound()
  }

  const initialData: InitialData = {
    id: dp.id,
    store_id: dp.store_id,
    supplier_id: dp.supplier_id,
    purchase_date: dp.purchase_date,
    notes: dp.notes,
    amount_paid: parseFloat(dp.amount_paid || '0'),
    transport_cost: parseFloat(dp.transport_cost || '0'),
    transport_note: dp.transport_note,
    transfer_checked: dp.transfer_checked || false,
    items: dpItems.map(item => ({
      id: item.id,
      item_type: item.raw_material_id ? 'RAW_MATERIAL' : 'PACKAGING',
      raw_material_id: item.raw_material_id,
      packaging_material_id: item.packaging_material_id,
      quantity: parseFloat(item.quantity || '0'),
      total_kg: item.total_kg ? parseFloat(item.total_kg) : null,
      price_per_unit: parseFloat(item.price_per_unit || '0'),
      unit_weight_kg: item.unit_weight_kg ? parseFloat(item.unit_weight_kg) : null,
      total_weight_kg: item.total_weight_kg ? parseFloat(item.total_weight_kg) : null,
    }))
  }

  // 4. Fetch conversion factors
  const { data: conversionFactors } = await supabase
    .from('conversion_factors')
    .select('id, name, factor_to_kg')

  return (
    <div className="mx-auto max-w-7xl">
      <DPEditForm
        stores={storesRes.data || []}
        suppliers={suppliersRes.data || []}
        rawMaterials={rawRes.data || []}
        packagingMaterials={pkgRes.data || []}
        categories={catRes.data || []}
        conversionFactors={conversionFactors || []}
        initialData={initialData}
      />
    </div>
  )
}
