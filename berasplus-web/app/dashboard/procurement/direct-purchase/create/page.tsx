import { createClient } from '@/utils/supabase/server'
import DPCreateForm from './DPCreateForm'

export const dynamic = 'force-dynamic'

export default async function CreateDirectPurchasePage() {
  const supabase = await createClient()

  // 1. Fetch active stores
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .eq('status', 'Active')
    .order('name')

  // 2. Fetch suppliers
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, name')
    .order('name')

  // 3. Fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, product_code, unit_of_measure, product_type, weight_per_unit_kg')
    .eq('is_active', true)
    .order('name')

  return (
    <DPCreateForm
      stores={stores || []}
      suppliers={suppliers || []}
      products={products || []}
    />
  )
}
