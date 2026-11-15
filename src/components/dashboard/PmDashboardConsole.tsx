'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { formatSafeImageUrl } from '@/lib/imgbb';
import { SCurveChart } from '@/components/dashboard/SCurveChart';
import { SCurveEditor } from '@/components/dashboard/SCurveEditor';
import { DailyReportFeed } from '@/components/dashboard/DailyReportFeed';
import { DailyReportForm } from '@/components/dashboard/DailyReportForm';

interface Project {
  id: number;
  name: string;
  category: string;
  location: string;
  contract_value?: number;
  cctv_url?: string | null;
  sCurveProgress?: any[];
}

interface DailyReport {
  id: number;
  project_id: number;
  date: string | Date;
  weather: string;
  worker_count: number;
  notes: string;
  photos: string[];
  project: { name: string };
}

interface MaterialPurchase {
  id: number;
  project_id: number;
  item_name: string;
  quantity: string;
  store_name: string;
  store_wa?: string | null;
  total_price: number;
  receipt_url?: string | null;
  purchase_date: string | Date;
  project: { name: string };
}

interface EquipmentItem {
  id: number;
  item_name: string;
  status: string;
  rental_duration?: string | null;
  rental_cost?: number | null;
  notes?: string | null;
  project?: { name: string } | null;
}

interface AddendumItem {
  id: number;
  description: string;
  cost_difference: number;
  status: string;
  createdAt: string | Date;
  project: { name: string };
}

interface PayrollItem {
  id: number;
  period: string;
  base_salary: number;
  operational_allowance: number;
  bonus: number;
  total_amount: number;
  status: string;
  slip_url?: string | null;
}

interface Props {
  projects: Project[];
  initialReports: DailyReport[];
  initialMaterials: MaterialPurchase[];
  initialEquipment: EquipmentItem[];
  initialAddendums: AddendumItem[];
  initialPayrolls: PayrollItem[];
}

export default function PmDashboardConsole({
  projects,
  initialReports,
  initialMaterials,
  initialEquipment,
  initialAddendums,
  initialPayrolls,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    'reports' | 'scurve' | 'cctv' | 'materials' | 'equipment' | 'addendums' | 'payroll'
  >('reports');

  const [selectedProjectId, setSelectedProjectId] = useState<number>(
    projects[0]?.id || 0
  );

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // States for lists
  const [reports, setReports] = useState<DailyReport[]>(initialReports);
  const [materials, setMaterials] = useState<MaterialPurchase[]>(initialMaterials);
  const [equipment, setEquipment] = useState<EquipmentItem[]>(initialEquipment);
  const [addendums, setAddendums] = useState<AddendumItem[]>(initialAddendums);

  // Feedback states
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);

  // 1. Form Daily Report
  const [reportForm, setReportForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weather: 'Cerah',
    workerCount: 12,
    notes: '',
    photos: [] as string[],
  });
  const [uploadingReportPhoto, setUploadingReportPhoto] = useState(false);

  // 2. Form S-Curve
  const [scurveForm, setScurveForm] = useState({
    weekNumber: 1,
    plannedPercentage: '',
    actualPercentage: '',
    targetDate: '',
    scheduleDocUrl: '',
    scheduleDocName: '',
  });
  const [uploadingSchedule, setUploadingSchedule] = useState(false);

  // 3. Form Material
  const [materialForm, setMaterialForm] = useState({
    itemName: '',
    quantity: '',
    storeName: '',
    storeWa: '',
    totalPrice: '',
    receiptUrl: '',
    receiptName: '',
  });
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // 4. Form Equipment
  const [equipForm, setEquipForm] = useState({
    itemName: '',
    status: 'MILIK_SENDIRI',
    rentalDuration: '',
    rentalCost: '',
    notes: '',
  });

  // 5. Form Addendum
  const [addendumForm, setAddendumForm] = useState({
    description: '',
    costDifference: '',
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper File Upload
  const handleFileUpload = async (file: File, folder: string) => {
    const data = new FormData();
    data.append('file', file);
    data.append('folder', folder);
    const res = await fetch('/api/upload', { method: 'POST', body: data });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Gagal upload');
    return json;
  };

  // Handle Photo upload for Daily Report (Max 3)
  const handleReportPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (reportForm.photos.length >= 3) {
      setStatusMsg({ type: 'error', text: 'Maksimal 3 foto dokumentasi harian per laporan (FR-09).' });
      return;
    }

    setUploadingReportPhoto(true);
    try {
      const remainingSlots = 3 - reportForm.photos.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      const uploadedUrls: string[] = [];
      for (const f of filesToUpload) {
        const res = await handleFileUpload(f, 'daily-reports');
        uploadedUrls.push(res.url);
      }

      setReportForm((prev) => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls].slice(0, 3),
      }));
      setStatusMsg({ type: 'success', text: `${uploadedUrls.length} foto berhasil diunggah.` });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal upload foto' });
    } finally {
      setUploadingReportPhoto(false);
    }
  };

  const removeReportPhoto = (idx: number) => {
    setReportForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));
  };

  // Submit Daily Report
  const submitDailyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.notes.trim()) {
      setStatusMsg({ type: 'error', text: 'Catatan pekerjaan dan kendala wajib diisi.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          ...reportForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setReports([data.report, ...reports]);
      setReportForm({
        date: new Date().toISOString().split('T')[0],
        weather: 'Cerah',
        workerCount: 12,
        notes: '',
        photos: [],
      });
      setStatusMsg({ type: 'success', text: 'Laporan harian berhasil disimpan dan otomatis disinkronkan ke Klien!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Submit S-Curve
  const submitSCurve = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/s-curve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          ...scurveForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setStatusMsg({ type: 'success', text: data.message });
      setScurveForm((prev) => ({
        ...prev,
        plannedPercentage: '',
        actualPercentage: '',
        scheduleDocUrl: '',
        scheduleDocName: '',
      }));
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Submit Material
  const submitMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.itemName || !materialForm.quantity) {
      setStatusMsg({ type: 'error', text: 'Nama barang dan kuantitas wajib diisi.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          ...materialForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setMaterials([data.purchase, ...materials]);
      setMaterialForm({
        itemName: '',
        quantity: '',
        storeName: '',
        storeWa: '',
        totalPrice: '',
        receiptUrl: '',
        receiptName: '',
      });
      setStatusMsg({ type: 'success', text: 'Pembelian material & nota berhasil dicatat!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Submit Equipment
  const submitEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipForm.itemName) {
      setStatusMsg({ type: 'error', text: 'Nama alat wajib diisi.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          ...equipForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setEquipment([data.equipment, ...equipment]);
      setEquipForm({
        itemName: '',
        status: 'MILIK_SENDIRI',
        rentalDuration: '',
        rentalCost: '',
        notes: '',
      });
      setStatusMsg({ type: 'success', text: 'Inventaris alat kerja berhasil disimpan!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Submit Addendum
  const submitAddendum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addendumForm.description) {
      setStatusMsg({ type: 'error', text: 'Rincian pekerjaan tambah/kurang wajib diisi.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/addendums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          ...addendumForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setAddendums([data.addendum, ...addendums]);
      setAddendumForm({ description: '', costDifference: '' });
      setStatusMsg({ type: 'success', text: 'Draf Addendum berhasil diajukan dan diteruskan ke Finance!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Project Selector Bar */}
      <div
        style={{
          background: 'var(--dash-card-bg)',
          border: '1px solid var(--dash-border)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.12)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="ri-building-line" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Pilih Proyek Supervisi
            </div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--dash-text-main)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="info">Kategori: {selectedProject?.category}</Badge>
          {selectedProject?.cctv_url ? (
            <Badge variant="success">● CCTV Online</Badge>
          ) : (
            <Badge variant="neutral">CCTV Offline</Badge>
          )}
        </div>
      </div>

      {/* Global Status Message */}
      {statusMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          <i className={statusMsg.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} style={{ fontSize: '18px' }} />
          <span>{statusMsg.text}</span>
          <button
            onClick={() => setStatusMsg(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs (Uniform Responsive Grid) */}
      <div className="dash-tabs-responsive-grid">
        {[
          { key: 'reports', label: 'Laporan Harian (3 Foto)', icon: 'ri-calendar-check-line', count: reports.length },
          { key: 'scurve', label: 'Kurva S & Jadwal', icon: 'ri-line-chart-line' },
          { key: 'cctv', label: 'Live CCTV Lapangan', icon: 'ri-camera-lens-line' },
          { key: 'materials', label: 'Pengadaan & Nota', icon: 'ri-shopping-cart-line', count: materials.length },
          { key: 'equipment', label: 'Inventaris & Sewa', icon: 'ri-tools-line', count: equipment.length },
          { key: 'addendums', label: 'Addendum (COR/ADD)', icon: 'ri-file-edit-line', count: addendums.length },
          { key: 'payroll', label: 'Slip Gaji PM', icon: 'ri-wallet-3-line' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setStatusMsg(null);
              }}
              className="dash-tab-btn"
              style={{
                border: '1px solid',
                borderColor: isActive ? '#f97316' : 'var(--dash-border)',
                background: isActive ? '#f97316' : 'var(--dash-card-bg)',
                color: isActive ? '#ffffff' : 'var(--dash-text-muted)',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
              }}
            >
              <i className={tab.icon} style={{ fontSize: '15px', flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'center' }}>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--dash-muted-bg)',
                    color: isActive ? '#fff' : 'var(--dash-text-muted)',
                    fontSize: '11px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: LAPORAN HARIAN (MAKS 3 FOTO) */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--dash-text-main)' }}>
                Laporan Pengawasan Harian: {currentProject?.name}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--dash-text-muted)', margin: '4px 0 0 0' }}>
                Dokumentasi foto lapangan terverifikasi (maks. 3 foto), cuaca, jumlah pekerja, kendala & solusi.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingReport(null);
                  setIsReportFormOpen(!isReportFormOpen);
                }}
                icon={isReportFormOpen ? 'ri-close-line' : 'ri-add-line'}
              >
                {isReportFormOpen ? 'Tutup Formulir' : '+ Buat Laporan Harian Baru'}
              </Button>
              <a href="/dashboard/daily-reports" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" icon="ri-external-link-line">
                  Buka Modul Laporan Penuh
                </Button>
              </a>
            </div>
          </div>

          {/* Form Modal / Inline Form */}
          {isReportFormOpen && (
            <DailyReportForm
              projects={projects}
              selectedProjectId={selectedProjectId}
              initialReport={editingReport}
              onSuccess={() => {
                setIsReportFormOpen(false);
                setEditingReport(null);
                window.location.reload();
              }}
              onCancel={() => {
                setIsReportFormOpen(false);
                setEditingReport(null);
              }}
            />
          )}

          {/* Daily Report Feed */}
          <DailyReportFeed
            reports={reports.filter((r) => r.project_id === selectedProjectId) as any}
            canEdit={true}
            onEdit={(rep) => {
              setEditingReport(rep);
              setIsReportFormOpen(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDelete={async (repId) => {
              try {
                const res = await fetch(`/api/daily-reports?id=${repId}`, { method: 'DELETE' });
                const d = await res.json();
                if (!res.ok || !d.success) throw new Error(d.error);
                window.location.reload();
              } catch (e: any) {
                alert(e.message || 'Gagal menghapus laporan');
              }
            }}
          />
        </div>
      )}

      {/* Tab 2: KURVA S & JADWAL KERJA */}
      {activeTab === 'scurve' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Header Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--dash-text-main)' }}>
                Modul Kurva S Lapangan: {currentProject?.name}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--dash-text-muted)', margin: '4px 0 0 0' }}>
                Pengawasan komprehensif antara target akumulasi bobot konstruksi dengan realisasi fisik mandor di lapangan.
              </p>
            </div>
            <a href="/dashboard/s-curve" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" icon="ri-external-link-line">
                Buka Halaman Modul Kurva S Penuh
              </Button>
            </a>
          </div>

          {/* Visual Kurva S Chart */}
          <SCurveChart
            data={currentProject?.sCurveProgress || []}
            projectName={currentProject?.name}
            contractValue={currentProject?.contract_value || 0}
            showSummaryCards={true}
          />

          {/* Interactive Kurva S Editor */}
          <SCurveEditor
            projectId={selectedProjectId}
            initialData={currentProject?.sCurveProgress || []}
            contractValue={currentProject?.contract_value || 0}
            onDataUpdated={() => window.location.reload()}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <Card>
              <CardHeader>
                <CardTitle icon="ri-upload-cloud-line">Pembaruan Cepat / Unggah Jadwal Kerja (PDF / Excel)</CardTitle>
                <Badge variant="info">Lampiran SPK/Rencana</Badge>
              </CardHeader>
              <CardContent style={{ padding: '20px' }}>
                <form onSubmit={submitSCurve} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        Nomor Minggu
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="52"
                        value={scurveForm.weekNumber}
                        onChange={(e) => setScurveForm({ ...scurveForm, weekNumber: parseInt(e.target.value) || 1 })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--dash-border)',
                          background: 'var(--dash-muted-bg)',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        Target Rencana (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Contoh: 45.0"
                        value={scurveForm.plannedPercentage}
                        onChange={(e) => setScurveForm({ ...scurveForm, plannedPercentage: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--dash-border)',
                          background: 'var(--dash-muted-bg)',
                          fontSize: '13px',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Realisasi Fisik Riil (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Contoh: 48.5"
                      value={scurveForm.actualPercentage}
                      onChange={(e) => setScurveForm({ ...scurveForm, actualPercentage: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#f97316',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Unggah Dokumen Jadwal Kerja / Time Schedule (PDF / Excel)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingSchedule(true);
                        try {
                          const res = await handleFileUpload(file, 'schedules');
                          setScurveForm((prev) => ({
                            ...prev,
                            scheduleDocUrl: res.url,
                            scheduleDocName: file.name,
                          }));
                        } catch (err: any) {
                          setStatusMsg({ type: 'error', text: err.message });
                        } finally {
                          setUploadingSchedule(false);
                        }
                      }}
                      style={{ fontSize: '12px' }}
                    />
                    {uploadingSchedule && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '4px' }}>Mengunggah jadwal...</div>}
                    {scurveForm.scheduleDocName && (
                      <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                        ✓ {scurveForm.scheduleDocName}
                      </div>
                    )}
                  </div>

                  <Button variant="primary" type="submit" disabled={loading} icon="ri-check-line">
                    {loading ? 'Menyimpan...' : 'Perbarui Data Kurva S Minggu Ini'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* S-Curve Information Card */}
            <Card>
              <CardHeader>
                <CardTitle icon="ri-information-line">Prinsip Pengendalian Kurva S Lapangan</CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '20px', fontSize: '13px', lineHeight: 1.6, color: 'var(--dash-text-main)' }}>
                <p>
                  <strong>Kurva S</strong> membandingkan akumulasi bobot pekerjaan terencana dengan capaian fisik nyata yang diverifikasi langsung oleh Project Manager di lapangan.
                </p>
                <div style={{ padding: '12px', background: 'var(--dash-muted-bg)', borderRadius: '8px', marginBottom: '12px' }}>
                  <div>• <strong>Deviasi Positif (+):</strong> Proyek berjalan lebih cepat dari jadwal (*ahead of schedule*).</div>
                  <div style={{ marginTop: '4px' }}>• <strong>Deviasi Negatif (-):</strong> Proyek terlambat, memerlukan evaluasi jam kerja lembur tukang atau percepatan pengadaan material.</div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>
                  *Catatan RBAC: Data persentase Kurva S akan tampil di Portal Klien secara transparan, namun rincian margin laba rugi internal tetap terlindungi.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: MONITORING CCTV */}
      {activeTab === 'cctv' && (
        <Card>
          <CardHeader>
            <CardTitle icon="ri-camera-lens-line">
              Monitoring Live Stream CCTV Proyek ({selectedProject?.name})
            </CardTitle>
            {selectedProject?.cctv_url ? <Badge variant="success">Active Stream</Badge> : <Badge variant="warning">Link Belum Diatur</Badge>}
          </CardHeader>
          <CardContent style={{ padding: '24px' }}>
            <div
              style={{
                background: '#090d16',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '340px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '16px',
                }}
              >
                <i className="ri-record-circle-line" />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0' }}>
                Live Stream CCTV Proyek: {selectedProject?.name}
              </h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '500px', margin: '0 0 20px 0' }}>
                Pengawasan langsung area konstruksi 24 jam melalui sistem terintegrasi aplikasi pihak ketiga (Hik-Connect / RTSP / Web Viewer).
              </p>
              {selectedProject?.cctv_url ? (
                <a
                  href={selectedProject.cctv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: '#f97316',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                  }}
                >
                  <i className="ri-external-link-line" /> Buka Live Stream di Tab Baru
                </a>
              ) : (
                <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                  Tautan CCTV belum dimasukkan oleh Owner pada proyek ini.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: PENGADAAN MATERIAL & NOTA */}
      {activeTab === 'materials' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Form Input Material */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-shopping-basket-2-line">Form Pencatatan Pembelian Material & Nota</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              <form onSubmit={submitMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Nama Barang Material <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Semen Gresik 40kg, Besi Ulir 13mm"
                    value={materialForm.itemName}
                    onChange={(e) => setMaterialForm({ ...materialForm, itemName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-muted-bg)',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Jumlah / Kuantitas <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 80 Sak / 2 Truk"
                      value={materialForm.quantity}
                      onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Total Harga (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 5200000"
                      value={materialForm.totalPrice}
                      onChange={(e) => setMaterialForm({ ...materialForm, totalPrice: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Nama Toko Material
                    </label>
                    <input
                      type="text"
                      placeholder="TB. Makmur Sentosa"
                      value={materialForm.storeName}
                      onChange={(e) => setMaterialForm({ ...materialForm, storeName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Nomor WhatsApp Toko
                    </label>
                    <input
                      type="tel"
                      placeholder="08123456789"
                      value={materialForm.storeWa}
                      onChange={(e) => setMaterialForm({ ...materialForm, storeWa: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Unggah Foto Nota / Kwitansi Fisik (JPG / PNG / PDF)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingReceipt(true);
                      try {
                        const res = await handleFileUpload(file, 'receipts');
                        setMaterialForm((prev) => ({
                          ...prev,
                          receiptUrl: res.url,
                          receiptName: file.name,
                        }));
                      } catch (err: any) {
                        setStatusMsg({ type: 'error', text: err.message });
                      } finally {
                        setUploadingReceipt(false);
                      }
                    }}
                    style={{ fontSize: '12px' }}
                  />
                  {uploadingReceipt && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '4px' }}>Mengunggah nota...</div>}
                  {materialForm.receiptName && (
                    <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                      🧾 {materialForm.receiptName}
                    </div>
                  )}
                </div>

                <Button variant="primary" type="submit" disabled={loading} icon="ri-save-line">
                  {loading ? 'Menyimpan...' : 'Simpan Pembelian Material'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List Material Purchases */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-file-text-line">Daftar Pembelian Material Terkini</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              {/* Desktop Table View */}
              <div className="dash-desktop-table" style={{ overflowX: 'auto', maxHeight: '500px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                      <th style={{ padding: '10px 14px' }}>Barang</th>
                      <th style={{ padding: '10px 14px' }}>Toko & WA</th>
                      <th style={{ padding: '10px 14px' }}>Total Biaya</th>
                      <th style={{ padding: '10px 14px' }}>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>{m.item_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Jumlah: {m.quantity}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div>{m.store_name}</div>
                          {m.store_wa && <div style={{ fontSize: '11px', color: '#10b981' }}>WA: {m.store_wa}</div>}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                          {formatIDR(m.total_price)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {m.receipt_url ? (
                            <a
                              href={m.receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}
                            >
                              Lihat Nota ↗
                            </a>
                          ) : (
                            <span style={{ color: 'var(--dash-text-muted)' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (<= 768px) */}
              <div className="dash-mobile-cards">
                {materials.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                    Belum ada pembelian material.
                  </div>
                ) : (
                  materials.map((m) => (
                    <div key={m.id} className="dash-mobile-card-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                            {m.item_name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
                            Jumlah: <b>{m.quantity}</b>
                          </div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#f97316' }}>
                          {formatIDR(m.total_price)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--dash-muted-bg)', borderRadius: '8px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--dash-text-muted)' }}>Toko & Kontak:</span>
                        <span style={{ fontWeight: 600 }}>
                          {m.store_name} {m.store_wa && <span style={{ color: '#10b981' }}>({m.store_wa})</span>}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                        {m.receipt_url ? (
                          <a
                            href={m.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#f97316', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <i className="ri-file-text-line" /> Lihat Foto Nota ↗
                          </a>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>Tidak ada foto nota</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: INVENTARIS & SEWA ALAT */}
      {activeTab === 'equipment' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Form Input Equipment */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-tools-fill">Pencatatan Inventaris & Alat Sewa</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              <form onSubmit={submitEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Nama Peralatan Tukang <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Molen Cor Beton, Jack Hammer, Scaffolding 50 Set"
                    value={equipForm.itemName}
                    onChange={(e) => setEquipForm({ ...equipForm, itemName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-muted-bg)',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Status Kepemilikan
                    </label>
                    <select
                      value={equipForm.status}
                      onChange={(e) => setEquipForm({ ...equipForm, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                        fontSize: '13px',
                      }}
                    >
                      <option value="MILIK_SENDIRI">Milik Sendiri (Halo Bangun)</option>
                      <option value="SEWA">Barang Sewaan Luar</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Durasi Sewa (Bila Sewa)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 14 Hari / 1 Bulan"
                      value={equipForm.rentalDuration}
                      onChange={(e) => setEquipForm({ ...equipForm, rentalDuration: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Catatan Kondisi / Penanggung Jawab
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Diserahkan ke Mandor Joko dalam kondisi baik, servis berkala tiap minggu."
                    value={equipForm.notes}
                    onChange={(e) => setEquipForm({ ...equipForm, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-muted-bg)',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <Button variant="primary" type="submit" disabled={loading} icon="ri-check-line">
                  {loading ? 'Menyimpan...' : 'Simpan Data Inventaris'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List Equipment */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-archive-line">Daftar Inventaris Lapangan</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {equipment.map((eq) => (
                  <div
                    key={eq.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-card-bg)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--dash-text-main)' }}>
                        {eq.item_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                        {eq.notes || 'Siap beroperasi di lapangan'}
                      </div>
                    </div>
                    {eq.status === 'SEWA' ? (
                      <Badge variant="warning">SEWA: {eq.rental_duration || 'Aktif'}</Badge>
                    ) : (
                      <Badge variant="success">ALAT SENDIRI</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 6: PENGAJUAN ADDENDUM (COR/ADD) */}
      {activeTab === 'addendums' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <Card>
            <CardHeader>
              <CardTitle icon="ri-file-edit-line">Pengajuan Draf Addendum (Pekerjaan Tambah/Kurang)</CardTitle>
              <Badge variant="warning">Diteruskan ke Finance</Badge>
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              <form onSubmit={submitAddendum} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Deskripsi Perubahan Lapangan (COR / Desain Baru) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Contoh: Permintaan penambahan instalasi titik lampu LED strip pada drop ceiling ruang keluarga dan perubahan spesifikasi keramik kamar mandi utama."
                    value={addendumForm.description}
                    onChange={(e) => setAddendumForm({ ...addendumForm, description: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Estimasi Selisih Biaya (+ / - Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 15500000 (Gunakan tanda minus bila pekerjaan kurang)"
                    value={addendumForm.costDifference}
                    onChange={(e) => setAddendumForm({ ...addendumForm, costDifference: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-muted-bg)',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <Button variant="primary" type="submit" disabled={loading} icon="ri-send-plane-line">
                  {loading ? 'Mengajukan...' : 'Ajukan ke Tim Finance untuk Kalkulasi RAB'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle icon="ri-history-line">Daftar Pengajuan Addendum Proyek Ini</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addendums.map((ad) => (
                  <div
                    key={ad.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-muted-bg)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                        {ad.cost_difference >= 0 ? `+ ${formatIDR(ad.cost_difference)}` : formatIDR(ad.cost_difference)}
                      </span>
                      <Badge variant={ad.status === 'APPROVED' ? 'success' : 'warning'}>
                        {ad.status}
                      </Badge>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--dash-text-main)', margin: 0, lineHeight: 1.4 }}>
                      "{ad.description}"
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 7: SLIP GAJI PRIBADI PM (FR-14) */}
      {activeTab === 'payroll' && (
        <Card>
          <CardHeader>
            <CardTitle icon="ri-wallet-3-line">Rincian Slip Gaji & Dana Operasional Pribadi (PM)</CardTitle>
            <Badge variant="success">Pribadi</Badge>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            {/* Desktop Table View */}
            <div className="dash-desktop-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                    <th style={{ padding: '12px 18px' }}>Periode</th>
                    <th style={{ padding: '12px 18px' }}>Gaji Pokok</th>
                    <th style={{ padding: '12px 18px' }}>Tunjangan Operasional</th>
                    <th style={{ padding: '12px 18px' }}>Bonus Supervisi</th>
                    <th style={{ padding: '12px 18px' }}>Total Diterima</th>
                    <th style={{ padding: '12px 18px' }}>Status & Slip</th>
                  </tr>
                </thead>
                <tbody>
                  {initialPayrolls.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                      <td style={{ padding: '12px 18px', fontWeight: 700 }}>{p.period}</td>
                      <td style={{ padding: '12px 18px' }}>{formatIDR(p.base_salary)}</td>
                      <td style={{ padding: '12px 18px' }}>{formatIDR(p.operational_allowance)}</td>
                      <td style={{ padding: '12px 18px', color: '#10b981', fontWeight: 600 }}>{formatIDR(p.bonus)}</td>
                      <td style={{ padding: '12px 18px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                        {formatIDR(p.total_amount)}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Badge variant="success">✓ Lunas</Badge>
                          {p.slip_url && (
                            <a
                              href={p.slip_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600, fontSize: '12px' }}
                            >
                              Unduh Slip 📄
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (<= 768px) */}
            <div className="dash-mobile-cards">
              {initialPayrolls.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                  Belum ada catatan slip gaji.
                </div>
              ) : (
                initialPayrolls.map((p) => (
                  <div key={p.id} className="dash-mobile-card-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                          Periode: {p.period}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
                          Supervisi & Pengawasan Lapangan
                        </div>
                      </div>
                      <Badge variant="success">✓ Lunas</Badge>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 12px', background: 'var(--dash-muted-bg)', borderRadius: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--dash-text-muted)' }}>Gaji Pokok:</span>
                        <span style={{ fontWeight: 600 }}>{formatIDR(p.base_salary)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--dash-text-muted)' }}>Tunjangan Operasional:</span>
                        <span style={{ fontWeight: 600 }}>{formatIDR(p.operational_allowance)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--dash-text-muted)' }}>Bonus Supervisi:</span>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{formatIDR(p.bonus)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Total Diterima:</div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981' }}>{formatIDR(p.total_amount)}</div>
                      </div>
                      {p.slip_url && (
                        <a
                          href={p.slip_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#f97316', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <i className="ri-file-download-line" /> Unduh Slip 📄
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

