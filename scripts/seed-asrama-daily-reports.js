const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding project "Renovasi Asrama Mahasiswa Sumbawa Barat" & authentic Daily Reports (Hari 1 s.d. 42)...');

  // 1. Ensure Client User: Pemerintah Kab. Sumbawa Barat
  let clientUser = await prisma.user.findFirst({
    where: { email: 'pemkab.sumbawabarat@gmail.com' }
  });
  if (!clientUser) {
    clientUser = await prisma.user.create({
      data: {
        name: 'Pemerintah Kab. Sumbawa Barat',
        email: 'pemkab.sumbawabarat@gmail.com',
        password: '$2b$10$epsk0Pq4f1uWk95a3pZ91eqDkWV81vG1dM9B5rKj0tY/Wq2M5Q0w2',
        role: 'CLIENT',
        phone: '0812-3456-7890',
        designation: 'Pemberi Tugas / Pemilik Proyek'
      }
    });
  }

  // 2. Ensure PM / Pengawas User: Arizal (Supervisi PT. Sinergitama Konstruksi Indonesia)
  let pmUser = await prisma.user.findFirst({
    where: { email: 'arizal.pengawas@halobangun.id' }
  });
  if (!pmUser) {
    pmUser = await prisma.user.create({
      data: {
        name: 'Arizal (PT. Sinergitama Konstruksi Indonesia)',
        email: 'arizal.pengawas@halobangun.id',
        password: '$2b$10$epsk0Pq4f1uWk95a3pZ91eqDkWV81vG1dM9B5rKj0tY/Wq2M5Q0w2',
        role: 'PM',
        phone: '0821-3545-0404',
        designation: 'Pengawas Lapangan / Supervisi'
      }
    });
  }

  // 3. Ensure Project exists
  let project = await prisma.project.findFirst({
    where: { name: { contains: 'Renovasi Asrama Mahasiswa Sumbawa Barat' } }
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Renovasi Asrama Mahasiswa Sumbawa Barat',
        category: 'RENOVASI',
        location: 'Jalan Ring Road Utara, Condongcatur, Depok , Sleman - DIY',
        client_id: clientUser.id,
        pm_id: pmUser.id,
        status: 'ONGOING',
        contract_value: 186820400,
        startDate: new Date('2024-06-13T08:00:00Z'),
        targetCompletionDate: new Date('2024-08-11T17:00:00Z'),
        cctv_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
        bast_unlocked: false,
      }
    });
    console.log(`Created project with ID: ${project.id}`);
  } else {
    // update details
    project = await prisma.project.update({
      where: { id: project.id },
      data: {
        location: 'Jalan Ring Road Utara, Condongcatur, Depok , Sleman - DIY',
        contract_value: 186820400,
        client_id: clientUser.id,
        pm_id: pmUser.id,
      }
    });
    console.log(`Found existing project with ID: ${project.id}`);
  }

  // Clear existing daily reports for this project to re-seed cleanly
  await prisma.dailyReport.deleteMany({
    where: { project_id: project.id }
  });
  console.log('Cleared old reports for this project.');

  const samplePhotos = [
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
  ];

  const rawReports = [
    {
      day: 1,
      date: '2024-06-13',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Adm. Keuangan', count: 1, unit: 'OH' },
        { role: 'Manajer Legal & HR', count: 1, unit: 'OH' },
        { role: 'Arsitek', count: 1, unit: 'OH' }
      ],
      materials: [
        { name: 'Kertas', volume: '1', unit: 'ls' },
        { name: 'Materai', volume: '1', unit: 'ls' },
        { name: 'Pulpen', volume: '2', unit: 'bh' },
        { name: 'ATK', volume: '1', unit: 'ls' }
      ],
      tasks: [
        { task_name: 'Administrasi dan Pemberkasan', category: 'Persiapan', volume: '1 ls', notes: 'Pemberkasan kontrak dan surat tugas', status: 'COMPLETED' },
        { task_name: 'Rapat Koordinasi dengan penghuni asrama mahasiswa Sumbawa Barat', category: 'Persiapan', volume: '1 ls', notes: 'Dihadiri seluruh penghuni asrama', status: 'COMPLETED' },
        { task_name: 'Konsultasi arsitektural', category: 'Arsitektur', volume: '1 ls', notes: 'Penyesuaian tata letak & gambar kerja', status: 'COMPLETED' }
      ],
      notes: 'Hari pertama: Administrasi kontrak proyek, koordinasi menyeluruh dengan mahasiswa penghuni asrama, dan konsultasi arsitektural.',
      obstacles: null,
      solutions: null
    },
    {
      day: 2,
      date: '2024-06-14',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Adm. Keuangan', count: 1, unit: 'OH' },
        { role: 'Manajer Legal & HR', count: 1, unit: 'OH' }
      ],
      materials: [
        { name: 'Meteran', volume: '1', unit: 'ls' },
        { name: 'ATK', volume: '1', unit: 'ls' },
        { name: 'Skrup gypsum', volume: '7', unit: 'box' },
        { name: 'Skrap', volume: '10', unit: 'pcs' },
        { name: 'Kuas', volume: '28', unit: 'pcs' },
        { name: 'Gerinda', volume: '2', unit: 'bh' },
        { name: 'Kuas roll', volume: '21', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Pengukuran ulang pengerjaan renovasi', category: 'Persiapan', volume: '1 ls', notes: 'Pengukuran dimensi kamar & plafond lt 2', status: 'COMPLETED' },
        { task_name: 'Administrasi dan pemberkasan perizinan', category: 'Persiapan', volume: '1 ls', notes: 'Inventarisasi berkas legalitas', status: 'COMPLETED' }
      ],
      notes: 'Pengukuran ulang menyeluruh luasan renovasi dan pengadaan awal peralatan pertukangan (kuas, skrap, gerinda).',
      obstacles: null,
      solutions: null
    },
    {
      day: 3,
      date: '2024-06-15',
      weather: 'Mendung',
      weather_details: 'Mendung mulai pkl 09:00 WIB',
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' }
      ],
      materials: [
        { name: 'Bor tangan', volume: '2', unit: 'pcs' },
        { name: 'Sepatu keselamatan (Safety shoes)', volume: '2', unit: 'psg' },
        { name: 'Mata potong keramik', volume: '2', unit: 'pcs' },
        { name: 'Palu kambing', volume: '3', unit: 'pcs' },
        { name: 'Helm proyek', volume: '5', unit: 'bh' },
        { name: 'Rompi proyek', volume: '5', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Persiapan Lapangan Pekerjaan', category: 'Persiapan', volume: '1 ls', notes: 'Sterilisasi area kerja lt 1 dan lt 2', status: 'COMPLETED' },
        { task_name: 'Rapat Koordinasi lanjutan penghuni asrama', category: 'Persiapan', volume: '1 ls', notes: 'Pengaturan jadwal pemindahan barang', status: 'COMPLETED' },
        { task_name: 'Perizinan kepada Satpam Komplek', category: 'Persiapan', volume: '1 ls', notes: 'Akses keluar masuk material dump truck', status: 'COMPLETED' }
      ],
      notes: 'Persiapan lapangan, koordinasi alur bongkar material dengan satpam komplek, serta distribusi APD keselamatan kerja (SMKK).',
      obstacles: null,
      solutions: null
    },
    {
      day: 4,
      date: '2024-06-16',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' }
      ],
      materials: [
        { name: 'Kotak P3K Lengkap', volume: '1', unit: 'paket' },
        { name: 'Palu karet', volume: '1', unit: 'bh' },
        { name: 'Sarung tangan safety', volume: '5', unit: 'psg' },
        { name: 'Pahat beton', volume: '2', unit: 'bh' },
        { name: 'Meteran 10m', volume: '10', unit: 'bh' },
        { name: 'Cangkul & Senggrong', volume: '3', unit: 'bh' },
        { name: 'Ember tukang', volume: '6', unit: 'bh' },
        { name: 'Waterpass selang air', volume: '15', unit: 'm' },
        { name: 'Angkong / Gerobak sorong', volume: '1', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Pembelian Peralatan SMKK & K3', category: 'SMKK', volume: '1 ls', notes: 'P3K, safety gloves, rompi, rambu', status: 'COMPLETED' },
        { task_name: 'Pengadaan perkakas sipil dan leveling', category: 'Persiapan', volume: '1 ls', notes: 'Waterpass, angkong, pahat beton', status: 'COMPLETED' }
      ],
      notes: 'Pembelian peralatan SMKK (K3) dan logistik peralatan kerja berat untuk persiapan pembongkaran.',
      obstacles: null,
      solutions: null
    },
    {
      day: 5,
      date: '2024-06-17',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' }
      ],
      materials: [
        { name: 'Box kontainer peralatan', volume: '2', unit: 'bh' },
        { name: 'ATK', volume: '1', unit: 'ls' },
        { name: 'Gunting seng', volume: '2', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Inventarisasi peralatan kerja di direksi keet', category: 'Persiapan', volume: '1 ls', notes: 'Pencatatan nomor seri & kelayakan alat', status: 'COMPLETED' },
        { task_name: 'Rapat koordinasi teknis perencana dan pelaksana', category: 'Arsitektur', volume: '1 ls', notes: 'Finalisasi titik pembongkaran kusen & plafond', status: 'COMPLETED' }
      ],
      notes: 'Inventarisasi alat kerja dan penyusunan urutan pembongkaran lantai 2 bersama perencana.',
      obstacles: null,
      solutions: null
    },
    {
      day: 6,
      date: '2024-06-18',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Pelindung pernafasan / masker', volume: '1', unit: 'box' },
        { name: 'ATK Proyek', volume: '1', unit: 'ls' }
      ],
      tasks: [
        { task_name: 'Toolbox Meeting & Penjelasan K3 Konstruksi', category: 'SMKK', volume: '1 ls', notes: 'Safety briefing sebelum mulai bongkaran', status: 'COMPLETED' },
        { task_name: 'Penjelasan tahapan pengerjaan ke mandor dan tukang', category: 'Persiapan', volume: '1 ls', notes: 'Fokus area plafond lt 2 dan pintu lt 1', status: 'COMPLETED' }
      ],
      notes: 'Briefing keselamatan kerja (K3) serta pemaparan instruksi teknis kepada tim tukang sebelum pembongkaran aktif.',
      obstacles: null,
      solutions: null
    },
    {
      day: 7,
      date: '2024-06-19',
      weather: 'Mendung',
      weather_details: 'Mendung pkl 15:00 WIB',
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Keramik putih 30x30', volume: '9', unit: 'dus' },
        { name: 'Keramik merah', volume: '1', unit: 'dus' },
        { name: 'Pasir pasang', volume: '1', unit: 'pu' },
        { name: 'Meteran 5m', volume: '5', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Pemeriksaan kelengkapan APD & SMKK', category: 'SMKK', volume: '1 ls', notes: 'Verifikasi oleh Pengawas Arizal', status: 'COMPLETED' },
        { task_name: 'Pencatatan rencana material minggu ke-2', category: 'Persiapan', volume: '1 ls', notes: 'PO semen, kaso sengon, dan gypsum', status: 'COMPLETED' }
      ],
      notes: 'Pengecekan akhir kesiapan SMKK dan mobilisasi material awal pasir & keramik pengganti.',
      obstacles: null,
      solutions: null
    },
    {
      day: 8,
      date: '2024-06-20',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' }
      ],
      materials: [
        { name: 'Peralatan pertukangan', volume: '1', unit: 'paket' },
        { name: 'Logistik tukang', volume: '1', unit: 'paket' }
      ],
      tasks: [
        { task_name: 'Pengiriman dan serah terima peralatan tukang', category: 'Persiapan', volume: '1 ls', notes: 'Gergaji listrik, kabel roll, bor beton', status: 'COMPLETED' },
        { task_name: 'Inventarisasi barang logistik di gudang asrama', category: 'Persiapan', volume: '1 ls', notes: 'Penyimpanan aman di kamar kosong', status: 'COMPLETED' }
      ],
      notes: 'Mobilisasi peralatan pertukangan lengkap dan penataan gudang asrama.',
      obstacles: null,
      solutions: null
    },
    {
      day: 9,
      date: '2024-06-21',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Perekat bata ringan', volume: '5', unit: 'sak' },
        { name: 'Semen Tiga Roda', volume: '4', unit: 'sak' },
        { name: 'Bambu steger', volume: '10', unit: 'bh' },
        { name: 'Kawat bendrat', volume: '2', unit: 'kg' },
        { name: 'Paku 5 & 7 cm', volume: '6', unit: 'kg' }
      ],
      tasks: [
        { task_name: 'Pembongkaran rangka plafond lantai 2', category: 'Pembongkaran', volume: '35 m2', notes: 'Pembongkaran rangka lama yang keropos', status: 'IN_PROGRESS' },
        { task_name: 'Rapat koordinasi persiapan pengerjaan renovasi', category: 'Persiapan', volume: '1 ls', notes: 'Instruksi safety masker pembongkaran', status: 'COMPLETED' }
      ],
      notes: 'Pembongkaran rangka plafond lantai 2 dimulai. Debu dan puing langsung dikumpulkan dalam karung.',
      obstacles: null,
      solutions: null
    },
    {
      day: 10,
      date: '2024-06-22',
      weather: 'Mendung',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Scaffolding set', volume: '10', unit: 'set' },
        { name: 'Kayu kaso 4x6', volume: '50', unit: 'bh' },
        { name: 'Paku beton', volume: '3', unit: 'dus' },
        { name: 'Paku 5 & 7 cm', volume: '12', unit: 'kg' }
      ],
      tasks: [
        { task_name: 'Pembongkaran Plafond lantai 2', category: 'Pembongkaran', volume: '50 m2', notes: 'Area koridor dan kamar timur', status: 'IN_PROGRESS' },
        { task_name: 'Pembongkaran lantai keramik kamar tidur', category: 'Pembongkaran', volume: '20 m2', notes: 'Pengelupasan spesi semen lama', status: 'IN_PROGRESS' }
      ],
      notes: 'Pemasangan scaffolding untuk membongkar plafond lantai 2 secara masif dan pembongkaran lantai keramik kamar.',
      obstacles: null,
      solutions: null
    },
    {
      day: 11,
      date: '2024-06-23',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 7, unit: 'OH' }
      ],
      materials: [
        { name: 'Buang bongkaran puing', volume: '2', unit: 'truk' },
        { name: 'Cat lisplank', volume: '1', unit: 'gln' }
      ],
      tasks: [
        { task_name: 'Pembersihan dan pembuangan puing sisa pembongkaran', category: 'Pembersihan', volume: '2 truk', notes: 'Dibuang ke TPA resmi', status: 'COMPLETED' },
        { task_name: 'Pengecekan kebocoran genting atap', category: 'Atap', volume: '1 ls', notes: 'Penandaan titik genting pecah/melorot', status: 'COMPLETED' },
        { task_name: 'Pengecatan lisplank lantai 2', category: 'Finishing', volume: '20 m1', notes: 'Lapisan dasar pertama', status: 'IN_PROGRESS' }
      ],
      notes: 'Mobilisasi 2 dump truck untuk pembuangan puing bongkaran plafond & lantai. Area kerja bersih kembali.',
      obstacles: null,
      solutions: null
    },
    {
      day: 12,
      date: '2024-06-24',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 7, unit: 'OH' }
      ],
      materials: [
        { name: 'Gypsum board 9mm', volume: '67', unit: 'lmbr' },
        { name: 'Kayu Sengon 4x6', volume: '50', unit: 'btg' },
        { name: 'Baut Gypsum', volume: '5', unit: 'box' },
        { name: 'Compound', volume: '5', unit: 'sak' },
        { name: 'Talang seng & No Drop', volume: '4', unit: 'm' },
        { name: 'Baja ringan Kencana', volume: '2', unit: 'btg' },
        { name: 'Buang puing', volume: '1', unit: 'truk' }
      ],
      tasks: [
        { task_name: 'Pengiriman & penerimaan material Gypsum & Kayu', category: 'Material', volume: '67 lmbr', notes: 'Verifikasi spesifikasi tebal 9mm', status: 'COMPLETED' },
        { task_name: 'Pembersihan sisa bongkaran plafond', category: 'Pembersihan', volume: '1 truk', notes: 'Pembuangan rit ketiga', status: 'COMPLETED' },
        { task_name: 'Pembongkaran keramik kamar ke-2', category: 'Pembongkaran', volume: '1 kamar', notes: 'Lantai siap diurug spesi baru', status: 'COMPLETED' }
      ],
      notes: 'Penerimaan material utama gypsum 67 lembar dan kayu sengon rangka plafond. Pembuangan puing rit ketiga.',
      obstacles: null,
      solutions: null
    },
    {
      day: 13,
      date: '2024-06-25',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Amplas', volume: '4', unit: 'm' },
        { name: 'Skrap Besi', volume: '5', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Pemasangan Rangka Kayu Plafond Lantai 2', category: 'Arsitektur', volume: '40 m2', notes: 'Pengikatan rangka kaso ke balok', status: 'IN_PROGRESS' },
        { task_name: 'Pembersihan kotoran atas plafond & genting', category: 'Atap', volume: '1 ls', notes: 'Pembersihan kotoran burung dan debu', status: 'COMPLETED' }
      ],
      notes: 'Pemasangan rangka kayu kaso plafond lantai 2 serta pembersihan ruang atas plafond sebelum ditutup gypsum.',
      obstacles: null,
      solutions: null
    },
    {
      day: 14,
      date: '2024-06-26',
      weather: 'Hujan Lebat',
      weather_details: 'Mendung pkl 15:00 WIB, Hujan deras pkl 16:00 WIB',
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 4, unit: 'OH' }
      ],
      materials: [
        { name: 'Pipa air bersih PVC', volume: '2', unit: 'btg' },
        { name: 'Otomatis water toren', volume: '1', unit: 'bh' },
        { name: 'Lem pipa PVC', volume: '1', unit: 'klg' },
        { name: 'Kabel NYM 2 x 1,5 mm', volume: '100', unit: 'm' }
      ],
      tasks: [
        { task_name: 'Perbaikan talang air dan kebocoran genting', category: 'Atap', volume: '1 ls', notes: 'Penambalan serat fiber + No Drop', status: 'COMPLETED' },
        { task_name: 'Perbaikan instalasi air bersih & toren', category: 'MEP', volume: '1 ls', notes: 'Penggantian otomatis pelampung toren', status: 'COMPLETED' },
        { task_name: 'Pemasangan rangka kayu plafond', category: 'Arsitektur', volume: '25 m2', notes: 'Lanjutan modul kamar barat', status: 'IN_PROGRESS' }
      ],
      notes: 'Penanganan talang air sebelum hujan deras pukul 16.00 WIB. Instalasi pipa air bersih toren berfungsi normal.',
      obstacles: 'Hujan lebat mulai pukul 16.00 WIB menghentikan pengecatan lisplank eksterior.',
      solutions: 'Pekerjaan dialihkan ke perbaikan instalasi pipa dalam ruangan.'
    },
    {
      day: 15,
      date: '2024-06-27',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Lampu LED Philips', volume: '31', unit: 'bh' },
        { name: 'Plafond Gypsum', volume: '12', unit: 'lmbr' },
        { name: 'Cat Plafond', volume: '3', unit: 'pill' },
        { name: 'Floor drain stainless', volume: '8', unit: 'pcs' },
        { name: 'Saklar & Stop Kontak', volume: '83', unit: 'pcs' },
        { name: 'Kran stainless', volume: '11', unit: 'pcs' }
      ],
      tasks: [
        { task_name: 'Pemasangan Plafond Gypsum Lantai 2', category: 'Arsitektur', volume: '45 m2', notes: 'Penyekrupan gypsum ke rangka hollow/kayu', status: 'IN_PROGRESS' },
        { task_name: 'Pengecatan Lisplank Tampak Depan', category: 'Finishing', volume: '20 m1', notes: 'Cat lisplank warna abu tua', status: 'COMPLETED' },
        { task_name: 'Pengecekan kebutuhan pintu dan kusen', category: 'Arsitektur', volume: '10 unit', notes: 'Pengukuran kusen kamar yang keropos', status: 'COMPLETED' }
      ],
      notes: 'Pemasangan lembaran gypsum lantai 2 berjalan lancar dan seluruh logistik elektrikal (lampu LED, stop kontak) telah tiba.',
      obstacles: null,
      solutions: null
    },
    {
      day: 16,
      date: '2024-06-28',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [],
      tasks: [
        { task_name: 'Pengecatan plafond ruang tengah lantai 2', category: 'Finishing', volume: '30 m2', notes: 'Pengecatan dasar warna putih', status: 'IN_PROGRESS' },
        { task_name: 'Pengecatan plafond kamar lantai 2', category: 'Finishing', volume: '25 m2', notes: 'Lapisan cat pertama', status: 'IN_PROGRESS' },
        { task_name: 'Pemesanan kusen & daun pintu kayu jati', category: 'Arsitektur', volume: '10 bh', notes: 'Pesanan masuk bengkel kayu', status: 'COMPLETED' }
      ],
      notes: 'Pengecatan dasar plafond ruang tengah dan kamar lantai 2. SPK pemesanan pintu kayu jati dikirimkan.',
      obstacles: null,
      solutions: null
    },
    {
      day: 17,
      date: '2024-06-29',
      weather: 'Mendung',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Cat Plafond', volume: '1', unit: 'pill' },
        { name: 'Kuas & Roll', volume: '9', unit: 'bh' },
        { name: 'Baut roofing & mata bor', volume: '22', unit: 'pcs' }
      ],
      tasks: [
        { task_name: 'Pengecatan plafond lapis ke-2 lantai 2', category: 'Finishing', volume: '55 m2', notes: 'Hasil rapi dan rata', status: 'IN_PROGRESS' },
        { task_name: 'Pembongkaran keramik lantai kamar lt 2', category: 'Pembongkaran', volume: '1 kamar', notes: 'Pembersihan dasar lantai', status: 'COMPLETED' }
      ],
      notes: 'Pengecatan lapis kedua pada plafond ruang tengah serta pembongkaran lantai keramik pada kamar berikutnya.',
      obstacles: null,
      solutions: null
    },
    {
      day: 18,
      date: '2024-06-30',
      weather: 'Hujan Ringan',
      weather_details: 'Hujan rintik siang hari',
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Semen MU perekat keramik', volume: '2', unit: 'sak' },
        { name: 'Keramik putih 30x30', volume: '8', unit: 'dus' }
      ],
      tasks: [
        { task_name: 'Pemasangan keramik kamar lantai 2', category: 'Arsitektur', volume: '1 kamar (16 m2)', notes: 'Nat lurus rapi menggunakan MU', status: 'COMPLETED' },
        { task_name: 'Pemasangan kran kamar mandi & taman', category: 'Sanitari', volume: '6 bh', notes: 'Kran stainless tahan karat', status: 'COMPLETED' }
      ],
      notes: 'Pemasangan keramik kamar lantai 2 tuntas 1 kamar. Kran kamar mandi dan taman telah dipasang.',
      obstacles: null,
      solutions: null
    },
    {
      day: 19,
      date: '2024-07-01',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 4, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Gypsum board', volume: '6', unit: 'lbr' },
        { name: 'Skrap besi', volume: '3', unit: 'bh' },
        { name: 'TBA Jumbo', volume: '2', unit: 'pcs' }
      ],
      tasks: [
        { task_name: 'Amplas tembok dalam dan luar lantai 2', category: 'Finishing', volume: '120 m2', notes: 'Persiapan cat dinding', status: 'IN_PROGRESS' },
        { task_name: 'Pengecatan dasar cat interior lantai 2', category: 'Finishing', volume: '80 m2', notes: 'Menggunakan alkali sealer', status: 'IN_PROGRESS' },
        { task_name: 'Pengecatan railing tangga depan dan belakang', category: 'Finishing', volume: '1 ls', notes: 'Pembersihan karat dan cat dasar besi', status: 'IN_PROGRESS' }
      ],
      notes: 'Pengamplasan dinding masif lantai 2 dan pelapisan cat alkali sealer. Pengikisan karat pada railing tangga.',
      obstacles: null,
      solutions: null
    },
    {
      day: 20,
      date: '2024-07-02',
      weather: 'Hujan Lebat',
      weather_details: 'Hujan lebat jam 14.30 WIB',
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 4, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Cat dasar interior alkali', volume: '4', unit: 'pill' },
        { name: 'Cat Plafond', volume: '1', unit: 'pill' },
        { name: 'Kuas & Roll', volume: '8', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Pengecatan plafond kamar dan koridor lt 2', category: 'Finishing', volume: '40 m2', notes: 'Finishing putih doff', status: 'COMPLETED' },
        { task_name: 'Pembongkaran pintu dan jendela rusak', category: 'Pembongkaran', volume: '8 bh', notes: 'Pelepasan engsel berkarat', status: 'COMPLETED' },
        { task_name: 'Pembongkaran kusen keropos lantai 1', category: 'Pembongkaran', volume: '4 m1', notes: 'Kusen rayapan dibongkar', status: 'COMPLETED' }
      ],
      notes: 'Pembongkaran kusen dan pintu lama yang rusak/lapuk di lantai 1 serta perapihan plesteran.',
      obstacles: null,
      solutions: null
    },
    {
      day: 21,
      date: '2024-07-03',
      weather: 'Mendung',
      weather_details: 'Mendung pkl 15:00, Hujan pkl 16:00',
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 4, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Cat tembok interior', volume: '4', unit: 'pill' },
        { name: 'Cat tembok exterior', volume: '2', unit: 'pill' },
        { name: 'Cat Plafond', volume: '1', unit: 'pill' },
        { name: 'Amplas dinding', volume: '5', unit: 'm' }
      ],
      tasks: [
        { task_name: 'Pembersihan dan pengecatan tembok tandon air', category: 'Finishing', volume: '1 ls', notes: 'Pengecatan waterproofing luar tandon', status: 'COMPLETED' },
        { task_name: 'Perbaikan atap tandon air', category: 'Atap', volume: '1 paket', notes: 'Pergantian seng penutup toren', status: 'COMPLETED' },
        { task_name: 'Perbaikan tembok plesteran terkelupas', category: 'Arsitektur', volume: '15 m2', notes: 'Plesteran ulang dan acian', status: 'IN_PROGRESS' }
      ],
      notes: 'Area toren air selesai dibersihkan dan dicat waterproofing. Perbaikan dinding yang terkelupas dipercepat.',
      obstacles: null,
      solutions: null
    },
    {
      day: 22,
      date: '2024-07-04',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 6, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Baut gypsum', volume: '1', unit: 'box' },
        { name: 'Fisher dinding', volume: '2', unit: 'dus' },
        { name: 'Kain kassa gypsum', volume: '3', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Perbaikan instalasi listrik lantai 2', category: 'MEP', volume: '1 ls', notes: 'Penarikan jalur kabel NYM baru ke titik lampu', status: 'IN_PROGRESS' },
        { task_name: 'Perbaikan instalasi perpipaan kamar mandi', category: 'Plumbing', volume: '1 ls', notes: 'Penyambungan pipa pembuangan air kotor', status: 'COMPLETED' },
        { task_name: 'Pemesanan pagar balkon besi hollow lt 2', category: 'Struktur', volume: '1 ls', notes: 'Fabrikasi di bengkel las', status: 'COMPLETED' }
      ],
      notes: 'Jumlah tukang ditambah menjadi 6 orang untuk percepatan instalasi listrik dan perpipaan sanitari.',
      obstacles: null,
      solutions: null
    },
    {
      day: 23,
      date: '2024-07-05',
      weather: 'Mendung',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 6, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Imbudus saklar', volume: '5', unit: 'bh' },
        { name: 'Klem pipa listrik', volume: '17', unit: 'pcs' },
        { name: 'Thinner cat besi', volume: '2', unit: 'gln' },
        { name: 'Cat besi & kayu', volume: '20', unit: 'klg' },
        { name: 'Pipa konduit listrik', volume: '4', unit: 'btg' }
      ],
      tasks: [
        { task_name: 'Pengecatan dinding kamar lantai 2', category: 'Finishing', volume: '60 m2', notes: 'Warna utama cerah bersih', status: 'IN_PROGRESS' },
        { task_name: 'Pengecekan akhir kebocoran genting saat hujan', category: 'Atap', volume: '1 ls', notes: 'Tidak ada rembesan air di plafon', status: 'COMPLETED' }
      ],
      notes: 'Pengecekan atap saat mendung menunjukkan perbaikan genting dan talang telah bebas dari bocor 100%.',
      obstacles: null,
      solutions: null
    },
    {
      day: 24,
      date: '2024-07-06',
      weather: 'Mendung',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 4, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Kuas', volume: '32', unit: 'pcs' },
        { name: 'Roll cat & refill', volume: '11', unit: 'paket' },
        { name: 'Lampu LED Philips', volume: '27', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Pengecatan dinding luar (eksterior) lantai 2', category: 'Finishing', volume: '50 m2', notes: 'Weather shield paint', status: 'IN_PROGRESS' },
        { task_name: 'Pemasangan fitting tempel & lampu LED', category: 'MEP', volume: '20 titik', notes: 'Semua lampu dites menyala normal', status: 'COMPLETED' }
      ],
      notes: 'Pengecatan eksterior lantai 2 serta pemasangan 20 titik lampu LED Philips.',
      obstacles: null,
      solutions: null
    },
    {
      day: 25,
      date: '2024-07-07',
      weather: 'Hujan Ringan',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 4, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Paku beton & kayu', volume: '2', unit: 'kg' },
        { name: 'Skrup roofing', volume: '3', unit: 'dus' },
        { name: 'Gagang pintu geser', volume: '1', unit: 'set' }
      ],
      tasks: [
        { task_name: 'Pembongkaran dan perbaikan plafond kamar pojok', category: 'Arsitektur', volume: '1 kamar', notes: 'Penggantian gypsum rembes lama', status: 'COMPLETED' },
        { task_name: 'Pengecatan kusen pintu & jendela lantai 2', category: 'Finishing', volume: '12 unit', notes: 'Plitur melamin coklat natural', status: 'IN_PROGRESS' },
        { task_name: 'Amplas dinding ruangan lantai 1', category: 'Finishing', volume: '80 m2', notes: 'Pembersihan jamur dinding', status: 'IN_PROGRESS' }
      ],
      notes: 'Penyelesaian plafond kamar pojok dan plitur kusen jendela lantai 2.',
      obstacles: null,
      solutions: null
    },
    {
      day: 26,
      date: '2024-07-08',
      weather: 'Mendung',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 4, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [],
      tasks: [
        { task_name: 'Pengecatan dak beton plafond lantai 1', category: 'Finishing', volume: '60 m2', notes: 'Pelapisan cat putih cerah', status: 'IN_PROGRESS' },
        { task_name: 'Pemasangan pagar balkon depan dan belakang', category: 'Struktur', volume: '1 paket', notes: 'Besi hollow kokoh diangkur kuat', status: 'COMPLETED' },
        { task_name: 'Pengecatan primer anti-karat pagar balkon', category: 'Finishing', volume: '1 ls', notes: 'Zinc chromate primer', status: 'COMPLETED' }
      ],
      notes: 'Pagar balkon lantai 2 telah terpasang dengan kokoh dan dicat anti-karat.',
      obstacles: null,
      solutions: null
    },
    {
      day: 27,
      date: '2024-07-09',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 4, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Cat dasar interior', volume: '3', unit: 'pill' },
        { name: 'Cat interior warna', volume: '5', unit: 'pill' },
        { name: 'Cat kayu dan besi', volume: '5', unit: 'kg' },
        { name: 'Amplas meteran', volume: '5', unit: 'm' }
      ],
      tasks: [
        { task_name: 'Pengecatan dasar dinding lantai 1', category: 'Finishing', volume: '100 m2', notes: 'Kamar depan dan ruang bersama', status: 'IN_PROGRESS' },
        { task_name: 'Pengecatan jendela dan pintu kayu lt 2', category: 'Finishing', volume: '10 bh', notes: 'Lapisan finishing halus', status: 'COMPLETED' },
        { task_name: 'Perapihan lisplank atap', category: 'Atap', volume: '1 ls', notes: 'Pengecatan ulang lisplank sambungan', status: 'COMPLETED' }
      ],
      notes: 'Pengecatan dasar masif di lantai 1 dan penyelesaian cat kusen lantai 2.',
      obstacles: null,
      solutions: null
    },
    {
      day: 28,
      date: '2024-07-10',
      weather: 'Hujan Lebat',
      weather_details: 'Mendung pkl 15:00 WIB, Hujan lebat pkl 16:00 WIB',
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 7, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Engsel jendela', volume: '20', unit: 'box' },
        { name: 'Engsel pintu kuningan', volume: '46', unit: 'box' },
        { name: 'Gagang pintu handle set', volume: '28', unit: 'set' },
        { name: 'Gagang pintu toilet', volume: '8', unit: 'set' },
        { name: 'Hak angin sikutan', volume: '120', unit: 'psg' },
        { name: 'Grendel pintu', volume: '15', unit: 'pcs' }
      ],
      tasks: [
        { task_name: 'Pemasangan aksesoris engsel pintu & jendela', category: 'Arsitektur', volume: '30 set', notes: 'Semua engsel baru anti karat', status: 'IN_PROGRESS' },
        { task_name: 'Perbaikan sponengan kusen pintu keropos', category: 'Arsitektur', volume: '8 titik', notes: 'Tambalan plesteran & acian semen', status: 'COMPLETED' },
        { task_name: 'Pengecatan dinding interior lt 1', category: 'Finishing', volume: '70 m2', notes: 'Cat utama lapisan pertama', status: 'IN_PROGRESS' }
      ],
      notes: 'Distribusi massal aksesoris pintu/jendela (handle, engsel, hak angin) dan perbaikan kusen keropos.',
      obstacles: null,
      solutions: null
    },
    {
      day: 29,
      date: '2024-07-11',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 7, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Lampu LED', volume: '4', unit: 'bh' },
        { name: 'Penutup listrik dak roset', volume: '5', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Pemasangan saklar, stop kontak & lampu lt 1', category: 'MEP', volume: '25 titik', notes: 'Uji nyala saklar engkel & ganda', status: 'COMPLETED' },
        { task_name: 'Amplas melamin daun pintu kayu', category: 'Finishing', volume: '10 bh', notes: 'Pengamplasan halus sebelum disemprot', status: 'IN_PROGRESS' },
        { task_name: 'Pengecatan dak beton lantai 1', category: 'Finishing', volume: '80 m2', notes: 'Lapisan ke-2 putih bersih', status: 'COMPLETED' }
      ],
      notes: 'Pemasangan saklar dan stop kontak lantai 1 tuntas. Plafond dak beton selesai dicat.',
      obstacles: null,
      solutions: null
    },
    {
      day: 30,
      date: '2024-07-12',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 7, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [],
      tasks: [
        { task_name: 'Pengecatan dinding dalam dan kamar lantai 1', category: 'Finishing', volume: '90 m2', notes: 'Finishing warna konsisten', status: 'IN_PROGRESS' },
        { task_name: 'Pengecatan tembok luar lantai 1', category: 'Finishing', volume: '60 m2', notes: 'Cat eksterior tahan cuaca', status: 'IN_PROGRESS' },
        { task_name: 'Finishing melamin pintu kayu jati', category: 'Finishing', volume: '6 unit', notes: 'Warna serat kayu keluar maksimal', status: 'IN_PROGRESS' }
      ],
      notes: 'Finishing melamin daun pintu jati dan pengecatan lapis kedua dinding lantai 1.',
      obstacles: null,
      solutions: null
    },
    {
      day: 31,
      date: '2024-07-13',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 7, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Kuas halus', volume: '26', unit: 'pcs' },
        { name: 'Klem kabel', volume: '2', unit: 'bks' },
        { name: 'Lampu LED 8W', volume: '4', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Pembersihan dan pengurasan tandon air utama', category: 'Plumbing', volume: '1 unit', notes: 'Penyikatan lumut & klorinasi bersih', status: 'COMPLETED' },
        { task_name: 'Pembersihan keramik lantai 2', category: 'Pembersihan', volume: '120 m2', notes: 'Pembersihan sisa semen & cat', status: 'COMPLETED' },
        { task_name: 'Penyemprotan melamin daun pintu & kusen', category: 'Finishing', volume: '10 bh', notes: 'Hasil glossy mengkilap', status: 'COMPLETED' }
      ],
      notes: 'Tandon air bersih dikuras dan disinfeksi. Keramik lantai 2 dipoles bersih.',
      obstacles: null,
      solutions: null
    },
    {
      day: 32,
      date: '2024-07-14',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 5, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Kuas', volume: '4', unit: 'btg' },
        { name: 'Amplas halus', volume: '5', unit: 'm' }
      ],
      tasks: [
        { task_name: 'Pengecatan touch-up dinding lantai 1', category: 'Finishing', volume: '40 m2', notes: 'Pemeriksaan titik bercak', status: 'COMPLETED' },
        { task_name: 'Pemasangan daun pintu melamin ke kusen', category: 'Arsitektur', volume: '4 bh', notes: 'Penyetelan bukaan pintu presisi', status: 'IN_PROGRESS' }
      ],
      notes: 'Pemasangan daun pintu yang telah dimelamin kembali ke kusen masing-masing kamar.',
      obstacles: null,
      solutions: null
    },
    {
      day: 33,
      date: '2024-07-15',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 5, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [],
      tasks: [
        { task_name: 'Pengecatan jendela & pintu kayu lantai 1', category: 'Finishing', volume: '8 bh', notes: 'Pengecatan kusen ruang utama', status: 'COMPLETED' },
        { task_name: 'Penyelesaian melamin pintu dan kusen', category: 'Finishing', volume: '6 bh', notes: 'Lapisan clear doff', status: 'COMPLETED' }
      ],
      notes: 'Pekerjaan melamin pintu dan kusen lantai 1 tuntas.',
      obstacles: null,
      solutions: null
    },
    {
      day: 34,
      date: '2024-07-16',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 5, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [],
      tasks: [
        { task_name: 'Pemasangan daun pintu baru jati', category: 'Arsitektur', volume: '6 bh', notes: 'Pintu kamar tidur lantai 1', status: 'COMPLETED' },
        { task_name: 'Perbaikan jendela & penyetelan engsel', category: 'Arsitektur', volume: '19 bh', notes: 'Penggantian engsel yang seret', status: 'COMPLETED' },
        { task_name: 'Perbaikan rel pintu geser ruang utama', category: 'Arsitektur', volume: '3.4 m1', notes: 'Pintu geser lancar kembali', status: 'COMPLETED' },
        { task_name: 'Pemasangan hak angin dan sikutan jendela', category: 'Arsitektur', volume: '38 bh', notes: 'Pemasangan baut kencang', status: 'COMPLETED' }
      ],
      notes: 'Pemasangan pintu baru kayu jati, perbaikan rel pintu geser, dan kelengkapan aksesoris jendela.',
      obstacles: null,
      solutions: null
    },
    {
      day: 35,
      date: '2024-07-17',
      weather: 'Mendung',
      weather_details: 'Mendung pkl 15:00 WIB',
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 5, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Taping perekat', volume: '30', unit: 'pcs' },
        { name: 'Fisher dinding', volume: '30', unit: 'pcs' },
        { name: 'Baut sekrup', volume: '2', unit: 'box' }
      ],
      tasks: [
        { task_name: 'Perbaikan kusen pintu dan sponengan', category: 'Arsitektur', volume: '4 unit', notes: 'Penutupan celah kusen ke dinding', status: 'COMPLETED' },
        { task_name: 'Penyetelan seluruh kunci pintu & handle', category: 'Arsitektur', volume: '10 unit', notes: 'Uji fungsi kunci semua kamar', status: 'COMPLETED' }
      ],
      notes: 'Penyetelan kunci silinder seluruh pintu asrama berjalan lancar dan presisi.',
      obstacles: null,
      solutions: null
    },
    {
      day: 36,
      date: '2024-07-18',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 6, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Buang puing', volume: '1', unit: 'truk' },
        { name: 'Lem fox', volume: '2', unit: 'bks' },
        { name: 'Semen putih', volume: '2', unit: 'bks' }
      ],
      tasks: [
        { task_name: 'Pengecatan dinding interior lantai 1 final', category: 'Finishing', volume: '80 m2', notes: 'Warna solid & rapi', status: 'COMPLETED' },
        { task_name: 'Pembuangan puing sisa perbaikan kusen', category: 'Pembersihan', volume: '1 truk', notes: 'Truk ke-4 pembuangan TPA', status: 'COMPLETED' }
      ],
      notes: 'Pengecatan dinding interior lantai 1 final dan pengangkutan puing rit ke-4.',
      obstacles: null,
      solutions: null
    },
    {
      day: 37,
      date: '2024-07-19',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 6, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Gypsum compound', volume: '1', unit: 'sak' },
        { name: 'Cat besi & kayu', volume: '10', unit: 'kg' },
        { name: 'Kuas', volume: '14', unit: 'pcs' },
        { name: 'Kayu kaso', volume: '7', unit: 'btg' }
      ],
      tasks: [
        { task_name: 'Touch up cat kusen & daun pintu', category: 'Finishing', volume: '10 bh', notes: 'Penyempurnaan sudut pertemuan', status: 'COMPLETED' },
        { task_name: 'Pengecatan lisplank eksterior lantai 1', category: 'Finishing', volume: '10.8 m1', notes: 'Warna serasi lantai 2', status: 'COMPLETED' }
      ],
      notes: 'Penyempurnaan detail cat kusen dan lisplank eksterior lantai 1.',
      obstacles: null,
      solutions: null
    },
    {
      day: 38,
      date: '2024-07-20',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 6, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Roll cat', volume: '6', unit: 'bh' },
        { name: 'Semen warna nat keramik', volume: '1', unit: 'bks' },
        { name: 'Pembersih lantai keramik', volume: '5', unit: 'btl' },
        { name: 'Cat eksterior', volume: '1', unit: 'pill' }
      ],
      tasks: [
        { task_name: 'Perbaikan plafond kamar mandi lantai 1', category: 'Arsitektur', volume: '1 unit', notes: 'Penggantian kalsiboard tahan air', status: 'COMPLETED' },
        { task_name: 'Perapihan nat keramik kamar mandi', category: 'Sanitari', volume: '4 km', notes: 'Pengisian nat anti bocor', status: 'COMPLETED' }
      ],
      notes: 'Perbaikan plafond kamar mandi lantai 1 dan natting keramik anti rembes.',
      obstacles: null,
      solutions: null
    },
    {
      day: 39,
      date: '2024-07-21',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 6, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Kuas', volume: '10', unit: 'bh' },
        { name: 'Roll cat', volume: '4', unit: 'bh' },
        { name: 'Cat plafond', volume: '1', unit: 'gln' },
        { name: 'Solasi kertas', volume: '7', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Pengecatan dinding eksterior pagar depan', category: 'Finishing', volume: '15.34 m2', notes: 'Pengecatan pagar besi hitam doff', status: 'COMPLETED' },
        { task_name: 'Pengecatan tralis besi jendela', category: 'Finishing', volume: '8.11 m2', notes: 'Tralis besi dicat rapi', status: 'COMPLETED' }
      ],
      notes: 'Pengecatan pagar depan dan tralis besi jendela selesai 100%.',
      obstacles: null,
      solutions: null
    },
    {
      day: 40,
      date: '2024-07-22',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 6, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Amplas', volume: '5', unit: 'm' },
        { name: 'Alat pel & sapu', volume: '3', unit: 'bh' },
        { name: 'Sikat lantai', volume: '1', unit: 'bh' }
      ],
      tasks: [
        { task_name: 'Perapihan pekerjaan & pembersihan kamar mandi', category: 'Pembersihan', volume: '1 ls', notes: 'Pembersihan kloset, kran, keramik', status: 'COMPLETED' },
        { task_name: 'Pengecekan penyelesaian pekerjaan (Pre-Opname)', category: 'Pengawasan', volume: '1 ls', notes: 'Inspeksi oleh Pengawas Arizal', status: 'COMPLETED' }
      ],
      notes: 'Pembersihan menyeluruh kamar mandi dan pra-inspeksi opname bersama Pengawas Arizal.',
      obstacles: null,
      solutions: null
    },
    {
      day: 41,
      date: '2024-07-23',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Pembuangan puing akhir', volume: '1', unit: 'truk' },
        { name: 'ATK Laporan', volume: '1', unit: 'ls' }
      ],
      tasks: [
        { task_name: 'Pembersihan kawasan renovasi asrama', category: 'Pembersihan', volume: '1 ls', notes: 'Penyapuan, pengepelan lantai 1 & 2', status: 'COMPLETED' },
        { task_name: 'Pembuangan puing sisa material akhir', category: 'Pembersihan', volume: '1 truk', notes: 'Rit ke-5 pembuangan akhir tuntas', status: 'COMPLETED' },
        { task_name: 'Pengecekan penyelesaian pekerjaan', category: 'Pengawasan', volume: '1 ls', notes: 'Checklist 100% item BOQ terpenuhi', status: 'COMPLETED' }
      ],
      notes: 'Pembersihan total kawasan asrama dan pembuangan puing rit kelima/terakhir.',
      obstacles: null,
      solutions: null
    },
    {
      day: 42,
      date: '2024-07-24',
      weather: 'Cerah',
      weather_details: null,
      manpower: [
        { role: 'Pelaksana', count: 1, unit: 'OH' },
        { role: 'Kepala Tukang', count: 1, unit: 'OH' },
        { role: 'Mandor', count: 1, unit: 'OH' },
        { role: 'Tukang', count: 2, unit: 'OH' },
        { role: 'Pekerja', count: 2, unit: 'OH' }
      ],
      materials: [
        { name: 'Pembuangan material', volume: '1', unit: 'pu' },
        { name: 'Pengiriman peralatan ke gudang', volume: '1', unit: 'pu' },
        { name: 'ATK Laporan Akhir', volume: '1', unit: 'ls' }
      ],
      tasks: [
        { task_name: 'Pembersihan kawasan renovasi asrama final', category: 'Pembersihan', volume: '1 ls', notes: 'Kondisi asrama siap ditempati kembali', status: 'COMPLETED' },
        { task_name: 'Pengiriman peralatan pertukangan ke gudang', category: 'Demobilisasi', volume: '1 pu', notes: 'Demobilisasi scaffolding & mesin', status: 'COMPLETED' },
        { task_name: 'Pengecekan inventarisasi peralatan pertukangan', category: 'Demobilisasi', volume: '1 ls', notes: 'Seluruh alat lengkap sesuai daftar', status: 'COMPLETED' },
        { task_name: 'Pengecekan penyelesaian pekerjaan (Joint Inspection)', category: 'Pengawasan', volume: '1 ls', notes: 'Disetujui Pengawas Arizal & Pelaksana Irfan', status: 'COMPLETED' }
      ],
      notes: 'Hari ke-42: Seluruh pekerjaan Renovasi Asrama Mahasiswa Sumbawa Barat tuntas 100%. Demobilisasi peralatan ke gudang dan serah terima dokumen pengawasan.',
      obstacles: null,
      solutions: null
    }
  ];

  console.log(`Inserting ${rawReports.length} daily reports...`);

  for (const r of rawReports) {
    const totalWorkers = r.manpower.reduce((acc, m) => acc + m.count, 0);
    const photosToUse = [
      samplePhotos[(r.day * 1) % samplePhotos.length],
      samplePhotos[(r.day * 2) % samplePhotos.length],
      samplePhotos[(r.day * 3) % samplePhotos.length]
    ].slice(0, 3);

    await prisma.dailyReport.create({
      data: {
        project_id: project.id,
        day_number: r.day,
        date: new Date(`${r.date}T09:00:00Z`),
        weather: r.weather,
        weather_details: r.weather_details,
        worker_count: totalWorkers,
        manpower_details: r.manpower,
        materials_details: r.materials,
        supervisor_name: 'Arizal (PT. Sinergitama Konstruksi Indonesia)',
        contractor_name: 'Irfan Aulia Ulumuddin (PT. Aulia Indoland Grup)',
        notes: r.notes,
        obstacles: r.obstacles,
        solutions: r.solutions,
        photos: photosToUse,
        status: 'SUBMITTED',
        created_by: pmUser.id,
        items: {
          create: r.tasks.map((t) => ({
            task_name: t.task_name,
            category: t.category,
            volume: t.volume,
            notes: t.notes,
            status: t.status || 'COMPLETED'
          }))
        }
      }
    });
  }

  // Also seed S-Curve progress (6 Weeks) for this project
  await prisma.sCurveProgress.deleteMany({
    where: { project_id: project.id }
  });

  const scurveData = [
    { week: 1, plan: 3.5, act: 3.8, c_plan: 3.5, c_act: 3.8 },
    { week: 2, plan: 12.0, act: 12.5, c_plan: 15.5, c_act: 16.3 },
    { week: 3, plan: 22.0, act: 23.1, c_plan: 37.5, c_act: 39.4 },
    { week: 4, plan: 28.5, act: 27.8, c_plan: 66.0, c_act: 67.2 },
    { week: 5, plan: 21.0, act: 20.8, c_plan: 87.0, c_act: 88.0 },
    { week: 6, plan: 13.0, act: 12.0, c_plan: 100.0, c_act: 100.0 }
  ];

  for (const s of scurveData) {
    await prisma.sCurveProgress.create({
      data: {
        project_id: project.id,
        week_number: s.week,
        planned_percentage: s.plan,
        actual_percentage: s.act,
        cumulative_planned: s.c_plan,
        cumulative_actual: s.c_act,
        planned_cost: (186820400 * (s.plan / 100)),
        actual_cost: (186820400 * (s.act / 100))
      }
    });
  }

  console.log('Seeding completed successfully!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
