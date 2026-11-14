'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { DailyReportFeed, DailyReportData } from '@/components/dashboard/DailyReportFeed';
import { DailyReportForm } from '@/components/dashboard/DailyReportForm';

interface Project {
  id: number;
  name: string;
  location: string;
  status: string;
}

export default function DailyReportsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [reports, setReports] = useState<DailyReportData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form mode state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReportData | null>(null);

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

  const fetchReports = async (projId?: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = projId ? `/api/daily-reports?projectId=${projId}` : '/api/daily-reports';
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memuat laporan harian');
      }

      setProjects(data.projects || []);
      setReports(data.reports || []);
      setSummary(data.summary || null);

      if (data.projects?.length > 0 && (!selectedProjectId || !projId)) {
        setSelectedProjectId(data.projects[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = parseInt(e.target.value, 10);
    setSelectedProjectId(pId);
    fetchReports(pId);
  };

  const handleDeleteReport = async (reportId: number) => {
    try {
      const res = await fetch(`/api/daily-reports?id=${reportId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      fetchReports(selectedProjectId || undefined);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus laporan');
    }
  };

  // RBAC checks
  const userRole = currentUser?.role;
  const isForbidden = userRole === 'MANDOR' || userRole === 'FINANCE';
  const canEdit = userRole === 'PM' || userRole === 'OWNER';

  return (
    <DashboardLayout title="Laporan Pengawasan Harian">
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
              Akses Laporan Harian Dibatasi (RBAC)
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--dash-text-muted)', maxWidth: '520px', margin: '0 auto 20px' }}>
              Modul Laporan Pengawasan Harian hanya dapat diakses oleh Pengawas Lapangan (PM), Direktur (Owner), dan Klien Proyek. Role Mandor & Finance dilarang mengakses modul ini.
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
          {/* Header Bar */}
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
            {/* Project Selector for PM & Owner */}
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
            </div>

            {/* Create Action for PM & Owner */}
            {canEdit && (
              <Button
                variant="primary"
                onClick={() => {
                  setEditingReport(null);
                  setIsFormOpen(!isFormOpen);
                }}
                icon={isFormOpen ? 'ri-close-line' : 'ri-add-line'}
              >
                {isFormOpen ? 'Tutup Formulir' : '+ Buat Laporan Harian Baru'}
              </Button>
            )}
          </div>

          {/* Form Modal / Section */}
          {isFormOpen && canEdit && (
            <DailyReportForm
              projects={projects}
              selectedProjectId={selectedProjectId || projects[0]?.id || 0}
              initialReport={editingReport}
              onSuccess={() => {
                setIsFormOpen(false);
                setEditingReport(null);
                fetchReports(selectedProjectId || undefined);
              }}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingReport(null);
              }}
            />
          )}

          {/* Summary Metric Cards */}
          {summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <Card>
                <CardContent style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dash-text-muted)' }}>
                    TOTAL LAPORAN TERCATAT
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#f97316', marginTop: '4px' }}>
                    {summary.totalReports} Laporan
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                    Dokumentasi pengawasan aktif
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dash-text-muted)' }}>
                    RATA-RATA PEKERJA HADIR
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    {summary.avgWorkers} Tukang / Hari
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                    Kapasitas tim konstruksi
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dash-text-muted)' }}>
                    FOTO DOKUMENTASI LAPANGAN
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                    {summary.totalPhotos} Foto
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                    Maks. 3 foto terkompresi per hari
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dash-text-muted)' }}>
                    KONDISI CUACA TERAKHIR
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--dash-text-main)', marginTop: '6px' }}>
                    {summary.latestWeather}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                    Laporan harian terkini
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading or Error */}
          {loading && (
            <Card>
              <CardContent style={{ padding: '40px', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                <i className="ri-loader-4-line ri-spin" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', color: '#f97316' }} />
                <div>Memuat laporan harian lapangan...</div>
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
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Live Feed List */}
          {!loading && !errorMsg && (
            <DailyReportFeed
              reports={reports}
              canEdit={canEdit}
              onEdit={(report) => {
                setEditingReport(report);
                setIsFormOpen(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={handleDeleteReport}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
