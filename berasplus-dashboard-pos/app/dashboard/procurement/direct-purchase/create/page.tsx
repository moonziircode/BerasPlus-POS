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

  // 3. Fetch active raw materials
  const { data: rawMaterials } = await supabase
    .from('raw_materials')
    .select('id, name, rm_code, conversion_factor, base_unit')
    .eq('status', 'Active')
    .order('name')

  // 4. Fetch active packaging materials
  const { data: packagingMaterials } = await supabase
    .from('packaging_materials')
    .select('id, name, packaging_code')
    .eq('status', 'Active')
    .order('name')

  // 5. Fetch categories for raw materials inline modal
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // 6. Fetch conversion factors
  const { data: conversionFactors } = await supabase
    .from('conversion_factors')
    .select('id, name, factor_to_kg')

  return (
    <DPCreateForm
      stores={stores || []}
      suppliers={suppliers || []}
      rawMaterials={rawMaterials || []}
      packagingMaterials={packagingMaterials || []}
      categories={categories || []}
      conversionFactors={conversionFactors || []}
    />
  )
}

