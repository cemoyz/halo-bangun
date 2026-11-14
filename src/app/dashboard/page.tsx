import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PageHeader } from '@/components/dashboard/ui';
import { Role, ROLE_CONFIGS } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function DashboardMainPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect('/login');
  }

  // If user is not OWNER, redirect to their specialized primary dashboard
  if (user.role === 'FINANCE') redirect('/dashboard/finance');
  if (user.role === 'PM') redirect('/dashboard/pm');
  if (user.role === 'MANDOR') redirect('/dashboard/mandor');
  if (user.role === 'CLIENT') redirect('/dashboard/client');

  // Fetch data for OWNER (Super Admin)
  const [projects, dailyReports, payments, materialPurchases, allocations] = await Promise.all([
    prisma.project.findMany({
      include: {
        client: true,
        pm: true,
        sCurveProgress: { orderBy: { week_number: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dailyReport.findMany({
      take: 5,
      include: { project: true, author: true },
      orderBy: { date: 'desc' },
    }),
    prisma.payment.findMany({
      take: 5,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.materialPurchase.findMany({
      take: 5,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.projectFinancialAllocation.findMany({
      include: { project: true },
    }),
  ]);

  const ongoingProjects = projects.filter((p) => p.status === 'ONGOING');
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED');
  const totalContractValue = projects.reduce((sum, p) => sum + p.contract_value, 0);
  const totalRealCost = allocations.reduce((sum, a) => sum + a.real_cost, 0);
  const totalNetProfit = allocations.reduce((sum, a) => sum + a.net_profit, 0);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <DashboardLayout title="Executive Overview (Direktur Utama)">
      <PageHeader
        breadcrumb="Executive Command Center"
        title="Ringkasan Eksekutif & Manajemen Terpadu"
        subtitle="Pantau seluruh portofolio proyek konstruksi, arus kas riil, dan margin laba perusahaan."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/dashboard/projects">
              <Button variant="secondary" icon="ri-folder-2-line">
                Semua Proyek
              </Button>
            </Link>
            <Link href="/dashboard/finance">
              <Button variant="primary" icon="ri-calculator-line">
                Laporan Keuangan
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Nilai Kontrak
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--dash-text-main)', marginTop: '4px' }}>
                  {formatIDR(totalContractValue)}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                  {projects.length} Total Proyek Tercatat
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(249, 115, 22, 0.12)',
                  color: '#f97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                <i className="ri-building-line" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Proyek Berjalan (Active)
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0ea5e9', marginTop: '4px' }}>
                  {ongoingProjects.length} Proyek
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                  {completedProjects.length} Proyek Selesai & BAST
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(14, 165, 233, 0.12)',
                  color: '#0ea5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                <i className="ri-hard-hat-line" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Realisasi Biaya
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--dash-text-main)', marginTop: '4px' }}>
                  {formatIDR(totalRealCost)}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                  Material, Tukang & Operasional
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                <i className="ri-shopping-cart-2-line" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Margin Laba Bersih
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  {formatIDR(totalNetProfit)}
                </div>
                <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                  Est. Margin ~{((totalNetProfit / (totalContractValue || 1)) * 100).toFixed(1)}%
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                <i className="ri-funds-line" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Projects List + Quick CCTV Monitoring */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Active Projects Table */}
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader>
            <div>
              <CardTitle icon="ri-building-4-line">Status Proyek Aktif & Monitoring</CardTitle>
            </div>
            <Link
              href="/dashboard/projects"
              style={{ fontSize: '12.5px', color: '#f97316', textDecoration: 'none', fontWeight: 600 }}
            >
              Lihat Detail Proyek →
            </Link>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--dash-text-muted)' }}>Proyek</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--dash-text-muted)' }}>Klien & Lokasi</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--dash-text-muted)' }}>Pengawas (PM)</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--dash-text-muted)' }}>Progres Riil</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--dash-text-muted)' }}>Nilai Kontrak</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--dash-text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => {
                    const latestProgress = project.sCurveProgress[0]?.actual_percentage || 0;
                    return (
                      <tr
                        key={project.id}
                        style={{ borderBottom: '1px solid var(--dash-border)', transition: 'background 0.15s' }}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>{project.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                            Kategori: {project.category}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600 }}>{project.client?.name || 'Klien Umum'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>{project.location}</div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 500 }}>{project.pm?.name || '-'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>{project.pm?.phone}</div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                flex: 1,
                                height: '6px',
                                background: 'var(--dash-border)',
                                borderRadius: '999px',
                                overflow: 'hidden',
                                minWidth: '60px',
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(latestProgress, 100)}%`,
                                  height: '100%',
                                  background: latestProgress >= 100 ? '#10b981' : '#f97316',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>{latestProgress}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                          {formatIDR(project.contract_value)}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {project.status === 'COMPLETED' ? (
                            <Badge variant="success">SELESAI (BAST)</Badge>
                          ) : (
                            <Badge variant="warning">ONGOING</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Live Daily Reports Feed */}
        <Card>
          <CardHeader>
            <CardTitle icon="ri-camera-3-line">Laporan Pengawasan Harian Terkini</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                      {report.project.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                      {new Date(report.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--dash-text-muted)', marginBottom: '8px' }}>
                    <span>⛅ {report.weather}</span>
                    <span>•</span>
                    <span>👷 {report.worker_count} Tukang</span>
                    <span>•</span>
                    <span>Pengawas: {report.author.name}</span>
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--dash-text-main)',
                      margin: '0 0 10px 0',
                      lineHeight: 1.4,
                    }}
                  >
                    "{report.notes}"
                  </p>
                  {report.photos && report.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                      {report.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt="Progres Lapangan"
                          style={{
                            width: '70px',
                            height: '50px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid var(--dash-border)',
                          }}
                        />
                      ))}
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

