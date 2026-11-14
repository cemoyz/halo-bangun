'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { compressImageFile } from '@/lib/imageCompressor';
import { formatSafeImageUrl } from '@/lib/imgbb';

export interface ReportItemInput {
  task_name: string;
  category: string;
  status: string;
  volume: string;
  notes: string;
}

export interface MaterialItemInput {
  name: string;
  volume: string;
  unit: string;
}

export interface ManpowerItemInput {
  role: string;
  count: number;
  unit: string;
}

interface ProjectOption {
  id: number;
  name: string;
  location: string;
}

interface DailyReportFormProps {
  projects: ProjectOption[];
  selectedProjectId: number;
  initialReport?: any | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

const WEATHER_OPTIONS = [
  { value: 'Cerah', label: 'Cerah', icon: 'ri-sun-line', color: '#f59e0b' },
  { value: 'Berawan', label: 'Berawan', icon: 'ri-cloudy-line', color: '#64748b' },
  { value: 'Hujan Ringan', label: 'Hujan Ringan', icon: 'ri-drizzle-line', color: '#0ea5e9' },
  { value: 'Hujan Lebat', label: 'Hujan Lebat', icon: 'ri-heavy-showers-line', color: '#2563eb' },
];

const CATEGORY_OPTIONS = ['Struktur', 'Arsitektur', 'MEP', 'Finishing', 'Persiapan / Galian'];

export const DailyReportForm: React.FC<DailyReportFormProps> = ({
  projects = [],
  selectedProjectId,
  initialReport = null,
  onSuccess,
  onCancel,
}) => {
  const [projectId, setProjectId] = useState<number>(initialReport?.project_id || selectedProjectId || projects[0]?.id || 0);
  const [dayNumber, setDayNumber] = useState<string>(initialReport?.day_number ? String(initialReport.day_number) : '');
  const [date, setDate] = useState<string>(
    initialReport?.date
      ? new Date(initialReport.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [weather, setWeather] = useState<string>(initialReport?.weather || 'Cerah');
  const [weatherDetails, setWeatherDetails] = useState<string>(initialReport?.weather_details || '');
  const [workerCount, setWorkerCount] = useState<number>(initialReport?.worker_count || 10);
  const [supervisorName, setSupervisorName] = useState<string>(initialReport?.supervisor_name || 'Arizal (PT. Sinergitama Konstruksi Indonesia)');
  const [contractorName, setContractorName] = useState<string>(initialReport?.contractor_name || 'PT. Aulia Indoland Grup');
  const [notes, setNotes] = useState<string>(initialReport?.notes || '');
  const [obstacles, setObstacles] = useState<string>(initialReport?.obstacles || '');
  const [solutions, setSolutions] = useState<string>(initialReport?.solutions || '');
  const [photos, setPhotos] = useState<string[]>(initialReport?.photos || []);
  
  // Dynamic Materials state
  const [materials, setMaterials] = useState<MaterialItemInput[]>(
    initialReport?.materials_details && initialReport.materials_details.length > 0
      ? initialReport.materials_details
      : [{ name: '', volume: '', unit: '' }]
  );

  // Dynamic Manpower state
  const [manpower, setManpower] = useState<ManpowerItemInput[]>(
    initialReport?.manpower_details && initialReport.manpower_details.length > 0
      ? initialReport.manpower_details
      : [
          { role: 'Pelaksana', count: 1, unit: 'OH' },
          { role: 'Kepala Tukang', count: 1, unit: 'OH' },
          { role: 'Mandor', count: 1, unit: 'OH' },
          { role: 'Tukang', count: 4, unit: 'OH' },
          { role: 'Pekerja', count: 2, unit: 'OH' },
        ]
  );

  const [items, setItems] = useState<ReportItemInput[]>(
    initialReport?.items && initialReport.items.length > 0
      ? initialReport.items.map((it: any) => ({
          task_name: it.task_name,
          category: it.category || 'Struktur',
          status: it.status || 'IN_PROGRESS',
          volume: it.volume || '',
          notes: it.notes || '',
        }))
      : [
          { task_name: '', category: 'Struktur', status: 'IN_PROGRESS', volume: '', notes: '' },
        ]
  );

  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload handler with client-side compression and max 3 enforcement
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length >= 3) {
      setStatusMsg({ type: 'error', text: 'Maksimal 3 foto dokumentasi per laporan harian' });
      return;
    }

    const remainingSlots = 3 - photos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setUploading(true);
    setStatusMsg(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        // Compress image before uploading
        const compressed = await compressImageFile(file, 1600, 1600, 0.82);

        const formData = new FormData();
        formData.append('file', compressed);
        formData.append('folder', 'daily_reports');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal mengunggah foto');
        }

        uploadedUrls.push(data.url);
      }

      setPhotos((prev) => [...prev, ...uploadedUrls].slice(0, 3));
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal mengunggah foto' });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add work item
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { task_name: '', category: 'Struktur', status: 'IN_PROGRESS', volume: '', notes: '' },
    ]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof ReportItemInput, val: string) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Materials helpers
  const addMaterial = () => {
    setMaterials((prev) => [...prev, { name: '', volume: '', unit: '' }]);
  };

  const removeMaterial = (idx: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateMaterial = (idx: number, field: keyof MaterialItemInput, val: string) => {
    setMaterials((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Manpower helpers
  const addManpower = () => {
    setManpower((prev) => [...prev, { role: '', count: 1, unit: 'OH' }]);
  };

  const removeManpower = (idx: number) => {
    setManpower((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateManpower = (idx: number, field: keyof ManpowerItemInput, val: any) => {
    setManpower((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Submit or Draft
  const handleSubmit = async (submitStatus: 'DRAFT' | 'SUBMITTED') => {
    if (!projectId) {
      setStatusMsg({ type: 'error', text: 'Pilih proyek terlebih dahulu' });
      return;
    }
    if (!notes.trim()) {
      setStatusMsg({ type: 'error', text: 'Ringkasan pekerjaan harian wajib diisi' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const calculatedWorkers = manpower.reduce((sum, m) => sum + (Number(m.count) || 0), 0);
      const payload = {
        id: initialReport?.id,
        projectId,
        dayNumber: dayNumber ? parseInt(dayNumber, 10) : null,
        date,
        weather,
        weatherDetails: weatherDetails.trim() || null,
        workerCount: calculatedWorkers > 0 ? calculatedWorkers : workerCount,
        manpowerDetails: manpower.filter((m) => m.role.trim().length > 0),
        materialsDetails: materials.filter((mat) => mat.name.trim().length > 0),
        supervisorName: supervisorName.trim() || null,
        contractorName: contractorName.trim() || null,
        notes,
        obstacles: obstacles.trim() || null,
        solutions: solutions.trim() || null,
        photos,
        status: submitStatus,
        items: items.filter((it) => it.task_name.trim().length > 0),
      };

      const isEdit = !!initialReport?.id;
      const res = await fetch('/api/daily-reports', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan laporan harian');
      }

      setStatusMsg({ type: 'success', text: data.message });
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle icon="ri-file-list-3-line">
            {initialReport ? 'Edit Laporan Pengawasan Harian' : 'Form Input Laporan Pengawasan Harian (PM)'}
          </CardTitle>
          <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
            Input kemajuan fisik harian, dokumentasi foto lapangan (maks. 3), dan kendala teknis
          </div>
        </div>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} icon="ri-close-line">
            Batal
          </Button>
        )}
      </CardHeader>

      <CardContent style={{ padding: '24px 20px' }}>
        {statusMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
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

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Proyek */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                Pilih Proyek Aktif <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--dash-border)',
                  background: 'var(--dash-card-bg)',
                  color: 'var(--dash-text-main)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Hari ke- */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                Hari Pelaksanaan ke-
              </label>
              <input
                type="number"
                placeholder="Contoh: 1, 14, 42"
                min="1"
                value={dayNumber}
                onChange={(e) => setDayNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--dash-border)',
                  background: 'var(--dash-card-bg)',
                  color: 'var(--dash-text-main)',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              />
            </div>

            {/* Tanggal Laporan */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                Tanggal Pelaporan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--dash-border)',
                  background: 'var(--dash-card-bg)',
                  color: 'var(--dash-text-main)',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Jumlah Pekerja Total */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                Total Pekerja Hadir (OH)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setWorkerCount((prev) => Math.max(0, prev - 1))}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 700,
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={workerCount}
                  onChange={(e) => setWorkerCount(parseInt(e.target.value, 10) || 0)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-card-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setWorkerCount((prev) => prev + 1)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 700,
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Kondisi Cuaca */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '8px' }}>
              Kondisi Cuaca Lapangan Hari Ini
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {WEATHER_OPTIONS.map((w) => {
                const isSelected = weather === w.value;
                return (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setWeather(w.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #f97316' : '1px solid var(--dash-border)',
                      background: isSelected ? 'rgba(249, 115, 22, 0.08)' : 'var(--dash-muted-bg)',
                      color: isSelected ? '#f97316' : 'var(--dash-text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <i className={w.icon} style={{ fontSize: '16px', color: w.color }} />
                    <span>{w.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Keterangan / jam cuaca penghambat (Opsional, e.g. Mendung pkl 15:00, Hujan deras pkl 16:00)"
                value={weatherDetails}
                onChange={(e) => setWeatherDetails(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--dash-border)',
                  background: 'var(--dash-card-bg)',
                  fontSize: '12.5px',
                  color: 'var(--dash-text-main)',
                }}
              />
            </div>
          </div>

          {/* Section 2: Ringkasan Catatan Pekerjaan */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
              Ringkasan Capaian Pekerjaan Harian <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Pengecoran plat lantai 2 selesai pukul 16.30 WIB dengan mutu beton K-250. Pemasangan bekisting tangga selesai diperiksa dan siap cor besok."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--dash-border)',
                background: 'var(--dash-card-bg)',
                color: 'var(--dash-text-main)',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Section 3: Item Pekerjaan Harian (Tabel Dinamis) */}
          <div style={{ border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '16px', background: 'var(--dash-muted-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                  Rincian Item Pekerjaan & Status Hari Ini
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)' }}>
                  Status pengerjaan fisik terverifikasi oleh PM di lapangan
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={addItem} icon="ri-add-line">
                Tambah Item Pekerjaan
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 1.2fr 1.2fr auto',
                    gap: '8px',
                    alignItems: 'center',
                    background: 'var(--dash-card-bg)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                  }}
                  className="daily-item-row"
                >
                  {/* Task Name */}
                  <input
                    type="text"
                    placeholder="Nama Pekerjaan (e.g. Pembesian Balok)"
                    value={item.task_name}
                    onChange={(e) => updateItem(idx, 'task_name', e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12px',
                      background: 'transparent',
                      color: 'var(--dash-text-main)',
                    }}
                  />

                  {/* Category */}
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(idx, 'category', e.target.value)}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12px',
                      background: 'transparent',
                      color: 'var(--dash-text-main)',
                    }}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Status */}
                  <select
                    value={item.status}
                    onChange={(e) => updateItem(idx, 'status', e.target.value)}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12px',
                      background: 'transparent',
                      fontWeight: 600,
                      color:
                        item.status === 'COMPLETED'
                          ? '#10b981'
                          : item.status === 'ON_HOLD'
                          ? '#ef4444'
                          : '#f59e0b',
                    }}
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>

                  {/* Volume */}
                  <input
                    type="text"
                    placeholder="Volume (e.g. 24 m2)"
                    value={item.volume}
                    onChange={(e) => updateItem(idx, 'volume', e.target.value)}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12px',
                      background: 'transparent',
                      color: 'var(--dash-text-main)',
                    }}
                  />

                  {/* Delete Item Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: items.length <= 1 ? 'var(--dash-border)' : '#ef4444',
                      cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                      padding: '6px',
                      fontSize: '16px',
                    }}
                    title="Hapus baris"
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Bahan / Material yang Digunakan */}
          <div style={{ border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '16px', background: 'var(--dash-muted-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ri-archive-line" style={{ color: '#f59e0b' }} />
                  <span>B. Bahan & Material Masuk / Digunakan Hari Ini</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)' }}>
                  Catat nama material, volume, dan satuan (e.g. Gypsum 9mm 67 lmbr, Kayu Sengon 50 btg)
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={addMaterial} icon="ri-add-line">
                Tambah Bahan
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {materials.map((mat, mIdx) => (
                <div
                  key={mIdx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: '8px',
                    alignItems: 'center',
                    background: 'var(--dash-card-bg)',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Nama Bahan (e.g. Semen Tiga Roda, Cat Plafond)"
                    value={mat.name}
                    onChange={(e) => updateMaterial(mIdx, 'name', e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12.5px',
                      background: 'transparent',
                      color: 'var(--dash-text-main)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Volume (e.g. 5, 20, 50)"
                    value={mat.volume}
                    onChange={(e) => updateMaterial(mIdx, 'volume', e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12.5px',
                      background: 'transparent',
                      color: 'var(--dash-text-main)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Satuan (e.g. sak, pcs, btg)"
                    value={mat.unit}
                    onChange={(e) => updateMaterial(mIdx, 'unit', e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12.5px',
                      background: 'transparent',
                      color: 'var(--dash-text-main)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeMaterial(mIdx)}
                    disabled={materials.length <= 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: materials.length <= 1 ? 'var(--dash-border)' : '#ef4444',
                      cursor: materials.length <= 1 ? 'not-allowed' : 'pointer',
                      padding: '6px',
                      fontSize: '16px',
                    }}
                    title="Hapus bahan"
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Rincian Tenaga Kerja Lapangan */}
          <div style={{ border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '16px', background: 'var(--dash-muted-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ri-user-settings-line" style={{ color: '#0ea5e9' }} />
                  <span>C. Komposisi Tenaga Kerja Lapangan (OH)</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)' }}>
                  Jumlah orang-hari berdasarkan jabatan (Pelaksana, Kepala Tukang, Mandor, Tukang, Pekerja)
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={addManpower} icon="ri-add-line">
                Tambah Jabatan
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {manpower.map((mp, mpIdx) => (
                <div
                  key={mpIdx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: '8px',
                    alignItems: 'center',
                    background: 'var(--dash-card-bg)',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Jabatan (e.g. Tukang, Mandor, Pelaksana)"
                    value={mp.role}
                    onChange={(e) => updateManpower(mpIdx, 'role', e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12.5px',
                      background: 'transparent',
                      color: 'var(--dash-text-main)',
                      fontWeight: 600,
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Jumlah"
                    value={mp.count}
                    onChange={(e) => updateManpower(mpIdx, 'count', parseInt(e.target.value, 10) || 0)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12.5px',
                      background: 'transparent',
                      color: 'var(--dash-text-main)',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Satuan (e.g. OH)"
                    value={mp.unit || 'OH'}
                    onChange={(e) => updateManpower(mpIdx, 'unit', e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      fontSize: '12.5px',
                      background: 'transparent',
                      color: 'var(--dash-text-main)',
                      textAlign: 'center',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeManpower(mpIdx)}
                    disabled={manpower.length <= 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: manpower.length <= 1 ? 'var(--dash-border)' : '#ef4444',
                      cursor: manpower.length <= 1 ? 'not-allowed' : 'pointer',
                      padding: '6px',
                      fontSize: '16px',
                    }}
                    title="Hapus jabatan"
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Foto Dokumentasi Lapangan (Maksimal 3 Foto) */}
          <div style={{ border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ri-camera-lens-line" style={{ color: '#f97316' }} />
                  <span>Foto Dokumentasi Lapangan (Maksimal 3 Foto)</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)' }}>
                  Otomatis dikompresi agar hemat kuota & cepat terkirim dari lapangan
                </div>
              </div>
              <Badge variant={photos.length === 3 ? 'warning' : 'outline'}>
                {photos.length} / 3 Foto
              </Badge>
            </div>

            {/* Photo Slots Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
              {[0, 1, 2].map((slotIdx) => {
                const photoUrl = photos[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    style={{
                      aspectRatio: '4/3',
                      borderRadius: '8px',
                      border: photoUrl ? '1px solid var(--dash-border)' : '2px dashed var(--dash-border)',
                      background: 'var(--dash-muted-bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {photoUrl ? (
                      <>
                        <img
                          src={formatSafeImageUrl(photoUrl)}
                          alt={`Dokumentasi ${slotIdx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(slotIdx)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(239, 68, 68, 0.85)',
                            border: 'none',
                            color: '#ffffff',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                          }}
                          title="Hapus foto"
                        >
                          <i className="ri-close-line" />
                        </button>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            left: '6px',
                            background: 'rgba(0,0,0,0.6)',
                            color: '#ffffff',
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Foto #{slotIdx + 1}
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--dash-text-muted)', padding: '10px' }}>
                        <i className="ri-image-add-line" style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }} />
                        <span style={{ fontSize: '11px' }}>Slot #{slotIdx + 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upload Button */}
            {photos.length < 3 ? (
              <div>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-card-bg)',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--dash-text-main)',
                  }}
                >
                  <i className={uploading ? 'ri-loader-4-line ri-spin' : 'ri-upload-2-line'} style={{ color: '#f97316' }} />
                  <span>{uploading ? 'Mengompresi & Mengunggah...' : `Unggah Foto Lapangan (${3 - photos.length} slot tersisa)`}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="ri-checkbox-circle-fill" />
                <span>Batas maksimal 3 foto dokumentasi harian telah terisi penuh.</span>
              </div>
            )}
          </div>

          {/* Section 5: Kendala Teknis & Solusi Lapangan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                Kendala Teknis Lapangan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Pengiriman semen instan terlambat 1 jam karena cuaca gerimis."
                value={obstacles}
                onChange={(e) => setObstacles(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--dash-border)',
                  background: 'var(--dash-card-bg)',
                  color: 'var(--dash-text-main)',
                  fontSize: '12.5px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                Solusi & Tindakan Lapangan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Penambahan 2 tukang lembur 1.5 jam untuk mengejar target cor."
                value={solutions}
                onChange={(e) => setSolutions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--dash-border)',
                  background: 'var(--dash-card-bg)',
                  color: 'var(--dash-text-main)',
                  fontSize: '12.5px',
                }}
              />
            </div>
          </div>

          {/* Section 6: Pengesahan Laporan Lapangan */}
          <div style={{ border: '1px solid var(--dash-border)', borderRadius: '10px', padding: '16px', background: 'var(--dash-muted-bg)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ri-quill-pen-line" style={{ color: '#f97316' }} />
              <span>Pengesahan & Verifikasi Laporan Lapangan</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Diperiksa Oleh (Supervisi / Pengawas Lapangan)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Arizal (PT. Sinergitama Konstruksi Indonesia)"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-card-bg)',
                    fontSize: '12.5px',
                    color: 'var(--dash-text-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Diajukan Oleh (Kontraktor Pelaksana)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Irfan Aulia Ulumuddin (PT. Aulia Indoland Grup)"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-card-bg)',
                    fontSize: '12.5px',
                    color: 'var(--dash-text-main)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid var(--dash-border)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>
              * Laporan yang di-<strong>Submit</strong> akan langsung muncul di timeline Portal Klien secara transparan.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSubmit('DRAFT')}
                loading={submitting}
                icon="ri-draft-line"
              >
                Simpan Draf
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={() => handleSubmit('SUBMITTED')}
                loading={submitting}
                icon="ri-send-plane-fill"
              >
                Submit / Kirim Laporan
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
