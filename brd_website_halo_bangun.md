# Business Requirements Document (BRD)
**Nama Proyek:** Pengembangan Website Company Profile & Sistem Manajemen Proyek Konstruksi (ERP/Portal) **Halo Bangun**  
**Tanggal:** 14 November 2026  
**Versi:** 1.0  

---

## 1. Ringkasan Eksekutif & Tujuan Bisnis

### 1.1 Latar Belakang
Halo Bangun merupakan perusahaan jasa konstruksi, arsitektur, dan pengadaan yang beroperasi di wilayah D.I. Yogyakarta, Jawa Tengah, dan Jawa Barat. Untuk meningkatkan kredibilitas perusahaan, transparansi kepada klien, serta efisiensi kontrol operasional dan keuangan proyek secara *real-time*, Halo Bangun membutuhkan platform web terpadu yang menggabungkan **Company Profile** (publik) dan **Sistem Informasi Manajemen Proyek & Portal Klien** (internal/terbatas).

### 1.2 Tujuan Bisnis
1. **Akuisisi & Kepercayaan Klien:** Menampilkan portofolio proyek dan standar layanan profesional untuk menarik calon klien baru.
2. **Transparansi Proyek (*Live Project Monitor*):** Memberikan akses pemantauan progres fisik (Kurva S, foto harian, CCTV) dan administrasi keuangan kepada klien secara mandiri.
3. **Kontrol Operasional & Keuangan:** Mendigitalisasi laporan pengawasan harian/mingguan, pengadaan material, inventaris alat, penggajian tenaga kerja, serta perhitungan laba rugi dan alokasi dana per proyek.
4. **Keamanan & Privasi Data:** Menerapkan pembatasan hak akses berbasis peran (*Role-Based Access Control*) untuk menjaga kerahasiaan margin laba dan data internal antar divisi.

---

## 2. Ruang Lingkup Proyek (*Scope*)

### 2.1 Dalam Ruang Lingkup (*In-Scope*)
* **Modul Publik (Company Profile):** Halaman Beranda, Tentang Kami, Layanan, Portofolio (dengan kategori khusus), Artikel Konstruksi, Area Kerja & Kontak, serta FAQ.
* **Modul Autentikasi & Manajemen Peran (RBAC):** Sistem *login* multi-peran (Klien Proyek, Mandor/Kepala Tukang, Pengawas Lapangan/PM, Finance Admin, Direktur/Owner).
* **Dashboard Klien (Portal Klien):** Pemantauan dokumen proyek, progres Kurva S, galeri foto, tautan/integrasi CCTV, status pembayaran/kwitansi, pengajuan/persetujuan Addendum (*Change Order*), masukan/saran, serta penguncian otomatis BAST & Garansi.
* **Dashboard Pengawas Lapangan / Project Manager:** Input laporan pengawasan harian & mingguan, unggah foto progres, pembaruan Kurva S, rencana kerja, pengadaan material & nota pembelian, inventaris peralatan/sewa, dan slip gaji.
* **Dashboard Keuangan (Finance Admin):** Rekapitulasi RAB vs Biaya Riil, pencatatan material manual, pengelolaan termin & kwitansi, serta kalkulator otomatis pembagian laba, pajak, zakat, operasional, dana mitigasi, dana pengembangan usaha, dan hutang piutang per proyek.
* **Dashboard Direktur / Owner:** Akses penuh (*Super Admin*) ke seluruh modul serta alur inisiasi proyek baru (unggah SPKPR, Desain Arsitektur, RAB, Rencana Kerja, dan Kwitansi awal).

### 2.2 Di Luar Ruang Lingkup (*Out-of-Scope*)
* Pengembangan sistem *streaming* video CCTV mandiri dari nol (integrasi menggunakan tautan/SDK aplikasi CCTV pihak ketiga yang sudah ada).
* *Payment Gateway* otomatis (pembayaran tetap menggunakan transfer manual dan verifikasi unggah bukti bayar/kwitansi).

---

## 3. Profil Perusahaan & Informasi Dasar (Konten Publik)

* **Identitas:** Logo dan Profil Perusahaan (Deskripsi, Visi & Misi, Nilai Perusahaan, dan Kolase Tim Manajemen).
* **Layanan Utama:**
  1. Jasa Desain Arsitektur
  2. Jasa Renovasi & Pembangunan
  3. Jasa Perhitungan RAB
  4. Jasa Pengurusan PBG (khusus area D.I. Yogyakarta)
* **Alur Pemesanan:** Visualisasi tahapan kerja dari konsultasi hingga serah terima.
* **Area Layanan:** D.I. Yogyakarta, Jawa Tengah, dan Jawa Barat.
* **Informasi Operasional:**
  * **Jam Operasional:** 08.00 – 21.00 WIB
  * **Alamat Kantor:** Jawa Barat & Yogyakarta
  * **Kontak:** WhatsApp `0821-3545-0404` (terintegrasi tombol *floating* WA) dan tautan akun media sosial resmi.
* **Keunggulan Kompetitif (FAQ / *Why Choose Us*):** Tenaga kerja berpengalaman, perjanjian & garansi tertulis, RAB mengikat tanpa biaya tersembunyi, laporan progres berkala + *live monitor* CCTV, serta akses *dashboard* khusus klien.

---

## 4. Kebutuhan Fungsional (*Functional Requirements*)

### 4.1 Modul Website Publik (*Front-End*)
* **FR-01 (Halaman Utama & Navigasi):** Menampilkan ringkasan profil, layanan, proyek unggulan, keunggulan perusahaan, dan akses masuk (*Login*) ke *Dashboard* Klien/Internal.
* **FR-02 (Galeri Portofolio Terkategori):** Sistem CMS untuk mengelola dan memfilter portofolio berdasarkan kategori:
  * *Desain Arsitektur:* Cluster, rumah tinggal, kosan, café, kantor, asrama mahasiswa, ruko, dan pengadaan barang pemerintah (mencakup data historis proyek seperti Rumah Ibu Theresia, Ndalem Sukoharjo 1 & 2, Café Mas Reza, Asrama Mahasiswa Sumbawa Barat, Desain XT Square, dll.).
  * *Pembangunan & Renovasi:* Dokumentasi hasil dan proses pengerjaan.
  * *Seremonial & Legalitas:* Dokumentasi penandatanganan kontrak, peletakan batu pertama, penyerahan PBG, dan serah terima unit (BAST).
  * *Kolase:* Kolase pembangunan dan tim manajemen.
* **FR-03 (Blog / Artikel Konstruksi):** Fitur CMS artikel edukasi seputar dunia konstruksi yang dapat dipublikasikan secara berkala (*on-going*).

### 4.2 Matriks Hak Akses Pengguna (*Role-Based Access Control*)
Sistem wajib membatasi visibilitas data berdasarkan 5 peran utama berikut:

| Fitur / Modul Platform | Klien Proyek | Mandor / Kepala Tukang | Pengawas / Project Manager | Finance Admin | Direktur / Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Live Stream CCTV Lapangan** | Lihat | Tidak | Lihat | Lihat | Lihat Semua |
| **Galeri Foto & Laporan Progres** | Lihat | Lihat | Upload & Edit | Tidak | Lihat Semua |
| **Kurva S Fisik (Rencana vs Riil)** | Lihat | Tidak | Verifikasi & Edit | Tidak | Full Access |
| **Status Termin Dana Klien** | Lihat Status Bayar | DILARANG | DILARANG | Input Tagihan | Full Access |
| **Cashflow Riil & Margin Laba** | DILARANG | DILARANG | DILARANG | Input Biaya | Full Laba/Rugi |
| **Change Order (COR) / Addendum** | Approve / Tolak | Tidak | Ajukan Draft ADD | Hitung Biaya | Full Access |
| **Dokumen SPKPR** | Lihat Terverifikasi | DILARANG | DILARANG | Lihat | Full Access |
| **BAST & Garansi** | Lihat (Terbuka saat lunas/selesai) | DILARANG | Lihat | Lihat | Full Access |
| **Pengadaan Material & Nota** | DILARANG | Lihat / Request | Upload Nota & Form Beli | Verifikasi & Input Biaya | Full Access |
| **Inventaris Alat & Sewa** | DILARANG | Lihat | Input & Kelola | Lihat | Full Access |
| **Slip Gaji & Operasional** | DILARANG | Lihat Slip Pribadi | Input / Lihat Slip Pribadi | Input & Rekap Gaji | Full Access |

*(Catatan: Peran Mandor/Kepala Tukang dibatasi secara ketat agar tidak dapat mengakses data finansial, kontrak SPKPR, Kurva S, maupun CCTV).*

### 4.3 Modul Dashboard Klien (*Klien Portal*)
* **FR-04 (Dokumen Kontrak & Perencanaan):** Klien dapat melihat dan mengunduh dokumen terverifikasi meliputi SPKPR, Desain Arsitektur, dan RAB.
* **FR-05 (Monitoring Progres):**
  * Menampilkan grafik **Kurva S** (perbandingan persentase rencana vs realisasi mingguan).
  * Galeri foto progres harian (maksimal 3 foto per hari yang diunggah pengawas).
  * Akses pemantauan langsung (*Live CCTV*) yang terhubung ke aplikasi pihak ketiga.
* **FR-06 (Keuangan & Termin):** Melihat jadwal termin pembayaran, status pelunasan, mengunggah bukti transfer pembayaran, serta mengunduh kwitansi resmi.
* **FR-07 (Manajemen Addendum / Biaya Tambah Kurang):** Klien menerima notifikasi pengajuan pekerjaan tambah/kurang (COR/ADD), dapat melihat rincian biaya, serta melakukan aksi **Approve (Setujui)** atau **Tolak** secara digital.
* **FR-08 (Masukan & Saran):** Form interaktif bagi klien untuk menyampaikan catatan atau evaluasi selama masa pembangunan.
* **FR-09 (Sistem Kunci BAST & Garansi):** Dokumen Berita Acara Serah Terima (BAST) dan Sertifikat Garansi berstatus **Terkunci (*Locked*)** selama proyek berjalan, dan otomatis **Terbuka (*Unlocked*)** setelah status proyek dinyatakan selesai 100% dan seluruh kewajiban termin lunas.

### 4.4 Modul Dashboard Pengawas Lapangan / Project Manager
* **FR-10 (Laporan Pengawasan Harian & Mingguan):** Form digital (dapat diedit manual sebelum disubmit) untuk mencatat aktivitas lapangan, cuaca, jumlah tukang, kendala, serta unggah maksimal 3 foto progres harian yang langsung tersinkronisasi ke *Dashboard* Klien dan Keuangan.
* **FR-11 (Rencana Kerja & Kurva S):** Pengisian dan pembaruan Rencana Kerja Mingguan/Bulanan serta input persentase realisasi progres mingguan pada Kurva S.
* **FR-12 (Pengadaan Material & Pembelian):**
  * Form pencatatan pembelian material (nama barang, kuantitas, nama toko, nomor WhatsApp toko, harga).
  * Fitur unggah foto nota/kwitansi pembelian barang.
* **FR-13 (Inventaris Peralatan & Sewa):** Modul pencatatan stok peralatan tukang milik perusahaan dan daftar barang/alat yang disewa beserta durasi sewanya.
* **FR-14 (Dokumen Teknis & Penggajian):** Akses melihat Dokumen Desain Arsitektur dan melihat rincian slip gaji (gaji pokok, dana operasional, dan bonus).

### 4.5 Modul Dashboard Keuangan (*Finance Admin*)
* **FR-15 (Kontrol Anggaran RAB vs Realisasi):** Perbandingan otomatis dan manual antara nilai RAB awal (ditambah Addendum yang disetujui) dengan total pengeluaran riil pembelian material dan upah di lapangan.
* **FR-16 (Pencatatan Material & Nota):** Rekapitulasi seluruh nota pembelian dari pengawas serta fitur input manual untuk pembelanjaan material yang dilakukan langsung oleh bagian keuangan.
* **FR-17 (Manajemen Termin & Kwitansi):** Pembuatan tagihan termin klien, verifikasi bukti bayar, dan penerbitan/unggah kwitansi pembayaran.
* **FR-18 (Kalkulator Alokasi Laba & Akuntansi Proyek):** Fitur perhitungan otomatis per proyek yang membagi dan melacak pos-pos berikut:
  * Laba Bersih Proyek
  * Kewajiban Pajak
  * Alokasi Zakat Perusahaan
  * Biaya Operasional Kantor
  * Dana Mitigasi Risiko
  * Dana Pengembangan Usaha
  * Pencatatan Hutang & Piutang per proyek
* **FR-19 (Manajemen Payroll / Slip Gaji):** Input dan penerbitan slip gaji tenaga kerja/pengawas (komponen gaji pokok, operasional, dan bonus).

### 4.6 Modul Dashboard Direktur / Owner (*Super Admin*)
* **FR-20 (Inisiasi Proyek Baru / *Project Onboarding*):** Alur kerja wajib bagi Owner saat mendaftarkan proyek baru ke dalam sistem dengan mengunggah paket dokumen awal:
  1. Dokumen SPKPR
  2. Dokumen Desain Arsitektur
  3. Dokumen RAB (dan struktur Addendum jika ada)
  4. Rencana Kerja Utama
  5. Foto Kwitansi Pembayaran Awal (DP)
* **FR-21 (Pengawasan Eksekutif Menyeluruh):** Akses penuh untuk melihat, mengedit, menyetujui, dan memantau seluruh proyek aktif, laporan keuangan, arus kas riil, margin laba gabungan, hingga akses penuh seluruh kamera CCTV proyek.

---

## 5. Alur Kerja Utama (*Core Workflows*)

1. **Alur Inisiasi Proyek:**
   Owner membuat akun proyek & akun klien $\rightarrow$ Owner mengunggah SPKPR, Desain Arsitektur, RAB, Rencana Kerja, dan Kwitansi DP $\rightarrow$ Sistem mendistribusikan akses dokumen ke Klien, Finance, dan Pengawas sesuai matriks RBAC.
2. **Alur Laporan Harian & Progres:**
   Pengawas mengisi form pengawasan harian + unggah maks. 3 foto $\rightarrow$ Sistem memperbarui galeri foto di Dashboard Klien, Finance, dan Owner secara *real-time* $\rightarrow$ Setiap akhir pekan, PM/Pengawas memperbarui persentase Kurva S.
3. **Alur Pekerjaan Tambah Kurang (*Addendum*):**
   PM/Pengawas mengajukan draf item pekerjaan tambah/kurang $\rightarrow$ Finance menghitung selisih biaya $\rightarrow$ Sistem mengirim notifikasi ke Klien $\rightarrow$ Klien klik *Approve/Tolak* $\rightarrow$ Jika disetujui, nilai kontrak dan RAB otomatis terbarui.
4. **Alur Penyelesaian Proyek (BAST):**
   Progres Kurva S mencapai 100% $\rightarrow$ Finance memverifikasi pelunasan seluruh termin $\rightarrow$ Owner/Finance mengunggah dokumen BAST & Garansi $\rightarrow$ Sistem membuka kunci (*unlock*) dokumen BAST & Garansi di Dashboard Klien.

---

## 6. Kebutuhan Non-Fungsional (*Non-Functional Requirements*)

* **Keamanan Data (*Security*):** Enkripsi kata sandi, proteksi *route* API berdasarkan peran (*RBAC middleware*), serta pembatasan akses unduh/lihat dokumen sensitif (RAB, Laba Rugi, SPKPR) agar tidak dapat diakses melalui URL langsung tanpa sesi *login* yang sah.
* **Responsivitas & Kompatibilitas (*Mobile-First*):** Antarmuka *Dashboard* Pengawas dan Mandor wajib dioptimalkan untuk perangkat *smartphone* (mengingat pengisian laporan harian, foto progres, dan unggah nota dilakukan langsung di lokasi proyek).
* **Performa & Kompresi Media:** Sistem harus melakukan kompresi otomatis pada foto progres lapangan dan foto nota pembelian agar hemat penyimpanan server namun tetap terbaca jelas.
* **Integrasi Pihak Ketiga:** Menyediakan modul *embed* / *deep-link* yang stabil untuk menghubungkan kredensial CCTV proyek ke aplikasi pemantau CCTV eksternal.