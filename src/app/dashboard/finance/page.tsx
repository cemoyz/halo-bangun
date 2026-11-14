import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PageHeader } from '@/components/dashboard/ui';

export const dynamic = 'force-dynamic';

export default async function FinanceDashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');
  if (user.role !== 'FINANCE' && user.role !== 'OWNER') {
    redirect('/dashboard?forbidden=1');
  }

  const [allocations, payments, materials, projects] = await Promise.all([
    prisma.projectFinancialAllocation.findMany({
      include: { project: true },
    }),
    prisma.payment.findMany({
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.materialPurchase.findMany({
      take: 8,
      include: { project: true },
      orderBy: { purchase_date: 'desc' },
    }),
    prisma.project.findMany(),
  ]);

  const totalContract = projects.reduce((acc, p) => acc + p.contract_value, 0);
  const totalPaidTermin = payments.filter((p) => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0);
  const totalPendingTermin = payments.filter((p) => p.status === 'PENDING_VERIFICATION').reduce((acc, p) => acc + p.amount, 0);
  const totalRealCost = allocations.reduce((acc, a) => acc + a.real_cost, 0);
  const totalNetProfit = allocations.reduce((acc, a) => acc + a.net_profit, 0);
  const totalTax = allocations.reduce((acc, a) => acc + a.tax_amount, 0);
  const totalZakat = allocations.reduce((acc, a) => acc + a.zakat_amount, 0);
  const totalMitigation = allocations.reduce((acc, a) => acc + a.mitigation_fund, 0);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <DashboardLayout title="Dashboard Keuangan & Akuntansi Proyek">
      <PageHeader
        breadcrumb="Finance & Accounting Lead"
        title="Kontrol Anggaran & Alokasi Keuangan Proyek"
        subtitle="Kelola termin tagihan klien, verifikasi transfer, rekap belanja material, dan hitung pembagian alokasi dana laba/rugi."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" icon="ri-file-add-line">
              + Catat Pembelanjaan Manual
            </Button>
            <Button variant="secondary" icon="ri-download-2-line">
              Ekspor Rekap Laba/Rugi
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
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
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>DANA TERMIN MASUK (PAID)</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              {formatIDR(totalPaidTermin)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              Dari total kontrak {formatIDR(totalContract)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>MENUNGGU VERIFIKASI</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {formatIDR(totalPendingTermin)}
            </div>
            <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', fontWeight: 600 }}>
              Bukti bayar diunggah klien
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>REALISASI BIAYA RIIL</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
              {formatIDR(totalRealCost)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              Material + Tenaga Kerja + Sewa
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>TOTAL LABA BERSIH</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0ea5e9', marginTop: '4px' }}>
              {formatIDR(totalNetProfit)}
            </div>
            <div style={{ fontSize: '11px', color: '#0ea5e9', marginTop: '4px', fontWeight: 600 }}>
              Akumulasi laba bersih proyek
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Financial Allocations (Kalkulator Alokasi Proyek FR-18) + Termin Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Pos Alokasi Keuangan & Akuntansi (FR-18) */}
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader>
            <CardTitle icon="ri-pie-chart-2-line">
              Kalkulator & Rekapitulasi Alokasi Dana per Proyek (FR-18)
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                    <th style={{ padding: '12px 16px' }}>Proyek</th>
                    <th style={{ padding: '12px 16px' }}>Biaya Riil</th>
                    <th style={{ padding: '12px 16px' }}>Laba Bersih</th>
                    <th style={{ padding: '12px 16px' }}>Pajak (Pph/Ppn)</th>
                    <th style={{ padding: '12px 16px' }}>Zakat Perusahaan</th>
                    <th style={{ padding: '12px 16px' }}>Operasional Kantor</th>
                    <th style={{ padding: '12px 16px' }}>Mitigasi Risiko</th>
                    <th style={{ padding: '12px 16px' }}>Pengembangan Usaha</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((alloc) => (
                    <tr key={alloc.id} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                        {alloc.project.name}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#ef4444', fontWeight: 600 }}>
                        {formatIDR(alloc.real_cost)}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 700 }}>
                        {formatIDR(alloc.net_profit)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>{formatIDR(alloc.tax_amount)}</td>
                      <td style={{ padding: '14px 16px', color: '#059669' }}>{formatIDR(alloc.zakat_amount)}</td>
                      <td style={{ padding: '14px 16px' }}>{formatIDR(alloc.operational_amount)}</td>
                      <td style={{ padding: '14px 16px', color: '#f59e0b' }}>{formatIDR(alloc.mitigation_fund)}</td>
                      <td style={{ padding: '14px 16px', color: '#6366f1' }}>{formatIDR(alloc.business_dev_fund)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payments Status */}
        <Card>
          <CardHeader>
            <CardTitle icon="ri-bank-card-line">Verifikasi Termin & Kwitansi (FR-17)</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {payments.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                      {p.termin_name}
                    </span>
                    {p.status === 'PAID' ? (
                      <Badge variant="success">LUNAS</Badge>
                    ) : p.status === 'PENDING_VERIFICATION' ? (
                      <Badge variant="warning">VERIFIKASI</Badge>
                    ) : (
                      <Badge variant="danger">BELUM BAYAR</Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)' }}>
                    {p.project.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                      {formatIDR(p.amount)}
                    </span>
                    {p.receipt_url ? (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                        ✓ Kwitansi Terbit
                      </span>
                    ) : p.proof_url ? (
                      <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
                        🔎 Cek Bukti Transfer
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                        Menunggu Bayar
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Material Purchases Table */}
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader>
            <CardTitle icon="ri-file-list-3-line">Rekapitulasi Belanja Material & Nota Lapangan (FR-16)</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                    <th style={{ padding: '12px 18px' }}>Barang</th>
                    <th style={{ padding: '12px 18px' }}>Kuantitas</th>
                    <th style={{ padding: '12px 18px' }}>Toko & Kontak WA</th>
                    <th style={{ padding: '12px 18px' }}>Total Biaya</th>
                    <th style={{ padding: '12px 18px' }}>Input Oleh</th>
                    <th style={{ padding: '12px 18px' }}>Bukti Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                      <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--dash-text-main)' }}>
                        {m.item_name}
                      </td>
                      <td style={{ padding: '12px 18px' }}>{m.quantity}</td>
                      <td style={{ padding: '12px 18px' }}>
                        <div>{m.store_name}</div>
                        <div style={{ fontSize: '11px', color: '#10b981' }}>{m.store_wa || '-'}</div>
                      </td>
                      <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                        {formatIDR(m.total_price)}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', background: 'var(--dash-muted-bg)', borderRadius: '4px' }}>
                          {m.input_by_role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        {m.receipt_url ? (
                          <span style={{ fontSize: '11.5px', color: '#f97316', fontWeight: 600 }}>
                            📄 Terlampir
                          </span>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)' }}>-</span>
                        )}
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

