'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { SCurveItem } from './SCurveChart';

interface SCurveEditorProps {
  projectId: number;
  initialData: SCurveItem[];
  contractValue: number;
  userRole?: string;
  onDataUpdated: () => void;
}

const formatIDR = (val?: number | null) => {
  if (val === undefined || val === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const SCurveEditor: React.FC<SCurveEditorProps> = ({
  projectId,
  initialData = [],
  contractValue = 0,
  userRole = 'OWNER',
  onDataUpdated,
}) => {
  const [weeks, setWeeks] = useState<SCurveItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [syncingDaily, setSyncingDaily] = useState(false);
  const [dailySyncInfo, setDailySyncInfo] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Mode: 'owner' (Perencanaan Target) vs 'supervisor' (Laporan Realisasi Mingguan)
  const isOwner = userRole === 'OWNER';
  const isPM = userRole === 'PM';
  const [activeMode, setActiveMode] = useState<'owner' | 'supervisor'>(isPM ? 'supervisor' : 'owner');

  // Sync internal state with incoming props
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setWeeks(JSON.parse(JSON.stringify(initialData)));
    } else {
      // Default template 6 weeks (Standard Renovasi Rumah 1 Lantai)
      const defaultWeeks: SCurveItem[] = [
        { week_number: 1, planned_percentage: 11.63, actual_percentage: 11.63, cumulative_planned: 11.63, cumulative_actual: 11.63, status: 'COMPLETED', notes: 'Pek. Persiapan, pembongkaran dinding & bowplank' },
        { week_number: 2, planned_percentage: 16.80, actual_percentage: 16.80, cumulative_planned: 28.43, cumulative_actual: 28.43, status: 'COMPLETED', notes: 'Pek. Pasangan bata merah & perpipaan air' },
        { week_number: 3, planned_percentage: 13.70, actual_percentage: 13.70, cumulative_planned: 42.13, cumulative_actual: 42.13, status: 'COMPLETED', notes: 'Plesteran acian & kusen pintu/jendela' },
        { week_number: 4, planned_percentage: 30.99, actual_percentage: 30.99, cumulative_planned: 73.12, cumulative_actual: 73.12, status: 'COMPLETED', notes: 'Rangka hollow, plafon gypsum & instalasi listrik' },
        { week_number: 5, planned_percentage: 19.80, actual_percentage: 19.80, cumulative_planned: 92.92, cumulative_actual: 92.92, status: 'IN_PROGRESS', notes: 'Keramik lantai/dinding & sanitair kamar mandi' },
        { week_number: 6, planned_percentage: 7.08, actual_percentage: 0, cumulative_planned: 100.00, cumulative_actual: 92.92, status: 'ON_HOLD', notes: 'Pengecatan akhir, pembersihan & persiapan BAST' },
      ];
      setWeeks(defaultWeeks);
    }
  }, [initialData]);

  // Recalculate cumulative values sequentially
  const recalculateCumulatives = (items: SCurveItem[]): SCurveItem[] => {
    let runCumPlanned = 0;
    let runCumActual = 0;

    return items.map((w) => {
      const pPct = Number(w.planned_percentage) || 0;
      const aPct = Number(w.actual_percentage) || 0;

      runCumPlanned = parseFloat((runCumPlanned + pPct).toFixed(2));
      if (aPct > 0 || (w.cumulative_actual && w.cumulative_actual > 0)) {
        runCumActual = parseFloat((runCumActual + aPct).toFixed(2));
      }

      return {
        ...w,
        cumulative_planned: runCumPlanned,
        cumulative_actual: aPct > 0 ? runCumActual : (w.cumulative_actual || 0),
        planned_cost: Math.round((pPct / 100) * contractValue),
        actual_cost: Math.round((aPct / 100) * contractValue),
      };
    });
  };

  const handleFieldChange = (
    index: number,
    field: keyof SCurveItem,
    value: any
  ) => {
    const updated = [...weeks];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    if (field === 'planned_percentage' || field === 'actual_percentage') {
      const recalculated = recalculateCumulatives(updated);
      setWeeks(recalculated);
    } else {
      setWeeks(updated);
    }
  };

  // Add new week (for Addendum / pekerjaan tambah kurang yang disetujui Owner)
  const handleAddWeek = () => {
    const nextNum = weeks.length > 0 ? weeks[weeks.length - 1].week_number + 1 : 1;
    const isAddendum = nextNum > 6;
    const newWeek: SCurveItem = {
      week_number: nextNum,
      planned_percentage: 0,
      actual_percentage: 0,
      cumulative_planned: weeks.length > 0 ? weeks[weeks.length - 1].cumulative_planned : 100,
      cumulative_actual: 0,
      status: 'IN_PROGRESS',
      notes: isAddendum ? 'Penyesuaian Minggu Addendum / Tambah Kurang Disetujui Owner' : '',
    };
    setWeeks([...weeks, newWeek]);
  };

  // Remove latest week (Owner only)
  const handleRemoveWeek = () => {
    if (weeks.length <= 1) return;
    const updated = weeks.slice(0, weeks.length - 1);
    const recalculated = recalculateCumulatives(updated);
    setWeeks(recalculated);
  };

  // Save by Owner (Perencanaan Baseline)
  const handleSaveOwnerPlan = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/s-curve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          action: 'save_owner_plan',
          weeks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan Perencanaan Target');
      }

      setStatusMsg({ type: 'success', text: data.message });
      onDataUpdated();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setSaving(false);
    }
  };

  // Save by Supervisor (Laporan Mingguan Lapangan)
  const handleSaveSupervisorReport = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/s-curve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          action: 'save_supervisor_report',
          weeks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan Laporan Mingguan');
      }

      setStatusMsg({ type: 'success', text: data.message });
      onDataUpdated();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setSaving(false);
    }
  };

  // Sync Daily Reports into Weekly S-Curve
  const handleSyncDailyReports = async () => {
    setSyncingDaily(true);
    try {
      const res = await fetch('/api/s-curve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          action: 'sync_daily_reports',
        }),
      });
      const data = await res.json();
      if (data.success && data.weeklyProgressMap) {
        setDailySyncInfo(data.weeklyProgressMap);
        setStatusMsg({
          type: 'success',
          text: `Sinkronisasi berhasil! ${data.message} Rincian harian siap dikonsolidasi ke progres mingguan.`,
        });
      }
    } catch (err: any) {
      alert('Gagal menyinkronkan laporan harian: ' + err.message);
    } finally {
      setSyncingDaily(false);
    }
  };

  // Total planned percentage validation
  const totalPlannedPct = weeks.reduce((sum, w) => sum + (Number(w.planned_percentage) || 0), 0);
  const isValid100 = Math.abs(totalPlannedPct - 100) < 0.1 || (weeks.length > 0 && Math.abs(weeks[weeks.length - 1].cumulative_planned - 100) < 0.1);

  return (
    <Card>
      <CardHeader>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                background: activeMode === 'owner' ? '#2563eb' : '#10b981',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              {activeMode === 'owner' ? 'Perencanaan Target (Owner)' : 'Realisasi Lapangan (Pengawas)'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>
              Total Nilai Proyek: <strong>{formatIDR(contractValue)}</strong>
            </span>
          </div>
          <CardTitle icon="ri-edit-2-line">
            Matriks Kurva S Dinamis — Rencana Owner vs Riil Pengawas
          </CardTitle>
        </div>

        {/* Action Buttons & Role Switcher */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* If Owner, allow toggle between Perencanaan and Laporan Mingguan */}
          {isOwner && (
            <div style={{ display: 'flex', background: 'var(--dash-muted-bg)', padding: '2px', borderRadius: '6px', border: '1px solid var(--dash-border)' }}>
              <button
                type="button"
                onClick={() => setActiveMode('owner')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeMode === 'owner' ? '#2563eb' : 'transparent',
                  color: activeMode === 'owner' ? '#fff' : 'var(--dash-text-muted)',
                }}
              >
                <i className="ri-building-line" style={{ marginRight: '4px' }} /> Perencanaan Target Owner
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('supervisor')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeMode === 'supervisor' ? '#10b981' : 'transparent',
                  color: activeMode === 'supervisor' ? '#fff' : 'var(--dash-text-muted)',
                }}
              >
                <i className="ri-user-follow-line" style={{ marginRight: '4px' }} /> Laporan Riil Pengawas
              </button>
            </div>
          )}

          {/* Mode Owner Actions */}
          {activeMode === 'owner' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddWeek}
                icon="ri-add-line"
              >
                Tambah Minggu Addendum
              </Button>
              {weeks.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveWeek}
                  icon="ri-delete-bin-line"
                  style={{ color: '#ef4444' }}
                >
                  Hapus Minggu
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveOwnerPlan}
                loading={saving}
                icon="ri-shield-check-line"
                style={{ background: '#2563eb', borderColor: '#2563eb' }}
              >
                {saving ? 'Menyimpan...' : 'Sahkan Target Rencana (Owner)'}
              </Button>
            </>
          )}

          {/* Mode Supervisor Actions */}
          {activeMode === 'supervisor' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncDailyReports}
                loading={syncingDaily}
                icon="ri-refresh-line"
                style={{ borderColor: '#10b981', color: '#10b981' }}
              >
                {syncingDaily ? 'Menyinkronkan...' : 'Sinkron Laporan Harian'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSupervisorReport}
                loading={saving}
                icon="ri-save-line"
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                {saving ? 'Menyimpan...' : 'Simpan Laporan Mingguan Pengawas'}
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent style={{ padding: '20px' }}>
        {statusMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: statusMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: statusMsg.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${statusMsg.type === 'success' ? '#86efac' : '#fca5a5'}`,
            }}
          >
            <i className={statusMsg.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Mode Information & Guidelines Banner */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '8px',
            background: activeMode === 'owner' ? 'rgba(37, 99, 235, 0.06)' : 'rgba(16, 185, 129, 0.06)',
            border: `1px solid ${activeMode === 'owner' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <strong style={{ fontSize: '13px', color: activeMode === 'owner' ? '#1d4ed8' : '#047857' }}>
              {activeMode === 'owner'
                ? '🎯 Mode Perencanaan Target (Direktur / Owner)'
                : '📋 Mode Laporan Mingguan Lapangan (Pengawas / PM)'}
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--dash-text-muted)' }}>
              {activeMode === 'owner'
                ? 'Tentukan target bobot arsitektural mingguan hingga total kumulatif tepat 100%. Target ini menjadi acuan kontrak mengikat di portal klien.'
                : 'Target Rencana terkunci sesuai kontrak Owner. Masukkan % realisasi fisik riil lapangan, status progres fisik, dan catatan kendala pengawasan.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: isValid100 ? '#10b981' : '#f59e0b',
                padding: '4px 10px',
                background: isValid100 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                borderRadius: '6px',
              }}
            >
              {isValid100 ? '✓ Target Rencana: Tepat 100%' : `⚠ Target: ${totalPlannedPct.toFixed(1)}% (Harus 100%)`}
            </span>
          </div>
        </div>

        {/* Daily Reports Sync Summary Banner (if triggered) */}
        {dailySyncInfo && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              marginBottom: '16px',
              fontSize: '12px',
            }}
          >
            <strong style={{ color: '#0f172a' }}>Hasil Rekap Laporan Harian Pengawas:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
              {Object.keys(dailySyncInfo).map((wKey) => (
                <div key={wKey} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '4px' }}>
                  <strong>Minggu {wKey}:</strong> {dailySyncInfo[wKey].count} laporan harian ({dailySyncInfo[wKey].items.length} item pekerjaan)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Responsive Matrix Table */}
        <div className="dash-desktop-table" style={{ overflowX: 'auto', border: '1px solid var(--dash-border)', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '2px solid var(--dash-border)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '100px' }}>Minggu</th>
                <th
                  style={{
                    padding: '12px 14px',
                    fontWeight: 700,
                    width: '140px',
                    background: activeMode === 'owner' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: '#2563eb',
                  }}
                >
                  % Rencana (Owner)
                </th>
                <th
                  style={{
                    padding: '12px 14px',
                    fontWeight: 700,
                    width: '140px',
                    background: activeMode === 'supervisor' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                    color: '#10b981',
                  }}
                >
                  % Riil (Pengawas)
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '130px' }}>Kum. Rencana</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '130px' }}>Kum. Riil</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '120px' }}>Deviasi</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '140px' }}>Status Pengerjaan</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Catatan Lapangan & Kendala</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w, idx) => {
                const dev = parseFloat((w.cumulative_actual - w.cumulative_planned).toFixed(2));
                const hasActual = w.cumulative_actual > 0 || w.actual_percentage > 0;
                const isAddendum = w.week_number > 6;

                return (
                  <tr
                    key={w.week_number}
                    style={{
                      borderBottom: '1px solid var(--dash-border)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                    }}
                  >
                    {/* Week Number */}
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Minggu {w.week_number}</span>
                        {isAddendum && (
                          <span
                            style={{
                              fontSize: '9px',
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              fontWeight: 700,
                            }}
                          >
                            ADD
                          </span>
                        )}
                      </div>
                    </td>

                    {/* % Planned (Owner Editable, PM Locked) */}
                    <td
                      style={{
                        padding: '10px 14px',
                        background: activeMode === 'owner' ? 'rgba(37, 99, 235, 0.03)' : 'transparent',
                      }}
                    >
                      {activeMode === 'owner' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={w.planned_percentage}
                            onChange={(e) => handleFieldChange(idx, 'planned_percentage', e.target.value)}
                            style={{
                              width: '75px',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #2563eb',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              color: '#2563eb',
                              background: 'var(--dash-card-bg)',
                            }}
                          />
                          <span style={{ fontWeight: 600, color: '#2563eb' }}>%</span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>
                          {w.planned_percentage}%
                        </span>
                      )}
                    </td>

                    {/* % Actual (Supervisor Editable) */}
                    <td
                      style={{
                        padding: '10px 14px',
                        background: activeMode === 'supervisor' ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
                      }}
                    >
                      {activeMode === 'supervisor' || isOwner ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={w.actual_percentage}
                            onChange={(e) => handleFieldChange(idx, 'actual_percentage', e.target.value)}
                            style={{
                              width: '75px',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #10b981',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              color: '#10b981',
                              background: 'var(--dash-card-bg)',
                            }}
                          />
                          <span style={{ fontWeight: 600, color: '#10b981' }}>%</span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, color: hasActual ? '#10b981' : 'var(--dash-text-muted)' }}>
                          {hasActual ? `${w.actual_percentage}%` : '-'}
                        </span>
                      )}
                    </td>

                    {/* Kumulatif Rencana */}
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>
                      {w.cumulative_planned}%
                    </td>

                    {/* Kumulatif Riil */}
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#10b981' }}>
                      {hasActual ? `${w.cumulative_actual}%` : '-'}
                    </td>

                    {/* Deviasi (+/- %) */}
                    <td style={{ padding: '12px 14px' }}>
                      {hasActual ? (
                        <span
                          style={{
                            fontWeight: 700,
                            color: dev > 0.5 ? '#10b981' : dev < -0.5 ? '#ef4444' : '#2563eb',
                          }}
                        >
                          {dev > 0 ? `+${dev}%` : `${dev}%`}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--dash-text-muted)' }}>-</span>
                      )}
                    </td>

                    {/* Status Pengerjaan */}
                    <td style={{ padding: '10px 14px' }}>
                      <select
                        value={w.status || 'IN_PROGRESS'}
                        onChange={(e) => handleFieldChange(idx, 'status', e.target.value)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--dash-border)',
                          background: 'var(--dash-card-bg)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                        }}
                      >
                        <option value="COMPLETED">Completed</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ON_HOLD">On Hold</option>
                      </select>
                    </td>

                    {/* Catatan Lapangan */}
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="text"
                        placeholder="Catatan progres / kendala lapangan..."
                        value={w.notes || ''}
                        onChange={(e) => handleFieldChange(idx, 'notes', e.target.value)}
                        style={{
                          width: '100%',
                          minWidth: '200px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--dash-border)',
                          background: 'var(--dash-card-bg)',
                          fontSize: '12px',
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (<= 768px) */}
        <div className="dash-mobile-cards">
          {weeks.map((w, idx) => {
            const dev = parseFloat((w.cumulative_actual - w.cumulative_planned).toFixed(2));
            const hasActual = w.cumulative_actual > 0 || w.actual_percentage > 0;
            const isAddendum = w.week_number > 6;

            return (
              <div key={w.week_number} className="dash-mobile-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                      Minggu {w.week_number}
                    </span>
                    {isAddendum && (
                      <span
                        style={{
                          fontSize: '9px',
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          fontWeight: 700,
                        }}
                      >
                        ADD
                      </span>
                    )}
                  </div>

                  <select
                    value={w.status || 'IN_PROGRESS'}
                    onChange={(e) => handleFieldChange(idx, 'status', e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-card-bg)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                    }}
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--dash-muted-bg)', padding: '10px 12px', borderRadius: '8px' }}>
                  {/* % Rencana */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#2563eb', fontWeight: 700, marginBottom: '3px' }}>
                      % Rencana (Owner)
                    </label>
                    {activeMode === 'owner' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={w.planned_percentage}
                          onChange={(e) => handleFieldChange(idx, 'planned_percentage', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #2563eb',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#2563eb',
                            background: 'var(--dash-card-bg)',
                          }}
                        />
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>%</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb' }}>
                        {w.planned_percentage}%
                      </div>
                    )}
                  </div>

                  {/* % Riil */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#10b981', fontWeight: 700, marginBottom: '3px' }}>
                      % Riil (Pengawas)
                    </label>
                    {activeMode === 'supervisor' || isOwner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={w.actual_percentage}
                          onChange={(e) => handleFieldChange(idx, 'actual_percentage', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #10b981',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#10b981',
                            background: 'var(--dash-card-bg)',
                          }}
                        />
                        <span style={{ fontWeight: 700, color: '#10b981' }}>%</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '14px', fontWeight: 800, color: hasActual ? '#10b981' : 'var(--dash-text-muted)' }}>
                        {hasActual ? `${w.actual_percentage}%` : '-'}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '0 4px' }}>
                  <span style={{ color: 'var(--dash-text-muted)' }}>
                    Kumulatif: <b style={{ color: '#2563eb' }}>{w.cumulative_planned}%</b> / <b style={{ color: '#10b981' }}>{hasActual ? `${w.cumulative_actual}%` : '-'}</b>
                  </span>
                  <span>
                    Deviasi:{' '}
                    {hasActual ? (
                      <b style={{ color: dev > 0.5 ? '#10b981' : dev < -0.5 ? '#ef4444' : '#2563eb' }}>
                        {dev > 0 ? `+${dev}%` : `${dev}%`}
                      </b>
                    ) : (
                      '-'
                    )}
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Catatan progres / kendala lapangan..."
                    value={w.notes || ''}
                    onChange={(e) => handleFieldChange(idx, 'notes', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-card-bg)',
                      fontSize: '12px',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
