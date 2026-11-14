import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PageHeader } from '@/components/dashboard/ui';

export const dynamic = 'force-dynamic';

export default async function PmDashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');
  if (user.role !== 'PM' && user.role !== 'OWNER') {
    redirect('/dashboard?forbidden=1');
  }

  const [projects, dailyReports, equipment, addendums, payrolls] = await Promise.all([
    prisma.project.findMany({
      where: user.role === 'PM' ? { pm_id: user.id } : {},
      include: {
        sCurveProgress: { orderBy: { week_number: 'desc' }, take: 1 },
      },
    }),
    prisma.dailyReport.findMany({
      where: user.role === 'PM' ? { created_by: user.id } : {},
      include: { project: true },
      orderBy: { date: 'desc' },
      take: 6,
    }),
    prisma.equipmentInventory.findMany({
      include: { project: true },
    }),
    prisma.addendum.findMany({
      include: { project: true },
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
    <DashboardLayout title="Dashboard Pengawas Lapangan (Project Manager)">
      <PageHeader
        breadcrumb="Senior Project Manager"
        title="Pengawasan Lapangan & Pengendalian Progres"
        subtitle="Kelola laporan harian lapangan, verifikasi Kurva S mingguan, inventaris alat kerja, dan pengajuan Addendum."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" icon="ri-camera-lens-line">
              + Input Laporan Harian (Maks 3 Foto)
            </Button>
            <Button variant="secondary" icon="ri-line-chart-line">
              Update Kurva S
            </Button>
          </div>
        }
      />

      {/* Top Status Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>PROYEK DALAM PENGAWASAN</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#f97316', marginTop: '4px' }}>
              {projects.length} Proyek Aktif
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              Lokasi DIY & Jawa Tengah
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>LAPORAN HARIAN TERCATAT</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0ea5e9', marginTop: '4px' }}>
              {dailyReports.length} Laporan
            </div>
            <div style={{ fontSize: '11px', color: '#0ea5e9', marginTop: '4px', fontWeight: 600 }}>
              Tersinkronisasi otomatis ke Klien & Owner
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>INVENTARIS & ALAT SEWA</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              {equipment.length} Unit Alat
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              {equipment.filter((e) => e.status === 'SEWA').length} Unit Status Sewa
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>DRAF ADDENDUM DIAJUKAN</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>
              {addendums.length} Pekerjaan Tambah
            </div>
            <div style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '4px', fontWeight: 600 }}>
              COR / Perubahan Desain
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Daily Report Card List + Equipment */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Laporan Harian Terkini */}
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader>
            <CardTitle icon="ri-calendar-todo-line">Laporan Pengawasan Harian & Dokumentasi Foto (FR-10)</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dailyReports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                        {report.project.name}
                      </span>
                      <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
                        📅 {new Date(report.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Badge variant="info">⛅ {report.weather}</Badge>
                      <Badge variant="warning">👷 {report.worker_count} Tukang</Badge>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--dash-text-main)', margin: '8px 0 12px 0', lineHeight: 1.5 }}>
                    {report.notes}
                  </p>

                  {report.photos && report.photos.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--dash-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                        Foto Progres Lapangan (Maks. 3 Foto)
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {report.photos.map((photo, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            <img
                              src={photo}
                              alt="Progres"
                              style={{
                                width: '130px',
                                height: '90px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '1px solid var(--dash-border)',
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '4px',
                                right: '4px',
                                background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                              }}
                            >
                              Foto {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipment & Sewa */}
        <Card>
          <CardHeader>
            <CardTitle icon="ri-tools-line">Inventaris Alat & Sewa (FR-13)</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {equipment.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-card-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--dash-text-main)' }}>
                      {item.item_name}
                    </div>
                    {item.status === 'SEWA' ? (
                      <Badge variant="warning">SEWA ({item.rental_duration})</Badge>
                    ) : (
                      <Badge variant="success">MILIK SENDIRI</Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                    Lokasi: {item.project?.name || 'Gudang Pusat'}
                  </div>
                  {item.notes && (
                    <div style={{ fontSize: '11.5px', color: 'var(--dash-text-main)', marginTop: '6px' }}>
                      Catatan: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

