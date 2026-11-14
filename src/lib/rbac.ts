export type Role = 'OWNER' | 'FINANCE' | 'PM' | 'MANDOR' | 'CLIENT';

export const ROLES: Record<Role, Role> = {
  OWNER: 'OWNER',
  FINANCE: 'FINANCE',
  PM: 'PM',
  MANDOR: 'MANDOR',
  CLIENT: 'CLIENT',
};

export interface RoleConfig {
  label: string;
  badgeColor: string;
  badgeBg: string;
  description: string;
  defaultRedirect: string;
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  OWNER: {
    label: 'Direktur / Owner (Super Admin)',
    badgeColor: '#e11d48',
    badgeBg: 'rgba(225, 29, 72, 0.12)',
    description: 'Akses penuh eksekutif, pengawasan seluruh proyek, laba rugi gabungan & inisiasi proyek.',
    defaultRedirect: '/dashboard',
  },
  FINANCE: {
    label: 'Finance Admin',
    badgeColor: '#059669',
    badgeBg: 'rgba(5, 150, 105, 0.12)',
    description: 'Kelola termin, verifikasi bukti bayar, kwitansi, rekap RAB vs riil, kalkulator alokasi laba & payroll.',
    defaultRedirect: '/dashboard/finance',
  },
  PM: {
    label: 'Pengawas Lapangan / Project Manager',
    badgeColor: '#0284c7',
    badgeBg: 'rgba(2, 132, 199, 0.12)',
    description: 'Input laporan harian (maks. 3 foto), pembaruan Kurva S mingguan, nota material, dan inventaris alat.',
    defaultRedirect: '/dashboard/pm',
  },
  MANDOR: {
    label: 'Mandor & Kepala Tukang Lapangan',
    badgeColor: '#d97706',
    badgeBg: 'rgba(217, 119, 6, 0.12)',
    description: 'Antarmuka mobile-first lapangan: cek laporan harian, input kebutuhan material & slip gaji pribadi.',
    defaultRedirect: '/dashboard/mandor',
  },
  CLIENT: {
    label: 'Klien Proyek (Portal Klien)',
    badgeColor: '#7c3aed',
    badgeBg: 'rgba(124, 58, 237, 0.12)',
    description: 'Pantau proyek mandiri: CCTV live, foto harian, Kurva S, termin pembayaran, addendum, BAST & Garansi.',
    defaultRedirect: '/dashboard/client',
  },
};

/**
 * Route access permissions mapping
 * '*' means unrestricted access to all dashboard routes
 */
export const ROUTE_PERMISSIONS: Record<Role, string[]> = {
  OWNER: ['*'],
  FINANCE: [
    '/dashboard',
    '/dashboard/finance',
    '/dashboard/projects',
    '/dashboard/payments',
    '/dashboard/materials',
    '/dashboard/payrolls',
    '/dashboard/addendums',
    '/dashboard/cctv',
    '/dashboard/documents',
    '/dashboard/profile',
  ],
  PM: [
    '/dashboard',
    '/dashboard/pm',
    '/dashboard/projects',
    '/dashboard/daily-reports',
    '/dashboard/s-curve',
    '/dashboard/materials',
    '/dashboard/equipment',
    '/dashboard/addendums',
    '/dashboard/cctv',
    '/dashboard/documents',
    '/dashboard/payrolls',
    '/dashboard/profile',
  ],
  MANDOR: [
    '/dashboard',
    '/dashboard/mandor',
    '/dashboard/daily-reports',
    '/dashboard/materials',
    '/dashboard/equipment',
    '/dashboard/payrolls',
    '/dashboard/profile',
  ],
  CLIENT: [
    '/dashboard',
    '/dashboard/client',
    '/dashboard/projects',
    '/dashboard/cctv',
    '/dashboard/documents',
    '/dashboard/s-curve',
    '/dashboard/daily-reports',
    '/dashboard/payments',
    '/dashboard/addendums',
    '/dashboard/feedbacks',
    '/dashboard/profile',
  ],
};

/**
 * Validates whether a specific role is allowed to access a route path
 */
export function canAccessRoute(role: Role | string | undefined, pathname: string): boolean {
  if (!role) return false;
  const userRole = role as Role;
  const allowed = ROUTE_PERMISSIONS[userRole] || [];

  if (allowed.includes('*')) return true;

  // Exact match or prefix match
  return allowed.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

