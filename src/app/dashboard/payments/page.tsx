'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { PaymentSummaryCards, formatIDR } from '@/components/dashboard/PaymentSummaryCards';
import { PaymentScheduleTable, PaymentItem } from '@/components/dashboard/PaymentScheduleTable';

interface Project {
  id: number;
  name: string;
  contract_value: number;
  status: string;
  location: string;
}

export default function PaymentsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const fetchPayments = async (projId?: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = projId ? `/api/payments?projectId=${projId}` : '/api/payments';
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memuat jadwal termin pembayaran');
      }

      setProjects(data.projects || []);
      setSelectedProject(data.project || null);
      setPayments(data.payments || []);
      setFinancialSummary(data.financialSummary || null);

      if (data.project?.id && (!selectedProjectId || !projId)) {
        setSelectedProjectId(data.project.id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = parseInt(e.target.value, 10);
    setSelectedProjectId(pId);
    fetchPayments(pId);
  };

  // RBAC checks
  const userRole = currentUser?.role;
  const isForbidden = userRole === 'PM' || userRole === 'MANDOR';
  const isFinanceOrOwner = userRole === 'FINANCE' || userRole === 'OWNER';

  return (
    <DashboardLayout title="Termin Pembayaran & Kwitansi">
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
              Akses Keuangan Dibatasi (RBAC)
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--dash-text-muted)', maxWidth: '520px', margin: '0 auto 20px' }}>
              Sesuai dengan SOP dan aturan keamanan platform Halo Bangun, modul Termin Pembayaran & Kwitansi bersifat rahasia dan hanya dapat diakses oleh Finance Admin, Direktur (Owner), serta Klien Proyek. Role Pengawas (PM) & Mandor dilarang keras mengakses modul ini.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = userRole === 'PM' ? '/dashboard/pm' : '/dashboard/mandor';
              }}
              icon="ri-arrow-left-line"
            >
              Kembali ke Dashboard Saya
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Bar & Project Selector */}
          <div
            className="dash-project-switcher"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
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
                  maxWidth: '100%',
                  flex: 1,
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPayments(selectedProjectId || undefined)}
              icon="ri-refresh-line"
            >
              Segarkan Data
            </Button>
          </div>

          {/* Loading or Error */}
          {loading && (
            <Card>
              <CardContent style={{ padding: '40px', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                <i className="ri-loader-4-line ri-spin" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', color: '#f97316' }} />
                <div>Memuat data keuangan termin proyek...</div>
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

          {!loading && !errorMsg && selectedProject && financialSummary && (
            <>
              {/* Financial Summary Cards */}
              <PaymentSummaryCards
                summary={financialSummary}
                projectName={selectedProject.name}
              />

              {/* Payment Schedule Table */}
              <PaymentScheduleTable
                payments={payments}
                userRole={userRole || 'CLIENT'}
                projectId={selectedProject.id}
                finalContractTotal={financialSummary.finalContractTotal}
                onRefresh={() => fetchPayments(selectedProject.id)}
              />
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
