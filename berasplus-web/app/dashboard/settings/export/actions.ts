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

    // 2. Procurements (Direct Purchases)
    const { data: procurements, error: procError } = await supabase
      .from('direct_purchases')
      .select(`
        *,
        items:direct_purchase_items(*)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')
      .order('created_at', { ascending: true })

    // 3. Mixing
    const { data: mixing, error: mixError } = await supabase
      .from('production_batches')
      .select(`
        *,
        inputs:production_batch_inputs(*),
        outputs:production_batch_outputs(*)
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
        inputs:production_batch_inputs(*),
        outputs:production_batch_outputs(*)
      `)
      .eq('type', 'REPACKING')
      .gte('created_at', startDate)
      .lte('created_at', endDate + ' 23:59:59')
      .order('created_at', { ascending: true })

    // 5. Inventory Ledger
    const { data: ledger, error: ledgerError } = await supabase
      .from('inventory_ledger')
      .select(`*`)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate + ' 23:59:59')
      .order('timestamp', { ascending: true })

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
