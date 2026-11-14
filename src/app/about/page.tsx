import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';

export const metadata = {
  title: 'Tentang Kami - Halo Bangun || Jasa Arsitektur & Konstruksi',
  description: 'Profil perusahaan, visi misi, nilai-nilai, dan tim profesional Halo Bangun.',
};

export default function AboutPage() {
  const companyValues = [
    {
      icon: 'ri-scales-line',
      title: 'Transparansi Penuh (Zero Hidden Cost)',
      desc: 'Setiap rincian biaya material, upah tukang, dan time schedule dipaparkan secara jujur tanpa mark-up liar. Klien memegang kendali atas dana mereka.',
    },
    {
      icon: 'ri-shield-star-line',
      title: 'Kualitas Berstandar SNI & Garansi',
      desc: 'Menggunakan material berstandar SNI dan metode konstruksi tahan gempa. Setiap hasil pekerjaan dilengkapi garansi struktur dan garansi pemeliharaan tertulis.',
    },
    {
      icon: 'ri-timer-flash-line',
      title: 'Disiplin Waktu (Kurva S Monitor)',
      desc: 'Pengendalian proyek berbasis target mingguan yang terukur lewat grafik Kurva S digital, meminimalisir deviasi dan keterlambatan serah terima.',
    },
    {
      icon: 'ri-hand-heart-line',
      title: 'Amanah & Pelayanan Humanis',
      desc: 'Membangun bukan sekadar urusan semen dan pasir, melainkan mewujudkan impian hidup klien dengan komunikasi hangat, responsif, dan bertanggung jawab.',
    },
  ];

  const managementTeam = [
    {
      name: 'Bpk. Arga Pramudya, S.T.',
      role: 'Direktur Utama / Founder',
      desc: 'Lulusan Teknik Sipil dengan pengalaman lebih dari 12 tahun memimpin proyek residensial, gedung komersial, dan pengadaan pemerintah.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dimas Pratama, S.T.',
      role: 'Senior Project Manager / Pengawas',
      desc: 'Praktisi pengawasan lapangan ahli struktur beton bertulang dan manajemen time schedule Kurva S.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Ibu Ratna Dewi, S.E.',
      role: 'Finance & Accounting Lead',
      desc: 'Mengelola tata kelola anggaran RAB, verifikasi termin dana klien, rekonsiliasi pengadaan, dan audit keuangan transparan.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Nathania Eda, S.Ars.',
      role: 'Lead Architect & 3D Visualizer',
      desc: 'Arsitek spesialis hunian tropis modern, Japandi style, dan layout komersial fungsional ramah pencahayaan alami.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* Page Header Banner */}
      <section
        style={{
          padding: '80px 0 60px 0',
          backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.98) 100%), url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#d97706',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              display: 'inline-block',
              marginBottom: '10px',
            }}
          >
            Mengenal Lebih Dekat
          </span>
          <h1
            style={{
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.5px',
              margin: '0 0 14px 0',
            }}
          >
            Tentang Halo Bangun
          </h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Mitra konstruksi profesional yang menggabungkan keindahan estetika arsitektur,
            kekuatan struktur bangunan, dan transparansi pengawasan digital.
          </p>
        </div>
      </section>

      {/* Company Story & Description */}
      <section style={{ padding: '90px 0', backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#d97706',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Kisah & Landasan Berdiri
              </span>
              <h2
                style={{
                  fontSize: 'clamp(26px, 3.5vw, 36px)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.3,
                  marginBottom: '20px',
                }}
              >
                Membongkar Paradigma Lama Dunia Konstruksi.
              </h2>
              <div style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0 }}>
                  <strong>Halo Bangun</strong> lahir dari pengalaman panjang dan keprihatinan mendalam terhadap
                  seringnya pemilik bangunan dirugikan oleh praktek kontraktor konvensional: RAB yang tiba-tiba membengkak di tengah pengerjaan,
                  keterlambatan berbulan-bulan tanpa penjelasan, serta kualitas bahan yang diturunkan tanpa sepengetahuan pemilik.
                </p>
                <p style={{ margin: 0 }}>
                  Beroperasi di wilayah <strong>D.I. Yogyakarta, Jawa Tengah, dan Jawa Barat</strong>, kami menghadirkan terobosan
                  dengan mengintegrasikan sistem pelaporan digital: <strong>Kurva S fisik, live stream CCTV 24 jam</strong>,
                  serta hak akses mandiri bagi klien melalui portal digital khusus.
                </p>
                <p style={{ margin: 0 }}>
                  Bagi kami, setiap meter persegi yang kami bangun adalah amanah yang harus berdiri kokoh, indah, dan memberikan
                  ketenangan lahir batin bagi seluruh penghuninya.
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <div style={{ position: 'relative' }}>
                <img
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80"
                  alt="Tim Arsitektur Halo Bangun"
                  style={{
                    width: '100%',
                    height: '420px',
                    objectFit: 'cover',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '20px',
                    backgroundColor: '#1e293b',
                    border: '1.5px solid #d97706',
                    borderRadius: '16px',
                    padding: '18px 24px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#d97706', lineHeight: 1 }}>100%</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                    Garansi Struktur & Anti Bocor
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi dan Misi */}
      <section style={{ padding: '90px 0', backgroundColor: '#090d16', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6">
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '36px',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(217, 119, 6, 0.15)',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    marginBottom: '20px',
                  }}
                >
                  <i className="ri-eye-line"></i>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                  Visi Perusahaan
                </h3>
                <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.75, margin: 0 }}>
                  Menjadi perusahaan jasa konstruksi dan arsitektur terdepan dan paling terpercaya di Indonesia
                  yang menjadi rujukan standar transparansi, mutu struktur, serta kepuasan pelanggan melalui pemanfaatan teknologi modern.
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '36px',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    marginBottom: '20px',
                  }}
                >
                  <i className="ri-focus-3-line"></i>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                  Misi Perusahaan
                </h3>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '14.5px', color: '#cbd5e1', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Menyediakan desain arsitektur bernilai estetika tinggi, fungsional, dan efisien biaya.</li>
                  <li>Menerapkan sistem pengawasan lapangan berbasis bukti nyata (Kurva S & CCTV) untuk transparansi 100%.</li>
                  <li>Menjamin ketepatan spesifikasi material SNI tanpa penurunan mutu atau kompromi.</li>
                  <li>Memberikan rasa aman maksimal bagi klien melalui perjanjian tertulis dan garansi purna jual.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai-Nilai Perusahaan (Company Values) */}
      <section style={{ padding: '90px 0', backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
              Prinsip Kerja Utama
            </span>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.5vw, 36px)',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 14px 0',
              }}
            >
              Nilai-Nilai Perusahaan (Company Values)
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
              Pondasi karakter yang dipegang teguh oleh setiap insan teknisi, mandor, dan manajemen Halo Bangun.
            </p>
          </div>

          <div className="row g-4">
            {companyValues.map((val, idx) => (
              <div className="col-lg-3 col-md-6" key={idx}>
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '28px 22px',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(217, 119, 6, 0.15)',
                      color: '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      marginBottom: '18px',
                    }}
                  >
                    <i className={val.icon}></i>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
                    {val.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
                    {val.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kolase Foto Tim Manajemen Profesional */}
      <section style={{ padding: '90px 0', backgroundColor: '#090d16', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
              Orang di Balik Karya
            </span>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.5vw, 36px)',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 14px 0',
              }}
            >
              Tim Manajemen Profesional
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
              Didukung oleh tenaga ahli berdedikasi tinggi yang mengawal proyek Anda dari konsepsi hingga serah terima.
            </p>
          </div>

          <div className="row g-4">
            {managementTeam.map((team, idx) => (
              <div className="col-lg-3 col-md-6" key={idx}>
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <img
                    src={team.image}
                    alt={team.name}
                    style={{ width: '100%', height: '260px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {team.role}
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
                      {team.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.55, margin: 0, flex: 1 }}>
                      {team.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section style={{ padding: '70px 0', backgroundColor: '#0f172a', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
            Ingin Berdiskusi Langsung dengan Tim Arsitek Kami?
          </h2>
          <p style={{ fontSize: '14.5px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
            Konsultasikan denah lahan, renovasi bangunan, atau estimasi anggaran Anda bersama Project Manager Halo Bangun.
          </p>
          <a
            href="https://wa.me/6282135450404?text=Halo%20Bangun,%20saya%20ingin%20konsultasi%20mengenai%20proyek%20saya."
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: '#d97706',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="ri-whatsapp-line"></i>
            <span>Hubungi WhatsApp Resmi</span>
          </a>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
