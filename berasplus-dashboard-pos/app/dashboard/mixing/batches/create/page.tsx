import { createClient } from '@/utils/supabase/server'
import BatchCreateForm from './BatchCreateForm'

export const dynamic = 'force-dynamic'

export default async function CreateProductionBatchPage() {
  const supabase = await createClient()

  // 1. Fetch active stores
  const { data: storesData } = await supabase
    .from('stores')
    .select('id, store_code, name')
    .eq('status', 'Active')
    .order('name')

  // 2. Fetch recipes
  const { data: recipesData } = await supabase
    .from('recipes')
    .select(`
      id,
      recipe_code,
      name,
      standard_loss_pct,
      target_product_id,
      selling_products:target_product_id (
        id,
        name,
        sku
      )
    `)
    .order('name')

  // 3. Fetch active recipe versions with nested inputs and packaging
  const { data: activeVersions } = await supabase
    .from('recipe_versions')
    .select(`
      id,
      recipe_id,
      version_number,
      recipe_version_inputs (
        id,
        raw_material_id,
        quantity_kg,
        raw_materials:raw_material_id (
          id,
          name,
          rm_code
        )
      ),
      recipe_version_packaging (
        id,
        packaging_material_id,
        quantity,
        packaging_materials:packaging_material_id (
          id,
          name,
          packaging_code,
          buy_price_per_pcs
        )
      )
    `)
    .eq('is_active', true)

  // Map active versions to their respective recipes
  const recipes = (recipesData || []).map((recipe) => {
    const activeVersion = (activeVersions || []).find((v) => v.recipe_id === recipe.id)
    return {
      ...recipe,
      activeVersion,
    }
  })

  const stores = storesData || []

  return <BatchCreateForm stores={stores} recipes={recipes} />
}
