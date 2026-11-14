import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PageHeader } from '@/components/dashboard/ui';

export const dynamic = 'force-dynamic';

export default async function MandorDashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');
  if (user.role !== 'MANDOR' && user.role !== 'OWNER') {
    redirect('/dashboard?forbidden=1');
  }

  const [dailyReports, equipment, purchases, payrolls] = await Promise.all([
    prisma.dailyReport.findMany({
      take: 4,
      include: { project: true },
      orderBy: { date: 'desc' },
    }),
    prisma.equipmentInventory.findMany({
      include: { project: true },
    }),
    prisma.materialPurchase.findMany({
      where: { input_by_role: 'MANDOR' },
      take: 5,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payroll.findMany({
      where: { user_id: user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <DashboardLayout title="Dashboard Lapangan Mandor">
      <PageHeader
        breadcrumb="Mandor & Kepala Tukang"
        title="Pusat Kerja Lapangan (Mobile-First)"
        subtitle="Pantau instruksi harian kerja tukang, cek stok peralatan di proyek, dan ajukan permintaan material."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" icon="ri-shopping-basket-line">
              + Request Material Mendesak
            </Button>
          </div>
        }
      />

      {/* Field Quick Action Buttons (Optimized for Mobile/Touch) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>
            <i className="ri-team-line" />
          </div>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Jumlah Tukang Aktif</div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>12 - 14 Orang</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--dash-card-bg)',
            border: '1px solid var(--dash-border)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '24px', color: '#0ea5e9', marginBottom: '8px' }}>
            <i className="ri-tools-fill" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>Alat Kerja Proyek</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
              {equipment.length} Peralatan
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--dash-card-bg)',
            border: '1px solid var(--dash-border)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '24px', color: '#10b981', marginBottom: '8px' }}>
            <i className="ri-wallet-3-line" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>Gaji Terakhir</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>
              {payrolls[0] ? formatIDR(payrolls[0].total_amount) : 'Lunas'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Field Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Catatan Harian Lapangan */}
        <Card>
          <CardHeader>
            <CardTitle icon="ri-file-list-2-line">Laporan Catatan Lapangan Terkini</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {dailyReports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'var(--dash-muted-bg)',
                    border: '1px solid var(--dash-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                      {report.project.name}
                    </span>
                    <Badge variant="info">⛅ {report.weather}</Badge>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginBottom: '8px' }}>
                    📅 {new Date(report.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })} • 👷 {report.worker_count} Pekerja
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--dash-text-main)', margin: 0, lineHeight: 1.4 }}>
                    "{report.notes}"
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daftar Alat & Stok Tukang */}
        <Card>
          <CardHeader>
            <CardTitle icon="ri-hammer-line">Inventaris Alat Tukang & Peralatan Sewa</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {equipment.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--dash-card-bg)',
                    border: '1px solid var(--dash-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                      {item.item_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                      {item.notes || 'Siap digunakan di lapangan'}
                    </div>
                  </div>
                  {item.status === 'SEWA' ? (
                    <Badge variant="warning">Sewa: {item.rental_duration}</Badge>
                  ) : (
                    <Badge variant="success">Alat Sendiri</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Slip Gaji & Upah Pribadi Mandor (FR-14) */}
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader>
            <CardTitle icon="ri-money-dollar-box-line">Slip Upah & Dana Operasional Pribadi (FR-14)</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                    <th style={{ padding: '12px 16px' }}>Periode</th>
                    <th style={{ padding: '12px 16px' }}>Gaji Pokok</th>
                    <th style={{ padding: '12px 16px' }}>Operasional</th>
                    <th style={{ padding: '12px 16px' }}>Bonus</th>
                    <th style={{ padding: '12px 16px' }}>Total Diterima</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{p.period}</td>
                      <td style={{ padding: '12px 16px' }}>{formatIDR(p.base_salary)}</td>
                      <td style={{ padding: '12px 16px' }}>{formatIDR(p.operational_allowance)}</td>
                      <td style={{ padding: '12px 16px', color: '#10b981' }}>{formatIDR(p.bonus)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                        {formatIDR(p.total_amount)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge variant="success">✓ DITRANSFER</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

