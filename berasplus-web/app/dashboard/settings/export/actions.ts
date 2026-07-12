'use server'

import { createClient } from '@/utils/supabase/server'

export async function fetchExportData(startDate: string, endDate: string) {
  try {
    const supabase = await createClient()

    // 1. Sales
    const { data: sales, error: salesError } = await supabase
      .from('sales_transactions')
      .select(`
        *,
        items:sales_transaction_items(*)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')
      .order('created_at', { ascending: true })

    // 2. Procurements
    const { data: procurements, error: procError } = await supabase
      .from('procurements')
      .select(`
        *,
        items:procurement_items(*)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')
      .order('created_at', { ascending: true })

    // 3. Mixing
    const { data: mixing, error: mixError } = await supabase
      .from('production_batches')
      .select(`
        *,
        materials:batch_materials(*),
        results:batch_results(*)
      `)
      .eq('type', 'MIXING')
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')
      .order('created_at', { ascending: true })

    // 4. Repacking
    const { data: repacking, error: repackError } = await supabase
      .from('production_batches')
      .select(`
        *,
        materials:batch_materials(*),
        results:batch_results(*)
      `)
      .eq('type', 'REPACKING')
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')
      .order('created_at', { ascending: true })

    // 5. Inventory Ledger
    const { data: ledger, error: ledgerError } = await supabase
      .from('inventory_ledger')
      .select(`*`)
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')
      .order('created_at', { ascending: true })

    if (salesError) throw new Error(salesError.message)
    if (procError) throw new Error(procError.message)
    if (mixError) throw new Error(mixError.message)
    if (repackError) throw new Error(repackError.message)
    if (ledgerError) throw new Error(ledgerError.message)

    return {
      success: true,
      data: {
        sales: sales || [],
        procurements: procurements || [],
        mixing: mixing || [],
        repacking: repacking || [],
        ledger: ledger || []
      }
    }
  } catch (error: any) {
    console.error('Export Error:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengambil data untuk ekspor'
    }
  }
}
