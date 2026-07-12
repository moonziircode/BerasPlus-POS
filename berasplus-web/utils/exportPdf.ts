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
    format(new Date(s.transaction_date), 'dd/MM/yy HH:mm'),
    s.transaction_id.substring(0, 8) + '...',
    s.customer_name || s.customer_type,
    formatRp(s.total_amount),
    s.payment_method,
    s.payment_status
  ])
  
  autoTable(doc, {
    startY: currentY + 4,
    head: [['Waktu', 'No. Trx', 'Customer', 'Total', 'Metode', 'Status']],
    body: salesRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
    styles: { fontSize: 9 }
  })

  currentY = (doc as any).lastAutoTable.finalY + 15

  // Check page break
  if (currentY > 170) {
    doc.addPage()
    currentY = 20
  }

  // 2. Procurements
  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text('2. Laporan Pembelian (Procurement)', 14, currentY)

  const procRows = data.procurements.map((p: any) => [
    format(new Date(p.created_at), 'dd/MM/yy HH:mm'),
    p.supplier_name || '-',
    p.status,
    formatRp(p.total_cost),
    `${p.total_weight_kg || 0} Kg`,
    p.payment_status
  ])

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Tanggal', 'Supplier', 'Status', 'Total Biaya', 'Total Berat', 'Pembayaran']],
    body: procRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 }
  })

  currentY = (doc as any).lastAutoTable.finalY + 15

  if (currentY > 170) {
    doc.addPage()
    currentY = 20
  }

  // 3. Mixing & Repacking
  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text('3. Laporan Produksi (Mixing & Repacking)', 14, currentY)

  const productionRows = [...data.mixing, ...data.repacking].map((m: any) => [
    format(new Date(m.created_at), 'dd/MM/yy HH:mm'),
    m.type,
    m.batch_id.substring(0, 8),
    `${m.total_input_kg || 0} Kg`,
    `${m.total_output_kg || 0} Kg`,
    m.status
  ])

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Waktu Selesai', 'Tipe', 'Batch ID', 'Input (Kg)', 'Output (Kg)', 'Status']],
    body: productionRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 }
  })
  
  currentY = (doc as any).lastAutoTable.finalY + 15

  if (currentY > 170) {
    doc.addPage()
    currentY = 20
  }

  // 4. Inventory Ledger
  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text('4. Laporan Mutasi Stok (Inventory Ledger)', 14, currentY)

  const ledgerRows = data.ledger.map((l: any) => [
    format(new Date(l.created_at), 'dd/MM/yy HH:mm'),
    l.transaction_type,
    l.item_type,
    `${l.quantity_change > 0 ? '+' : ''}${l.quantity_change}`,
    `${l.weight_change_kg > 0 ? '+' : ''}${l.weight_change_kg} Kg`,
    l.reference_id || '-'
  ])

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Waktu', 'Tipe Transaksi', 'Tipe Item', 'Qty', 'Berat (Kg)', 'Referensi']],
    body: ledgerRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 }
  })

  
  const fileName = `Laporan_BerasPlus_${startDate}_sd_${endDate}.pdf`
  doc.save(fileName)
}
