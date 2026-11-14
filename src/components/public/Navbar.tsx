'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Layanan', href: '/#layanan' },
    { label: 'Portofolio', href: '/portfolio' },
    { label: 'Artikel', href: '/articles' },
    { label: 'Kontak', href: '/#kontak' },
  ];

  return (
    <>
      {/* Top Notification / Info Bar */}
      <div
        style={{
          backgroundColor: '#090d16',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#94a3b8',
          fontSize: '12px',
          padding: '8px 0',
          position: 'relative',
          zIndex: 1001,
        }}
        className="d-none d-md-block"
      >
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ri-map-pin-2-line" style={{ color: '#d97706' }}></i>
                  <span>Area Kerja: D.I. Yogyakarta • Jawa Tengah • Jawa Barat</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ri-time-line" style={{ color: '#d97706' }}></i>
                  <span>Operasional: 08.00 – 21.00 WIB</span>
                </span>
              </div>
            </div>
            <div className="col-auto">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <a
                  href="https://wa.me/6282135450404"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#22c55e',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  <i className="ri-whatsapp-line"></i> 0821-3545-0404
                </a>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                <Link
                  href="/login"
                  style={{
                    color: '#fbbf24',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <i className="ri-shield-user-line"></i> Ruang Klien & ERP
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: isScrolled ? 'rgba(15, 23, 42, 0.95)' : '#0f172a',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.4)' : 'none',
          transition: 'all 0.3s ease',
          padding: isScrolled ? '12px 0' : '16px 0',
        }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-between">
            {/* Logo */}
            <div className="col-auto">
              <Link
                href="/"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '20px',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
                  }}
                >
                  H
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '-0.5px',
                      display: 'block',
                      lineHeight: 1,
                    }}
                  >
                    Halo<span style={{ color: '#d97706' }}>Bangun</span>
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#94a3b8',
                      letterSpacing: '0.8px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      display: 'block',
                      marginTop: '2px',
                    }}
                  >
                    Arsitektur • Konstruksi • Renovasi
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="col-auto d-none d-lg-block">
              <ul
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '26px',
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                }}
              >
                {navLinks.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        style={{
                          color: isActive ? '#d97706' : '#e2e8f0',
                          textDecoration: 'none',
                          fontSize: '14.5px',
                          fontWeight: isActive ? 700 : 500,
                          transition: 'color 0.2s ease',
                          padding: '6px 0',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#d97706')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? '#d97706' : '#e2e8f0')}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right CTAs */}
            <div className="col-auto d-flex align-items-center gap-3">
              <Link
                href="/login"
                style={{
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(217, 119, 6, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(217, 119, 6, 0.3)';
                }}
              >
                <i className="ri-user-shared-line"></i>
                <span>Portal Klien / Login</span>
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="d-lg-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  cursor: 'pointer',
                }}
                aria-label="Toggle Navigation Menu"
              >
                <i className={isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-3-line'}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            style={{
              backgroundColor: '#090d16',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '20px 24px',
              animation: 'fadeIn 0.2s ease',
            }}
            className="d-lg-none"
          >
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      color: pathname === item.href ? '#d97706' : '#e2e8f0',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: pathname === item.href ? 700 : 500,
                      display: 'block',
                      padding: '6px 0',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <a
                  href="https://wa.me/6282135450404"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#22c55e',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="ri-whatsapp-line"></i> Konsultasi WA (0821-3545-0404)
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}

