import { createClient } from '@/utils/supabase/server'
import RepackCreateForm from './RepackCreateForm'

export const dynamic = 'force-dynamic'

export default async function RepackCreatePage() {
  const supabase = await createClient()

  // 1. Fetch stores
  const { data: stores } = await supabase
    .from('stores')
    .select('id, store_code, name')
    .order('name', { ascending: true })

  // 2. Fetch raw materials
  const { data: rawMaterials } = await supabase
    .from('raw_materials')
    .select('id, rm_code, name, base_unit, hpp')
    .eq('status', 'Active')
    .order('name', { ascending: true })

  // 3. Fetch selling products
  const { data: sellingProducts } = await supabase
    .from('selling_products')
    .select('id, sku, name, sell_price')
    .eq('status', 'Active')
    .order('name', { ascending: true })

  // 4. Fetch raw materials stock balances
  const { data: stockBalances } = await supabase
    .from('inventory_balances_view')
    .select('store_id, product_id, current_stock_kg')
    .eq('product_type', 'RAW_MATERIAL')

  return (
    <div className="space-y-6 font-sans">
      <RepackCreateForm
        stores={stores || []}
        rawMaterials={rawMaterials || []}
        sellingProducts={sellingProducts || []}
        stockBalances={stockBalances || []}
      />
    </div>
  )
}
