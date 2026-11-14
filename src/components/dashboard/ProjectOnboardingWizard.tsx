'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Props {
  clients: UserOption[];
  pms: UserOption[];
}

export default function ProjectOnboardingWizard({ clients, pms }: Props) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'PEMBANGUNAN',
    location: '',
    startDate: '',
    targetCompletionDate: '',
    cctvUrl: '',

    // Client & PM
    clientMode: 'existing' as 'existing' | 'new',
    clientId: clients[0]?.id ? String(clients[0].id) : '',
    newClientName: '',
    newClientEmail: '',
    newClientPhone: '',
    pmId: pms[0]?.id ? String(pms[0].id) : '',

    // Finance
    contractValue: '',
    dpAmount: '',

    // 5 Mandatory Documents
    spkprUrl: '',
    spkprName: '',
    desainUrl: '',
    desainName: '',
    rabUrl: '',
    rabName: '',
    rencanaKerjaUrl: '',
    rencanaKerjaName: '',
    dpReceiptUrl: '',
    dpReceiptName: '',
  });

  // Uploading states for each file slot
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [slot]: true }));
    setErrorMessage('');

    const bodyData = new FormData();
    bodyData.append('file', file);
    bodyData.append('folder', slot === 'dpReceipt' ? 'receipts' : 'documents');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah file');
      }

      setFormData((prev) => ({
        ...prev,
        [`${slot}Url`]: data.url,
        [`${slot}Name`]: file.name,
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saat mengunggah');
    } finally {
      setUploading((prev) => ({ ...prev, [slot]: false }));
    }
  };

  const handleNext = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.location.trim()) {
        setErrorMessage('Nama proyek dan lokasi proyek wajib diisi.');
        return;
      }
    } else if (currentStep === 2) {
      if (formData.clientMode === 'new') {
        if (!formData.newClientName.trim() || !formData.newClientEmail.trim()) {
          setErrorMessage('Nama dan email klien baru wajib diisi.');
          return;
        }
      } else if (!formData.clientId) {
        setErrorMessage('Silakan pilih salah satu klien.');
        return;
      }
      if (!formData.pmId) {
        setErrorMessage('Silakan tentukan Project Manager penanggung jawab.');
        return;
      }
    } else if (currentStep === 3) {
      const val = parseFloat(formData.contractValue);
      if (isNaN(val) || val <= 0) {
        setErrorMessage('Nilai kontrak proyek wajib diisi dengan nominal yang valid.');
        return;
      }
      if (!formData.dpAmount) {
        // Auto compute default 30%
        setFormData((prev) => ({ ...prev, dpAmount: String(val * 0.3) }));
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan proyek');
      }

      setSuccessMessage('Proyek baru dan 5 paket dokumen onboarding berhasil dibuat!');
      setTimeout(() => {
        router.push('/dashboard/projects');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Data Proyek', icon: 'ri-building-line' },
    { num: 2, label: 'Klien & PM', icon: 'ri-user-star-line' },
    { num: 3, label: 'Nilai Kontrak & DP', icon: 'ri-money-dollar-circle-line' },
    { num: 4, label: 'Paket 5 Dokumen', icon: 'ri-file-upload-line' },
    { num: 5, label: 'Review & Selesai', icon: 'ri-checkbox-circle-line' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle icon="ri-magic-line">
          Wizard Onboarding Proyek Baru (Direktur / Owner)
        </CardTitle>
        <Badge variant="warning">Wajib 5 Dokumen Awal</Badge>
      </CardHeader>

      <CardContent style={{ padding: '24px' }}>
        {/* Progress Bar / Stepper */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '5%',
              right: '5%',
              height: '3px',
              background: 'var(--dash-border)',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                height: '100%',
                background: '#f97316',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {steps.map((s) => {
            const isPassed = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                  width: '80px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isCurrent ? '#f97316' : isPassed ? '#10b981' : 'var(--dash-card-bg)',
                    border: `2px solid ${isCurrent ? '#f97316' : isPassed ? '#10b981' : 'var(--dash-border)'}`,
                    color: isCurrent || isPassed ? '#ffffff' : 'var(--dash-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(249, 115, 22, 0.2)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {isPassed ? <i className="ri-check-line" /> : s.num}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? '#f97316' : isPassed ? 'var(--dash-text-main)' : 'var(--dash-text-muted)',
                    marginTop: '8px',
                    textAlign: 'center',
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="ri-error-warning-line" style={{ fontSize: '18px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="ri-checkbox-circle-line" style={{ fontSize: '18px' }} />
            <span>{successMessage} Mengalihkan ke daftar proyek...</span>
          </div>
        )}

        {/* Step 1: Data Proyek */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
              Tahap 1: Identitas & Lokasi Proyek
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--dash-text-muted)', margin: 0 }}>
              Masukkan nama proyek konstruksi, kategori pekerjaan, dan lokasi pembangunan fisik.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Nama Proyek <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pembangunan Rumah Tinggal 2 Lantai Ibu Theresia"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Kategori Pekerjaan
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '13px',
                  }}
                >
                  <option value="PEMBANGUNAN">Pembangunan Rumah / Bangunan Baru</option>
                  <option value="RENOVASI">Renovasi & Pemugaran</option>
                  <option value="ARSITEKTUR">Perencanaan Desain Arsitektur Sahaja</option>
                  <option value="PEMERINTAH">Pengadaan Publik / Pemerintah (PBG / Sarpras)</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Lokasi / Alamat Lengkap Proyek <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Magelang Km 7.5, Mlati, Kab. Sleman, D.I. Yogyakarta"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Tanggal Mulai Proyek (SPK)
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Target Selesai Konstruksi (BAST)
                </label>
                <input
                  type="date"
                  value={formData.targetCompletionDate}
                  onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Tautan Live Streaming CCTV Lapangan (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://cctv.halobangun.id/stream/cam-01 atau link RTSP / HLS"
                  value={formData.cctvUrl}
                  onChange={(e) => setFormData({ ...formData, cctvUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Klien & PM */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
              Tahap 2: Penugasan Klien & Project Manager (PM)
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--dash-text-muted)', margin: 0 }}>
              Sistem akan otomatis memberikan akses portal ke Klien dan melimpahkan pengawasan lapangan ke PM yang dipilih.
            </p>

            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '8px' }}>
                Pilihan Akun Klien:
              </label>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="clientMode"
                    checked={formData.clientMode === 'existing'}
                    onChange={() => setFormData({ ...formData, clientMode: 'existing' })}
                  />
                  Pilih Klien Terdaftar
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="clientMode"
                    checked={formData.clientMode === 'new'}
                    onChange={() => setFormData({ ...formData, clientMode: 'new' })}
                  />
                  + Buat Akun Klien Baru
                </label>
              </div>

              {formData.clientMode === 'existing' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--dash-text-muted)', marginBottom: '6px' }}>
                    Daftar Klien Proyek Halo Bangun:
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-muted-bg)',
                      color: 'var(--dash-text-main)',
                      fontSize: '13px',
                    }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', padding: '16px', background: 'var(--dash-muted-bg)', borderRadius: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Nama Lengkap Klien <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Bpk. Bambang Wijaya"
                      value={formData.newClientName}
                      onChange={(e) => setFormData({ ...formData, newClientName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-card-bg)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Email Klien (Untuk Login) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="klien@gmail.com"
                      value={formData.newClientEmail}
                      onChange={(e) => setFormData({ ...formData, newClientEmail: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-card-bg)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Nomor WhatsApp Klien
                    </label>
                    <input
                      type="tel"
                      placeholder="08123456789"
                      value={formData.newClientPhone}
                      onChange={(e) => setFormData({ ...formData, newClientPhone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-card-bg)',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Penanggung Jawab Lapangan (Project Manager / Pengawas) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.pmId}
                onChange={(e) => setFormData({ ...formData, pmId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--dash-border)',
                  background: 'var(--dash-muted-bg)',
                  color: 'var(--dash-text-main)',
                  fontSize: '13px',
                }}
              >
                {pms.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.email})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                PM akan menginput laporan harian maks 3 foto, pembaruan Kurva S mingguan, dan pencatatan inventaris.
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Nilai Kontrak & DP */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
              Tahap 3: Nilai Kontrak & Komitmen Uang Muka (DP)
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--dash-text-muted)', margin: 0 }}>
              Sistem akan otomatis membuat jadwal termin 1 (DP 30%) dan draf alokasi anggaran proyek (FR-18).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Total Nilai Kontrak Proyek (Rp) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 850000000"
                  value={formData.contractValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      contractValue: e.target.value,
                      dpAmount: String(val * 0.3),
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                />
                <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                  {formData.contractValue ? `Rp ${parseFloat(formData.contractValue).toLocaleString('id-ID')}` : 'Rp 0'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Nominal DP Termin 1 (Default 30%)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 255000000"
                  value={formData.dpAmount}
                  onChange={(e) => setFormData({ ...formData, dpAmount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                />
                <div style={{ fontSize: '11.5px', color: '#f97316', marginTop: '4px', fontWeight: 600 }}>
                  {formData.dpAmount ? `Rp ${parseFloat(formData.dpAmount).toLocaleString('id-ID')}` : 'Rp 0'}
                </div>
              </div>
            </div>

            {/* Estimated Allocation Preview */}
            {formData.contractValue && (
              <div style={{ padding: '16px', background: 'var(--dash-muted-bg)', borderRadius: '10px', marginTop: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-main)', marginBottom: '8px' }}>
                  ⚡ Proyeksi Alokasi Keuangan Otomatis (FR-18):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '11.5px' }}>
                  <div>• Est. Laba Bersih (15%): <strong>Rp {(parseFloat(formData.contractValue) * 0.15).toLocaleString('id-ID')}</strong></div>
                  <div>• Pajak PPh/PPN (2%): <strong>Rp {(parseFloat(formData.contractValue) * 0.02).toLocaleString('id-ID')}</strong></div>
                  <div>• Zakat Perusahaan (2.5%): <strong>Rp {((parseFloat(formData.contractValue) * 0.15) * 0.025).toLocaleString('id-ID')}</strong></div>
                  <div>• Dana Mitigasi (2%): <strong>Rp {(parseFloat(formData.contractValue) * 0.02).toLocaleString('id-ID')}</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Paket 5 Dokumen Onboarding Wajib */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
                Tahap 4: Unggah Paket 5 Dokumen Onboarding Wajib
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--dash-text-muted)', margin: 0 }}>
                Owner wajib mengunggah kelima dokumen legalitas & teknis awal berikut sebelum proyek dialihkan ke pengawas lapangan.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* 1. SPKPR */}
              <div style={{ padding: '16px', border: '1.5px dashed var(--dash-border)', borderRadius: '10px', background: 'var(--dash-muted-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                    1. Dokumen SPKPR Resmi
                  </span>
                  {formData.spkprUrl ? <Badge variant="success">✓ Terunggah</Badge> : <Badge variant="warning">Wajib</Badge>}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', margin: '0 0 10px 0' }}>
                  Surat Perjanjian Kerja Pelaksanaan Konstruksi bermaterai. (PDF/DOCX)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'spkpr')}
                  disabled={uploading['spkpr']}
                  style={{ fontSize: '12px' }}
                />
                {uploading['spkpr'] && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '6px' }}>Mengunggah dokumen...</div>}
                {formData.spkprName && <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>📄 {formData.spkprName}</div>}
              </div>

              {/* 2. Desain Arsitektur */}
              <div style={{ padding: '16px', border: '1.5px dashed var(--dash-border)', borderRadius: '10px', background: 'var(--dash-muted-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                    2. Desain Arsitektur & DED
                  </span>
                  {formData.desainUrl ? <Badge variant="success">✓ Terunggah</Badge> : <Badge variant="warning">Wajib</Badge>}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', margin: '0 0 10px 0' }}>
                  Gambar kerja 2D, DED struktur, dan render visual 3D lengkap. (PDF/DWG/ZIP)
                </p>
                <input
                  type="file"
                  accept=".pdf,.zip,.rar,.dwg"
                  onChange={(e) => handleFileUpload(e, 'desain')}
                  disabled={uploading['desain']}
                  style={{ fontSize: '12px' }}
                />
                {uploading['desain'] && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '6px' }}>Mengunggah dokumen...</div>}
                {formData.desainName && <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>📐 {formData.desainName}</div>}
              </div>

              {/* 3. RAB */}
              <div style={{ padding: '16px', border: '1.5px dashed var(--dash-border)', borderRadius: '10px', background: 'var(--dash-muted-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                    3. RAB (dan Struktur Addendum)
                  </span>
                  {formData.rabUrl ? <Badge variant="success">✓ Terunggah</Badge> : <Badge variant="warning">Wajib</Badge>}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', margin: '0 0 10px 0' }}>
                  Rencana Anggaran Biaya terikat detail volume material & upah kerja. (PDF/XLSX)
                </p>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  onChange={(e) => handleFileUpload(e, 'rab')}
                  disabled={uploading['rab']}
                  style={{ fontSize: '12px' }}
                />
                {uploading['rab'] && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '6px' }}>Mengunggah dokumen...</div>}
                {formData.rabName && <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>📊 {formData.rabName}</div>}
              </div>

              {/* 4. Rencana Kerja Utama */}
              <div style={{ padding: '16px', border: '1.5px dashed var(--dash-border)', borderRadius: '10px', background: 'var(--dash-muted-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                    4. Rencana Kerja Utama (Master Schedule)
                  </span>
                  {formData.rencanaKerjaUrl ? <Badge variant="success">✓ Terunggah</Badge> : <Badge variant="warning">Wajib</Badge>}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', margin: '0 0 10px 0' }}>
                  Time schedule mingguan/bulanan dan timeline tahapan struktur. (PDF/XLSX)
                </p>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  onChange={(e) => handleFileUpload(e, 'rencanaKerja')}
                  disabled={uploading['rencanaKerja']}
                  style={{ fontSize: '12px' }}
                />
                {uploading['rencanaKerja'] && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '6px' }}>Mengunggah dokumen...</div>}
                {formData.rencanaKerjaName && <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>📅 {formData.rencanaKerjaName}</div>}
              </div>

              {/* 5. Foto Kwitansi DP */}
              <div style={{ padding: '16px', border: '1.5px dashed var(--dash-border)', borderRadius: '10px', background: 'var(--dash-muted-bg)', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
                    5. Foto Kwitansi Pembayaran Awal (DP)
                  </span>
                  {formData.dpReceiptUrl ? <Badge variant="success">✓ Terunggah</Badge> : <Badge variant="warning">Wajib</Badge>}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', margin: '0 0 10px 0' }}>
                  Bukti transfer bank / kwitansi resmi penerimaan DP Termin 1 dari klien. (JPG/PNG/PDF)
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, 'dpReceipt')}
                  disabled={uploading['dpReceipt']}
                  style={{ fontSize: '12px' }}
                />
                {uploading['dpReceipt'] && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '6px' }}>Mengunggah dokumen...</div>}
                {formData.dpReceiptName && <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>🧾 {formData.dpReceiptName}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
                Tahap 5: Verifikasi Akhir & Inisiasi Proyek
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--dash-text-muted)', margin: 0 }}>
                Pastikan data proyek dan kelengkapan 5 dokumen onboarding sudah tepat sebelum disimpan secara permanen.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--dash-muted-bg)', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>
                  Detail Proyek
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px', color: 'var(--dash-text-main)' }}>
                  {formData.name || '-'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                  📍 {formData.location || '-'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                  🏷️ Kategori: {formData.category}
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--dash-muted-bg)', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase' }}>
                  Finansial & Kontrak
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>
                  Rp {formData.contractValue ? parseFloat(formData.contractValue).toLocaleString('id-ID') : 0}
                </div>
                <div style={{ fontSize: '12px', color: '#f97316', marginTop: '4px', fontWeight: 600 }}>
                  DP Termin 1: Rp {formData.dpAmount ? parseFloat(formData.dpAmount).toLocaleString('id-ID') : 0}
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--dash-muted-bg)', borderRadius: '10px', gridColumn: 'span 2' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Status Dokumen Onboarding
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '12px' }}>
                  <div>1. SPKPR: {formData.spkprUrl ? <span style={{ color: '#10b981' }}>✓ Ada</span> : <span style={{ color: '#ef4444' }}>- Belum diunggah</span>}</div>
                  <div>2. Desain Arsitektur: {formData.desainUrl ? <span style={{ color: '#10b981' }}>✓ Ada</span> : <span style={{ color: '#ef4444' }}>- Belum diunggah</span>}</div>
                  <div>3. RAB Mengikat: {formData.rabUrl ? <span style={{ color: '#10b981' }}>✓ Ada</span> : <span style={{ color: '#ef4444' }}>- Belum diunggah</span>}</div>
                  <div>4. Rencana Kerja: {formData.rencanaKerjaUrl ? <span style={{ color: '#10b981' }}>✓ Ada</span> : <span style={{ color: '#ef4444' }}>- Belum diunggah</span>}</div>
                  <div>5. Kwitansi DP: {formData.dpReceiptUrl ? <span style={{ color: '#10b981' }}>✓ Ada</span> : <span style={{ color: '#ef4444' }}>- Belum diunggah</span>}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--dash-border)',
          }}
        >
          {currentStep > 1 ? (
            <Button variant="secondary" onClick={handlePrev} disabled={submitting}>
              ← Kembali
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button variant="primary" onClick={handleNext}>
              Lanjutkan →
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} disabled={submitting} icon="ri-save-line">
              {submitting ? 'Memproses Inisiasi...' : 'Simpan & Aktifkan Proyek'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

