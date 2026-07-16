import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BlendingForm from './BlendingForm'

export const dynamic = 'force-dynamic'

export default async function CreateBlendingPage() {
  const supabase = await createClient()

  // Fetch all active products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, product_type, unit_of_measure, weight_per_unit_kg, hpp')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/blending"
          className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
            Buat Blending Baru
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
            Proses pencampuran akan mengurangi stok bahan curah & kemasan, serta menambah stok hasil produksi dan kalkulasi HPP otomatis.
          </p>
        </div>
      </div>

      <BlendingForm products={products || []} />
    </div>
  )
}
