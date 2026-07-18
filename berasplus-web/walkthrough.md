# Walkthrough Migrasi Arsitektur V2 (Single Product Master) - FINAL UPDATE

Sistem BerasPlus POS berhasil dimigrasi secara menyeluruh ke **Arsitektur V2**, di mana seluruh barang operasional toko (baik bahan baku, barang curah, kemasan plastik, maupun beras kemasan) sekarang disatukan ke dalam satu tabel Master Produk yang terpusat.

## Integrasi & Kompatibilitas Aplikasi Android POS (Tablet)

Untuk memastikan aplikasi kasir tablet Android yang ada tetap terintegrasi secara mulus pasca-migrasi ke arsitektur database V2, kami telah menambahkan lapisan kompatibilitas (*compatibility layers*) pada database Supabase:

1. **Pembuatan View Kompatibilitas:**
   - **`public.selling_products`**: Menyediakan representasi virtual dari produk jadi untuk katalog kasir di aplikasi Android, memetakan kolom baru seperti `product_code` ke `sku` dan menyaring beras yang memiliki harga jual (`sell_price > 0`).
   - **`public.sales_transaction_items`**: Menyediakan representasi virtual dari item transaksi ritel dengan trigger `INSTEAD OF INSERT` yang secara otomatis mengarahkan data masukan dari aplikasi kasir ke tabel `sales_items` V2.

2. **Dukungan Kolom Legacy pada `sales_transactions`:**
   - Kami menambahkan kembali kolom kompatibilitas (`subtotal`, `discount`, `tax`, `total`, `offline_sync_token`) ke tabel `sales_transactions` agar mendukung fungsi *offline-sync* dan *checkout* langsung dari aplikasi Android tanpa error kolom hilang.
   - Trigger otomatis ditambahkan untuk menyinkronkan total pembayaran ke kolom `total_amount` V2.

3. **Restorasi RPC Functions untuk Android:**
   - Kami membangun kembali fungsi RPC `process_sales_transaction` (untuk sinkronisasi luring/offline sync) dan `process_pos_transaction` (untuk transaksi online kasir) agar memproses data berbasis struktur V2 (`products`, `sales_transactions`, `sales_items`, `sales_payments`) secara aman.

4. **Penyemaian Data (*Seeding*) Produk Jual:**
   - Menyemaikan empat varian beras komersial baru dengan harga jual ke tabel `products` yang secara otomatis langsung muncul di katalog kasir Android:
     - **Beras Pandan Wangi 5 Kg** (SKU: `B-PW-05`, Harga: Rp75.000)
     - **Beras Pandan Wangi 10 Kg** (SKU: `B-PW-10`, Harga: Rp148.000)
     - **Beras Pandan Wangi 20 Kg** (SKU: `B-PW-20`, Harga: Rp290.000)
     - **Beras Ketan Putih 1 Kg** (SKU: `B-KTN-01`, Harga: Rp18.000)

## Verifikasi & Testing (Fase 6)

Sekranag aplikasi Anda di Vercel dan aplikasi kasir tablet Android sudah terhubung penuh ke skema database baru dan seluruh halaman (termasuk dashboard utama, sisa saldo stok, dan laporan) dapat dibuka secara lancar.

Kami merekomendasikan langkah pengujian manual berikut:
1. **Pengadaan**: Tambahkan stok beras/kemasan melalui menu *Procurement* -> *Direct Purchase*, lalu selesaikan transaksi dengan menerima barang (Receive Goods).
2. **Racikan**: Masuk ke menu *Blending*, pilih beras curah dan kemasan plastik yang sudah di-restock tadi, lalu jalankan proses pencampuran (Blending) untuk menghasilkan beras kemasan bermerek.
3. **Penjualan**: Buka menu *POS Kasir* (`/dashboard/sales/pos`) dan coba lakukan transaksi penjualan pada beras kemasan hasil racikan.
4. **Validasi**: Periksa halaman *Sisa Saldo Stok* dan *Laporan & Ledger* untuk memastikan pergerakan kuantitas stok bertambah/berkurang dan nilai HPP rata-rata terhitung dengan benar.
