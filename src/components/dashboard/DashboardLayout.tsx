'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Role, ROLE_CONFIGS, ROUTE_PERMISSIONS } from '@/lib/rbac';
import { Badge } from './ui';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface UserSession {
  id: number;
  name: string;
  email: string;
  role: Role;
  designation?: string;
  avatar?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Detect desktop viewport to guarantee sidebar visibility
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= 992);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Load user from session storage and fetch fresh me
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('dash-theme') as 'light' | 'dark';
      if (storedTheme) setThemeMode(storedTheme);

      const storedUser = sessionStorage.getItem('dash_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {}

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          try {
            sessionStorage.setItem('dash_user', JSON.stringify(data.user));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    try {
      localStorage.setItem('dash-theme', next);
    } catch (e) {}
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      try {
        sessionStorage.removeItem('dash_user');
      } catch (e) {}
      window.location.href = '/login';
    }
  };

  const role: Role = currentUser?.role || (pathname.startsWith('/dashboard/client') ? 'CLIENT' : 'OWNER');
  const roleCfg = ROLE_CONFIGS[role] || ROLE_CONFIGS.OWNER;

  // Build navigation items based on role
  const getNavItems = () => {
    const items: Array<{ label: string; href: string; icon: string; badge?: string; roles: Role[] }> = [
      // 1. Owner & Umum
      { label: 'Ringkasan Eksekutif', href: '/dashboard', icon: 'ri-dashboard-3-line', roles: ['OWNER'] },
      { label: 'Buat Proyek Baru (Wizard)', href: '/dashboard/projects/new', icon: 'ri-magic-line', roles: ['OWNER'] },
      { label: 'CMS Laman Depan', href: '/dashboard/cms', icon: 'ri-layout-masonry-line', badge: 'Dinamis', roles: ['OWNER'] },
      { label: 'Dashboard Keuangan', href: '/dashboard/finance', icon: 'ri-money-dollar-circle-line', roles: ['OWNER', 'FINANCE'] },
      { label: 'Dashboard Pengawas', href: '/dashboard/pm', icon: 'ri-building-line', roles: ['OWNER', 'PM'] },
      { label: 'Dashboard Mandor', href: '/dashboard/mandor', icon: 'ri-hammer-line', roles: ['OWNER', 'MANDOR'] },
      { label: 'Portal Pantau Klien', href: '/dashboard/client', icon: 'ri-home-smile-line', roles: ['OWNER', 'CLIENT'] },

      // 2. Proyek & Pelaporan
      { label: 'Daftar Proyek', href: '/dashboard/projects', icon: 'ri-folder-shared-line', roles: ['OWNER', 'FINANCE', 'PM', 'CLIENT'] },
      { label: 'Laporan Harian (Foto)', href: '/dashboard/daily-reports', icon: 'ri-calendar-check-line', roles: ['OWNER', 'PM', 'CLIENT'] },
      { label: 'Kurva S (Rencana vs Riil)', href: '/dashboard/s-curve', icon: 'ri-line-chart-line', roles: ['OWNER', 'PM', 'CLIENT'] },
      { label: 'Live CCTV Proyek', href: '/dashboard/cctv', icon: 'ri-camera-lens-line', roles: ['OWNER', 'FINANCE', 'PM', 'CLIENT'] },

      // 3. Finansial & Administrasi
      { label: 'Termin & Kwitansi', href: '/dashboard/payments', icon: 'ri-bill-line', roles: ['OWNER', 'FINANCE', 'CLIENT'] },
      { label: 'Addendum (COR/ADD)', href: '/dashboard/addendums', icon: 'ri-file-edit-line', roles: ['OWNER', 'FINANCE', 'PM', 'CLIENT'] },
      { label: 'Pengadaan & Nota', href: '/dashboard/materials', icon: 'ri-shopping-cart-line', roles: ['OWNER', 'FINANCE', 'PM', 'MANDOR'] },
      { label: 'Inventaris Peralatan', href: '/dashboard/equipment', icon: 'ri-tools-line', roles: ['OWNER', 'PM', 'MANDOR'] },
      { label: 'Dokumen SPK & BAST', href: '/dashboard/documents', icon: 'ri-file-text-line', roles: ['OWNER', 'FINANCE', 'CLIENT'] },
      { label: 'Penggajian / Payroll', href: '/dashboard/payrolls', icon: 'ri-bank-card-line', roles: ['OWNER', 'FINANCE', 'PM', 'MANDOR'] },
      { label: 'Masukan Klien', href: '/dashboard/feedbacks', icon: 'ri-chat-1-line', roles: ['OWNER', 'CLIENT'] },
    ];

    return items.filter((item) => item.roles.includes(role));
  };

  const navItems = getNavItems();

  return (
    <div className={`dashboard-root ${themeMode === 'dark' ? 'dash-theme-dark' : 'dash-theme-light'}`} style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: isCollapsed ? '78px' : '270px',
          background: 'var(--dash-sidebar-bg)',
          borderRight: '1px solid var(--dash-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 999,
          transform: isDesktop ? 'none' : (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'),
          transition: 'width 0.2s ease, transform 0.25s ease',
        }}
        className="dash-sidebar-desktop"
      >
        {/* Brand Header */}
        <div
          style={{
            height: '70px',
            padding: isCollapsed ? '0 12px' : '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--dash-border)',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: '20px',
                boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)',
                flexShrink: 0,
              }}
            >
              H
            </div>
            {!isCollapsed && (
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--dash-text-main)', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  Halo<span style={{ color: '#f97316' }}>Bangun</span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--dash-text-muted)', fontWeight: 500 }}>
                  ERP & Portal Klien
                </div>
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="d-lg-none"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--dash-text-muted)',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            <i className="ri-close-line" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div
          style={{
            padding: isCollapsed ? '12px 8px' : '16px 20px',
            borderBottom: '1px solid var(--dash-border)',
            background: 'var(--dash-muted-bg)',
            display: 'flex',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={currentUser?.avatar || '/avatar.png'}
              alt={currentUser?.name || 'User'}
              style={{
                width: isCollapsed ? '34px' : '40px',
                height: isCollapsed ? '34px' : '40px',
                borderRadius: '10px',
                objectFit: 'cover',
                border: '1.5px solid var(--dash-border)',
                flexShrink: 0,
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
              }}
            />
            {!isCollapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--dash-text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUser?.name || 'Memuat...'}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: roleCfg.badgeColor,
                    background: roleCfg.badgeBg,
                    display: 'inline-block',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginTop: '2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {role}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isCollapsed ? '16px 8px' : '16px 12px' }}>
          {!isCollapsed && (
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--dash-text-subtle)',
                letterSpacing: '0.6px',
                padding: '0 12px 8px 12px',
              }}
            >
              Menu Navigasi
            </div>
          )}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: isCollapsed ? '0' : '12px',
                    padding: isCollapsed ? '10px 0' : '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#ffffff' : 'var(--dash-text-muted)',
                    background: isActive ? '#f97316' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--dash-muted-bg)';
                      e.currentTarget.style.color = 'var(--dash-text-main)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--dash-text-muted)';
                    }
                  }}
                >
                  <i
                    className={item.icon}
                    style={{
                      fontSize: '18px',
                      color: isActive ? '#ffffff' : 'var(--dash-text-muted)',
                      flexShrink: 0,
                    }}
                  />
                  {!isCollapsed && (
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: isCollapsed ? '12px 8px' : '14px 16px',
            borderTop: '1px solid var(--dash-border)',
            background: 'var(--dash-card-bg)',
          }}
        >
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Keluar (Logout)' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isCollapsed ? '0' : '8px',
              padding: isCollapsed ? '10px 0' : '9px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            <i className="ri-logout-box-r-line" />
            {!isCollapsed && <span>Keluar (Logout)</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: isDesktop ? (isCollapsed ? '78px' : '270px') : 0,
          transition: 'margin-left 0.2s ease',
        }}
        className="dash-main-container"
      >
        {/* Topbar */}
        <header
          style={{
            height: '70px',
            background: 'var(--dash-topbar-bg, var(--dash-card-bg))',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--dash-border)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          {/* Left: Mobile Toggle & Page Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="d-lg-none"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--dash-muted-bg)',
                border: '1px solid var(--dash-border)',
                color: 'var(--dash-text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              <i className="ri-menu-line" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="d-none d-lg-flex"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--dash-muted-bg)',
                border: '1px solid var(--dash-border)',
                color: 'var(--dash-text-main)',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
              }}
              title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            >
              <i className={isCollapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'} />
            </button>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dash-text-main)', lineHeight: 1.2 }}>
                {title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                Halo Bangun • {roleCfg.label}
              </div>
            </div>
          </div>

          {/* Right: Actions, Theme & User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Live Website Button */}
            <Link
              href="/"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'var(--dash-muted-bg)',
                border: '1px solid var(--dash-border)',
                color: 'var(--dash-text-main)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <i className="ri-global-line" style={{ color: '#f97316' }} />
              <span className="d-none d-sm-inline">Website Publik</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--dash-muted-bg)',
                border: '1px solid var(--dash-border)',
                color: themeMode === 'light' ? '#f59e0b' : '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                cursor: 'pointer',
              }}
              title={themeMode === 'light' ? 'Mode Gelap' : 'Mode Terang'}
            >
              <i className={themeMode === 'light' ? 'ri-sun-line' : 'ri-moon-line'} />
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--dash-muted-bg)',
                  border: '1px solid var(--dash-border)',
                  color: 'var(--dash-text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '17px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                title="Notifikasi Proyek"
              >
                <i className="ri-notification-3-line" />
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#f97316',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--dash-card-bg)',
                  }}
                >
                  3
                </span>
              </button>

              {notifDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '300px',
                    background: 'var(--dash-card-bg)',
                    border: '1px solid var(--dash-border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--dash-shadow-lg)',
                    padding: '12px',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--dash-border)', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--dash-text-main)' }}>Notifikasi Proyek</span>
                    <Badge variant="warning">3 Baru</Badge>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--dash-muted-bg)', fontSize: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>📸 Laporan Harian Baru</div>
                      <div style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '2px' }}>Mandor mengunggah progres Rumah Theresia</div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--dash-muted-bg)', fontSize: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>📑 Addendum Diajukan</div>
                      <div style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '2px' }}>PM mengajukan permohonan COR Café Mas Reza</div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--dash-muted-bg)', fontSize: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>💰 Kwitansi DP Masuk</div>
                      <div style={{ color: 'var(--dash-text-muted)', fontSize: '11px', marginTop: '2px' }}>Klien transfer Termin 1 verifikasi Finance</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <img
                  src={currentUser?.avatar || '/avatar.png'}
                  alt={currentUser?.name || 'User'}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid var(--dash-border)',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                  }}
                />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '240px',
                    background: 'var(--dash-card-bg)',
                    border: '1px solid var(--dash-border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--dash-shadow-lg)',
                    padding: '12px',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--dash-border)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                      {currentUser?.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                      {currentUser?.email}
                    </div>
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '10px',
                        fontWeight: 800,
                        color: roleCfg.badgeColor,
                        background: roleCfg.badgeBg,
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {roleCfg.label}
                    </div>
                  </div>

                  <div style={{ paddingTop: '8px' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <i className="ri-logout-box-r-line" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main
          style={{
            flex: 1,
            padding: '24px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .dash-sidebar-desktop {
            transform: none !important;
          }
          .dash-main-container {
            margin-left: ${isCollapsed ? '78px' : '270px'} !important;
          }
        }
      `}</style>
    </div>
  );
}

