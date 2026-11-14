'use client';

import React from 'react';
import { Card, CardContent, Badge } from '@/components/dashboard/ui';

interface FinancialSummary {
  baseContractValue: number;
  addendumTotal: number;
  finalContractTotal: number;
  totalPaid: number;
  totalPending: number;
  totalRemaining: number;
  paymentProgress: number;
  allPaid: boolean;
  latestSCurve: number;
  isBastUnlocked: boolean;
  totalTermins: number;
  paidTerminsCount: number;
}

interface PaymentSummaryCardsProps {
  summary: FinancialSummary;
  projectName?: string;
}

export const formatIDR = (val?: number | null) => {
  if (val === undefined || val === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({ summary, projectName }) => {
  if (!summary) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 4 Key Financial Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Card 1: Total Nilai Kontrak */}
        <Card>
          <CardContent style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>
              Total Nilai Kontrak Proyek
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dash-text-main)', marginTop: '6px' }}>
              {formatIDR(summary.finalContractTotal)}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              Nilai SPK: {formatIDR(summary.baseContractValue)}
              {summary.addendumTotal !== 0 && (
                <span style={{ color: summary.addendumTotal > 0 ? '#10b981' : '#ef4444', marginLeft: '4px' }}>
                  ({summary.addendumTotal > 0 ? `+${formatIDR(summary.addendumTotal)} Addendum` : `${formatIDR(summary.addendumTotal)} Addendum`})
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Terverifikasi Lunas */}
        <Card>
          <CardContent style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>
              Total Sudah Dibayar (Lunas)
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
              {formatIDR(summary.totalPaid)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <div style={{ flex: 1, height: '6px', background: 'var(--dash-border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(summary.paymentProgress, 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    borderRadius: '3px',
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                {summary.paymentProgress}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Sisa Tagihan Berjalan */}
        <Card>
          <CardContent style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>
              Sisa Tagihan Berjalan
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: summary.totalRemaining > 0 ? '#f97316' : '#10b981', marginTop: '6px' }}>
              {summary.totalRemaining > 0 ? formatIDR(summary.totalRemaining) : 'LUNAS 100%'}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              {summary.totalPending > 0 ? (
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                  ⏳ {formatIDR(summary.totalPending)} menunggu verifikasi
                </span>
              ) : (
                `${summary.paidTerminsCount} dari ${summary.totalTermins} termin telah lunas`
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Status Kunci BAST & Garansi */}
        <Card style={{ borderColor: summary.isBastUnlocked ? '#10b981' : 'var(--dash-border)' }}>
          <CardContent style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>
              Status Dokumen BAST & Garansi
            </div>
            <div style={{ marginTop: '8px' }}>
              <Badge
                variant={summary.isBastUnlocked ? 'success' : 'neutral'}
                style={{ fontSize: '12.5px', padding: '5px 10px' }}
              >
                <i className={summary.isBastUnlocked ? 'ri-lock-unlock-line' : 'ri-lock-2-line'} style={{ marginRight: '6px' }} />
                {summary.isBastUnlocked ? 'TERBUKA (Bisa Diunduh)' : 'TERKUNCI OTOMATIS'}
              </Badge>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
              Syarat BAST: Lunas 100% ({summary.allPaid ? '✓' : '✗'}) & Fisik Kurva S 100% ({summary.latestSCurve >= 100 ? '✓' : `${summary.latestSCurve}%`})
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
