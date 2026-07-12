import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function exportToExcel(data: any, startDate: string, endDate: string) {
  const wb = XLSX.utils.book_new()

  // 1. Sales Sheet
  const salesData = data.sales.map((s: any) => ({
    'Waktu Transaksi': format(new Date(s.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    'No. Transaksi': s.transaction_number || '-',
    'Tipe Pelanggan': s.customer_id ? 'Member' : 'Umum',
    'Nama Pelanggan': s.customer_name || '-',
    'Total Pembelian': s.total,
    'Metode Pembayaran': s.payment_method || '-',
    'Status Pembayaran': s.status,
    'Kasir': s.cashier_id,
  }))
  const wsSales = XLSX.utils.json_to_sheet(salesData)
  XLSX.utils.book_append_sheet(wb, wsSales, 'Penjualan')

  // 2. Procurements Sheet (Direct Purchases)
  const procData = data.procurements.map((p: any) => ({
    'Tanggal': format(new Date(p.purchase_date || p.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    'Supplier': p.supplier_id || '-',
    'Status': p.status,
    'Total Biaya': p.total_amount,
    'Pembayaran': p.payment_status,
    'Catatan': p.notes || '-'
  }))
  const wsProc = XLSX.utils.json_to_sheet(procData)
  XLSX.utils.book_append_sheet(wb, wsProc, 'Pembelian')

  // 3. Mixing Sheet
  const mixData = data.mixing.map((m: any) => ({
    'Waktu Selesai': format(new Date(m.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    'Batch ID': m.batch_number,
    'Nama Resep': m.recipe_id || '-',
    'Total Input (Kg)': m.total_input_weight_kg,
    'Total Output (Kg)': m.total_output_weight_kg,
    'Susut (Kg)': m.loss_weight_kg,
    'Catatan': m.notes || '-'
  }))
  const wsMix = XLSX.utils.json_to_sheet(mixData)
  XLSX.utils.book_append_sheet(wb, wsMix, 'Produksi Mixing')

  // 4. Repacking Sheet
  const repackData = data.repacking.map((r: any) => ({
    'Waktu Selesai': format(new Date(r.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
    'Batch ID': r.batch_number,
    'Total Input (Kg)': r.total_input_weight_kg,
    'Total Output (Kg)': r.total_output_weight_kg,
    'Catatan': r.notes || '-'
  }))
  const wsRepack = XLSX.utils.json_to_sheet(repackData)
  XLSX.utils.book_append_sheet(wb, wsRepack, 'Produksi Repacking')

  // 5. Inventory Ledger Sheet
  const ledgerData = data.ledger.map((l: any) => ({
    'Waktu': format(new Date(l.timestamp), 'dd MMM yyyy HH:mm', { locale: id }),
    'Tipe Produk': l.product_type,
    'Produk ID': l.product_id,
    'Tipe Pergerakan': l.movement_type,
    'Perubahan Qty Kg': l.quantity_kg,
    'Referensi': l.reference_id || '-'
  }))
  const wsLedger = XLSX.utils.json_to_sheet(ledgerData)
  XLSX.utils.book_append_sheet(wb, wsLedger, 'Mutasi Stok')

  // Write and Save
  const fileName = `Laporan_BerasPlus_${startDate}_sd_${endDate}.xlsx`
  XLSX.writeFile(wb, fileName)
}
