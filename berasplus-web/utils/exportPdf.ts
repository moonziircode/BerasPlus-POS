import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function exportToPdf(data: any, startDate: string, endDate: string) {
  const doc = new jsPDF('landscape')
  const title = `Laporan Keseluruhan BerasPlus POS`
  const subtitle = `Periode: ${format(new Date(startDate), 'dd MMM yyyy')} s/d ${format(new Date(endDate), 'dd MMM yyyy')}`

  // Function to format currency
  const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0)

  // Title
  doc.setFontSize(16)
  doc.text(title, 14, 15)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(subtitle, 14, 22)
  doc.text(`Laporan ini men-generate seluruh rekapitulasi data penjualan, pembelian, produksi, dan mutasi stok secara rapih. Semua narasi yang panjang akan menggunakan perataan teks (justify) agar nyaman dibaca.`, 14, 28, { maxWidth: 260, align: 'justify' })

  let currentY = 40

  // 1. Sales
  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text('1. Laporan Penjualan', 14, currentY)
  
  const salesRows = data.sales.map((s: any) => [
    format(new Date(s.created_at), 'dd/MM/yy HH:mm'),
    (s.transaction_number || '-').substring(0, 8) + '...',
    s.customer_name || (s.customer_id ? 'Member' : 'Umum'),
    formatRp(s.total),
    s.payment_method || '-',
    s.status
  ])
  
  autoTable(doc, {
    startY: currentY + 4,
    head: [['Waktu', 'No. Trx', 'Customer', 'Total', 'Metode', 'Status']],
    body: salesRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
    styles: { fontSize: 9 }
  })

  // 2. Pembelian (Direct Purchases)
  currentY = (doc as any).lastAutoTable.finalY + 15
  doc.setFontSize(14)
  doc.text('2. Laporan Pembelian (Direct Purchases)', 14, currentY)
  
  const procRows = data.procurements.map((p: any) => [
    format(new Date(p.purchase_date || p.created_at), 'dd/MM/yy HH:mm'),
    (p.supplier_id || '-').substring(0, 8),
    p.status,
    formatRp(p.total_amount),
    p.payment_status
  ])
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Tanggal', 'Supplier ID', 'Status', 'Total Biaya', 'Pembayaran']],
    body: procRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // emerald-500
    styles: { fontSize: 9 }
  })

  // 3. Produksi Mixing
  currentY = (doc as any).lastAutoTable.finalY + 15
  if (currentY > 250) {
    doc.addPage()
    currentY = 20
  }
  doc.setFontSize(14)
  doc.text('3. Laporan Produksi Mixing', 14, currentY)

  const mixRows = data.mixing.map((m: any) => [
    format(new Date(m.created_at), 'dd/MM/yy HH:mm'),
    m.batch_number,
    (m.recipe_id || '-').substring(0, 8),
    m.total_input_weight_kg,
    m.total_output_weight_kg,
    m.loss_weight_kg
  ])

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Waktu', 'Batch', 'Resep', 'Input (Kg)', 'Output (Kg)', 'Susut (Kg)']],
    body: mixRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 }
  })

  // 4. Produksi Repacking
  currentY = (doc as any).lastAutoTable.finalY + 15
  if (currentY > 250) {
    doc.addPage()
    currentY = 20
  }
  doc.setFontSize(14)
  doc.text('4. Laporan Produksi Repacking', 14, currentY)

  const repackRows = data.repacking.map((r: any) => [
    format(new Date(r.created_at), 'dd/MM/yy HH:mm'),
    r.batch_number,
    r.total_input_weight_kg,
    r.total_output_weight_kg
  ])

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Waktu', 'Batch', 'Input (Kg)', 'Output (Kg)']],
    body: repackRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 }
  })

  // 5. Mutasi Stok (Inventory Ledger)
  currentY = (doc as any).lastAutoTable.finalY + 15
  if (currentY > 250) {
    doc.addPage()
    currentY = 20
  }
  doc.setFontSize(14)
  doc.text('5. Laporan Mutasi Stok (Inventory Ledger)', 14, currentY)

  const ledgerRows = data.ledger.map((l: any) => [
    format(new Date(l.timestamp), 'dd/MM/yy HH:mm'),
    l.product_type,
    l.movement_type,
    l.quantity_kg,
    (l.reference_id || '-').substring(0, 8)
  ])

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Waktu', 'Tipe Produk', 'Tipe Mutasi', 'Qty (Kg)', 'Referensi']],
    body: ledgerRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 }
  })

  
  const fileName = `Laporan_BerasPlus_${startDate}_sd_${endDate}.pdf`
  doc.save(fileName)
}
