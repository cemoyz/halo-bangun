'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/dashboard/ui';

export interface SCurveItem {
  id?: number;
  project_id?: number;
  week_number: number;
  planned_percentage: number;
  actual_percentage: number;
  cumulative_planned: number;
  cumulative_actual: number;
  planned_cost?: number | null;
  actual_cost?: number | null;
  status?: string;
  notes?: string | null;
  target_date?: string | null;
}

interface SCurveChartProps {
  data: SCurveItem[];
  projectName?: string;
  contractValue?: number;
  showSummaryCards?: boolean;
}

const formatIDR = (val?: number | null) => {
  if (val === undefined || val === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const SCurveChart: React.FC<SCurveChartProps> = ({
  data = [],
  projectName,
  contractValue = 0,
  showSummaryCards = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent style={{ padding: '40px', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
          <i className="ri-line-chart-line" style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }} />
          <div>Belum ada data Kurva S mingguan yang dimasukkan untuk proyek ini.</div>
        </CardContent>
      </Card>
    );
  }

  // Find latest recorded progress week (where cumulative_actual > 0)
  const recordedWeeks = data.filter((d) => d.cumulative_actual > 0);
  const currentWeek = recordedWeeks.length > 0 ? recordedWeeks[recordedWeeks.length - 1] : data[0];
  const targetPct = currentWeek?.cumulative_planned || 0;
  const actualPct = currentWeek?.cumulative_actual || 0;
  const deviation = parseFloat((actualPct - targetPct).toFixed(2));

  let deviationBadge: { label: string; variant: 'success' | 'danger' | 'info'; icon: string } = {
    label: 'On-Track (Sesuai Rencana)',
    variant: 'info',
    icon: 'ri-check-line',
  };

  if (deviation > 0.5) {
    deviationBadge = {
      label: `Ahead (+${deviation}%) Lebih Cepat`,
      variant: 'success',
      icon: 'ri-arrow-up-circle-line',
    };
  } else if (deviation < -0.5) {
    deviationBadge = {
      label: `Delayed (${deviation}%) Terlambat`,
      variant: 'danger',
      icon: 'ri-alert-line',
    };
  }

  // Transform data for Recharts
  const chartData = data.map((d) => ({
    week: `M-${d.week_number}`,
    weekNumber: d.week_number,
    'Target Rencana Kumulatif (Perencanaan Owner)': d.cumulative_planned,
    'Progres Riil Kumulatif (Laporan Pengawas)': d.cumulative_actual > 0 ? d.cumulative_actual : null,
    targetMingguan: d.planned_percentage,
    riilMingguan: d.actual_percentage,
    plannedCost: d.planned_cost,
    actualCost: d.actual_cost,
    status: d.status || 'IN_PROGRESS',
    notes: d.notes,
    targetDate: d.target_date,
    deviation: parseFloat((d.cumulative_actual - d.cumulative_planned).toFixed(2)),
  }));

  // Custom Interactive Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pData = payload[0]?.payload;
      const targetVal = pData['Target Rencana Kumulatif (Perencanaan Owner)'];
      const actualVal = pData['Progres Riil Kumulatif (Laporan Pengawas)'];
      const dev = actualVal !== null ? parseFloat((actualVal - targetVal).toFixed(2)) : null;

      return (
        <div
          style={{
            background: 'var(--dash-card-bg, #ffffff)',
            border: '1px solid var(--dash-border, #e2e8f0)',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            fontSize: '12.5px',
            minWidth: '240px',
            color: 'var(--dash-text-main, #0f172a)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--dash-border, #e2e8f0)', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#f97316' }}>
              Minggu ke-{pData.weekNumber}
            </span>
            {pData.status && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: pData.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                  color: pData.status === 'COMPLETED' ? '#166534' : '#92400e',
                }}
              >
                {pData.status}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
                Target Rencana Kumulatif:
              </span>
              <strong style={{ color: '#2563eb' }}>{targetVal}%</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                Progres Riil Kumulatif:
              </span>
              <strong style={{ color: '#10b981' }}>
                {actualVal !== null ? `${actualVal}%` : 'Belum diinput'}
              </strong>
            </div>

            {actualVal !== null && dev !== null && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: dev >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  marginTop: '4px',
                }}
              >
                <span style={{ fontSize: '11.5px', fontWeight: 600 }}>Status Deviasi:</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '11.5px',
                    color: dev > 0.5 ? '#10b981' : dev < -0.5 ? '#ef4444' : '#2563eb',
                  }}
                >
                  {dev > 0.5 ? `+${dev}% (Ahead)` : dev < -0.5 ? `${dev}% (Delayed)` : '0% (On-Track)'}
                </span>
              </div>
            )}

            {pData.plannedCost !== null && pData.plannedCost !== undefined && (
              <div style={{ fontSize: '11px', color: 'var(--dash-text-muted, #64748b)', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--dash-border, #e2e8f0)' }}>
                <div>Bobot Biaya Terencana: <strong>{formatIDR(pData.plannedCost)}</strong></div>
                {pData.actualCost !== null && pData.actualCost !== undefined && (
                  <div>Realisasi Biaya Lapangan: <strong>{formatIDR(pData.actualCost)}</strong></div>
                )}
              </div>
            )}

            {pData.notes && (
              <div style={{ fontSize: '11px', color: 'var(--dash-text-muted, #64748b)', marginTop: '4px', fontStyle: 'italic' }}>
                Catatan: {pData.notes}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {showSummaryCards && (
        <div className="dash-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Card 1: Realisasi Fisik */}
          <Card>
            <CardContent style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>
                Progres Fisik Riil Kumulatif
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span>{actualPct}%</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dash-text-muted)' }}>
                  (Target: {targetPct}%)
                </span>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ width: '100%', height: '6px', background: 'var(--dash-border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(actualPct, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #059669)',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Status Deviasi */}
          <Card>
            <CardContent style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>
                Deviasi Jadwal Lapangan
              </div>
              <div style={{ marginTop: '8px' }}>
                <Badge variant={deviationBadge.variant} style={{ fontSize: '13px', padding: '6px 12px' }}>
                  <i className={deviationBadge.icon} style={{ marginRight: '4px' }} />
                  {deviationBadge.label}
                </Badge>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '8px' }}>
                Evaluasi Minggu ke-{currentWeek?.week_number} dari {data.length} minggu total durasi
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Nilai Riil Proyek */}
          <Card>
            <CardContent style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>
                Nilai Fisik Terpasang
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '6px' }}>
                {formatIDR((actualPct / 100) * contractValue)}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                Total Nilai Kontrak RAB: {formatIDR(contractValue)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main S-Curve Graphic Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle icon="ri-line-chart-line">
              Grafik Kurva S Digital: Rencana vs Realisasi Fisik
            </CardTitle>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
              {projectName ? `Proyek: ${projectName} • ` : ''}Model Standard S-Curve Konstruksi Rumah Tinggal & Gedung
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="outline">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', display: 'inline-block', marginRight: '4px' }} />
              Rencana Target
            </Badge>
            <Badge variant="outline">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '4px' }} />
              Realisasi Lapangan
            </Badge>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '24px 20px 20px 10px' }}>
          <div className="dash-scurve-chart-box" style={{ width: '100%', height: '380px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border, #e2e8f0)" opacity={0.7} />
                <XAxis
                  dataKey="week"
                  stroke="var(--dash-text-muted, #64748b)"
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis
                  stroke="var(--dash-text-muted, #64748b)"
                  domain={[0, 100]}
                  fontSize={12}
                  unit="%"
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: 'var(--dash-text-main, #0f172a)', fontSize: '12px', fontWeight: 600 }}>
                      {value}
                    </span>
                  )}
                />
                <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: '100% Selesai', fill: '#94a3b8', fontSize: 11, position: 'right' }} />

                {/* Garis Rencana (Planned - Target): Blue line with clean round dots */}
                <Line
                  type="monotone"
                  dataKey="Target Rencana Kumulatif (Perencanaan Owner)"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                />

                {/* Garis Riil (Actual - Progres Lapangan): Emerald line with distinct dots */}
                <Line
                  type="monotone"
                  dataKey="Progres Riil Kumulatif (Laporan Pengawas)"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeDasharray=""
                  connectNulls={false}
                  dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--dash-muted-bg)',
              borderRadius: '8px',
              marginTop: '16px',
              fontSize: '12px',
              color: 'var(--dash-text-muted)',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ri-information-line" style={{ color: '#f97316' }} />
              <span>
                Kurva S standard mencerminkan kurva sigmoidal (awal lambat, akselerasi pekerjaan struktur di tengah, lalu *finishing* di akhir).
              </span>
            </div>
            <div>
              Total Pekerjaan: <strong>{data.length} Minggu</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

