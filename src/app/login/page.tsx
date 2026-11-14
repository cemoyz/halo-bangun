'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const DEMO_ACCOUNTS = [
  {
    role: 'OWNER',
    name: 'Bpk. Arga Pramudya, S.T.',
    email: 'owner@halobangun.id',
    title: 'Direktur / Owner',
    badge: 'Super Admin',
    color: '#e11d48',
    icon: 'ri-vip-crown-2-line',
    desc: 'Akses penuh eksekutif, laba rugi gabungan, seluruh CCTV & inisiasi proyek.',
  },
  {
    role: 'FINANCE',
    name: 'Ibu Ratna Dewi, S.E.',
    email: 'finance@halobangun.id',
    title: 'Finance & Accounting Lead',
    badge: 'Keuangan',
    color: '#059669',
    icon: 'ri-wallet-3-line',
    desc: 'Kelola termin, verifikasi bukti bayar, kwitansi, rekap RAB vs riil & payroll.',
  },
  {
    role: 'PM',
    name: 'Dimas Pratama, S.T.',
    email: 'pm@halobangun.id',
    title: 'Senior Project Manager',
    badge: 'Pengawas',
    color: '#0284c7',
    icon: 'ri-survey-line',
    desc: 'Laporan harian (maks 3 foto), Kurva S fisik, nota pembelian & inventaris.',
  },
  {
    role: 'MANDOR',
    name: 'Pak Sukirno',
    email: 'mandor@halobangun.id',
    title: 'Mandor & Kepala Tukang',
    badge: 'Lapangan',
    color: '#d97706',
    icon: 'ri-hammer-line',
    desc: 'Mobile-first: pantau instruksi harian, permintaan material & slip gaji.',
  },
  {
    role: 'CLIENT',
    name: 'Ibu Theresia Wulandari',
    email: 'client@halobangun.id',
    title: 'Klien Proyek Rumah Sleman',
    badge: 'Portal Klien',
    color: '#7c3aed',
    icon: 'ri-home-smile-line',
    desc: 'Pantau CCTV live, foto harian, Kurva S, upload bukti termin & addendum.',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);

  const handleSelectDemo = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setSelectedDemoRole(demo.role);
    setEmail(demo.email);
    setPassword('password123');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
      }

      // Simpan data user ke sessionStorage untuk matching duanarasi
      if (typeof window !== 'undefined' && data.user) {
        try {
          sessionStorage.setItem('dash_user', JSON.stringify(data.user));
        } catch (err) {}
      }

      // Redirect ke URL target atau dashboard bawaan per peran
      const destination = redirectParam || data.redirectUrl || '/dashboard';
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menghubungi server.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(30, 41, 59, 0.9) 0, transparent 70%), radial-gradient(at 100% 100%, rgba(15, 23, 42, 0.9) 0, transparent 70%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px 16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1080px', width: '100%' }}>
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: '22px',
                boxShadow: '0 8px 16px rgba(249, 115, 22, 0.3)',
              }}
            >
              H
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Halo<span style={{ color: '#f97316' }}>Bangun</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
            Portal Klien & ERP Manajemen Proyek
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Silakan masuk untuk mengakses sistem pengawasan, dokumen proyek, dan pelaporan keuangan.
          </p>
        </div>

        {/* Main Grid: Form + Quick Demo Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* Left Column: Login Card */}
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '32px 28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Masuk ke Akun Anda
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#f97316',
                    background: 'rgba(249, 115, 22, 0.12)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Sistem Aman RBAC
                </span>
              </div>

              {errorMessage && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="ri-error-warning-line" style={{ fontSize: '16px', flexShrink: 0 }}></i>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '6px',
                    }}
                  >
                    Alamat Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@halobangun.id"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#f97316')}
                      onBlur={(e) => (e.target.style.borderColor = '#334155')}
                    />
                    <i
                      className="ri-mail-line"
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        fontSize: '16px',
                      }}
                    ></i>
                  </div>
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>
                      Kata Sandi
                    </label>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Default demo: password123</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 40px',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#f97316')}
                      onBlur={(e) => (e.target.style.borderColor = '#334155')}
                    />
                    <i
                      className="ri-lock-2-line"
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        fontSize: '16px',
                      }}
                    ></i>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    background: isLoading ? '#9a3412' : '#f97316',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {isLoading ? (
                    <>
                      <i className="ri-loader-4-line ri-spin"></i>
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <i className="ri-arrow-right-line"></i>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div
              style={{
                marginTop: '28px',
                paddingTop: '20px',
                borderTop: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
              }}
            >
              <Link
                href="/"
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="ri-arrow-left-line"></i> Kembali ke Beranda
              </Link>
              <a
                href="https://wa.me/6282135450404"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#22c55e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <i className="ri-whatsapp-line"></i> Butuh Bantuan?
              </a>
            </div>
          </div>

          {/* Right Column: Demo Accounts Quick Selector */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '28px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    background: '#f97316',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                ></span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Demo Akun Siap Uji (Pilih & Masuk Instan)
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                Klik salah satu kartu di bawah ini untuk mengisi kredensial secara otomatis:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {DEMO_ACCOUNTS.map((demo) => {
                const isSelected = selectedDemoRole === demo.role || email === demo.email;
                return (
                  <div
                    key={demo.role}
                    onClick={() => handleSelectDemo(demo)}
                    style={{
                      background: isSelected ? 'rgba(249, 115, 22, 0.1)' : '#1e293b',
                      border: `1.5px solid ${isSelected ? '#f97316' : '#334155'}`,
                      borderRadius: '12px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#475569';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#334155';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: `${demo.color}22`,
                          color: demo.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        <i className={demo.icon}></i>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                            {demo.name}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: demo.color,
                              background: `${demo.color}20`,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              letterSpacing: '0.3px',
                            }}
                          >
                            {demo.badge}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#94a3b8',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {demo.email} • {demo.desc}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      style={{
                        padding: '6px 12px',
                        background: isSelected ? '#f97316' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#ffffff' : '#cbd5e1',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected ? 'Dipilih' : 'Gunakan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

