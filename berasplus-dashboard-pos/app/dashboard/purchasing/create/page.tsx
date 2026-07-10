import { createClient } from '@/utils/supabase/server'
import POCreateForm from './POCreateForm'

export const dynamic = 'force-dynamic'

export default async function CreatePOPage() {
  const supabase = await createClient()

  // 1. Fetch stores
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .eq('status', 'Active')
    .order('name', { ascending: true })

  // 2. Fetch suppliers
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, name')
    .order('name', { ascending: true })

  // 3. Fetch raw materials
  const { data: rawMaterials } = await supabase
    .from('raw_materials')
    .select('id, name, rm_code')
    .eq('status', 'Active')
    .order('name', { ascending: true })

  // 4. Fetch packaging materials
  const { data: packagingMaterials } = await supabase
    .from('packaging_materials')
    .select('id, name, packaging_code')
    .eq('status', 'Active')
    .order('name', { ascending: true })

  return (
    <POCreateForm
      stores={stores || []}
      suppliers={suppliers || []}
      rawMaterials={rawMaterials || []}
      packagingMaterials={packagingMaterials || []}
    />
  )
}
