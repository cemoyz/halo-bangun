import prisma from '@/lib/prisma';

export interface LandingHeroData {
  title: string;
  subtitle: string;
  backgroundImage: string;
  badgeText: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  statsNumber: string;
  statsLabel: string;
  slides?: Array<{
    title: string;
    subtitle: string;
    image: string;
  }>;
}

export interface LandingAboutData {
  badge: string;
  title: string;
  description: string;
  features: string[];
  experienceYears: number;
  experienceLabel: string;
  mainImage: string;
  phoneConsult: string;
}

export interface LandingServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image?: string;
  link: string;
}

export interface LandingServicesData {
  badge: string;
  title: string;
  subtitle: string;
  items: LandingServiceItem[];
}

export interface LandingWhyChooseItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface LandingWhyChooseData {
  badge: string;
  title: string;
  subtitle: string;
  items: LandingWhyChooseItem[];
}

export interface LandingProcessStep {
  step: string;
  title: string;
  description: string;
  icon: string;
}

export interface LandingProcessData {
  badge: string;
  title: string;
  subtitle: string;
  steps: LandingProcessStep[];
}

export interface LandingCtaData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  phoneText: string;
  phoneNumber: string;
}

export interface LandingCounterItem {
  number: number;
  suffix: string;
  label: string;
}

export interface LandingCountersData {
  items: LandingCounterItem[];
}

export interface LandingTestimonialItem {
  name: string;
  role: string;
  project: string;
  comment: string;
  rating: number;
  avatar: string;
}

export interface LandingTestimonialsData {
  badge: string;
  title: string;
  subtitle: string;
  items: LandingTestimonialItem[];
}

export interface LandingFooterData {
  companyName: string;
  tagline: string;
  addressYogyakarta: string;
  addressJawaBarat: string;
  operationalHours: string;
  phone: string;
  whatsapp: string;
  email: string;
  socials: {
    instagram: string;
    facebook: string;
    youtube: string;
    linkedin: string;
  };
  copyright: string;
}

export interface LandingSettingsData {
  imgbb_api_key?: string;
  maintenance_mode?: boolean;
}

// Default Data Fallbacks
export const DEFAULT_LANDING_DATA: Record<string, any> = {
  hero: {
    title: 'Bangun Hunian & Gedung Masa Depan Bersama Halo Bangun',
    subtitle: 'Jasa arsitektur, konstruksi baru, dan renovasi terpercaya di D.I. Yogyakarta, Jateng & Jabar dengan transparansi Kurva S dan live CCTV.',
    backgroundImage: '/main-assets/img/hero/hero_bg_1_1.png',
    badgeText: 'KONTRAKTOR & ARSITEK BERPENGALAMAN',
    primaryButtonText: 'Konsultasi Proyek via WA',
    primaryButtonLink: 'https://wa.me/6282135450404',
    secondaryButtonText: 'Portal Klien',
    secondaryButtonLink: '/login',
    statsNumber: '150+',
    statsLabel: 'Proyek Selesai Tepat Waktu',
    slides: [
      {
        title: 'Bangun Hunian & Gedung Masa Depan Bersama Halo Bangun',
        subtitle: 'Jasa arsitektur, konstruksi baru, dan renovasi terpercaya di D.I. Yogyakarta, Jateng & Jabar dengan transparansi Kurva S dan live CCTV.',
        image: '/main-assets/img/hero/hero_bg_1_1.png',
      },
      {
        title: 'Transparansi Penuh Pengawasan Proyek Lapangan',
        subtitle: 'Pantau perkembangan progres mingguan dengan Kurva S riil, foto harian, dan monitoring CCTV secara real-time langsung di gawai Anda.',
        image: '/main-assets/img/hero/hero_bg_1_2.png',
      },
    ],
  },
  about: {
    badge: 'TENTANG HALO BANGUN',
    title: 'Mitra Terpercaya Solusi Rancang Bangun & Renovasi Berkualitas',
    description: 'Halo Bangun adalah perusahaan jasa arsitektur, konstruksi bangunan baru, dan renovasi profesional yang beroperasi di wilayah D.I. Yogyakarta, Jawa Tengah, dan Jawa Barat. Kami mengutamakan transparansi anggaran, ketepatan jadwal, serta standar mutu bahan bangunan bergaransi.',
    features: [
      'Perjanjian Kontrak Kerja & Garansi Konstruksi Tertulis',
      'RAB Mengikat Tanpa Biaya Tersembunyi di Lapangan',
      'Laporan Progres Berkala Mingguan (Kurva S Rencana vs Riil)',
      'Akses Live CCTV Proyek 24 Jam untuk Klien',
      'Tim Arsitek & Tenaga Ahli Lapangan Berpengalaman',
    ],
    experienceYears: 12,
    experienceLabel: 'Tahun Pengalaman Rancang Bangun',
    mainImage: '/main-assets/img/normal/about_1-1.png',
    phoneConsult: '0821-3545-0404',
  },
  services: {
    badge: 'LAYANAN UTAMA KAMI',
    title: 'Solusi Lengkap Kebutuhan Proyek Konstruksi Anda',
    subtitle: 'Kami menyediakan 4 pilar layanan utama untuk mewujudkan impian hunian maupun fasilitas bisnis yang kokoh, fungsional, dan estetis.',
    items: [
      {
        id: 'arsitektur',
        title: 'Jasa Desain Arsitektur',
        subtitle: 'Konsep Desain & 3D Eksklusif',
        description: 'Perencanaan desain arsitektur mendalam, gambar kerja detail, 3D visual render realistis, hingga animasi konsep tata ruang sesuai gaya hidup dan budget Anda.',
        icon: 'ri-pencil-ruler-2-line',
        image: '/main-assets/img/icon/service-icon1-1.png',
        link: '/pages/innerpage/service',
      },
      {
        id: 'pembangunan',
        title: 'Jasa Renovasi & Pembangunan',
        subtitle: 'Konstruksi Baru & Renovasi Total',
        description: 'Pengerjaan pembangunan rumah baru, villa joglo, gedung kantor, serta renovasi bertahap dengan pengawasan mandor profesional dan standar mutu bergaransi.',
        icon: 'ri-building-line',
        image: '/main-assets/img/icon/service-icon1-2.png',
        link: '/pages/innerpage/service',
      },
      {
        id: 'rab',
        title: 'Jasa Perhitungan RAB',
        subtitle: 'Transparan & Efisien Biaya',
        description: 'Perhitungan Rencana Anggaran Biaya (RAB) terperinci dan transparan, spesifikasi material jelas tanpa biaya tak terduga yang membebani pemilik proyek.',
        icon: 'ri-calculator-line',
        image: '/main-assets/img/icon/service-icon1-3.png',
        link: '/pages/innerpage/service',
      },
      {
        id: 'pbg',
        title: 'Jasa Pengurusan PBG',
        subtitle: 'Khusus Wilayah D.I. Yogyakarta',
        description: 'Layanan asistensi pengurusan Persetujuan Bangunan Gedung (PBG) resmi untuk kelancaran administrasi dan legalitas properti di area D.I. Yogyakarta.',
        icon: 'ri-file-shield-line',
        image: '/main-assets/img/icon/service-icon1-4.png',
        link: '/pages/innerpage/service',
      },
    ],
  },
  whyChoose: {
    badge: 'MENGAPA HALO BANGUN?',
    title: 'Standar Unggul Menjamin Ketenangan Pikiran Anda',
    subtitle: 'Kami mengubah pengalaman membangun rumah menjadi proses yang tenang, transparan, dan terukur secara sistematis.',
    items: [
      {
        id: 'tenaga-ahli',
        title: 'Tenaga Kerja Berpengalaman',
        description: 'Didukung oleh tim mandor, tukang terlatih, dan insinyur pengawas yang berdedikasi tinggi serta berpengalaman lebih dari satu dekade.',
        icon: 'ri-team-line',
      },
      {
        id: 'garansi-tertulis',
        title: 'Perjanjian & Garansi Tertulis',
        description: 'Perlindungan garansi pemeliharaan tertulis resmi setelah BAST ditandatangani untuk menjamin kenyamanan Anda jangka panjang.',
        icon: 'ri-shield-check-line',
      },
      {
        id: 'rab-mengikat',
        title: 'RAB Mengikat Tanpa Jebakan',
        description: 'Rincian biaya mengikat sejak awal tanpa manipulasi atau penambahan biaya tersembunyi yang memberatkan di tengah pengerjaan.',
        icon: 'ri-money-dollar-circle-line',
      },
      {
        id: 'pantauan-cctv',
        title: 'Laporan Progres & Live CCTV',
        description: 'Laporan harian terintegrasi, Kurva S mingguan transparan, serta link live streaming CCTV proyek di genggaman smartphone Anda.',
        icon: 'ri-live-line',
      },
      {
        id: 'ruang-klien',
        title: 'Dashboard Khusus Klien',
        description: 'Setiap klien mendapatkan portal digital pribadi untuk mengunduh dokumen SPKPR, desain, melacak termin, dan menyetujui addendum.',
        icon: 'ri-user-settings-line',
      },
    ],
  },
  process: {
    badge: 'ALUR PEMESANAN',
    title: 'Tahapan Kerja Jelas dari Awal Hingga Serah Terima',
    subtitle: 'Langkah terstruktur memastikan seluruh visi dan anggaran Anda terwujud dengan hasil sempurna.',
    steps: [
      {
        step: '01',
        title: 'Konsultasi & Survei Lokasi',
        description: 'Diskusi rencana kebutuhan, preferensi gaya arsitektur, dan survei fisik kontur tanah lokasi proyek.',
        icon: 'ri-chat-voice-line',
      },
      {
        step: '02',
        title: 'Konsep Desain & Perencanaan',
        description: 'Pembuatan denah, visualisasi 3D render arsitektur, dan penyesuaian tata letak ruangan sesuai masukan Anda.',
        icon: 'ri-layout-masonry-line',
      },
      {
        step: '03',
        title: 'Penyusunan RAB & Kontrak SPK',
        description: 'Penetapan spesifikasi teknis material, rincian biaya mengikat, dan penandatanganan SPK dengan termin bertahap.',
        icon: 'ri-contract-line',
      },
      {
        step: '04',
        title: 'Eksekusi Lapangan & Monitoring',
        description: 'Pengerjaan fisik oleh tukang ahli dengan pengawasan ketat, laporan Kurva S mingguan, dan pantauan CCTV.',
        icon: 'ri-hammer-line',
      },
      {
        step: '05',
        title: 'Serah Terima (BAST) & Garansi',
        description: 'Inspeksi akhir bersama klien, penandatanganan BAST serah terima kunci, dan penyerahan sertifikat garansi purna jual.',
        icon: 'ri-key-2-line',
      },
    ],
  },
  cta: {
    title: 'Siap Mewujudkan Rumah Impian atau Renovasi Proyek Anda?',
    subtitle: 'Konsultasikan rencana Anda bersama tim arsitek dan estimator ahli Halo Bangun hari ini tanpa biaya awal.',
    buttonText: 'Konsultasi Gratis via WhatsApp',
    buttonLink: 'https://wa.me/6282135450404',
    phoneText: 'Hotline Cepat:',
    phoneNumber: '0821-3545-0404',
  },
  counters: {
    items: [
      { number: 150, suffix: '+', label: 'Proyek Selesai' },
      { number: 98, suffix: '%', label: 'Kepuasan Klien' },
      { number: 35, suffix: '+', label: 'Tenaga Ahli Konstruksi' },
      { number: 12, suffix: ' Th', label: 'Pengalaman Industri' },
    ],
  },
  testimonials: {
    badge: 'TESTIMONI KLIEN',
    title: 'Apa Kata Klien yang Telah Mempercayakan Proyeknya',
    subtitle: 'Kepercayaan dan kepuasan klien adalah prioritas utama mutu pengerjaan kami.',
    items: [
      {
        name: 'Ibu Theresia Wulandari',
        role: 'Pemilik Rumah Tinggal',
        project: 'Pembangunan Rumah Tinggal 2 Lantai, Yogyakarta',
        comment: 'Sangat terbantu dengan Portal Klien Halo Bangun. Setiap minggu Kurva S diperbarui dan bisa pantau CCTV lapangan dari kantor tanpa harus sering ke lokasi proyek.',
        rating: 5,
        avatar: '/main-assets/img/testimonial/testi_1_1.png',
      },
      {
        name: 'Mas Reza Fahlevi',
        role: 'Owner Café',
        project: 'Renovasi Arsitektur & Interior Café, Sleman',
        comment: 'RAB sangat transparan dan addendum tercatat rapi secara digital. Pengerjaan renovasi interior selesai tepat waktu sebelum soft-opening café kami.',
        rating: 5,
        avatar: '/main-assets/img/testimonial/testi_1_2.png',
      },
      {
        name: 'Bapak Hendra Kusuma',
        role: 'Keluarga Ndalem Sukoharjo',
        project: 'Pembangunan Ndalem Joglo Tradisional',
        comment: 'Struktur kayu dan atap joglo dikerjakan sangat presisi. Serah terima kunci lancar dan sertifikat garansi resmi langsung diterbitkan.',
        rating: 5,
        avatar: '/main-assets/img/testimonial/testi_1_3.png',
      },
    ],
  },
  footer: {
    companyName: 'Halo Bangun',
    tagline: 'Jasa Arsitektur, Konstruksi Baru & Renovasi Terpercaya. Membangun dengan Transparansi, Integritas, dan Komitmen Mutu.',
    addressYogyakarta: 'Jl. Palagan Tentara Pelajar Km. 9, Sleman, D.I. Yogyakarta',
    addressJawaBarat: 'Jl. Raya Pajajaran No. 88, Bogor, Jawa Barat',
    operationalHours: 'Senin – Sabtu: 08.00 – 21.00 WIB (Minggu Libur / Janji Temu)',
    phone: '0821-3545-0404',
    whatsapp: 'https://wa.me/6282135450404',
    email: 'kontak@halobangun.id',
    socials: {
      instagram: 'https://instagram.com/halobangun',
      facebook: 'https://facebook.com/halobangun',
      youtube: 'https://youtube.com/@halobangun',
      linkedin: 'https://linkedin.com/company/halobangun',
    },
    copyright: '© 2026 Halo Bangun. Seluruh Hak Cipta Dilindungi.',
  },
  settings: {
    imgbb_api_key: '',
    maintenance_mode: false,
  },
};

/**
 * Get dynamic section content from DB with automatic fallback to DEFAULT_LANDING_DATA
 */
export async function getLandingSectionContent<T = any>(section: string): Promise<T> {
  const defaultVal = DEFAULT_LANDING_DATA[section] || {};
  try {
    const record = await prisma.landingPageContent.findUnique({
      where: { section },
    });
    if (record && record.data) {
      // Merge with default so missing keys don't break UI
      if (typeof defaultVal === 'object' && !Array.isArray(defaultVal)) {
        return { ...defaultVal, ...(record.data as any) };
      }
      return record.data as any;
    }
  } catch (error) {
    console.error(`Error loading section ${section}:`, error);
  }
  return defaultVal as T;
}

/**
 * Get all sections merged with defaults
 */
export async function getAllLandingContent(): Promise<Record<string, any>> {
  const result: Record<string, any> = { ...DEFAULT_LANDING_DATA };
  try {
    const records = await prisma.landingPageContent.findMany();
    for (const r of records) {
      if (result[r.section] && typeof result[r.section] === 'object' && !Array.isArray(result[r.section])) {
        result[r.section] = { ...result[r.section], ...(r.data as any) };
      } else {
        result[r.section] = r.data;
      }
    }
  } catch (error) {
    console.error('Error loading all landing contents:', error);
  }
  return result;
}

/**
 * Save section data to DB
 */
export async function saveLandingSectionContent(section: string, data: any) {
  return await prisma.landingPageContent.upsert({
    where: { section },
    update: { data },
    create: { section, data },
  });
}

