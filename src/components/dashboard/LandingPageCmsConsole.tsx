"use client";

import React, { useState, useEffect } from 'react';
import ImgBBUploader from './ImgBBUploader';
import { formatSafeImageUrl } from '@/lib/imgbb';

export default function LandingPageCmsConsole() {
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'services' | 'whyChoose' | 'process' | 'cta' | 'counters' | 'testimonials' | 'footer' | 'settings'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Contents state for all sections
  const [contents, setContents] = useState<Record<string, any>>({});

  // ImgBB tester state
  const [testImgBBKey, setTestImgBBKey] = useState('');
  const [testUploadFile, setTestUploadFile] = useState<File | null>(null);
  const [testUploading, setTestUploading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/landing-content');
      const data = await res.json();
      if (data.success && data.data) {
        setContents(data.data);
        if (data.data.settings?.imgbb_api_key) {
          setTestImgBBKey(data.data.settings.imgbb_api_key);
        }
      }
    } catch (err: any) {
      console.error('Failed to load landing content:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSectionField = (section: string, field: string, value: any) => {
    setContents((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveSection = async (section: string) => {
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch(`/api/landing-content/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contents[section] || {}),
      });

      const result = await res.json();

      if (result.success) {
        setSaveSuccess(`Bagian "${section.toUpperCase()}" berhasil disimpan ke Supabase! Perubahan langsung tayang di Laman Depan.`);
        setTimeout(() => setSaveSuccess(null), 4000);
      } else {
        setSaveError(result.error || 'Gagal menyimpan perubahan.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  // Test ImgBB direct upload
  const handleTestImgBBUpload = async () => {
    if (!testUploadFile) {
      setTestError('Pilih file gambar terlebih dahulu.');
      return;
    }

    setTestUploading(true);
    setTestError(null);
    setTestResult(null);

    try {
      const formData = new FormData();
      formData.append('image', testUploadFile);
      if (testImgBBKey.trim()) {
        formData.append('key', testImgBBKey.trim());
      }

      const res = await fetch('/api/upload/imgbb', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data) {
        setTestResult(data.data);
      } else {
        setTestError(data.error || 'Upload gagal diperiksa.');
      }
    } catch (err: any) {
      setTestError(err.message || 'Koneksi ke API gagal.');
    } finally {
      setTestUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <i className="ri-loader-4-line ri-spin" style={{ fontSize: '32px', color: '#2563eb' }}></i>
        <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '14px' }}>Memuat konten landing page dari Supabase...</p>
      </div>
    );
  }

  const hero = contents.hero || {};
  const about = contents.about || {};
  const services = contents.services || { items: [] };
  const whyChoose = contents.whyChoose || { items: [] };
  const process = contents.process || { steps: [] };
  const cta = contents.cta || {};
  const counters = contents.counters || { items: [] };
  const testimonials = contents.testimonials || { items: [] };
  const footer = contents.footer || {};
  const settings = contents.settings || {};

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {/* Header Banner */}
      <div style={{
        padding: '24px 32px',
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#f59e0b', color: '#000', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
              CMS LANDING PAGE
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              <i className="ri-database-2-line"></i> Terkoneksi ke Supabase Database
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#fff' }}>
            Manajemen Konten Dinamis Laman Depan
          </h2>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
            Ubah teks, judul, tombol, ikon, serta unggah gambar langsung ke ImgBB CDN untuk semua komponen website publik.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <i className="ri-external-link-line"></i> Lihat Laman Depan Live
        </a>
      </div>

      {/* Toast Alert */}
      {saveSuccess && (
        <div style={{
          margin: '16px 32px 0 32px',
          padding: '12px 16px',
          background: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: '8px',
          color: '#15803d',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="ri-checkbox-circle-fill" style={{ fontSize: '18px' }}></i>
          {saveSuccess}
        </div>
      )}

      {saveError && (
        <div style={{
          margin: '16px 32px 0 32px',
          padding: '12px 16px',
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#b91c1c',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="ri-error-warning-fill" style={{ fontSize: '18px' }}></i>
          {saveError}
        </div>
      )}

      {/* Tabs Bar */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        borderBottom: '1px solid #e5e7eb',
        background: '#f8fafc',
        padding: '0 16px'
      }}>
        {[
          { key: 'hero', label: '1. Hero & Banner', icon: 'ri-slideshow-line' },
          { key: 'about', label: '2. Tentang Kami', icon: 'ri-building-line' },
          { key: 'services', label: '3. 4 Layanan Utama', icon: 'ri-tools-line' },
          { key: 'whyChoose', label: '4. Mengapa Kami?', icon: 'ri-shield-star-line' },
          { key: 'process', label: '5. Alur Pemesanan', icon: 'ri-flow-chart' },
          { key: 'cta', label: '6. Banner Konsultasi', icon: 'ri-customer-service-line' },
          { key: 'counters', label: '7. Statistik', icon: 'ri-bar-chart-box-line' },
          { key: 'testimonials', label: '8. Testimoni', icon: 'ri-chat-smile-2-line' },
          { key: 'footer', label: '9. Kontak & Footer', icon: 'ri-contacts-book-line' },
          { key: 'settings', label: '⚙️ ImgBB & Media', icon: 'ri-image-add-line' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '14px 18px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
              background: 'none',
              color: activeTab === tab.key ? '#2563eb' : '#64748b',
              fontWeight: activeTab === tab.key ? 600 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div style={{ padding: '28px 32px' }}>
        {/* TAB 1: HERO */}
        {activeTab === 'hero' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Pengaturan Hero Banner & Headline Utama
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Atur judul utama, narasi pendukung, gambar latar belakang, dan tombol aksi yang tampil di bagian paling atas.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('hero')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Perubahan Hero"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Badge Tagline Atas
                </label>
                <input
                  type="text"
                  value={hero.badgeText || ''}
                  onChange={(e) => updateSectionField('hero', 'badgeText', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Judul Utama (Headline H1)
                </label>
                <input
                  type="text"
                  value={hero.title || ''}
                  onChange={(e) => updateSectionField('hero', 'title', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Sub-Judul / Deskripsi Pendukung
                </label>
                <textarea
                  rows={3}
                  value={hero.subtitle || ''}
                  onChange={(e) => updateSectionField('hero', 'subtitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Teks Tombol Utama (CTA 1)
                </label>
                <input
                  type="text"
                  value={hero.primaryButtonText || ''}
                  onChange={(e) => updateSectionField('hero', 'primaryButtonText', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Link Tombol Utama (misal: WhatsApp / Form)
                </label>
                <input
                  type="text"
                  value={hero.primaryButtonLink || ''}
                  onChange={(e) => updateSectionField('hero', 'primaryButtonLink', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Teks Tombol Kedua (CTA 2)
                </label>
                <input
                  type="text"
                  value={hero.secondaryButtonText || ''}
                  onChange={(e) => updateSectionField('hero', 'secondaryButtonText', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Link Tombol Kedua (misal: /login)
                </label>
                <input
                  type="text"
                  value={hero.secondaryButtonLink || ''}
                  onChange={(e) => updateSectionField('hero', 'secondaryButtonLink', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Angka Highlight Cepat
                </label>
                <input
                  type="text"
                  value={hero.statsNumber || ''}
                  onChange={(e) => updateSectionField('hero', 'statsNumber', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Label Highlight Cepat
                </label>
                <input
                  type="text"
                  value={hero.statsLabel || ''}
                  onChange={(e) => updateSectionField('hero', 'statsLabel', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <ImgBBUploader
                  label="Gambar Background Banner Hero (Upload via ImgBB)"
                  value={hero.backgroundImage}
                  onChange={(url) => updateSectionField('hero', 'backgroundImage', url)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ABOUT */}
        {activeTab === 'about' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Pengaturan Bagian Tentang Kami (Company Profile)
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Atur narasi deskripsi perusahaan, tahun pengalaman, daftar poin keunggulan, dan foto kantor/tim.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('about')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Perubahan About"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Badge Tagline
                </label>
                <input
                  type="text"
                  value={about.badge || ''}
                  onChange={(e) => updateSectionField('about', 'badge', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  No. Telepon Konsultasi Cepat
                </label>
                <input
                  type="text"
                  value={about.phoneConsult || ''}
                  onChange={(e) => updateSectionField('about', 'phoneConsult', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Judul Tentang Kami (H2)
                </label>
                <input
                  type="text"
                  value={about.title || ''}
                  onChange={(e) => updateSectionField('about', 'title', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Deskripsi Narasi Perusahaan
                </label>
                <textarea
                  rows={4}
                  value={about.description || ''}
                  onChange={(e) => updateSectionField('about', 'description', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Tahun Pengalaman (Angka)
                </label>
                <input
                  type="number"
                  value={about.experienceYears || 0}
                  onChange={(e) => updateSectionField('about', 'experienceYears', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Label Pengalaman
                </label>
                <input
                  type="text"
                  value={about.experienceLabel || ''}
                  onChange={(e) => updateSectionField('about', 'experienceLabel', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <ImgBBUploader
                  label="Foto Utama Bagian About (Upload via ImgBB)"
                  value={about.mainImage}
                  onChange={(url) => updateSectionField('about', 'mainImage', url)}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Daftar Poin Keunggulan (Satu per baris)
                </label>
                <textarea
                  rows={5}
                  value={Array.isArray(about.features) ? about.features.join('\n') : ''}
                  onChange={(e) => updateSectionField('about', 'features', e.target.value.split('\n').filter(Boolean))}
                  placeholder="Poin 1&#10;Poin 2&#10;Poin 3"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES */}
        {activeTab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Pengaturan 4 Layanan Utama Konstruksi
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Atur judul layanan, deskripsi, tautan, serta foto/ikon untuk Desain Arsitektur, Pembangunan, RAB, dan PBG.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('services')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Perubahan Layanan"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Badge Layanan
                </label>
                <input
                  type="text"
                  value={services.badge || ''}
                  onChange={(e) => updateSectionField('services', 'badge', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Judul Section Layanan (H2)
                </label>
                <input
                  type="text"
                  value={services.title || ''}
                  onChange={(e) => updateSectionField('services', 'title', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Sub-Judul Penjelasan
                </label>
                <input
                  type="text"
                  value={services.subtitle || ''}
                  onChange={(e) => updateSectionField('services', 'subtitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* List 4 Services */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(services.items || []).map((item: any, idx: number) => (
                <div key={item.id || idx} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', background: '#f9fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                      Layanan #{idx + 1}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                      {item.title}
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Nama Layanan
                      </label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => {
                          const newItems = [...services.items];
                          newItems[idx] = { ...newItems[idx], title: e.target.value };
                          updateSectionField('services', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Subjudul Singkat
                      </label>
                      <input
                        type="text"
                        value={item.subtitle || ''}
                        onChange={(e) => {
                          const newItems = [...services.items];
                          newItems[idx] = { ...newItems[idx], subtitle: e.target.value };
                          updateSectionField('services', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Deskripsi Layanan
                      </label>
                      <textarea
                        rows={2}
                        value={item.description || ''}
                        onChange={(e) => {
                          const newItems = [...services.items];
                          newItems[idx] = { ...newItems[idx], description: e.target.value };
                          updateSectionField('services', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Ikon RemixIcon (misal: ri-building-line)
                      </label>
                      <input
                        type="text"
                        value={item.icon || ''}
                        onChange={(e) => {
                          const newItems = [...services.items];
                          newItems[idx] = { ...newItems[idx], icon: e.target.value };
                          updateSectionField('services', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Tautan Halaman
                      </label>
                      <input
                        type="text"
                        value={item.link || '/service'}
                        onChange={(e) => {
                          const newItems = [...services.items];
                          newItems[idx] = { ...newItems[idx], link: e.target.value };
                          updateSectionField('services', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <ImgBBUploader
                        label={`Gambar Cover Layanan #${idx + 1} (Upload ke ImgBB)`}
                        value={item.image}
                        onChange={(url) => {
                          const newItems = [...services.items];
                          newItems[idx] = { ...newItems[idx], image: url };
                          updateSectionField('services', 'items', newItems);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WHY CHOOSE US */}
        {activeTab === 'whyChoose' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Pengaturan Keunggulan Perusahaan (Why Choose Us)
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Atur 5 pilar kepercayaan: Tenaga Kerja, Garansi Tertulis, RAB Mengikat, Live CCTV, & Dashboard Klien.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('whyChoose')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Perubahan Keunggulan"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Badge Keunggulan
                </label>
                <input
                  type="text"
                  value={whyChoose.badge || ''}
                  onChange={(e) => updateSectionField('whyChoose', 'badge', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Judul Section (H2)
                </label>
                <input
                  type="text"
                  value={whyChoose.title || ''}
                  onChange={(e) => updateSectionField('whyChoose', 'title', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Sub-Judul Penjelasan
                </label>
                <input
                  type="text"
                  value={whyChoose.subtitle || ''}
                  onChange={(e) => updateSectionField('whyChoose', 'subtitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(whyChoose.items || []).map((item: any, idx: number) => (
                <div key={item.id || idx} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: '#f9fafb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Judul Poin #{idx + 1}
                      </label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => {
                          const newItems = [...whyChoose.items];
                          newItems[idx] = { ...newItems[idx], title: e.target.value };
                          updateSectionField('whyChoose', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Deskripsi
                      </label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => {
                          const newItems = [...whyChoose.items];
                          newItems[idx] = { ...newItems[idx], description: e.target.value };
                          updateSectionField('whyChoose', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Ikon RemixIcon
                      </label>
                      <input
                        type="text"
                        value={item.icon || ''}
                        onChange={(e) => {
                          const newItems = [...whyChoose.items];
                          newItems[idx] = { ...newItems[idx], icon: e.target.value };
                          updateSectionField('whyChoose', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROCESS */}
        {activeTab === 'process' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Pengaturan Alur Pemesanan & Tahapan Kerja (Ordering Flow)
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Atur 5 tahapan kerja mulai dari Konsultasi, Desain, RAB & SPK, Konstruksi & Pengawasan, hingga BAST & Garansi.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('process')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Perubahan Alur"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Badge Alur
                </label>
                <input
                  type="text"
                  value={process.badge || ''}
                  onChange={(e) => updateSectionField('process', 'badge', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Judul Section (H2)
                </label>
                <input
                  type="text"
                  value={process.title || ''}
                  onChange={(e) => updateSectionField('process', 'title', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Sub-Judul Penjelasan
                </label>
                <input
                  type="text"
                  value={process.subtitle || ''}
                  onChange={(e) => updateSectionField('process', 'subtitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(process.steps || []).map((step: any, idx: number) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: '#f9fafb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr 1fr', gap: '12px', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Nomor
                      </label>
                      <input
                        type="text"
                        value={step.step || `0${idx + 1}`}
                        onChange={(e) => {
                          const newSteps = [...process.steps];
                          newSteps[idx] = { ...newSteps[idx], step: e.target.value };
                          updateSectionField('process', 'steps', newSteps);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Judul Tahapan
                      </label>
                      <input
                        type="text"
                        value={step.title || ''}
                        onChange={(e) => {
                          const newSteps = [...process.steps];
                          newSteps[idx] = { ...newSteps[idx], title: e.target.value };
                          updateSectionField('process', 'steps', newSteps);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Deskripsi Penjelasan
                      </label>
                      <input
                        type="text"
                        value={step.description || ''}
                        onChange={(e) => {
                          const newSteps = [...process.steps];
                          newSteps[idx] = { ...newSteps[idx], description: e.target.value };
                          updateSectionField('process', 'steps', newSteps);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Ikon RemixIcon
                      </label>
                      <input
                        type="text"
                        value={step.icon || ''}
                        onChange={(e) => {
                          const newSteps = [...process.steps];
                          newSteps[idx] = { ...newSteps[idx], icon: e.target.value };
                          updateSectionField('process', 'steps', newSteps);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CTA BANNER */}
        {activeTab === 'cta' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Pengaturan Banner Konsultasi Proyek (CTA)
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Atur ajakan aksi konsultasi cepat gratis dan nomor kontak WhatsApp hotline.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('cta')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Perubahan CTA"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Judul Banner CTA
                </label>
                <input
                  type="text"
                  value={cta.title || ''}
                  onChange={(e) => updateSectionField('cta', 'title', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Sub-Judul Banner CTA
                </label>
                <textarea
                  rows={2}
                  value={cta.subtitle || ''}
                  onChange={(e) => updateSectionField('cta', 'subtitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Teks Tombol Aksi
                </label>
                <input
                  type="text"
                  value={cta.buttonText || ''}
                  onChange={(e) => updateSectionField('cta', 'buttonText', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Link Tombol WhatsApp
                </label>
                <input
                  type="text"
                  value={cta.buttonLink || ''}
                  onChange={(e) => updateSectionField('cta', 'buttonLink', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Label Nomor Hotline
                </label>
                <input
                  type="text"
                  value={cta.phoneText || ''}
                  onChange={(e) => updateSectionField('cta', 'phoneText', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Nomor Telepon Hotline
                </label>
                <input
                  type="text"
                  value={cta.phoneNumber || ''}
                  onChange={(e) => updateSectionField('cta', 'phoneNumber', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: COUNTERS */}
        {activeTab === 'counters' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Pengaturan Angka Statistik Pencapaian
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Atur 4 metrik pencapaian Halo Bangun (Proyek Selesai, Kepuasan, Tenaga Ahli, Pengalaman).
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('counters')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Perubahan Statistik"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {(counters.items || []).map((cnt: any, idx: number) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', background: '#f9fafb' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#2563eb', marginBottom: '12px' }}>
                    Statistik #{idx + 1}
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Nilai Angka
                    </label>
                    <input
                      type="number"
                      value={cnt.number || 0}
                      onChange={(e) => {
                        const newItems = [...counters.items];
                        newItems[idx] = { ...newItems[idx], number: parseInt(e.target.value) || 0 };
                        updateSectionField('counters', 'items', newItems);
                      }}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontWeight: 600 }}
                    />
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Suffix (misal: +, %, Th)
                    </label>
                    <input
                      type="text"
                      value={cnt.suffix || ''}
                      onChange={(e) => {
                        const newItems = [...counters.items];
                        newItems[idx] = { ...newItems[idx], suffix: e.target.value };
                        updateSectionField('counters', 'items', newItems);
                      }}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Label Keterangan
                    </label>
                    <input
                      type="text"
                      value={cnt.label || ''}
                      onChange={(e) => {
                        const newItems = [...counters.items];
                        newItems[idx] = { ...newItems[idx], label: e.target.value };
                        updateSectionField('counters', 'items', newItems);
                      }}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Pengaturan Ulasan & Testimoni Klien
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Atur testimoni klien, nama pemilik proyek, ulasan pengalaman, rating bintang, dan foto avatar.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('testimonials')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Perubahan Testimoni"}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(testimonials.items || []).map((t: any, idx: number) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', background: '#f9fafb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '16px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Nama Klien #{idx + 1}
                      </label>
                      <input
                        type="text"
                        value={t.name || ''}
                        onChange={(e) => {
                          const newItems = [...testimonials.items];
                          newItems[idx] = { ...newItems[idx], name: e.target.value };
                          updateSectionField('testimonials', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Status / Jenis Proyek
                      </label>
                      <input
                        type="text"
                        value={t.project || ''}
                        onChange={(e) => {
                          const newItems = [...testimonials.items];
                          newItems[idx] = { ...newItems[idx], project: e.target.value };
                          updateSectionField('testimonials', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={t.rating || 5}
                        onChange={(e) => {
                          const newItems = [...testimonials.items];
                          newItems[idx] = { ...newItems[idx], rating: parseInt(e.target.value) || 5 };
                          updateSectionField('testimonials', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Komentar Testimoni
                      </label>
                      <textarea
                        rows={2}
                        value={t.comment || ''}
                        onChange={(e) => {
                          const newItems = [...testimonials.items];
                          newItems[idx] = { ...newItems[idx], comment: e.target.value };
                          updateSectionField('testimonials', 'items', newItems);
                        }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <ImgBBUploader
                        label={`Foto Avatar Klien #${idx + 1} (Upload ke ImgBB)`}
                        value={t.avatar}
                        onChange={(url) => {
                          const newItems = [...testimonials.items];
                          newItems[idx] = { ...newItems[idx], avatar: url };
                          updateSectionField('testimonials', 'items', newItems);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: FOOTER & CONTACT */}
        {activeTab === 'footer' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Pengaturan Footer, Kontak & Informasi Kantor
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Atur alamat kantor wilayah (Yogyakarta & Jawa Barat), jam operasional, WhatsApp, email, dan sosial media.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('footer')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Perubahan Footer"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Nama Brand Perusahaan
                </label>
                <input
                  type="text"
                  value={footer.companyName || ''}
                  onChange={(e) => updateSectionField('footer', 'companyName', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Jam Operasional Kantor
                </label>
                <input
                  type="text"
                  value={footer.operationalHours || ''}
                  onChange={(e) => updateSectionField('footer', 'operationalHours', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Tagline Perusahaan
                </label>
                <textarea
                  rows={2}
                  value={footer.tagline || ''}
                  onChange={(e) => updateSectionField('footer', 'tagline', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Alamat Kantor Wilayah D.I. Yogyakarta
                </label>
                <textarea
                  rows={2}
                  value={footer.addressYogyakarta || ''}
                  onChange={(e) => updateSectionField('footer', 'addressYogyakarta', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Alamat Kantor Wilayah Jawa Barat
                </label>
                <textarea
                  rows={2}
                  value={footer.addressJawaBarat || ''}
                  onChange={(e) => updateSectionField('footer', 'addressJawaBarat', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Nomor Kontak WhatsApp Resmi
                </label>
                <input
                  type="text"
                  value={footer.phone || ''}
                  onChange={(e) => updateSectionField('footer', 'phone', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Email Resmi Perusahaan
                </label>
                <input
                  type="email"
                  value={footer.email || ''}
                  onChange={(e) => updateSectionField('footer', 'email', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Instagram URL
                </label>
                <input
                  type="text"
                  value={footer.socials?.instagram || ''}
                  onChange={(e) => updateSectionField('footer', 'socials', { ...footer.socials, instagram: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Facebook URL
                </label>
                <input
                  type="text"
                  value={footer.socials?.facebook || ''}
                  onChange={(e) => updateSectionField('footer', 'socials', { ...footer.socials, facebook: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  YouTube URL
                </label>
                <input
                  type="text"
                  value={footer.socials?.youtube || ''}
                  onChange={(e) => updateSectionField('footer', 'socials', { ...footer.socials, youtube: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Teks Hak Cipta (Copyright)
                </label>
                <input
                  type="text"
                  value={footer.copyright || ''}
                  onChange={(e) => updateSectionField('footer', 'copyright', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: IMGBB & MEDIA CONFIG */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Konfigurasi & Pengujian API ImgBB (Cloud CDN Hosting)
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Simpan API Key ImgBB untuk hosting gambar gratis, otomatis menghasilkan URL permanen tanpa membebani server lokal.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSection('settings')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <i className={saving ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {saving ? "Menyimpan..." : "Simpan Kunci API ImgBB"}
              </button>
            </div>

            {/* ImgBB Configuration Card */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <i className="ri-key-2-fill" style={{ fontSize: '22px', color: '#2563eb' }}></i>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                  Kunci API ImgBB (Client API Key)
                </h4>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  ImgBB API Key (v1)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 7a9ddf5e13cb9d67ba5b9b9a690e09dc..."
                  value={settings.imgbb_api_key || ''}
                  onChange={(e) => {
                    updateSectionField('settings', 'imgbb_api_key', e.target.value);
                    setTestImgBBKey(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    background: '#fff'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                  Dapatkan API Key gratis di <a href="https://api.imgbb.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>api.imgbb.com</a>. Kunci ini akan otomatis digunakan oleh seluruh fitur upload gambar (CMS, Proyek, Foto Progres Harian, & Kwitansi).
                </span>
              </div>
            </div>

            {/* Live ImgBB Upload Tester Card */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <i className="ri-flask-line" style={{ fontSize: '22px', color: '#10b981' }}></i>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                    Live Tester Upload ImgBB
                  </h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Uji langsung pengunggahan gambar ke API ImgBB dan verifikasi respons URL CDN.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTestUploadFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '13px' }}
                />

                <button
                  type="button"
                  disabled={testUploading || !testUploadFile}
                  onClick={handleTestImgBBUpload}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background: testUploading ? '#9ca3af' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: testUploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className={testUploading ? "ri-loader-4-line ri-spin" : "ri-send-plane-line"}></i>
                  {testUploading ? "Sedang Mengirim ke ImgBB..." : "Jalankan Uji Upload ImgBB"}
                </button>
              </div>

              {testError && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', fontSize: '13px' }}>
                  <i className="ri-error-warning-line"></i> {testError}
                </div>
              )}

              {testResult && (
                <div style={{ padding: '18px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
                    <i className="ri-checkbox-circle-line" style={{ fontSize: '20px' }}></i>
                    API ImgBB Berhasil Terhubung & Gambar Terunggah!
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <img
                      src={formatSafeImageUrl(testResult.url || testResult.display_url)}
                      alt="Uploaded test"
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#374151', marginBottom: '6px' }}>
                        <strong>URL Publik (CDN ImgBB):</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          readOnly
                          value={testResult.url || ''}
                          style={{ flex: 1, padding: '6px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        />
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(testResult.url || '')}
                          style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Salin URL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

