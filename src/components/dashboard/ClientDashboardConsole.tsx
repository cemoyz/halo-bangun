'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { formatSafeImageUrl } from '@/lib/imgbb';
import { SCurveChart } from '@/components/dashboard/SCurveChart';
import { DailyReportFeed } from '@/components/dashboard/DailyReportFeed';
import { PaymentScheduleTable } from '@/components/dashboard/PaymentScheduleTable';

interface Project {
  id: number;
  name: string;
  category: string;
  location: string;
  contract_value: number;
  cctv_url?: string | null;
  bast_unlocked: boolean;
  status: string;
  pm?: { name: string; phone?: string | null } | null;
  documents: Array<{ id: number; doc_type: string; title?: string | null; file_url: string; is_locked: boolean }>;
  sCurveProgress: Array<{ id: number; week_number: number; planned_percentage: number; actual_percentage: number }>;
  dailyReports: Array<{ id: number; date: string | Date; weather: string; worker_count: number; notes: string; photos: string[] }>;
  payments: Array<{ id: number; termin_name: string; amount: number; status: string; due_date?: string | null; proof_url?: string | null; receipt_url?: string | null; notes?: string | null }>;
  addendums: Array<{ id: number; description: string; cost_difference: number; status: string; client_note?: string | null; createdAt: string | Date }>;
}

interface Props {
  project: Project;
  allProjects?: Array<{ id: number; name: string; location: string; status: string }>;
  userRole?: string;
}

export default function ClientDashboardConsole({ project, allProjects = [], userRole }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'monitor' | 'documents' | 'termin' | 'addendums' | 'feedback'>('monitor');

  const [payments, setPayments] = useState(project.payments);
  const [addendums, setAddendums] = useState(project.addendums);
  const [contractValue, setContractValue] = useState(project.contract_value);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Upload proof modal
  const [uploadProofModal, setUploadProofModal] = useState<number | null>(null);
  const [proofFileUrl, setProofFileUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);

  // Client Feedback Form
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper file upload
  const handleFileUpload = async (file: File, folder: string) => {
    const data = new FormData();
    data.append('file', file);
    data.append('folder', folder);
    const res = await fetch('/api/upload', { method: 'POST', body: data });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Gagal upload');
    return json;
  };

  // Upload Bukti Bayar
  const handleUploadProof = async (paymentId: number) => {
    if (!proofFileUrl) {
      setStatusMsg({ type: 'error', text: 'Silakan pilih file bukti transfer terlebih dahulu.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'upload_proof',
          proofUrl: proofFileUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setPayments(payments.map((p) => (p.id === paymentId ? data.payment : p)));
      setUploadProofModal(null);
      setProofFileUrl('');
      setStatusMsg({ type: 'success', text: data.message });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Addendum Response (Approve / Reject)
  const handleAddendumResponse = async (addendumId: number, isApprove: boolean) => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/addendums/${addendumId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isApprove ? 'client_approve' : 'client_reject',
          clientNote: isApprove ? 'Disetujui oleh Klien' : 'Ditolak oleh Klien',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setAddendums(addendums.map((a) => (a.id === addendumId ? data.addendum : a)));
      if (isApprove) {
        setContractValue((prev) => prev + data.addendum.cost_difference);
      }
      setStatusMsg({ type: 'success', text: data.message });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setSubmittingFeedback(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          message: feedbackText,
          rating: parseInt(feedbackRating, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setFeedbackText('');
      setStatusMsg({ type: 'success', text: data.message });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Automatic Lock Check for BAST & Garansi
  const latestProgress = project.sCurveProgress[project.sCurveProgress.length - 1]?.actual_percentage || 0;
  const allPaymentsPaid = payments.length > 0 && payments.every((p) => p.status === 'PAID');
  const isBastUnlocked = project.bast_unlocked || (latestProgress >= 100 && allPaymentsPaid);

  // S-Curve chart data
  const chartData = project.sCurveProgress.map((item) => ({
    name: `M${item.week_number}`,
    Rencana: item.planned_percentage,
    Realisasi: item.actual_percentage,
  }));

  const pendingAddendumsCount = addendums.filter((a) => a.status === 'PENDING_CLIENT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Project Switcher Bar if Multiple Projects */}
      {allProjects && allProjects.length > 1 && (
        <div
          className="dash-project-switcher"
          style={{
            background: 'var(--dash-card-bg)',
            border: '1px solid var(--dash-border)',
            padding: '14px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px', color: '#f97316' }}>
              <i className="ri-folder-shared-line" />
            </span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                Pilih Proyek Aktif {userRole === 'OWNER' && '(Mode Pratinjau Owner)'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                Anda memiliki akses pemantauan untuk {allProjects.length} proyek di database Halo Bangun
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={project.id}
              onChange={(e) => {
                const newId = e.target.value;
                router.push(`/dashboard/client?projectId=${newId}`);
              }}
              style={{
                background: 'var(--dash-bg)',
                color: 'var(--dash-text-main)',
                border: '1px solid var(--dash-border)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} - {p.name} ({p.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Alert Banner */}
      {statusMsg && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${statusMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="dash-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>PROGRES RIIL KURVA S</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#f97316', marginTop: '4px' }}>
              {latestProgress}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              Diperbarui mingguan oleh Senior PM
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>TOTAL NILAI KONTRAK</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--dash-text-main)', marginTop: '4px' }}>
              {formatIDR(contractValue)}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
              Termasuk penyesuaian Addendum
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', fontWeight: 600 }}>STATUS BAST & GARANSI</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: isBastUnlocked ? '#10b981' : '#ef4444', marginTop: '6px' }}>
              {isBastUnlocked ? '🔓 TERBUKA (LENGKAP)' : '🔒 TERKUNCI OTOMATIS'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
              {isBastUnlocked ? 'Unit siap serah terima' : 'Syarat: Fisik 100% & Termin Lunas'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Bar */}
      <div
        className="dash-tabs-scroll"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {[
          { key: 'monitor', label: 'Live Monitor (CCTV & Kurva S)', icon: 'ri-dashboard-line' },
          { key: 'documents', label: 'Dokumen Proyek & BAST', icon: 'ri-file-text-line' },
          { key: 'termin', label: 'Jadwal Termin & Kwitansi', icon: 'ri-bank-card-line' },
          { key: 'addendums', label: 'Persetujuan Addendum', icon: 'ri-file-edit-line', count: pendingAddendumsCount },
          { key: 'feedback', label: 'Masukan & Saran Pembangunan', icon: 'ri-message-3-line' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setStatusMsg(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isActive ? '#f97316' : 'var(--dash-border)',
                background: isActive ? '#f97316' : 'var(--dash-card-bg)',
                color: isActive ? '#ffffff' : 'var(--dash-text-muted)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <i className={tab.icon} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: LIVE MONITOR (KURVA S & FOTO HARIAN & CCTV) */}
      {activeTab === 'monitor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* S-Curve Graph Card */}
          <SCurveChart
            data={project.sCurveProgress as any}
            projectName={project.name}
            contractValue={project.contract_value}
            showSummaryCards={false}
          />

          {/* Live CCTV Stream Card */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-camera-lens-line">
                Live Project Monitor: Kamera CCTV Lapangan 24 Jam
              </CardTitle>
              {project.cctv_url ? <Badge variant="success">● Online Stream</Badge> : <Badge variant="neutral">Offline</Badge>}
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              <div
                style={{
                  background: '#0a0e17',
                  borderRadius: '12px',
                  padding: '30px',
                  textAlign: 'center',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '260px',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '14px',
                  }}
                >
                  <i className="ri-record-circle-line" />
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 800 }}>
                  Pemantauan CCTV Langsung di Lokasi Proyek
                </h4>
                <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '480px', margin: '0 0 16px 0' }}>
                  Pantau para tukang bekerja dan proses pengiriman material langsung dari smartphone Anda.
                </p>
                {project.cctv_url ? (
                  <a
                    href={project.cctv_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: '#f97316',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                  >
                    <i className="ri-fullscreen-line" /> Buka Live Stream Layar Penuh
                  </a>
                ) : (
                  <div style={{ color: '#ef4444', fontSize: '13px' }}>Tautan streaming sedang dipersiapkan teknisi.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Photo Feed (Max 3 Photos per Day with Lightbox & Work Items) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--dash-text-main)' }}>
                  Dokumentasi Foto Pengawasan Harian (Live Feed)
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--dash-text-muted)', margin: '3px 0 0 0' }}>
                  Laporan kemajuan fisik nyata & foto dokumentasi terverifikasi oleh Pengawas Lapangan
                </p>
              </div>
              <a href="/dashboard/daily-reports" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" icon="ri-external-link-line">
                  Buka Modul Laporan Harian Penuh
                </Button>
              </a>
            </div>

            <DailyReportFeed
              reports={project.dailyReports as any}
              canEdit={false}
            />
          </div>
        </div>
      )}

      {/* Tab 2: DOKUMEN PROYEK & KUNCI OTOMATIS BAST */}
      {activeTab === 'documents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Dokumen Terbuka (SPKPR, Desain, RAB) */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-folder-open-line">Dokumen Proyek Terverifikasi</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {project.documents
                  .filter((d) => ['SPKPR', 'DESAIN_ARS', 'RAB', 'RENCANA_KERJA'].includes(d.doc_type))
                  .map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'var(--dash-muted-bg)',
                        border: '1px solid var(--dash-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--dash-text-main)' }}>
                          {doc.title || doc.doc_type}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                          Kategori: {doc.doc_type}
                        </div>
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#f97316',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <i className="ri-download-2-line" /> Unduh
                      </a>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Sistem Kunci BAST & Garansi (Otomatis) */}
          <Card>
            <CardHeader>
              <CardTitle icon={isBastUnlocked ? 'ri-lock-unlock-line' : 'ri-lock-2-line'}>
                Berita Acara Serah Terima (BAST) & Sertifikat Garansi
              </CardTitle>
              <Badge variant={isBastUnlocked ? 'success' : 'danger'}>
                {isBastUnlocked ? '🔓 TERBUKA' : '🔒 TERKUNCI OTOMATIS'}
              </Badge>
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              {isBastUnlocked ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 800, color: '#10b981', fontSize: '14px' }}>
                      ✓ Selamat! Proyek Anda Telah Rampung 100% & Lunas
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--dash-text-main)', marginTop: '4px' }}>
                      Seluruh berkas serah terima dan sertifikat garansi resmi dapat Anda unduh di bawah ini.
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--dash-muted-bg)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>Berita Acara Serah Terima (BAST)</div>
                        <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Dokumen legal serah terima kunci bangunan</div>
                      </div>
                      <a href="/documents/bast-resmi.pdf" target="_blank" rel="noreferrer">
                        <Button size="sm" variant="success" icon="ri-download-line">Unduh BAST</Button>
                      </a>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--dash-muted-bg)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>Sertifikat Garansi Konstruksi (6 Bulan)</div>
                        <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Jaminan perbaikan kebocoran dan retak struktur</div>
                      </div>
                      <a href="/documents/garansi-resmi.pdf" target="_blank" rel="noreferrer">
                        <Button size="sm" variant="success" icon="ri-download-line">Unduh Garansi</Button>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '24px 16px',
                    background: 'var(--dash-muted-bg)',
                    borderRadius: '10px',
                    border: '1.5px dashed var(--dash-border)',
                  }}
                >
                  <div style={{ fontSize: '40px', color: '#ef4444', marginBottom: '8px' }}>
                    <i className="ri-lock-fill" />
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                    Dokumen BAST & Garansi Saat Ini Masih Terkunci
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--dash-text-muted)', maxWidth: '420px', margin: '0 auto 16px auto', lineHeight: 1.4 }}>
                    Sesuai Standar Operasional Halo Bangun, dokumen Berita Acara Serah Terima (BAST) dan Kartu Garansi Konstruksi <strong>hanya akan terbuka otomatis</strong> apabila:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px', margin: '0 auto', textAlign: 'left', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{latestProgress >= 100 ? '✅' : '⏳'}</span>
                      <span>Progres Fisik Kurva S mencapai 100% (Saat ini: <strong>{latestProgress}%</strong>)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{allPaymentsPaid ? '✅' : '⏳'}</span>
                      <span>Seluruh termin pembayaran berstatus <strong>PAID</strong> (Lunas diverifikasi Finance)</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: JADWAL TERMIN & KWITANSI */}
      {activeTab === 'termin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <PaymentScheduleTable
            payments={payments as any}
            userRole="CLIENT"
            projectId={project.id}
            finalContractTotal={project.contract_value}
            onRefresh={() => window.location.reload()}
          />
        </div>
      )}

      {/* Tab 4: PERSETUJUAN ADDENDUM (COR) */}
      {activeTab === 'addendums' && (
        <Card>
          <CardHeader>
            <CardTitle icon="ri-file-edit-line">Pekerjaan Tambah / Kurang (Addendum COR)</CardTitle>
            <Badge variant="info">Persetujuan Transparan</Badge>
          </CardHeader>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {addendums.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--dash-text-muted)' }}>
                  Tidak ada pengajuan pekerjaan tambah/kurang (Addendum) pada proyek ini.
                </div>
              ) : (
                addendums.map((ad) => (
                  <div
                    key={ad.id}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'var(--dash-muted-bg)',
                      border: '1px solid var(--dash-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                          Pengajuan Addendum
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                          Diajukan: {new Date(ad.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </div>
                      </div>
                      <Badge variant={ad.status === 'APPROVED' ? 'success' : ad.status === 'PENDING_CLIENT' ? 'warning' : 'danger'}>
                        {ad.status === 'APPROVED' ? '✓ DISETUJUI ANDA' : ad.status === 'PENDING_CLIENT' ? 'MENUNGGU PERSETUJUAN ANDA' : ad.status}
                      </Badge>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--dash-text-main)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      "{ad.description}"
                    </p>

                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#f97316', marginBottom: '14px' }}>
                      Selisih Biaya: {ad.cost_difference >= 0 ? `+ ${formatIDR(ad.cost_difference)}` : formatIDR(ad.cost_difference)}
                    </div>

                    {ad.status === 'PENDING_CLIENT' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                          size="sm"
                          variant="success"
                          icon="ri-check-line"
                          onClick={() => handleAddendumResponse(ad.id, true)}
                          disabled={loading}
                        >
                          Setujui Addendum
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon="ri-close-line"
                          onClick={() => handleAddendumResponse(ad.id, false)}
                          disabled={loading}
                        >
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: MASUKAN & SARAN PEMBANGUNAN */}
      {activeTab === 'feedback' && (
        <Card>
          <CardHeader>
            <CardTitle icon="ri-message-3-line">Kirim Masukan & Saran Pembangunan</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '20px' }}>
            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '600px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Tingkat Kepuasan Pelayanan
                </label>
                <select
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    fontSize: '13px',
                  }}
                >
                  <option value="5">⭐⭐⭐⭐⭐ Sangat Puas</option>
                  <option value="4">⭐⭐⭐⭐ Puas</option>
                  <option value="3">⭐⭐⭐ Cukup</option>
                  <option value="2">⭐⭐ Kurang Puas</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Pesan Evaluasi / Masukan Teknis Lapangan
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan catatan, pertanyaan khusus, atau apresiasi untuk pengawas dan tim tukang..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    fontSize: '13px',
                    lineHeight: 1.4,
                  }}
                />
              </div>

              <Button variant="primary" type="submit" disabled={submittingFeedback} icon="ri-send-plane-fill">
                {submittingFeedback ? 'Mengirimkan...' : 'Kirim Masukan ke Direktur & PM'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

