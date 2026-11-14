'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { SCurveItem } from './SCurveChart';

interface SCurveEditorProps {
  projectId: number;
  initialData: SCurveItem[];
  contractValue: number;
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
  onDataUpdated,
}) => {
  const [weeks, setWeeks] = useState<SCurveItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync internal state with incoming props
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setWeeks(JSON.parse(JSON.stringify(initialData)));
    } else {
      // Default template 6 weeks (Standard Renovasi Rumah 1 Lantai)
      const defaultWeeks: SCurveItem[] = [
        { week_number: 1, planned_percentage: 10, actual_percentage: 10, cumulative_planned: 10, cumulative_actual: 10, status: 'COMPLETED', notes: 'Pekerjaan persiapan & pembongkaran' },
        { week_number: 2, planned_percentage: 15, actual_percentage: 16, cumulative_planned: 25, cumulative_actual: 26, status: 'COMPLETED', notes: 'Pekerjaan pondasi & struktur bawah' },
        { week_number: 3, planned_percentage: 25, actual_percentage: 24, cumulative_planned: 50, cumulative_actual: 50, status: 'IN_PROGRESS', notes: 'Pasangan dinding bata & plesteran' },
        { week_number: 4, planned_percentage: 25, actual_percentage: 0, cumulative_planned: 75, cumulative_actual: 0, status: 'IN_PROGRESS', notes: 'Kusen, instalasi listrik & air' },
        { week_number: 5, planned_percentage: 15, actual_percentage: 0, cumulative_planned: 90, cumulative_actual: 0, status: 'IN_PROGRESS', notes: 'Pekerjaan plafon & finishing lantai' },
        { week_number: 6, planned_percentage: 10, actual_percentage: 0, cumulative_planned: 100, cumulative_actual: 0, status: 'IN_PROGRESS', notes: 'Pengecatan, sanitair & pembersihan akhir' },
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
      // Actual cumulative only accumulates if actual > 0
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

    // If changing planned_percentage or actual_percentage, recalculate cumulatives
    if (field === 'planned_percentage' || field === 'actual_percentage') {
      const recalculated = recalculateCumulatives(updated);
      setWeeks(recalculated);
    } else {
      setWeeks(updated);
    }
  };

  // Add new week (for Addendum / pekerjaan tambah kurang)
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
      notes: isAddendum ? 'Pekerjaan Addendum / Tambah Kurang' : '',
    };
    setWeeks([...weeks, newWeek]);
  };

  // Remove latest week
  const handleRemoveWeek = () => {
    if (weeks.length <= 1) return;
    const updated = weeks.slice(0, weeks.length - 1);
    const recalculated = recalculateCumulatives(updated);
    setWeeks(recalculated);
  };

  // Batch Save all weeks to API
  const handleBatchSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/s-curve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          action: 'batch_save',
          weeks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan data Kurva S');
      }

      setStatusMsg({ type: 'success', text: data.message });
      onDataUpdated();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  // Total planned percentage validation
  const totalPlannedPct = weeks.reduce((sum, w) => sum + (Number(w.planned_percentage) || 0), 0);
  const isValid100 = Math.abs(totalPlannedPct - 100) < 0.05 || (weeks.length > 0 && Math.abs(weeks[weeks.length - 1].cumulative_planned - 100) < 0.05);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle icon="ri-edit-2-line">
            Editor Matriks Kurva S Mingguan (PM & Pengawas Lapangan)
          </CardTitle>
          <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
            Input bobot rencana mingguan, realisasi riil lapangan, status pekerjaan, dan catatan kendala
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
              Hapus Minggu Akhir
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleBatchSave}
            loading={saving}
            icon="ri-save-line"
          >
            {saving ? 'Menyimpan...' : 'Simpan Seluruh Kurva S'}
          </Button>
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

        {/* Total Bobot Validation Bar */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: isValid100 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${isValid100 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: isValid100 ? '#10b981' : '#f59e0b' }}>
              {isValid100 ? '✓ Validasi Bobot Rencana: Tepat 100%' : `⚠ Total Bobot: ${totalPlannedPct.toFixed(1)}% (Harus 100%)`}
            </span>
            <span style={{ color: 'var(--dash-text-muted)' }}>
              • Total Nilai Kontrak Proyek: <strong>{formatIDR(contractValue)}</strong>
            </span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)' }}>
            Total Durasi: <strong>{weeks.length} Minggu</strong>
          </div>
        </div>

        {/* Responsive Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--dash-border)', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '2px solid var(--dash-border)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '110px' }}>Minggu Ke</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '120px' }}>Rencana (%)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '120px' }}>Riil Lapangan (%)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '130px' }}>Kumulatif Rencana</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '130px' }}>Kumulatif Riil</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '150px' }}>Status Pekerjaan</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, minWidth: '180px' }}>Catatan Kendala / Progres</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, idx) => {
                const dev = parseFloat(((week.cumulative_actual || 0) - (week.cumulative_planned || 0)).toFixed(2));
                const isAddendumWeek = week.week_number > 6;

                return (
                  <tr
                    key={week.week_number}
                    style={{
                      borderBottom: '1px solid var(--dash-border)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                    }}
                  >
                    {/* Minggu Ke */}
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>M-{week.week_number}</span>
                        {isAddendumWeek && (
                          <Badge variant="warning" style={{ fontSize: '9px', padding: '1px 4px' }}>
                            ADD
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Rencana % */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={week.planned_percentage}
                          onChange={(e) => handleFieldChange(idx, 'planned_percentage', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '75px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--dash-border)',
                            background: 'var(--dash-card-bg)',
                            color: 'var(--dash-text-main)',
                            fontWeight: 600,
                          }}
                        />
                        <span style={{ color: 'var(--dash-text-muted)' }}>%</span>
                      </div>
                    </td>

                    {/* Riil Lapangan % */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={week.actual_percentage}
                          onChange={(e) => handleFieldChange(idx, 'actual_percentage', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '75px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--dash-border)',
                            background: 'var(--dash-card-bg)',
                            color: '#10b981',
                            fontWeight: 700,
                          }}
                        />
                        <span style={{ color: 'var(--dash-text-muted)' }}>%</span>
                      </div>
                    </td>

                    {/* Kumulatif Rencana */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={week.cumulative_planned}
                          onChange={(e) => handleFieldChange(idx, 'cumulative_planned', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '75px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--dash-border)',
                            background: 'var(--dash-muted-bg)',
                            color: '#2563eb',
                            fontWeight: 700,
                          }}
                        />
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>%</span>
                      </div>
                    </td>

                    {/* Kumulatif Riil */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={week.cumulative_actual}
                          onChange={(e) => handleFieldChange(idx, 'cumulative_actual', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '75px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--dash-border)',
                            background: 'var(--dash-muted-bg)',
                            color: '#10b981',
                            fontWeight: 700,
                          }}
                        />
                        <span style={{ color: '#10b981', fontWeight: 600 }}>%</span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td style={{ padding: '10px 14px' }}>
                      <select
                        value={week.status || 'IN_PROGRESS'}
                        onChange={(e) => handleFieldChange(idx, 'status', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--dash-border)',
                          background: 'var(--dash-card-bg)',
                          color: 'var(--dash-text-main)',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        <option value="COMPLETED">Completed (Selesai)</option>
                        <option value="IN_PROGRESS">In Progress (Berjalan)</option>
                        <option value="ON_HOLD">On Hold (Tertunda)</option>
                      </select>
                    </td>

                    {/* Notes */}
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="text"
                        placeholder="Contoh: Cor plat lantai 2 selesai..."
                        value={week.notes || ''}
                        onChange={(e) => handleFieldChange(idx, 'notes', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--dash-border)',
                          background: 'var(--dash-card-bg)',
                          color: 'var(--dash-text-main)',
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

        {/* Footer info & submit bar */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>
            * Perubahan bobot riil akan secara otomatis memperbarui grafik Kurva S digital di Portal Klien secara *real-time*.
          </div>
          <Button
            variant="primary"
            onClick={handleBatchSave}
            loading={saving}
            icon="ri-check-double-line"
          >
            {saving ? 'Menyimpan Pembaruan...' : 'Simpan Seluruh Kurva S'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

