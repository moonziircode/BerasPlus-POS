import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function exportToExcel(data: any, startDate: string, endDate: string) {
  const wb = XLSX.utils.book_new()

  // 1. Sales Sheet
  const salesData = data.sales.map((s: any) => ({
    'Waktu Transaksi': format(new Date(s.transaction_date), 'dd MMM yyyy HH:mm', { locale: id }),
    'No. Transaksi': s.transaction_id,
    'Tipe Pelanggan': s.customer_type,
    'Nama Pelanggan': s.customer_name || '-',
    'Total Pembelian': s.total_amount,
    'Metode Pembayaran': s.payment_method,
    'Status Pembayaran': s.payment_status,
    'Kasir': s.cashier_name || s.user_id,
  }))
  const wsSales = XLSX.utils.json_to_sheet(salesData)
  XLSX.utils.book_append_sheet(wb, wsSales, 'Penjualan')

  // 2. Procurements Sheet
  const procData = data.procurements.map((p: any) => ({
    'Tanggal': format(new Date(p.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    'Supplier': p.supplier_name || '-',
    'Status': p.status,
    'Total Biaya': p.total_cost,
    'Total Berat (Kg)': p.total_weight_kg,
    'Pembayaran': p.payment_status,
    'Catatan': p.notes || '-'
  }))
  const wsProc = XLSX.utils.json_to_sheet(procData)
  XLSX.utils.book_append_sheet(wb, wsProc, 'Pembelian')

  // 3. Mixing Sheet
  const mixData = data.mixing.map((m: any) => ({
    'Waktu Selesai': format(new Date(m.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    'Batch ID': m.batch_id,
    'Nama Resep': m.recipe_name || '-',
    'Total Input (Kg)': m.total_input_kg,
    'Total Output (Kg)': m.total_output_kg,
    'Susut (Kg)': m.loss_kg,
    'Catatan': m.notes || '-'
  }))
  const wsMix = XLSX.utils.json_to_sheet(mixData)
  XLSX.utils.book_append_sheet(wb, wsMix, 'Produksi Mixing')

  // 4. Repacking Sheet
  const repackData = data.repacking.map((r: any) => ({
    'Waktu Selesai': format(new Date(r.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    'Batch ID': r.batch_id,
    'Bahan Baku ID': r.source_material_id,
    'Input (Kg)': r.total_input_kg,
    'Total Output (Kg)': r.total_output_kg,
    'Catatan': r.notes || '-'
  }))
  const wsRepack = XLSX.utils.json_to_sheet(repackData)
  XLSX.utils.book_append_sheet(wb, wsRepack, 'Produksi Repacking')

  // 5. Inventory Ledger Sheet
  const ledgerData = data.ledger.map((l: any) => ({
    'Waktu': format(new Date(l.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    'Tipe Transaksi': l.transaction_type,
    'Entitas ID': l.entity_id,
    'Tipe Item': l.item_type,
    'Perubahan Qty': l.quantity_change,
    'Perubahan Kg': l.weight_change_kg,
    'Keterangan': l.reference_id || '-'
  }))
  const wsLedger = XLSX.utils.json_to_sheet(ledgerData)
  XLSX.utils.book_append_sheet(wb, wsLedger, 'Mutasi Stok')

  // Write and Save
  const fileName = `Laporan_BerasPlus_${startDate}_sd_${endDate}.xlsx`
  XLSX.writeFile(wb, fileName)
}
