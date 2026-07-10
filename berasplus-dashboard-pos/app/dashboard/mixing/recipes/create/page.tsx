import { createClient } from '@/utils/supabase/server'
import RecipeCreateForm from './RecipeCreateForm'

export const dynamic = 'force-dynamic'

export default async function CreateRecipePage() {
  const supabase = await createClient()

  // 1. Fetch selling products for target options
  const { data: products } = await supabase
    .from('selling_products')
    .select('id, name, sku')
    .eq('status', 'Active')
    .order('name', { ascending: true })

  // 2. Fetch raw materials for inputs composition
  const { data: rawMaterials } = await supabase
    .from('raw_materials')
    .select('id, name, rm_code')
    .eq('status', 'Active')
    .order('name', { ascending: true })

  // 3. Fetch packaging materials
  const { data: packagingMaterials } = await supabase
    .from('packaging_materials')
    .select('id, name, packaging_code')
    .eq('status', 'Active')
    .order('name', { ascending: true })

  return (
    <RecipeCreateForm
      products={products || []}
      rawMaterials={rawMaterials || []}
      packagingMaterials={packagingMaterials || []}
    />
  )
}
