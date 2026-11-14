import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PageHeader } from '@/components/dashboard/ui';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');

  const whereClause = user.role === 'CLIENT' ? { client_id: user.id } : {};

  const projects = await prisma.project.findMany({
    where: whereClause,
    include: {
      client: true,
      pm: true,
      sCurveProgress: { orderBy: { week_number: 'desc' }, take: 1 },
      documents: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <DashboardLayout title="Daftar Proyek Konstruksi & Arsitektur">
      <PageHeader
        breadcrumb="Manajemen Proyek"
        title="Daftar Seluruh Proyek Halo Bangun"
        subtitle="Pantau status konstruksi, dokumen SPKPR, progres fisik, dan serah terima BAST."
        action={
          user.role === 'OWNER' ? (
            <Link href="/dashboard/projects/new" style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon="ri-magic-line">
                + Buat Proyek Baru (Wizard Onboarding)
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {projects.map((p) => {
          const currentProgress = p.sCurveProgress[0]?.actual_percentage || 0;
          return (
            <Card key={p.id}>
              <CardHeader>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Badge variant={p.status === 'COMPLETED' ? 'success' : 'warning'}>
                      {p.status}
                    </Badge>
                    <span style={{ fontSize: '11px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>
                      Kategori: {p.category}
                    </span>
                  </div>
                  <CardTitle>{p.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent style={{ padding: '20px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--dash-text-muted)', marginBottom: '14px' }}>
                  📍 {p.location}
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--dash-text-muted)' }}>Progres Kurva S:</span>
                    <span style={{ fontWeight: 800, color: 'var(--dash-text-main)' }}>{currentProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--dash-muted-bg)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(currentProgress, 100)}%`,
                        height: '100%',
                        background: currentProgress >= 100 ? '#10b981' : '#f97316',
                      }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', borderTop: '1px solid var(--dash-border)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--dash-text-muted)' }}>Klien Proyek:</span>
                    <span style={{ fontWeight: 600, color: 'var(--dash-text-main)' }}>{p.client?.name || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--dash-text-muted)' }}>Pengawas (PM):</span>
                    <span style={{ fontWeight: 600, color: 'var(--dash-text-main)' }}>{p.pm?.name || '-'}</span>
                  </div>
                  {user.role !== 'PM' && user.role !== 'MANDOR' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--dash-text-muted)' }}>Nilai Kontrak:</span>
                      <span style={{ fontWeight: 800, color: '#f97316' }}>{formatIDR(p.contract_value)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--dash-text-muted)' }}>Dokumen BAST:</span>
                    <span style={{ fontWeight: 700, color: p.bast_unlocked ? '#10b981' : '#ef4444' }}>
                      {p.bast_unlocked ? '✓ Terbuka' : '🔒 Terkunci'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  {p.cctv_url && (
                    <a href={p.cctv_url} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                      <Button size="sm" variant="danger" icon="ri-live-line" style={{ width: '100%' }}>
                        CCTV
                      </Button>
                    </a>
                  )}
                  <Link href={`/dashboard/client`} style={{ flex: 1, textDecoration: 'none' }}>
                    <Button size="sm" variant="secondary" icon="ri-eye-line" style={{ width: '100%' }}>
                      Pantau Proyek
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

