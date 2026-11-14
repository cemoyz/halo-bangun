'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { SCurveChart, SCurveItem } from '@/components/dashboard/SCurveChart';
import { SCurveEditor } from '@/components/dashboard/SCurveEditor';

interface Project {
  id: number;
  name: string;
  contract_value: number;
  status: string;
  location: string;
  pm?: { name: string; phone?: string | null } | null;
  client?: { name: string; phone?: string | null } | null;
}

const formatIDR = (val?: number | null) => {
  if (val === undefined || val === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function SCurvePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [progressData, setProgressData] = useState<SCurveItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'chart' | 'editor' | 'table'>('chart');

  // Load user from Supabase auth session
  useEffect(() => {
    async function loadAuthUser() {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        if (json.success && json.user) {
          setCurrentUser(json.user);
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch auth session:', e);
      }
      try {
        const stored = sessionStorage.getItem('dash_user');
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (e) {}
    }
    loadAuthUser();
  }, []);

  // Fetch S-Curve data from API
  const fetchSCurveData = async (projId?: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = projId ? `/api/s-curve?projectId=${projId}` : '/api/s-curve';
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memuat data Kurva S');
      }

      setProjects(data.projects || []);
      setSelectedProject(data.project || null);
      setProgressData(data.progress || []);
      setSummary(data.summary || null);

      if (data.project?.id && (!selectedProjectId || selectedProjectId !== data.project.id)) {
        setSelectedProjectId(data.project.id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSCurveData();
  }, []);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = parseInt(e.target.value, 10);
    setSelectedProjectId(pId);
    fetchSCurveData(pId);
  };

  // RBAC check
  const userRole = currentUser?.role;
  const isForbidden = userRole === 'MANDOR' || userRole === 'FINANCE';
  const canEdit = userRole === 'PM' || userRole === 'OWNER';

  return (
    <DashboardLayout title="Kurva S (Rencana vs Riil)">
      {/* RBAC Warning if Mandor or Finance */}
      {isForbidden ? (
        <Card style={{ marginTop: '20px', borderColor: '#ef4444' }}>
          <CardContent style={{ padding: '40px', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
              }}
            >
              <i className="ri-lock-line" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--dash-text-main)', marginBottom: '8px' }}>
              Akses Kurva S Dibatasi (RBAC)
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--dash-text-muted)', maxWidth: '520px', margin: '0 auto 20px' }}>
              Sesuai dengan SOP dan aturan keamanan platform Halo Bangun, modul Kurva S hanya dapat diakses oleh Pengawas Lapangan (PM), Direktur (Owner), dan Klien Proyek. Role Mandor & Finance dilarang mengakses modul ini.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = userRole === 'MANDOR' ? '/dashboard/mandor' : '/dashboard/finance';
              }}
              icon="ri-arrow-left-line"
            >
              Kembali ke Dashboard Saya
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Controls & Project Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              background: 'var(--dash-card-bg)',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid var(--dash-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                Pilih Proyek:
              </span>
              <select
                value={selectedProjectId || ''}
                onChange={handleProjectChange}
                disabled={loading || projects.length === 0}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--dash-border)',
                  background: 'var(--dash-muted-bg)',
                  color: 'var(--dash-text-main)',
                  fontSize: '13px',
                  fontWeight: 600,
                  minWidth: '280px',
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>

              {selectedProject && (
                <Badge variant="outline" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  Kontrak: <strong>{formatIDR(selectedProject.contract_value)}</strong>
                </Badge>
              )}
            </div>

            {/* Navigation tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant={activeView === 'chart' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveView('chart')}
                icon="ri-line-chart-line"
              >
                Grafik Kurva S
              </Button>
              <Button
                variant={activeView === 'table' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveView('table')}
                icon="ri-table-line"
              >
                Laporan Excel Progres
              </Button>
              {canEdit && (
                <Button
                  variant={activeView === 'editor' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('editor')}
                  icon="ri-edit-line"
                >
                  Editor Mingguan (PM)
                </Button>
              )}
            </div>
          </div>

          {/* Loading or Error */}
          {loading && (
            <Card>
              <CardContent style={{ padding: '40px', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                <i className="ri-loader-4-line ri-spin" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', color: '#f97316' }} />
                <div>Memuat data Kurva S proyek...</div>
              </CardContent>
            </Card>
          )}

          {errorMsg && (
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fca5a5',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="ri-error-warning-line" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!loading && !errorMsg && selectedProject && (
            <>
              {/* VIEW 1: CHART */}
              {activeView === 'chart' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <SCurveChart
                    data={progressData}
                    projectName={selectedProject.name}
                    contractValue={selectedProject.contract_value}
                    showSummaryCards={true}
                  />

                  {/* Quick Shortcut to Editor for PM */}
                  {canEdit && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="secondary"
                        onClick={() => setActiveView('editor')}
                        icon="ri-edit-line"
                      >
                        Buka Formulir Input / Editor Kurva S Lapangan
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: EDITOR (PM & OWNER ONLY) */}
              {activeView === 'editor' && canEdit && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <SCurveEditor
                    projectId={selectedProject.id}
                    initialData={progressData}
                    contractValue={selectedProject.contract_value}
                    userRole={userRole}
                    onDataUpdated={() => fetchSCurveData(selectedProject.id)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                      variant="outline"
                      onClick={() => setActiveView('chart')}
                      icon="ri-line-chart-line"
                    >
                      Lihat Kembali Hasil Grafik Kurva S
                    </Button>
                  </div>
                </div>
              )}

              {/* VIEW 3: STRUCTURED EXCEL-LIKE CONSTRUCTION REPORT TABLE */}
              {activeView === 'table' && (
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle icon="ri-file-excel-2-line">
                        Progress Report Mingguan: Format Standard Renovasi Rumah 1 Lantai
                      </CardTitle>
                      <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
                        Tabel rekapitulasi bobot rencana, progres riil, kumulatif, dan deviasi mingguan
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      icon="ri-printer-line"
                    >
                      Cetak / Simpan PDF
                    </Button>
                  </CardHeader>
                  <CardContent style={{ padding: '20px' }}>
                    <div style={{ overflowX: 'auto', border: '1px solid var(--dash-border)', borderRadius: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '2px solid var(--dash-border)' }}>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Minggu</th>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Rencana (%)</th>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Riil Lapangan (%)</th>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Kum. Rencana (%)</th>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Kum. Riil (%)</th>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Deviasi (+/- %)</th>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Bobot Biaya Rencana</th>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Bobot Biaya Riil</th>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Status</th>
                            <th style={{ padding: '12px 14px', fontWeight: 700 }}>Catatan Evaluasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {progressData.map((w, idx) => {
                            const dev = parseFloat((w.cumulative_actual - w.cumulative_planned).toFixed(2));
                            const hasActual = w.cumulative_actual > 0;

                            return (
                              <tr
                                key={w.week_number}
                                style={{
                                  borderBottom: '1px solid var(--dash-border)',
                                  background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                                }}
                              >
                                <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                                  Minggu {w.week_number}
                                </td>
                                <td style={{ padding: '12px 14px' }}>{w.planned_percentage}%</td>
                                <td style={{ padding: '12px 14px', fontWeight: 600, color: hasActual ? '#10b981' : 'var(--dash-text-muted)' }}>
                                  {hasActual ? `${w.actual_percentage}%` : '-'}
                                </td>
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>
                                  {w.cumulative_planned}%
                                </td>
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#10b981' }}>
                                  {hasActual ? `${w.cumulative_actual}%` : '-'}
                                </td>
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
                                <td style={{ padding: '12px 14px', fontSize: '11.5px' }}>
                                  {formatIDR(w.planned_cost)}
                                </td>
                                <td style={{ padding: '12px 14px', fontSize: '11.5px' }}>
                                  {hasActual ? formatIDR(w.actual_cost) : '-'}
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                  <Badge
                                    variant={
                                      w.status === 'COMPLETED'
                                        ? 'success'
                                        : w.status === 'ON_HOLD'
                                        ? 'danger'
                                        : 'warning'
                                    }
                                  >
                                    {w.status || 'IN_PROGRESS'}
                                  </Badge>
                                </td>
                                <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--dash-text-muted)' }}>
                                  {w.notes || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

