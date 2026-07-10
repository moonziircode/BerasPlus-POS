'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface RecipeInput {
  raw_material_id: string
  quantity_kg: number
}

interface RecipePackaging {
  packaging_material_id: string
  quantity: number
}

export async function createRecipe(formData: {
  recipe_code: string
  name: string
  target_product_id: string
  standard_loss_pct: number
  inputs: RecipeInput[]
  packaging: RecipePackaging[]
}) {
  const supabase = await createClient()

  // 1. Get logged-in user id for created_by field
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User tidak terautentikasi.')
  }

  // A. INSERT INTO recipes
  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .insert([
      {
        recipe_code: formData.recipe_code,
        name: formData.name,
        target_product_id: formData.target_product_id,
        standard_loss_pct: formData.standard_loss_pct,
      },
    ])
    .select('id')
    .single()

  if (recipeError) {
    if (recipeError.code === '23505') {
      throw new Error('Kode resep sudah terdaftar (harus unik).')
    }
    throw new Error(`Gagal membuat resep: ${recipeError.message}`)
  }

  const recipeId = recipeData.id

  try {
    // B. INSERT INTO recipe_versions (version_number: 1, is_active: true, created_by)
    const { data: versionData, error: versionError } = await supabase
      .from('recipe_versions')
      .insert([
        {
          recipe_id: recipeId,
          version_number: 1,
          is_active: true,
          created_by: user.id,
        },
      ])
      .select('id')
      .single()

    if (versionError) {
      throw new Error(`Gagal membuat versi resep: ${versionError.message}`)
    }

    const versionId = versionData.id

    // C. INSERT INTO recipe_version_inputs
    if (formData.inputs.length === 0) {
      throw new Error('Resep harus memiliki minimal 1 bahan baku.')
    }

    const inputsInsert = formData.inputs.map((input) => ({
      recipe_version_id: versionId,
      raw_material_id: input.raw_material_id,
      quantity_kg: input.quantity_kg,
    }))

    const { error: inputsError } = await supabase
      .from('recipe_version_inputs')
      .insert(inputsInsert)

    if (inputsError) {
      throw new Error(`Gagal menyimpan bahan baku resep: ${inputsError.message}`)
    }

    // D. INSERT INTO recipe_version_packaging (if packaging items exist)
    if (formData.packaging && formData.packaging.length > 0) {
      const packagingInsert = formData.packaging.map((pkg) => ({
        recipe_version_id: versionId,
        packaging_material_id: pkg.packaging_material_id,
        quantity: pkg.quantity,
      }))

      const { error: packagingError } = await supabase
        .from('recipe_version_packaging')
        .insert(packagingInsert)

      if (packagingError) {
        throw new Error(`Gagal menyimpan kemasan resep: ${packagingError.message}`)
      }
    }

    // E. UPDATE recipes set active_version_id = versionId
    const { error: updateRecipeError } = await supabase
      .from('recipes')
      .update({ active_version_id: versionId })
      .eq('id', recipeId)

    if (updateRecipeError) {
      throw new Error(`Gagal mengaktifkan versi resep: ${updateRecipeError.message}`)
    }

  } catch (error: any) {
    // Rollback simulation: delete the recipes record.
    // Due to CASCADE references in the schema, this will automatically delete any versions, inputs or packaging added.
    await supabase.from('recipes').delete().eq('id', recipeId)
    throw error
  }

  revalidatePath('/dashboard/mixing/recipes')
}
