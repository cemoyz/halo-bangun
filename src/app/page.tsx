'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const trustSignals = [
    {
      icon: 'ri-user-star-line',
      title: 'Tenaga Kerja Berpengalaman',
      desc: 'Dikerjakan oleh arsitek terverifikasi, Project Manager sipil berlisensi, serta mandor dan kepala tukang ahli berpengalaman belasan tahun.',
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Perjanjian & Garansi Tertulis',
      desc: 'Setiap proyek dilindungi SPKPR resmi bermaterai lengkap dengan klausul garansi struktur dan garansi kebocoran pemeliharaan tertulis.',
    },
    {
      icon: 'ri-scales-3-line',
      title: 'RAB Mengikat Tanpa Biaya Tersembunyi',
      desc: 'Transparansi penuh sejak awal. Rencana Anggaran Biaya (RAB) dibuat presisi dan mengikat tanpa pembengkakan biaya mendadak di tengah jalan.',
    },
    {
      icon: 'ri-line-chart-line',
      title: 'Laporan Progres Berkala + Live CCTV',
      desc: 'Pantau deviasi fisik rencana vs riil lewat grafik Kurva S mingguan, foto harian pengawasan, dan akses kamera CCTV proyek secara langsung.',
    },
    {
      icon: 'ri-computer-line',
      title: 'Dashboard Khusus Klien (Ruang Klien)',
      desc: 'Klien mendapatkan akses portal digital mandiri untuk memantau status termin, unduh dokumen SPKPR, setujui addendum, dan dokumen BAST.',
    },
  ];

  const services = [
    {
      icon: 'ri-pencil-ruler-2-line',
      title: 'Jasa Desain Arsitektur',
      badge: 'Visualisasi 3D Realistis',
      desc: 'Perencanaan denah fungsional 2D, gambar kerja DED arsitektur & struktur lengkap, visualisasi render fasad 3D berkualitas tinggi, serta estimasi tata letak ruang.',
      items: ['Konsep Desain Rumah & Komersial', 'Gambar Kerja Lengkap (DED)', 'Visual Fasad 3D Photorealistic', 'Analisis Sirkulasi Udara & Cahaya'],
      linkText: 'Konsultasi Desain',
    },
    {
      icon: 'ri-building-line',
      title: 'Jasa Renovasi & Pembangunan',
      badge: 'Struktur SNI Bergaransi',
      desc: 'Pembangunan rumah tinggal, kos-kosan eksklusif, ruko, kafe, kantor, hingga renovasi skala kecil maupun total dengan mutu beton dan material berstandar SNI.',
      items: ['Bangun Rumah Baru dari Nol', 'Renovasi Fasad & Interior', 'Peningkatan Lantai (Tingkat)', 'Pekerjaan Baja Ringan & Struktur'],
      linkText: 'Mulai Bangun / Renovasi',
    },
    {
      icon: 'ri-calculator-line',
      title: 'Jasa Perhitungan RAB',
      badge: 'Akurat & Mengikat',
      desc: 'Penyusunan Rencana Anggaran Biaya (RAB) terperinci berdasarkan volume bahan riil dan analisis harga satuan kerja (AHS) pasar terkini di wilayah kerja Anda.',
      items: ['Perhitungan Volume Material Presisi', 'Analisis Upah Tenaga Kerja', 'Optimalisasi Anggaran Klien', 'RAB Mengikat Tanpa Mark-up Liar'],
      linkText: 'Hitung Estimasi Biaya',
    },
    {
      icon: 'ri-government-line',
      title: 'Jasa Pengurusan PBG (Khusus DIY)',
      badge: 'Legalitas Resmi D.I. Yogyakarta',
      desc: 'Layanan terpadu pengurusan Persetujuan Bangunan Gedung (PBG) di wilayah Sleman, Bantul, dan Kota Yogyakarta melalui sistem resmi SIMBG Kementerian PUPR.',
      items: ['Persiapan Gambar Teknis Standar SIMBG', 'Perhitungan Kelayakan Konstruksi', 'Pendampingan Sidang Teknis TPA/TPT', 'Penerbitan Dokumen PBG Resmi'],
      linkText: 'Urus Izin PBG Sekarang',
    },
  ];

  const orderFlows = [
    {
      step: '01',
      title: 'Konsultasi & Survey Lokasi',
      desc: 'Diskusi kebutuhan ruang, gaya arsitektur, estimasi budget, dan survey pengukuran langsung kondisi tanah di lapangan.',
    },
    {
      step: '02',
      title: 'Desain 3D & Penyusunan RAB',
      desc: 'Pembuatan konsep denah, visualisasi 3D fasad, dan penyusunan RAB mengikat yang transparan tanpa biaya siluman.',
    },
    {
      step: '03',
      title: 'Kontrak SPKPR & Pembayaran DP',
      desc: 'Penandatanganan Surat Perjanjian Kerja Pelaksanaan Renovasi (SPKPR) bermaterai dan pembayaran termin tahap awal.',
    },
    {
      step: '04',
      title: 'Konstruksi & Live Monitoring',
      desc: 'Pelaksanaan konstruksi di lapangan yang dapat dipantau langsung oleh klien via Live CCTV, Kurva S, dan foto harian.',
    },
    {
      step: '05',
      title: 'BAST & Sertifikat Garansi',
      desc: 'Pemeriksaan akhir bersama, penandatanganan Berita Acara Serah Terima (BAST), dan penyerahan sertifikat garansi tertulis.',
    },
  ];

  const featuredPortfolios = [
    {
      title: 'Rumah Tinggal Modern Tropis Ibu Theresia',
      category: 'Pembangunan Baru',
      location: 'Sleman, D.I. Yogyakarta',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      tag: '2 Lantai • Luas 220 m²',
    },
    {
      title: 'Ndalem Sukoharjo 1 & 2 (Japandi Modern)',
      category: 'Desain Arsitektur & Bangun',
      location: 'Sukoharjo, Jawa Tengah',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
      tag: 'Rumah Tinggal Eksklusif',
    },
    {
      title: 'Renovasi Interior & Arsitektur Café Mas Reza',
      category: 'Komersial / Kafe',
      location: 'Sambilegi, D.I. Yogyakarta',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      tag: 'Industrial Garden Concept',
    },
    {
      title: 'Perencanaan Asrama Mahasiswa Sumbawa Barat',
      category: 'Pengadaan & Fasilitas Publik',
      location: 'D.I. Yogyakarta',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
      tag: 'Gedung Asrama 3 Lantai',
    },
  ];

  const faqs = [
    {
      q: 'Apakah biaya pembangunan dalam RAB bisa membengkak di tengah proses?',
      a: 'Tidak. Di Halo Bangun, kami menerapkan prinsip RAB Mengikat. Segala spesifikasi material, volume, dan harga satuan telah disepakati di dalam dokumen SPKPR tertulis. Jika ada perubahan desain atau pekerjaan tambah/kurang dari keinginan klien (Addendum), hal tersebut wajib diajukan dan disetujui secara digital melalui portal klien sebelum dikerjakan.',
    },
    {
      q: 'Bagaimana cara klien memantau proyek jika sedang berada di luar kota?',
      a: 'Setiap klien mendapatkan akun khusus "Portal Klien" di website Halo Bangun. Melalui portal ini, Anda dapat melihat live streaming CCTV lapangan 24 jam, grafik Kurva S mingguan (membandingkan target vs realisasi riil), galeri foto progres harian yang diunggah pengawas lapangan, serta status pembayaran termin.',
    },
    {
      q: 'Berapa lama masa garansi konstruksi yang diberikan?',
      a: 'Kami memberikan garansi pemeliharaan tertulis selama 3 hingga 6 bulan untuk kebocoran dan instalasi, serta garansi struktur hingga 1 tahun yang tercantum resmi di dalam Berita Acara Serah Terima (BAST). Dokumen garansi dapat diunduh langsung di akun portal klien setelah serah terima unit.',
    },
    {
      q: 'Bagaimana sistem pembayaran termin di Halo Bangun?',
      a: 'Pembayaran dilakukan secara bertahap (termin) sesuai progres fisik nyata di lapangan (misal: DP awal, progres struktur 30%, progres dinding/atap 60%, finishing 90%, dan retensi 5% setelah BAST). Anda dapat mengunggah bukti transfer langsung di portal klien dan mengunduh kwitansi pembayaran resmi.',
    },
    {
      q: 'Wilayah mana saja yang dijangkau oleh layanan Halo Bangun?',
      a: 'Wilayah operasional utama kami mencakup seluruh Daerah Istimewa Yogyakarta (Sleman, Bantul, Kulon Progo, Gunungkidul, Kota Jogja), Jawa Tengah (Solo, Sukoharjo, Klaten, Magelang, Purworejo, Semarang), serta Jawa Barat. Untuk konsultasi awal dan survey lokasi, Anda dapat langsung menghubungi WhatsApp kami.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section
        style={{
          position: 'relative',
          paddingTop: '110px',
          paddingBottom: '120px',
          backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.78) 0%, rgba(15, 23, 42, 0.95) 100%), url("https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=1600&auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center gy-5">
            <div className="col-lg-8">
              {/* Pill Tag */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  border: '1px solid rgba(217, 119, 6, 0.35)',
                  borderRadius: '30px',
                  padding: '6px 16px',
                  marginBottom: '20px',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d97706' }}></span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  Kontraktor & Arsitektur Terpercaya D.I. Yogyakarta • Jateng • Jabar
                </span>
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: 'clamp(32px, 5vw, 54px)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-1px',
                  color: '#ffffff',
                  marginBottom: '22px',
                }}
              >
                Membangun dengan <span style={{ color: '#d97706' }}>Transparansi Nyata</span> & Garansi Tertulis.
              </h1>

              {/* Sub-headline */}
              <p
                style={{
                  fontSize: 'clamp(15px, 2vw, 18px)',
                  color: '#cbd5e1',
                  lineHeight: 1.65,
                  maxWidth: '680px',
                  marginBottom: '36px',
                }}
              >
                Wujudkan hunian dan bangunan komersial berkualitas tanpa rasa was-was.
                Dipantau langsung lewat <strong>Kurva S fisik, live CCTV lapangan 24 jam</strong>,
                serta jaminan <strong>RAB mengikat tanpa biaya tersembunyi</strong>.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
                <a
                  href="https://wa.me/6282135450404?text=Halo%20Bangun,%20saya%20tertarik%20untuk%20konsultasi%20proyek%20konstruksi/desain."
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '15px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(217, 119, 6, 0.4)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b45309')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d97706')}
                >
                  <i className="ri-whatsapp-line" style={{ fontSize: '18px' }}></i>
                  <span>Konsultasi Proyek via WA</span>
                </a>

                <Link
                  href="/login"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '15px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  <i className="ri-dashboard-line" style={{ fontSize: '18px', color: '#fbbf24' }}></i>
                  <span>Pantau Proyek Klien</span>
                </Link>
              </div>
            </div>

            {/* Right Card Feature Highlight */}
            <div className="col-lg-4">
              <div
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(217, 119, 6, 0.2)',
                      color: '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    <i className="ri-radar-line"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                      Live Project Monitor
                    </h3>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Standar Keamanan Transparansi</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <i className="ri-checkbox-circle-fill" style={{ color: '#22c55e', fontSize: '18px', flexShrink: 0 }}></i>
                    <span><strong>Live CCTV 24 Jam:</strong> Akses stream mandiri langsung dari smartphone Anda.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <i className="ri-checkbox-circle-fill" style={{ color: '#22c55e', fontSize: '18px', flexShrink: 0 }}></i>
                    <span><strong>Kurva S Digital:</strong> Lacak persentase rencana kerja vs realisasi riil di lapangan.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <i className="ri-checkbox-circle-fill" style={{ color: '#22c55e', fontSize: '18px', flexShrink: 0 }}></i>
                    <span><strong>Foto Harian Pengawas:</strong> Maksimal 3 foto dokumentasi fisik terunggah setiap hari.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <i className="ri-checkbox-circle-fill" style={{ color: '#22c55e', fontSize: '18px', flexShrink: 0 }}></i>
                    <span><strong>BAST & Garansi Terbuka:</strong> Serah terima kunci resmi dan sertifikat garansi tertulis.</span>
                  </div>
                </div>

                <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <Link
                    href="/about"
                    style={{
                      color: '#fbbf24',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Pelajari Standar Mutu Halo Bangun</span>
                    <i className="ri-arrow-right-line"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS BAR ================= */}
      <section
        style={{
          backgroundColor: '#090d16',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '36px 0',
        }}
      >
        <div className="container">
          <div className="row text-center gy-4">
            <div className="col-6 col-md-3">
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#d97706', lineHeight: 1 }}>100+</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
                Proyek Selesai & Berjalan
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>100%</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
                RAB Mengikat (No Hidden Cost)
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>3 Wilayah</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
                D.I. Yogyakarta • Jateng • Jabar
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>1 Tahun</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
                Garansi Tertulis Resmi (BAST)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= KENAPA MEMILIH HALO BANGUN? (TRUST SIGNALS) ================= */}
      <section
        id="keunggulan"
        style={{
          padding: '90px 0',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#d97706',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Komitmen Kualitas & Kepercayaan
            </span>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.5px',
                lineHeight: 1.25,
                margin: '0 0 16px 0',
              }}
            >
              Kenapa Memilih Halo Bangun?
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
              Kami menjawab kekhawatiran klasik dalam dunia konstruksi: proyek molor, kualitas mengecewakan,
              dan biaya tak terduga dengan sistem manajemen berbasis data dan pengawasan digital.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {trustSignals.map((item, idx) => (
              <div className="col-lg-4 col-md-6" key={idx}>
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '30px 24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = '#d97706';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(217, 119, 6, 0.15)',
                      color: '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      marginBottom: '20px',
                    }}
                  >
                    <i className={item.icon}></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4 LAYANAN UTAMA ================= */}
      <section
        id="layanan"
        style={{
          padding: '90px 0',
          backgroundColor: '#090d16',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#d97706',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Solusi Terpadu Satu Pintu
            </span>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.5px',
                lineHeight: 1.25,
                margin: '0 0 16px 0',
              }}
            >
              4 Layanan Utama Halo Bangun
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
              Dari tahap coretan konsep desain, perizinan gedung, hingga pelaksanaan fisik dan serah terima kunci.
            </p>
          </div>

          <div className="row g-4">
            {services.map((svc, idx) => (
              <div className="col-lg-6" key={idx}>
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '32px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, rgba(217,119,6,0.2) 0%, rgba(180,83,9,0.2) 100%)',
                          color: '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          border: '1px solid rgba(217,119,6,0.3)',
                        }}
                      >
                        <i className={svc.icon}></i>
                      </div>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#fbbf24',
                          backgroundColor: 'rgba(217, 119, 6, 0.12)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          border: '1px solid rgba(217, 119, 6, 0.25)',
                        }}
                      >
                        {svc.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
                      {svc.title}
                    </h3>

                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.65, marginBottom: '20px' }}>
                      {svc.desc}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '24px' }}>
                      {svc.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#cbd5e1' }}>
                          <i className="ri-check-line" style={{ color: '#d97706', fontWeight: 700 }}></i>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <a
                      href={`https://wa.me/6282135450404?text=Halo%20Bangun,%20saya%20ingin%20konsultasi%20mengenai%20${encodeURIComponent(svc.title)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#d97706',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderBottom: '1.5px solid #d97706',
                        paddingBottom: '2px',
                      }}
                    >
                      <span>{svc.linkText}</span>
                      <i className="ri-arrow-right-up-line"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ALUR PEMESANAN (ORDERING FLOW) ================= */}
      <section
        id="alur-pemesanan"
        style={{
          padding: '90px 0',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#d97706',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Tahapan Pekerjaan Terstruktur
            </span>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.5px',
                lineHeight: 1.25,
                margin: '0 0 16px 0',
              }}
            >
              Alur Pemesanan & Pembangunan
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
              Langkah transparan dari awal konsultasi hingga kunci rumah diserahkan kepada Anda.
            </p>
          </div>

          <div className="row g-4">
            {orderFlows.map((flow, idx) => (
              <div className="col-lg col-md-6" key={idx}>
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '24px 20px',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 900,
                      color: 'rgba(217, 119, 6, 0.35)',
                      lineHeight: 1,
                      marginBottom: '14px',
                    }}
                  >
                    {flow.step}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                    {flow.title}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                    {flow.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PREVIEW PORTOFOLIO TERPILIH ================= */}
      <section
        id="portofolio-preview"
        style={{
          padding: '90px 0',
          backgroundColor: '#090d16',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container">
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
            <div>
              <span
                style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#d97706',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Bukti Karya Nyata
              </span>
              <h2
                style={{
                  fontSize: 'clamp(26px, 3.5vw, 38px)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.25,
                  margin: 0,
                }}
              >
                Portofolio Proyek Unggulan
              </h2>
            </div>
            <Link
              href="/portfolio"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Lihat Semua Proyek ({`20+ Proyek`})</span>
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          <div className="row g-4">
            {featuredPortfolios.map((item, idx) => (
              <div className="col-lg-6" key={idx}>
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = '#d97706';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(6px)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#fbbf24',
                      }}
                    >
                      {item.category}
                    </div>
                  </div>
                  <div style={{ padding: '22px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      📍 {item.location} • {item.tag}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section
        id="faq"
        style={{
          padding: '90px 0',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#d97706',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Pertanyaan yang Sering Diajukan
            </span>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.5px',
                lineHeight: 1.25,
                margin: '0 0 16px 0',
              }}
            >
              FAQ Halo Bangun
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
              Jawaban ringkas seputar sistem kontrak, garansi, transparansi termin, dan pemantauan proyek.
            </p>
          </div>

          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#1e293b',
                    border: `1px solid ${isOpen ? '#d97706' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '18px 22px',
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 700,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{faq.q}</span>
                    <i
                      className={isOpen ? 'ri-subtract-line' : 'ri-add-line'}
                      style={{
                        color: isOpen ? '#d97706' : '#94a3b8',
                        fontSize: '20px',
                        flexShrink: 0,
                      }}
                    ></i>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 22px 20px 22px',
                        fontSize: '14px',
                        color: '#94a3b8',
                        lineHeight: 1.7,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '14px',
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA BANNER ================= */}
      <section
        id="kontak"
        style={{
          padding: '80px 0',
          backgroundImage: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container text-center" style={{ maxWidth: '780px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              backgroundColor: 'rgba(217, 119, 6, 0.2)',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 20px auto',
            }}
          >
            <i className="ri-customer-service-2-line"></i>
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.5px',
              marginBottom: '16px',
            }}
          >
            Siap Wujudkan Bangunan Impian Anda?
          </h2>
          <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: 1.65, marginBottom: '32px' }}>
            Konsultasikan ide Anda bersama tim arsitek dan teknis Halo Bangun.
            Kami siap melayani survey lokasi gratis di wilayah D.I. Yogyakarta, Jawa Tengah, dan Jawa Barat.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
            <a
              href="https://wa.me/6282135450404?text=Halo%20Bangun,%20saya%20ingin%20konsultasi%20langsung%20dengan%20tim%20teknis."
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                padding: '14px 30px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(217, 119, 6, 0.4)',
              }}
            >
              <i className="ri-whatsapp-fill" style={{ fontSize: '18px' }}></i>
              <span>Hubungi via WhatsApp (0821-3545-0404)</span>
            </a>
            <Link
              href="/portfolio"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '14px 28px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="ri-gallery-line" style={{ fontSize: '18px' }}></i>
              <span>Jelajahi Portofolio</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
