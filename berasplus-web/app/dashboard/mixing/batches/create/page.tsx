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

  // 2. Fetch active selling products (Target SKU)
  const { data: sellingProductsData } = await supabase
    .from('selling_products')
    .select('id, sku, name, unit_weight_kg')
    .eq('status', 'Active')
    .order('name')

  // 3. Fetch active raw materials
  const { data: rawMaterialsData } = await supabase
    .from('raw_materials')
    .select('id, rm_code, name')
    .eq('status', 'Active')
    .order('name')

  // 4. Fetch active packaging materials
  const { data: packagingMaterialsData } = await supabase
    .from('packaging_materials')
    .select('id, packaging_code, name')
    .eq('status', 'Active')
    .order('name')

  const stores = storesData || []
  const sellingProducts = sellingProductsData || []
  const rawMaterials = rawMaterialsData || []
  const packagingMaterials = packagingMaterialsData || []

  return (
    <BatchCreateForm 
      stores={stores} 
      sellingProducts={sellingProducts} 
      rawMaterials={rawMaterials}
      packagingMaterials={packagingMaterials}
    />
  )
}
