const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data Halo Bangun...');

  // 1. Bersihkan data lama jika ada
  await prisma.clientFeedback.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.projectFinancialAllocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.equipmentInventory.deleteMany();
  await prisma.materialPurchase.deleteMany();
  await prisma.addendum.deleteMany();
  await prisma.sCurveProgress.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.projectDocument.deleteMany();
  await prisma.project.deleteMany();
  await prisma.article.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // 2. Buat akun untuk 5 Role
  console.log('👤 Membuat akun pengguna untuk 5 Role...');
  
  const owner = await prisma.user.create({
    data: {
      name: 'Bpk. Arga Pramudya, S.T.',
      email: 'owner@halobangun.id',
      password: hashedPassword,
      role: 'OWNER',
      phone: '0821-3545-0404',
      designation: 'Direktur Utama / Founder',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const finance = await prisma.user.create({
    data: {
      name: 'Ibu Ratna Dewi, S.E.',
      email: 'finance@halobangun.id',
      password: hashedPassword,
      role: 'FINANCE',
      phone: '0812-3456-7890',
      designation: 'Finance & Accounting Lead',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const pm = await prisma.user.create({
    data: {
      name: 'Dimas Pratama, S.T.',
      email: 'pm@halobangun.id',
      password: hashedPassword,
      role: 'PM',
      phone: '0813-9876-5432',
      designation: 'Senior Project Manager / Pengawas',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const mandor = await prisma.user.create({
    data: {
      name: 'Pak Sukirno',
      email: 'mandor@halobangun.id',
      password: hashedPassword,
      role: 'MANDOR',
      phone: '0857-1122-3344',
      designation: 'Mandor & Kepala Tukang Lapangan',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const client = await prisma.user.create({
    data: {
      name: 'Ibu Theresia Wulandari',
      email: 'client@halobangun.id',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '0818-5544-3322',
      designation: 'Klien Proyek Rumah Tinggal',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const clientReza = await prisma.user.create({
    data: {
      name: 'Mas Reza Fahlevi',
      email: 'reza@gmail.com',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '0819-2233-4455',
      designation: 'Owner Café Mas Reza',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  const clientSukoharjo = await prisma.user.create({
    data: {
      name: 'Bpk. H. Sutrisno',
      email: 'sutrisno@gmail.com',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '0812-7788-9900',
      designation: 'Pemilik Ndalem Sukoharjo 1',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Proyek 1: ONGOING (Rumah Ibu Theresia)
  console.log('🏗️ Membuat Proyek 1: Rumah Tinggal Ibu Theresia (ONGOING)...');
  const project1 = await prisma.project.create({
    data: {
      name: 'Pembangunan Rumah Tinggal 2 Lantai Ibu Theresia',
      category: 'PEMBANGUNAN',
      location: 'Jl. Kaliurang KM 8.5, Sleman, D.I. Yogyakarta',
      client_id: client.id,
      pm_id: pm.id,
      status: 'ONGOING',
      contract_value: 850000000,
      cctv_url: 'https://cctv.halobangun.id/stream/cam-theresia-01',
      bast_unlocked: false,
      startDate: new Date('2026-09-01'),
      targetCompletionDate: new Date('2027-02-28'),
    },
  });

  // Dokumen Proyek 1
  await prisma.projectDocument.createMany({
    data: [
      {
        project_id: project1.id,
        doc_type: 'SPKPR',
        title: 'Surat Perjanjian Kerja & Pelaksanaan Renovasi (SPKPR)',
        file_url: '/documents/spkpr-theresia.pdf',
        is_locked: false,
      },
      {
        project_id: project1.id,
        doc_type: 'DESAIN_ARS',
        title: 'Gambar Kerja & Desain Arsitektur 3D Lengkap',
        file_url: '/documents/desain-arsitektur-theresia.pdf',
        is_locked: false,
      },
      {
        project_id: project1.id,
        doc_type: 'RAB',
        title: 'Rencana Anggaran Biaya (RAB) Final Disepakati',
        file_url: '/documents/rab-final-theresia.pdf',
        is_locked: false,
      },
      {
        project_id: project1.id,
        doc_type: 'RENCANA_KERJA',
        title: 'Time Schedule & Rencana Kerja Mingguan',
        file_url: '/documents/rencana-kerja-theresia.pdf',
        is_locked: false,
      },
      {
        project_id: project1.id,
        doc_type: 'BAST',
        title: 'Berita Acara Serah Terima (BAST)',
        file_url: '/documents/bast-theresia.pdf',
        is_locked: true, // Terkunci hingga 100% dan lunas
      },
      {
        project_id: project1.id,
        doc_type: 'GARANSI',
        title: 'Sertifikat Garansi Konstruksi & Kebocoran 6 Bulan',
        file_url: '/documents/garansi-theresia.pdf',
        is_locked: true,
      },
    ],
  });

  // Kurva S Proyek 1 (Minggu 1 - 10)
  await prisma.sCurveProgress.createMany({
    data: [
      { project_id: project1.id, week_number: 1, planned_percentage: 5.0, actual_percentage: 5.5 },
      { project_id: project1.id, week_number: 2, planned_percentage: 12.0, actual_percentage: 13.0 },
      { project_id: project1.id, week_number: 3, planned_percentage: 20.0, actual_percentage: 21.0 },
      { project_id: project1.id, week_number: 4, planned_percentage: 30.0, actual_percentage: 29.5 },
      { project_id: project1.id, week_number: 5, planned_percentage: 42.0, actual_percentage: 43.0 },
      { project_id: project1.id, week_number: 6, planned_percentage: 55.0, actual_percentage: 56.5 },
      { project_id: project1.id, week_number: 7, planned_percentage: 65.0, actual_percentage: 64.0 },
      { project_id: project1.id, week_number: 8, planned_percentage: 75.0, actual_percentage: 74.8 },
      { project_id: project1.id, week_number: 9, planned_percentage: 85.0, actual_percentage: 82.0 },
      { project_id: project1.id, week_number: 10, planned_percentage: 92.0, actual_percentage: 0.0 },
      { project_id: project1.id, week_number: 11, planned_percentage: 97.0, actual_percentage: 0.0 },
      { project_id: project1.id, week_number: 12, planned_percentage: 100.0, actual_percentage: 0.0 },
    ],
  });

  // Laporan Harian Pengawas Proyek 1
  await prisma.dailyReport.createMany({
    data: [
      {
        project_id: project1.id,
        date: new Date('2026-11-13'),
        weather: 'Cerah',
        worker_count: 14,
        notes: 'Pengecoran plat atap lantai 2 selesai pukul 16.30 WIB. Pemasangan bekisting tangga selesai diperiksa dan siap cor besok. Kualitas adukan beton mutu K-250 sesuai spesifikasi.',
        photos: [
          'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80',
        ],
        created_by: pm.id,
      },
      {
        project_id: project1.id,
        date: new Date('2026-11-14'),
        weather: 'Berawan Sore Hujan Ringan',
        worker_count: 12,
        notes: 'Plesteran dinding sisi barat lantai 1 dan instalasi pipa air bersih kamar mandi utama. Semua material pasir pasang dan pipa PVC sudah tiba tepat waktu.',
        photos: [
          'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
        ],
        created_by: pm.id,
      },
    ],
  });

  // Pembelian Material Proyek 1
  await prisma.materialPurchase.createMany({
    data: [
      {
        project_id: project1.id,
        item_name: 'Semen Gresik 40kg',
        quantity: '80 Sak',
        store_name: 'TB. Makmur Sentosa Sleman',
        store_wa: '081223344556',
        total_price: 5200000,
        receipt_url: '/receipts/nota-semen-80sak.jpg',
        input_by_role: 'PM',
      },
      {
        project_id: project1.id,
        item_name: 'Besi Beton Ulir 13mm SNI',
        quantity: '50 Batang',
        store_name: 'CV. Baja Mandiri Utama',
        store_wa: '081399887766',
        total_price: 6850000,
        receipt_url: '/receipts/nota-besi-ulir.jpg',
        input_by_role: 'PM',
      },
      {
        project_id: project1.id,
        item_name: 'Pasir Muntilan Grade A',
        quantity: '3 Truk Colt',
        store_name: 'Depo Pasir Merapi Sleman',
        store_wa: '085612349876',
        total_price: 4500000,
        receipt_url: '/receipts/nota-pasir-3truk.jpg',
        input_by_role: 'MANDOR',
      },
      {
        project_id: project1.id,
        item_name: 'Granit Tile 60x60 Glazed Polished',
        quantity: '45 Dus',
        store_name: 'Mitra 10 Maguwoharjo',
        store_wa: '081198761234',
        total_price: 9900000,
        receipt_url: '/receipts/nota-granit-mitra10.jpg',
        input_by_role: 'FINANCE',
      },
    ],
  });

  // Inventaris Peralatan Proyek 1
  await prisma.equipmentInventory.createMany({
    data: [
      {
        project_id: project1.id,
        item_name: 'Mesin Molen Beton Tiger 500L',
        status: 'MILIK_SENDIRI',
        rental_duration: null,
        rental_cost: 0,
        notes: 'Kondisi mesin prima, rutin service oli dan bahan bakar solar.',
      },
      {
        project_id: project1.id,
        item_name: 'Scaffolding Lengkap 1 Set (30 Tumpuk)',
        status: 'SEWA',
        rental_duration: '30 Hari',
        rental_cost: 2100000,
        notes: 'Disewa dari Rental Steger Sleman Jaya s/d akhir bulan November.',
      },
      {
        project_id: project1.id,
        item_name: 'Mesin Potong Keramik & Gurinda Duduk',
        status: 'MILIK_SENDIRI',
        rental_duration: null,
        rental_cost: 0,
        notes: 'Inventaris bengkel kerja internal Halo Bangun.',
      },
    ],
  });

  // Pembayaran Termin Proyek 1
  await prisma.payment.createMany({
    data: [
      {
        project_id: project1.id,
        termin_name: 'Termin 1 (DP & SPK 30%)',
        amount: 255000000,
        status: 'PAID',
        due_date: new Date('2026-09-05'),
        paid_at: new Date('2026-09-04'),
        proof_url: '/proofs/transfer-dp-theresia.jpg',
        receipt_url: '/receipts/kwitansi-resmi-termin1-theresia.pdf',
        notes: 'Lunas via Transfer BCA. Kwitansi resmi telah diterbitkan oleh Finance.',
      },
      {
        project_id: project1.id,
        termin_name: 'Termin 2 (Progres Struktur 30%)',
        amount: 255000000,
        status: 'PAID',
        due_date: new Date('2026-10-15'),
        paid_at: new Date('2026-10-14'),
        proof_url: '/proofs/transfer-termin2-theresia.jpg',
        receipt_url: '/receipts/kwitansi-resmi-termin2-theresia.pdf',
        notes: 'Lunas via Transfer Mandiri setelah verifikasi progres fisik struktur capai 35%.',
      },
      {
        project_id: project1.id,
        termin_name: 'Termin 3 (Progres Finishing 35%)',
        amount: 297500000,
        status: 'PENDING_VERIFICATION',
        due_date: new Date('2026-11-20'),
        paid_at: null,
        proof_url: '/proofs/draft-transfer-termin3.jpg',
        receipt_url: null,
        notes: 'Bukti transfer diunggah klien, sedang menunggu rekonsiliasi bank oleh Finance.',
      },
      {
        project_id: project1.id,
        termin_name: 'Termin 4 (Pelunasan & Retensi 5%)',
        amount: 42500000,
        status: 'UNPAID',
        due_date: new Date('2027-02-28'),
        paid_at: null,
        proof_url: null,
        receipt_url: null,
        notes: 'Jatuh tempo saat serah terima BAST dan sertifikat garansi.',
      },
    ],
  });

  // Addendum (COR/ADD) Proyek 1
  await prisma.addendum.create({
    data: {
      project_id: project1.id,
      description: 'Pekerjaan Tambah: Pembuatan Kanopi Carport Baja Hollow Galvanis + Atap SolarTuff tebal 3mm dan Upgrade Stop Kontak Luar Waterproof.',
      cost_difference: 28500000,
      status: 'APPROVED',
      submitted_by: pm.id,
      client_note: 'Disetujui oleh Ibu Theresia via Portal Klien tanggal 10 November 2026.',
    },
  });

  await prisma.addendum.create({
    data: {
      project_id: project1.id,
      description: 'Pekerjaan Tambah: Penambahan Kisi-kisi Kayu Bengkirai pada Fasad Depan Lantai 2.',
      cost_difference: 14200000,
      status: 'PENDING_CLIENT',
      submitted_by: pm.id,
      client_note: 'Menunggu persetujuan Ibu Theresia di Portal Klien.',
    },
  });

  // Alokasi Finansial Proyek 1
  await prisma.projectFinancialAllocation.create({
    data: {
      project_id: project1.id,
      real_cost: 635000000,
      net_profit: 130000000,
      tax_amount: 17000000,
      zakat_amount: 3250000,
      operational_amount: 35000000,
      mitigation_fund: 15000000,
      business_dev_fund: 14750000,
      debt_receivable_notes: 'Piutang Termin 3 Rp 297.500.000 (status verifikasi). Tidak ada hutang ke toko material.',
    },
  });

  // 4. Proyek 2: ONGOING (Café Mas Reza)
  console.log('🏗️ Membuat Proyek 2: Renovasi Komersial Café Mas Reza (ONGOING)...');
  const project2 = await prisma.project.create({
    data: {
      name: 'Renovasi Arsitektur & Interior Café Mas Reza',
      category: 'RENOVASI',
      location: 'Jl. Raya Sambilegi, Maguwoharjo, D.I. Yogyakarta',
      client_id: clientReza.id,
      pm_id: pm.id,
      status: 'ONGOING',
      contract_value: 420000000,
      cctv_url: 'https://cctv.halobangun.id/stream/cam-reza-cafe',
      bast_unlocked: false,
      startDate: new Date('2026-10-01'),
      targetCompletionDate: new Date('2026-12-20'),
    },
  });

  await prisma.projectDocument.createMany({
    data: [
      {
        project_id: project2.id,
        doc_type: 'SPKPR',
        title: 'Kontrak Kerja Renovasi Café Sambilegi',
        file_url: '/documents/spk-cafe-reza.pdf',
        is_locked: false,
      },
      {
        project_id: project2.id,
        doc_type: 'DESAIN_ARS',
        title: 'Konsep Desain Industrial Modern & Bar Counter',
        file_url: '/documents/desain-cafe-reza.pdf',
        is_locked: false,
      },
      {
        project_id: project2.id,
        doc_type: 'RAB',
        title: 'RAB Renovasi Café & MEP Lighting',
        file_url: '/documents/rab-cafe-reza.pdf',
        is_locked: false,
      },
      {
        project_id: project2.id,
        doc_type: 'BAST',
        title: 'BAST Café Mas Reza',
        file_url: '/documents/bast-cafe.pdf',
        is_locked: true,
      },
    ],
  });

  await prisma.sCurveProgress.createMany({
    data: [
      { project_id: project2.id, week_number: 1, planned_percentage: 10.0, actual_percentage: 12.0 },
      { project_id: project2.id, week_number: 2, planned_percentage: 25.0, actual_percentage: 28.0 },
      { project_id: project2.id, week_number: 3, planned_percentage: 45.0, actual_percentage: 42.0 },
      { project_id: project2.id, week_number: 4, planned_percentage: 60.0, actual_percentage: 61.5 },
      { project_id: project2.id, week_number: 5, planned_percentage: 80.0, actual_percentage: 78.0 },
      { project_id: project2.id, week_number: 6, planned_percentage: 95.0, actual_percentage: 0.0 },
      { project_id: project2.id, week_number: 7, planned_percentage: 100.0, actual_percentage: 0.0 },
    ],
  });

  await prisma.payment.createMany({
    data: [
      {
        project_id: project2.id,
        termin_name: 'Termin 1 (DP 40%)',
        amount: 168000000,
        status: 'PAID',
        due_date: new Date('2026-10-02'),
        paid_at: new Date('2026-10-02'),
        proof_url: '/proofs/transfer-dp-reza.jpg',
        receipt_url: '/receipts/kwitansi-dp-reza.pdf',
        notes: 'Lunas via Transfer BCA.',
      },
      {
        project_id: project2.id,
        termin_name: 'Termin 2 (Progress 40%)',
        amount: 168000000,
        status: 'PAID',
        due_date: new Date('2026-11-05'),
        paid_at: new Date('2026-11-06'),
        proof_url: '/proofs/transfer-termin2-reza.jpg',
        receipt_url: '/receipts/kwitansi-termin2-reza.pdf',
        notes: 'Lunas diverifikasi Finance.',
      },
      {
        project_id: project2.id,
        termin_name: 'Termin 3 (Pelunasan 20%)',
        amount: 84000000,
        status: 'UNPAID',
        due_date: new Date('2026-12-20'),
        paid_at: null,
        proof_url: null,
        receipt_url: null,
        notes: 'Jatuh tempo saat serah terima BAST kafe.',
      },
    ],
  });

  await prisma.projectFinancialAllocation.create({
    data: {
      project_id: project2.id,
      real_cost: 310000000,
      net_profit: 68000000,
      tax_amount: 8400000,
      zakat_amount: 1700000,
      operational_amount: 18000000,
      mitigation_fund: 7000000,
      business_dev_fund: 6900000,
      debt_receivable_notes: 'Piutang sisa termin 3 Rp 84.000.000.',
    },
  });

  // 5. Proyek 3: COMPLETED (Ndalem Sukoharjo 1)
  console.log('🏗️ Membuat Proyek 3: Ndalem Sukoharjo 1 (COMPLETED & BAST UNLOCKED)...');
  const project3 = await prisma.project.create({
    data: {
      name: 'Pembangunan Ndalem Sukoharjo 1',
      category: 'PEMBANGUNAN',
      location: 'Kec. Baki, Kab. Sukoharjo, Jawa Tengah',
      client_id: clientSukoharjo.id,
      pm_id: pm.id,
      status: 'COMPLETED',
      contract_value: 650000000,
      cctv_url: 'https://cctv.halobangun.id/archive/sukoharjo-1',
      bast_unlocked: true, // Proyek selesai 100% dan lunas -> BAST terbuka
      startDate: new Date('2026-02-01'),
      targetCompletionDate: new Date('2026-08-15'),
    },
  });

  await prisma.projectDocument.createMany({
    data: [
      {
        project_id: project3.id,
        doc_type: 'SPKPR',
        title: 'SPKPR Pembangunan Ndalem Sukoharjo 1',
        file_url: '/documents/spkpr-sukoharjo1.pdf',
        is_locked: false,
      },
      {
        project_id: project3.id,
        doc_type: 'DESAIN_ARS',
        title: 'Desain Arsitektur Modern Tropis Ndalem Sukoharjo',
        file_url: '/documents/desain-sukoharjo1.pdf',
        is_locked: false,
      },
      {
        project_id: project3.id,
        doc_type: 'RAB',
        title: 'RAB Pelaksanaan Selesai',
        file_url: '/documents/rab-sukoharjo1.pdf',
        is_locked: false,
      },
      {
        project_id: project3.id,
        doc_type: 'BAST',
        title: 'Berita Acara Serah Terima (BAST) No. 042/HB/BAST/VIII/2026',
        file_url: '/documents/bast-sukoharjo1-resmi.pdf',
        is_locked: false, // Terbuka karena proyek COMPLETED & lunas
      },
      {
        project_id: project3.id,
        doc_type: 'GARANSI',
        title: 'Sertifikat Garansi Pemeliharaan Bangunan (Berlaku s/d Feb 2027)',
        file_url: '/documents/garansi-sukoharjo1.pdf',
        is_locked: false, // Terbuka
      },
    ],
  });

  await prisma.sCurveProgress.createMany({
    data: [
      { project_id: project3.id, week_number: 1, planned_percentage: 10.0, actual_percentage: 10.0 },
      { project_id: project3.id, week_number: 2, planned_percentage: 25.0, actual_percentage: 26.0 },
      { project_id: project3.id, week_number: 3, planned_percentage: 50.0, actual_percentage: 51.0 },
      { project_id: project3.id, week_number: 4, planned_percentage: 75.0, actual_percentage: 76.5 },
      { project_id: project3.id, week_number: 5, planned_percentage: 90.0, actual_percentage: 92.0 },
      { project_id: project3.id, week_number: 6, planned_percentage: 100.0, actual_percentage: 100.0 },
    ],
  });

  await prisma.payment.createMany({
    data: [
      {
        project_id: project3.id,
        termin_name: 'Termin 1 (DP 30%)',
        amount: 195000000,
        status: 'PAID',
        due_date: new Date('2026-02-05'),
        paid_at: new Date('2026-02-04'),
        proof_url: '/proofs/transfer-dp-sukoharjo.jpg',
        receipt_url: '/receipts/kwitansi-dp-sukoharjo.pdf',
        notes: 'Lunas.',
      },
      {
        project_id: project3.id,
        termin_name: 'Termin 2 (Struktur 40%)',
        amount: 260000000,
        status: 'PAID',
        due_date: new Date('2026-05-10'),
        paid_at: new Date('2026-05-09'),
        proof_url: '/proofs/transfer-termin2-sukoharjo.jpg',
        receipt_url: '/receipts/kwitansi-termin2-sukoharjo.pdf',
        notes: 'Lunas.',
      },
      {
        project_id: project3.id,
        termin_name: 'Termin 3 (Pelunasan & BAST 30%)',
        amount: 195000000,
        status: 'PAID',
        due_date: new Date('2026-08-15'),
        paid_at: new Date('2026-08-14'),
        proof_url: '/proofs/transfer-pelunasan-sukoharjo.jpg',
        receipt_url: '/receipts/kwitansi-pelunasan-sukoharjo.pdf',
        notes: 'Lunas 100%. BAST dan Garansi diserahkan.',
      },
    ],
  });

  await prisma.projectFinancialAllocation.create({
    data: {
      project_id: project3.id,
      real_cost: 495000000,
      net_profit: 98000000,
      tax_amount: 13000000,
      zakat_amount: 2450000,
      operational_amount: 24000000,
      mitigation_fund: 9000000,
      business_dev_fund: 8550000,
      debt_receivable_notes: 'Proyek lunas 100%, seluruh alokasi dana telah disalurkan.',
    },
  });

  // 6. Data Penggajian (Payroll)
  console.log('💵 Membuat Data Penggajian (Payrolls)...');
  await prisma.payroll.createMany({
    data: [
      {
        user_id: pm.id,
        project_id: project1.id,
        period: 'November 2026',
        base_salary: 8500000,
        operational_allowance: 2000000,
        bonus: 1500000,
        total_amount: 12000000,
        slip_url: '/slips/slip-gaji-pm-nov-2026.pdf',
        status: 'PAID',
      },
      {
        user_id: mandor.id,
        project_id: project1.id,
        period: 'Minggu ke-2 November 2026',
        base_salary: 2800000,
        operational_allowance: 500000,
        bonus: 300000,
        total_amount: 3600000,
        slip_url: '/slips/slip-gaji-mandor-w2-nov.pdf',
        status: 'PAID',
      },
    ],
  });

  // 7. Data Portofolio Publik
  console.log('🖼️ Membuat Data Portofolio Publik...');
  await prisma.portfolio.createMany({
    data: [
      {
        title: 'Desain & Pembangunan Rumah Ibu Theresia',
        slug: 'rumah-ibu-theresia-slemn',
        category: 'PEMBANGUNAN_RENOVASI',
        subcategory: 'Rumah Tinggal',
        client_name: 'Ibu Theresia Wulandari',
        location: 'Sleman, D.I. Yogyakarta',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        gallery_urls: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80',
        ],
        description: 'Pembangunan rumah tinggal 2 lantai berkonsep modern tropical kontemporer dengan sirkulasi udara alami dan pencahayaan maksimal.',
        is_featured: true,
      },
      {
        title: 'Desain Pertama Ndalem Sukoharjo 1 & 2',
        slug: 'ndalem-sukoharjo-1-dan-2',
        category: 'DESAIN_ARSITEKTUR',
        subcategory: 'Cluster & Rumah Tinggal',
        client_name: 'Bpk. H. Sutrisno',
        location: 'Sukoharjo, Jawa Tengah',
        image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
        gallery_urls: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80',
        ],
        description: 'Perencanaan desain arsitektur hunian eksklusif bergaya Jawa Modern (Japandi-Javanese) dengan material kayu alami dan aksen batu candi.',
        is_featured: true,
      },
      {
        title: 'Renovasi Arsitektur Café Mas Reza',
        slug: 'cafe-mas-reza-sambilegi',
        category: 'PEMBANGUNAN_RENOVASI',
        subcategory: 'Café & Komersial',
        client_name: 'Mas Reza Fahlevi',
        location: 'Sambilegi, Sleman, Yogyakarta',
        image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
        gallery_urls: [],
        description: 'Transformasi bangunan lama menjadi coffee shop estetik dengan konsep indoor-outdoor garden dan bar counter ergonomis.',
        is_featured: true,
      },
      {
        title: 'Perencanaan Asrama Mahasiswa Sumbawa Barat',
        slug: 'asrama-mahasiswa-sumbawa-barat',
        category: 'DESAIN_ARSITEKTUR',
        subcategory: 'Asrama & Pengadaan Pemerintah',
        client_name: 'Pemerintah Daerah Sumbawa Barat',
        location: 'D.I. Yogyakarta',
        image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
        gallery_urls: [],
        description: 'Desain gedung bertingkat fasilitas asrama mahasiswa lengkap dengan ruang serbaguna, perpustakaan, dan area komunal.',
        is_featured: true,
      },
      {
        title: 'Desain Penataan Kawasan XT Square',
        slug: 'desain-xt-square-jogja',
        category: 'DESAIN_ARSITEKTUR',
        subcategory: 'Pengadaan Pemerintah',
        client_name: 'Pemerintah Kota Yogyakarta',
        location: 'Umbulharjo, Kota Yogyakarta',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        gallery_urls: [],
        description: 'Masterplan revitalisasi kawasan komersial publik XT Square untuk mendukung UMKM dan pusat kreativitas anak muda Yogyakarta.',
        is_featured: false,
      },
      {
        title: 'Kosan Eksklusif UMY Pak Fadli',
        slug: 'kosan-eksklusif-umy-pak-fadli',
        category: 'PEMBANGUNAN_RENOVASI',
        subcategory: 'Kosan',
        client_name: 'Bpk. Fadli',
        location: 'Utara Suciati, Sleman',
        image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
        gallery_urls: [],
        description: 'Pembangunan kos-kosan eksklusif 16 kamar dengan kamar mandi dalam, balkon privat, dan parkiran luas.',
        is_featured: false,
      },
    ],
  });

  // 8. Data Artikel Edukasi Konstruksi
  console.log('📰 Membuat Data Artikel Konstruksi...');
  await prisma.article.createMany({
    data: [
      {
        title: 'Panduan Memilih Material Konstruksi yang Tahan Gempa di Wilayah Yogyakarta & Sekitarnya',
        slug: 'panduan-material-konstruksi-tahan-gempa-yogyakarta',
        excerpt: 'Struktur tahan gempa bukan hanya tentang beton tebal, tetapi kesesuaian ikatan kolom praktis, pembesian standar SNI, dan pondasi tanah yang stabil.',
        content: `Membangun rumah di wilayah D.I. Yogyakarta, Jawa Tengah, dan Jawa Barat memerlukan perhitungan struktur khusus karena berada pada jalur tektonik aktif. 

Berikut adalah 4 poin penting yang diterapkan oleh Halo Bangun:
1. Penggunaan Besi Tulangan Standar SNI: Pastikan diameter besi beton berlabel SNI ulir untuk balok utama dan sloof.
2. Mutu Beton Teruji: Pengecoran plat lantai dan kolom utama wajib menggunakan mutu K-225 hingga K-250 dengan perbandingan semen, split, dan pasir yang presisi.
3. Struktur Kolom dan Balok Ring Terikat Sempurna: Setiap sudut dinding bata merah atau hebel wajib diperkuat kolom praktis dengan jarak maksimal 3 meter.
4. Pondasi Cakar Ayam Terkoneksi Sloof: Pondasi tapak beton bertulang memberikan daya lentur saat terjadi getaran seismik.

Halo Bangun selalu menyertakan garansi struktur tertulis dalam setiap SPKPR untuk menjamin rasa aman bagi seluruh keluarga klien.`,
        cover_image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80',
        category: 'Teknik Konstruksi',
        author_id: owner.id,
        status: 'PUBLISHED',
        views: 342,
      },
      {
        title: 'Mengenal Kurva S: Mengapa Klien Halo Bangun Bisa Memantau Proyek Secara Transparan?',
        slug: 'mengenal-kurva-s-transparansi-proyek-halo-bangun',
        excerpt: 'Kurva S adalah grafik akumulasi persentase bobot pekerjaan terhadap waktu yang membandingkan rencana kerja vs realisasi nyata di lapangan.',
        content: `Banyak pemilik rumah khawatir proyek konstruksinya molor atau biaya membengkak. Di Halo Bangun, kekhawatiran ini dijawab melalui integrasi Kurva S digital di Portal Klien.

Dengan Kurva S:
- Klien dapat memantau apakah proyek berada di jalur cepat (*ahead of schedule*) atau terjadi deviasi (*behind schedule*).
- Setiap termin pembayaran dikaitkan dengan milestone persentase fisik yang diverifikasi oleh Project Manager dan Direktur.
- Dilengkapi foto dokumentasi harian maksimal 3 foto serta akses CCTV langsung.`,
        cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        category: 'Manajemen Proyek',
        author_id: pm.id,
        status: 'PUBLISHED',
        views: 521,
      },
      {
        title: 'Langkah dan Syarat Pengurusan PBG (Persetujuan Bangunan Gedung) di Wilayah Sleman & Bantul',
        slug: 'syarat-pengurusan-pbg-diy-yogyakarta',
        excerpt: 'Pengganti IMB, kini PBG menjadi dokumen legalitas mutlak sebelum mendirikan bangunan. Simak tahapan pengurusannya melalui sistem SIMBG.',
        content: `Bagi Anda yang berencana membangun rumah tinggal atau tempat usaha di D.I. Yogyakarta, Persetujuan Bangunan Gedung (PBG) wajib dimiliki. Halo Bangun menyediakan jasa terpadu pengurusan PBG mencakup gambar kerja arsitektur, perhitungan struktur, dan data teknis MEP.`,
        cover_image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
        category: 'Legalitas & Perizinan',
        author_id: owner.id,
        status: 'PUBLISHED',
        views: 289,
      },
    ],
  });

  console.log('✅ Seeding berhasil diselesaikan!');
  console.log('📋 Akun Demo untuk Pengujian:');
  console.log('1. OWNER   : owner@halobangun.id   | password: password123');
  console.log('2. FINANCE : finance@halobangun.id | password: password123');
  console.log('3. PM      : pm@halobangun.id      | password: password123');
  console.log('4. MANDOR  : mandor@halobangun.id  | password: password123');
  console.log('5. CLIENT  : client@halobangun.id  | password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

