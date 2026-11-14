'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#090d16',
        color: '#94a3b8',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '64px',
        paddingBottom: '28px',
        position: 'relative',
        zIndex: 10,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div className="container">
        <div className="row gy-4 gx-lg-5 justify-content-between mb-5">
          {/* Col 1: Brand Info */}
          <div className="col-lg-4 col-md-6">
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '20px',
                }}
              >
                H
              </div>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                }}
              >
                Halo<span style={{ color: '#d97706' }}>Bangun</span>
              </span>
            </Link>
            <p style={{ fontSize: '13.5px', lineHeight: 1.7, color: '#94a3b8', marginBottom: '20px' }}>
              Perusahaan jasa konstruksi, arsitektur, dan renovasi terpercaya. Menghadirkan transparansi
              proyek nyata dengan monitoring Kurva S, live CCTV lapangan, RAB mengikat, dan garansi tertulis.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="https://wa.me/6282135450404"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  textDecoration: 'none',
                }}
                aria-label="WhatsApp"
              >
                <i className="ri-whatsapp-line"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#e1306c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  textDecoration: 'none',
                }}
                aria-label="Instagram"
              >
                <i className="ri-instagram-line"></i>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  textDecoration: 'none',
                }}
                aria-label="Facebook"
              >
                <i className="ri-facebook-fill"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#0ea5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  textDecoration: 'none',
                }}
                aria-label="LinkedIn"
              >
                <i className="ri-linkedin-fill"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Layanan Utama */}
          <div className="col-lg-2 col-md-6">
            <h4
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Layanan Utama
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <li>
                <Link href="/#layanan" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Desain Arsitektur 3D
                </Link>
              </li>
              <li>
                <Link href="/#layanan" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Pembangunan Baru
                </Link>
              </li>
              <li>
                <Link href="/#layanan" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Renovasi Rumah & Ruko
                </Link>
              </li>
              <li>
                <Link href="/#layanan" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Perhitungan RAB Realistis
                </Link>
              </li>
              <li>
                <Link href="/#layanan" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Pengurusan PBG (Khusus DIY)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigasi Cepat */}
          <div className="col-lg-2 col-md-6">
            <h4
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Tautan Cepat
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <li>
                <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Tentang Halo Bangun
                </Link>
              </li>
              <li>
                <Link href="/portfolio" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Portofolio Proyek
                </Link>
              </li>
              <li>
                <Link href="/articles" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Artikel Konstruksi
                </Link>
              </li>
              <li>
                <Link href="/login" style={{ color: '#d97706', fontWeight: 600, textDecoration: 'none' }}>
                  Portal Klien & Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Info Operasional & Kontak */}
          <div className="col-lg-4 col-md-6">
            <h4
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Informasi Operasional & Kontak
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <i className="ri-map-pin-line" style={{ color: '#d97706', fontSize: '18px', flexShrink: 0, marginTop: '2px' }}></i>
                <div>
                  <strong style={{ color: '#f8fafc' }}>Alamat Kantor:</strong>
                  <div>Yogyakarta & Jawa Barat</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <i className="ri-compass-3-line" style={{ color: '#d97706', fontSize: '18px', flexShrink: 0, marginTop: '2px' }}></i>
                <div>
                  <strong style={{ color: '#f8fafc' }}>Area Layanan:</strong>
                  <div>D.I. Yogyakarta, Jawa Tengah & Jawa Barat</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <i className="ri-time-line" style={{ color: '#d97706', fontSize: '18px', flexShrink: 0, marginTop: '2px' }}></i>
                <div>
                  <strong style={{ color: '#f8fafc' }}>Jam Operasional:</strong>
                  <div>Setiap Hari: 08.00 – 21.00 WIB</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <i className="ri-whatsapp-line" style={{ color: '#22c55e', fontSize: '18px', flexShrink: 0, marginTop: '2px' }}></i>
                <div>
                  <strong style={{ color: '#f8fafc' }}>WhatsApp Resmi:</strong>
                  <div>
                    <a href="https://wa.me/6282135450404" target="_blank" rel="noreferrer" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
                      0821-3545-0404
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '24px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12.5px',
          }}
        >
          <div>
            © {new Date().getFullYear()} <strong>Halo Bangun</strong>. Seluruh hak cipta dilindungi undang-undang.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Transparansi Proyek</span>
            <span>•</span>
            <span>Garansi Tertulis</span>
            <span>•</span>
            <Link href="/login" style={{ color: '#d97706', textDecoration: 'none', fontWeight: 600 }}>
              Masuk Portal Klien
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
