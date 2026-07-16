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
  const [storesRes, suppliersRes, productsRes] = await Promise.all([
    supabase.from('stores').select('id, name').order('name'),
    supabase.from('suppliers').select('id, name').order('name'),
    supabase.from('products').select('id, name, product_code, unit_of_measure, product_type').eq('is_active', true).order('name')
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
    .eq('purchase_id', resolvedParams.id)

  if (itemsError || !dpItems) {
    notFound()
  }

  const initialData: InitialData = {
    id: dp.id,
    store_id: dp.store_id,
    supplier_id: dp.supplier_id,
    purchase_date: dp.purchase_date,
    items: dpItems.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: parseFloat(item.quantity || '0'),
      price_per_unit: parseFloat(item.unit_price || '0'),
    }))
  }

  return (
    <div className="mx-auto max-w-7xl">
      <DPEditForm
        stores={storesRes.data || []}
        suppliers={suppliersRes.data || []}
        products={productsRes.data || []}
        initialData={initialData}
      />
    </div>
  )
}
