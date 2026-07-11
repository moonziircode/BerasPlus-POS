import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Blend, Package, Scale, HelpCircle } from 'lucide-react'
import { convertFromKg } from '@/utils/conversion'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch recipe details
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      id,
      recipe_code,
      name,
      standard_loss_pct,
      active_version_id,
      selling_products!recipes_target_product_id_fkey (
        id,
        sku,
        name
      )
    `)
    .eq('id', id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  // 2. Fetch the active recipe version inputs and packaging
  let versionNumber = 1
  let inputs: any[] = []
  let packaging: any[] = []

  if (recipe.active_version_id) {
    const { data: version } = await supabase
      .from('recipe_versions')
      .select('version_number')
      .eq('id', recipe.active_version_id)
      .single()

    if (version) {
      versionNumber = version.version_number
    }

    const { data: versionInputs } = await supabase
      .from('recipe_version_inputs')
      .select(`
        quantity_kg,
        raw_materials (name, rm_code, base_unit)
      `)
      .eq('recipe_version_id', recipe.active_version_id)

    if (versionInputs) {
      inputs = versionInputs
    }

    const { data: versionPkg } = await supabase
      .from('recipe_version_packaging')
      .select(`
        quantity,
        packaging_materials (name, size_dimension)
      `)
      .eq('recipe_version_id', recipe.active_version_id)

    if (versionPkg) {
      packaging = versionPkg
    }
  }

  // 3. Fetch conversion factors
  const { data: conversions } = await supabase
    .from('conversion_factors')
    .select('id, name, factor_to_kg')

  const targetProduct = (recipe as any).selling_products

  return (
    <div className="space-y-6 font-sans">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/mixing/recipes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Resep
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
            <Blend className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-50">{recipe.name}</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Kode Resep: {recipe.recipe_code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-3.5 py-2 text-emerald-400 text-xs font-semibold">
          <span>Versi Aktif: v{versionNumber}</span>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formula details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inputs Section */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-800/50">
            <h3 className="font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-500" /> Komposisi Bahan Baku (Raw Materials)
            </h3>
            <div className="overflow-hidden border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="px-4 py-3 pl-5">Nama Bahan</th>
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3 text-right pr-5">Takaran (Kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {inputs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500 italic">Tidak ada bahan baku untuk versi resep ini.</td>
                    </tr>
                  ) : (
                    inputs.map((inp, idx) => {
                      const baseUnit = (inp.raw_materials as any)?.base_unit || 'Kg'
                      const quantityKg = Number(inp.quantity_kg)
                      const needsConversion = baseUnit.toLowerCase() !== 'kg' && baseUnit.toLowerCase() !== 'kilogram'
                      const convertedQty = needsConversion 
                        ? convertFromKg(quantityKg, baseUnit, conversions || [])
                        : quantityKg
                      return (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="px-4 py-3.5 pl-5 font-medium text-slate-200">{(inp.raw_materials as any)?.name}</td>
                          <td className="px-4 py-3.5 font-mono text-slate-400">{(inp.raw_materials as any)?.rm_code}</td>
                          <td className="px-4 py-3.5 text-right pr-5 font-mono font-semibold text-slate-100">
                            <div>{quantityKg.toLocaleString('id-ID')} Kg</div>
                            {needsConversion && (
                              <span className="text-[10px] text-emerald-400 block font-normal mt-0.5">
                                ({convertedQty.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {baseUnit})
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Packaging Section */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-800/50">
            <h3 className="font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" /> Kebutuhan Kemasan (Packaging)
            </h3>
            <div className="overflow-hidden border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="px-4 py-3 pl-5">Nama Kemasan</th>
                    <th className="px-4 py-3">Dimensi</th>
                    <th className="px-4 py-3 text-right pr-5">Jumlah Kebutuhan (Pcs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {packaging.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500 italic">Tidak ada kemasan untuk versi resep ini.</td>
                    </tr>
                  ) : (
                    packaging.map((pkg, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="px-4 py-3.5 pl-5 font-medium text-slate-200">{(pkg.packaging_materials as any)?.name}</td>
                        <td className="px-4 py-3.5 text-slate-400">{(pkg.packaging_materials as any)?.size_dimension || '-'}</td>
                        <td className="px-4 py-3.5 text-right pr-5 font-mono font-semibold text-slate-100">
                          {Number(pkg.quantity).toLocaleString('id-ID')} Pcs
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info & Knowledge base */}
        <div className="space-y-6">
          {/* Target Product info */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Produk Target Penjualan</h4>
            {targetProduct ? (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-100">{targetProduct.name}</div>
                <div className="text-xs text-slate-400 font-mono">SKU: {targetProduct.sku}</div>
                <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                  <span>Toleransi Susut:</span>
                  <span className="font-semibold text-amber-400 font-mono">{parseFloat(recipe.standard_loss_pct).toFixed(2)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">Tidak ada produk target.</div>
            )}
          </div>

          {/* Unit & Conversion Knowledge Base */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-800/50 relative overflow-hidden">
            <div className="absolute right-3 top-3 opacity-10">
              <HelpCircle className="w-20 h-20 text-slate-400" />
            </div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-500" /> Knowledge: Satuan & Konversi
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Dalam mixing beras, perhatikan rasio dan nilai konversi berikut untuk menjaga keakuratan persediaan:
            </p>
            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">1 Karung (Teoritis)</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Umumnya setara dengan 50 Kg atau 25 Kg tergantung karung pemasok.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">Rasio Susut</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Selisih antara berat bahan baku timbangan aktual dengan yield output pasca mixing.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">Perhitungan HPP</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Biaya per kg output = Total biaya bahan baku input / Berat yield output bersih.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
