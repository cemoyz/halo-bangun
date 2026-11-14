import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PageHeader } from '@/components/dashboard/ui';

export const dynamic = 'force-dynamic';

export default async function ClientDashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');
  if (user.role !== 'CLIENT' && user.role !== 'OWNER') {
    redirect('/dashboard?forbidden=1');
  }

  // Find project for this client (default to Project 1 Ibu Theresia or first client project)
  const project = await prisma.project.findFirst({
    where: user.role === 'CLIENT' ? { client_id: user.id } : {},
    include: {
      pm: true,
      documents: true,
      sCurveProgress: { orderBy: { week_number: 'asc' } },
      dailyReports: { orderBy: { date: 'desc' }, take: 3 },
      payments: { orderBy: { createdAt: 'asc' } },
      addendums: { orderBy: { createdAt: 'desc' } },
    },
  });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const latestSCurve = project?.sCurveProgress[project.sCurveProgress.length - 1];
  const actualPercent = latestSCurve?.actual_percentage || 0;
  const plannedPercent = latestSCurve?.planned_percentage || 0;

  return (
    <DashboardLayout title="Portal Klien (Live Project Monitor)">
      <PageHeader
        breadcrumb="Portal Klien Terpadu"
        title={project?.name || 'Proyek Anda'}
        subtitle={`Lokasi: ${project?.location || 'Yogyakarta'} • Pengawas: ${project?.pm?.name || 'Senior PM Halo Bangun'}`}
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            {project?.cctv_url && (
              <a href={project.cctv_url} target="_blank" rel="noreferrer">
                <Button variant="danger" icon="ri-live-line">
                  Live CCTV Lapangan
                </Button>
              </a>
            )}
            <Button variant="primary" icon="ri-message-3-line">
              Beri Masukan / Evaluasi
            </Button>
          </div>
        }
      />

      {/* Progress & Quick Stats Card */}
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
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>PROGRES RIIL MINGGU INI</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#f97316', marginTop: '4px' }}>
              {actualPercent}%
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              Target Rencana Kurva S: {plannedPercent}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>NILAI KONTRAK SPKPR</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dash-text-main)', marginTop: '4px' }}>
              {formatIDR(project?.contract_value || 0)}
            </div>
            <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
              Perjanjian Tertulis & Garansi
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>STATUS BAST & GARANSI</div>
            <div style={{ marginTop: '6px' }}>
              {project?.bast_unlocked ? (
                <Badge variant="success">✓ TERBUKA (PROYEK SELESAI)</Badge>
              ) : (
                <Badge variant="warning">🔒 TERKUNCI (SELESAI 100% & LUNAS)</Badge>
              )}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '6px' }}>
              Otomatis terbuka saat serah terima
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>PENGAWAS LAPANGAN (PM)</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dash-text-main)', marginTop: '4px' }}>
              {project?.pm?.name || 'Dimas Pratama, S.T.'}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
              WA: {project?.pm?.phone || '0821-3545-0404'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Live CCTV & Daily Photos + S-Curve Progress */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* CCTV & Galeri Foto Harian (FR-05) */}
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader>
            <CardTitle icon="ri-camera-lens-fill">
              Galeri Progres Harian & Live CCTV Lapangan (FR-05)
            </CardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></span>
              <span style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: 700 }}>LIVE CCTV TERKONEKSI</span>
            </div>
          </CardHeader>
          <CardContent style={{ padding: '20px' }}>
            {/* CCTV Stream Container */}
            <div
              style={{
                width: '100%',
                height: '240px',
                borderRadius: '12px',
                background: '#090d16',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                overflow: 'hidden',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=1000&auto=format&fit=crop&q=80"
                alt="Live Camera Feed"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0,0,0,0.65)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.4px' }}>
                  CAM-01 • AREA PLAT LANTAI 2
                </span>
              </div>
              <a
                href={project?.cctv_url || '#'}
                target="_blank"
                rel="noreferrer"
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '14px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="ri-fullscreen-line" /> Buka Full Screen
              </a>
            </div>

            {/* Daily Photo Feed (Max 3 Photos) */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)', marginBottom: '12px' }}>
                📸 Foto Dokumentasi Pengawasan Harian Terkini
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {project?.dailyReports.flatMap((dr) =>
                  dr.photos.map((p, idx) => (
                    <div
                      key={`${dr.id}-${idx}`}
                      style={{
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                      }}
                    >
                      <img
                        src={p}
                        alt="Progres Harian"
                        style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '8px 12px', fontSize: '11.5px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--dash-text-main)' }}>
                          {new Date(dr.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </div>
                        <div style={{ color: 'var(--dash-text-muted)', fontSize: '11px' }}>
                          Cuaca: {dr.weather} • {dr.worker_count} Tukang
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termin Pembayaran & Kwitansi (FR-06) */}
        <Card>
          <CardHeader>
            <CardTitle icon="ri-bank-card-line">Termin & Kwitansi Resmi (FR-06)</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {project?.payments.map((pmt) => (
                <div
                  key={pmt.id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'var(--dash-muted-bg)',
                    border: '1px solid var(--dash-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                      {pmt.termin_name}
                    </span>
                    {pmt.status === 'PAID' ? (
                      <Badge variant="success">✓ LUNAS</Badge>
                    ) : pmt.status === 'PENDING_VERIFICATION' ? (
                      <Badge variant="warning">DIVERIFIKASI</Badge>
                    ) : (
                      <Badge variant="danger">TAGIHAN AKTIF</Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dash-text-main)', margin: '4px 0' }}>
                    {formatIDR(pmt.amount)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                    {pmt.notes}
                  </div>
                  {pmt.status === 'PAID' && pmt.receipt_url && (
                    <div style={{ marginTop: '8px' }}>
                      <a
                        href={pmt.receipt_url}
                        style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 700, textDecoration: 'none' }}
                      >
                        📄 Unduh Kwitansi Resmi
                      </a>
                    </div>
                  )}
                  {pmt.status === 'UNPAID' && (
                    <div style={{ marginTop: '8px' }}>
                      <Button size="sm" variant="primary" icon="ri-upload-2-line">
                        Unggah Bukti Transfer
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Change Order (Addendum COR/ADD) Approvals (FR-07) */}
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader>
            <CardTitle icon="ri-file-edit-line">Persetujuan Tambah Kurang / Addendum (FR-07)</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {project?.addendums.map((add) => (
                <div
                  key={add.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'var(--dash-muted-bg)',
                    border: '1px solid var(--dash-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                        {add.description}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#f97316', marginTop: '4px' }}>
                        Selisih Biaya: +{formatIDR(add.cost_difference)}
                      </div>
                    </div>
                    {add.status === 'APPROVED' ? (
                      <Badge variant="success">✓ DISETUJUI KLIEN</Badge>
                    ) : add.status === 'PENDING_CLIENT' ? (
                      <Badge variant="warning">MENUNGGU PERSETUJUAN ANDA</Badge>
                    ) : (
                      <Badge variant="danger">{add.status}</Badge>
                    )}
                  </div>

                  {add.client_note && (
                    <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>
                      Catatan: {add.client_note}
                    </div>
                  )}

                  {add.status === 'PENDING_CLIENT' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <Button size="sm" variant="primary" icon="ri-check-line">
                        Setujui Addendum
                      </Button>
                      <Button size="sm" variant="danger" icon="ri-close-line">
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dokumen SPKPR & BAST Terkunci (FR-04 & FR-09) */}
        <Card>
          <CardHeader>
            <CardTitle icon="ri-folder-lock-line">Dokumen Kontrak & BAST (FR-04 & FR-09)</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {project?.documents.map((doc) => (
                <div
                  key={doc.id}
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
                      {doc.title || doc.doc_type}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                      Tipe: {doc.doc_type}
                    </div>
                  </div>
                  {doc.is_locked ? (
                    <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>
                      🔒 Terkunci
                    </span>
                  ) : (
                    <a
                      href={doc.file_url}
                      style={{ fontSize: '11.5px', color: '#0ea5e9', fontWeight: 700, textDecoration: 'none' }}
                    >
                      Unduh ↗
                    </a>
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

