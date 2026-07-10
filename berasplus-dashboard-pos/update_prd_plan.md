# Rencana Pembaruan PRD (Product Requirements Document)

Berdasarkan progres terbaru dan instruksi Anda, berikut adalah poin-poin yang akan diperbarui di dalam dokumen `All Docs BerasPlus POS.txt`:

1.  **Pembaruan Arsitektur Inventaris (Qty vs Total Kg)**:
    -   Merevisi prinsip dasar pencatatan kuantitas di Bab 5.
    -   Menjelaskan bahwa semua input user akan menggunakan satuan alami (Pcs, Pak, Karung), namun sistem secara otomatis mengkonversi dan menyimpan nilai `total_kg` secara independen untuk menjaga akurasi neraca massa dan perhitungan HPP.
    -   Memperbarui struktur database (tabel `direct_purchase_items` dan `production_batch_outputs`) di bagian penjelasan teknis.

2.  **Pembaruan Modul HPP Moving Average**:
    -   Menambahkan dokumentasi bahwa HPP sekarang dihitung secara *real-time* (otomatis di *backend* Supabase menggunakan RPC `process_inventory_movement`) setiap kali ada penerimaan barang (Goods Receipt) maupun produksi.

3.  **Pembaruan Modul Repacking (Pengemasan Ulang)**:
    -   Memperbarui status fitur Repacking menjadi "Selesai" (Implemented).
    -   Menyesuaikan penamaan parameter output pada Repacking dan Mixing menjadi `quantity_pcs` dan `total_weight_kg`.

4.  **Penambahan Kebutuhan Baru: Dynamic Owner Dashboard Configuration**:
    -   Menambahkan bab/klausul baru (misal di Bab 18: System Configuration) yang secara eksplisit menyatakan: *"Seluruh parameter sistem (seperti Kategori Produk, Satuan Pengukuran, Faktor Konversi Unit, Manajemen Toko, dan Manajemen Pengguna) WAJIB dapat dikonfigurasi secara langsung dan dinamis melalui UI Web Dashboard Owner, tanpa memerlukan intervensi langsung ke database backend."*
    -   Menambahkan fitur CRUD (Create, Read, Update, Delete) untuk Master Data pendukung tersebut di matriks Hak Akses Owner.

## Pendekatan Eksekusi:
Karena dokumen PRD Anda (`All Docs BerasPlus POS.txt`) sangat panjang (~1000 baris), saya akan membuat skrip Python (sementara) yang akan membaca dokumen tersebut, menyisipkan dan merevisi paragraf yang relevan secara presisi, lalu menyimpannya kembali. Saya juga akan membuat salinan *backup* dari dokumen asli sebelum melakukan perubahan.

Apakah rencana pembaruan dokumen PRD ini sudah sesuai dengan ekspektasi Anda?
