'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { formatSafeImageUrl } from '@/lib/imgbb';

interface Props {
  dailyReports: any[];
  equipment: any[];
  materials: any[];
  payrolls: any[];
  projects: any[];
}

export default function MandorFieldConsole({
  dailyReports,
  equipment,
  materials,
  payrolls,
  projects,
}: Props) {
  const [activeTab, setActiveTab] = useState<'photos' | 'materials' | 'payroll'>('photos');

  // Form quick request material
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqForm, setReqForm] = useState({
    projectId: projects[0]?.id || '',
    itemName: '',
    quantity: '',
    notes: '',
  });
  const [submittingReq, setSubmittingReq] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleRequestMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.itemName || !reqForm.quantity) {
      setAlertMsg({ type: 'error', text: 'Nama barang dan jumlah material wajib diisi.' });
      return;
    }

    setSubmittingReq(true);
    setAlertMsg(null);

    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: reqForm.projectId,
          itemName: reqForm.itemName,
          quantity: reqForm.quantity,
          storeName: 'Permintaan Lapangan (Mandor)',
          totalPrice: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setAlertMsg({ type: 'success', text: 'Permintaan material berhasil diteruskan ke Project Manager!' });
      setReqForm({ projectId: projects[0]?.id || '', itemName: '', quantity: '', notes: '' });
      setShowReqModal(false);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Alert Banner */}
      {alertMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: alertMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${alertMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: alertMsg.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      )}

      {/* Mobile Top KPI Cards (Large, Touch-Friendly) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '6px' }}>
            <i className="ri-team-line" />
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>Tukang Lapangan</div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>12 - 14 Org</div>
        </div>

        <div
          style={{
            background: 'var(--dash-card-bg)',
            border: '1px solid var(--dash-border)',
            borderRadius: '14px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '20px', color: '#0ea5e9', marginBottom: '6px' }}>
            <i className="ri-tools-line" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Alat Kerja Proyek</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
            {equipment.length} Unit
          </div>
        </div>

        <div
          style={{
            background: 'var(--dash-card-bg)',
            border: '1px solid var(--dash-border)',
            borderRadius: '14px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '20px', color: '#10b981', marginBottom: '6px' }}>
            <i className="ri-wallet-3-line" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Upah Terakhir</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
            {payrolls[0] ? formatIDR(payrolls[0].total_amount) : 'Lunas'}
          </div>
        </div>
      </div>

      {/* Big Action Button for Field Worker */}
      <button
        onClick={() => setShowReqModal(true)}
        style={{
          width: '100%',
          padding: '14px 20px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: '#ffffff',
          border: 'none',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
        }}
      >
        <i className="ri-shopping-basket-line" style={{ fontSize: '20px' }} />
        + Request Kebutuhan Material Mendesak ke PM
      </button>

      {/* Modal Quick Request Material */}
      {showReqModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--dash-card-bg)',
              borderRadius: '14px',
              border: '1px solid var(--dash-border)',
              padding: '24px',
              boxShadow: 'var(--dash-shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                Request Material ke Project Manager
              </h4>
              <button
                onClick={() => setShowReqModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--dash-text-muted)', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRequestMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Pilih Proyek
                </label>
                <select
                  value={reqForm.projectId}
                  onChange={(e) => setReqForm({ ...reqForm, projectId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    fontSize: '13px',
                  }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Nama Material / Barang Dibutuhkan <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Semen Gresik, Pasir Pasang 1 Truk, Paku 7cm"
                  value={reqForm.itemName}
                  onChange={(e) => setReqForm({ ...reqForm, itemName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Jumlah / Kebutuhan <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 30 Sak / 1 Truk / 5 Kg"
                  value={reqForm.quantity}
                  onChange={(e) => setReqForm({ ...reqForm, quantity: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <Button variant="secondary" onClick={() => setShowReqModal(false)} type="button">
                  Batal
                </Button>
                <Button variant="primary" type="submit" disabled={submittingReq} icon="ri-send-plane-fill">
                  {submittingReq ? 'Mengirim...' : 'Kirim ke PM'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Field Tabs */}
      <div className="mandor-tabs-responsive">
        <button
          onClick={() => setActiveTab('photos')}
          style={{
            padding: '10px 8px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'photos' ? 'var(--dash-card-bg)' : 'transparent',
            color: activeTab === 'photos' ? '#f97316' : 'var(--dash-text-muted)',
            fontWeight: activeTab === 'photos' ? 800 : 600,
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: activeTab === 'photos' ? 'var(--dash-shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <i className="ri-image-line" />
          <span>Foto Lapangan</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          style={{
            padding: '10px 8px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'materials' ? 'var(--dash-card-bg)' : 'transparent',
            color: activeTab === 'materials' ? '#f97316' : 'var(--dash-text-muted)',
            fontWeight: activeTab === 'materials' ? 800 : 600,
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: activeTab === 'materials' ? 'var(--dash-shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <i className="ri-tools-line" />
          <span>Material & Alat</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          style={{
            padding: '10px 8px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'payroll' ? 'var(--dash-card-bg)' : 'transparent',
            color: activeTab === 'payroll' ? '#f97316' : 'var(--dash-text-muted)',
            fontWeight: activeTab === 'payroll' ? 800 : 600,
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: activeTab === 'payroll' ? 'var(--dash-shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <i className="ri-bill-line" />
          <span>Slip Upah</span>
        </button>
      </div>

      {/* Tab 1: FOTO & LAPORAN LAPANGAN */}
      {activeTab === 'photos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dailyReports.map((rep) => (
            <Card key={rep.id}>
              <CardContent style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--dash-text-main)' }}>
                    {rep.project.name}
                  </div>
                  <Badge variant="info">⛅ {rep.weather}</Badge>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginBottom: '10px' }}>
                  📅 {new Date(rep.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • 👷 {rep.worker_count} Tukang
                </div>
                <p style={{ fontSize: '13px', color: 'var(--dash-text-main)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                  "{rep.notes}"
                </p>

                {rep.photos && rep.photos.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                    {rep.photos.map((p: string, i: number) => (
                      <img
                        key={i}
                        src={formatSafeImageUrl(p)}
                        alt="Progres Lapangan"
                        style={{
                          width: '100%',
                          height: '110px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid var(--dash-border)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: MATERIAL & ALAT KERJA */}
      {activeTab === 'materials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Alat Kerja Lapangan */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-tools-line">Inventaris Alat Tukang Lapangan</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {equipment.map((eq) => (
                  <div
                    key={eq.id}
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
                        {eq.item_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                        {eq.notes || 'Siap digunakan di lokasi'}
                      </div>
                    </div>
                    {eq.status === 'SEWA' ? (
                      <Badge variant="warning">Sewa: {eq.rental_duration}</Badge>
                    ) : (
                      <Badge variant="success">Alat Sendiri</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permintaan Material yang Diajukan */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-shopping-cart-line">Kebutuhan Material & Pembelian</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {materials.map((m) => (
                  <div
                    key={m.id}
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
                        {m.item_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                        Kuantitas: {m.quantity} • Toko: {m.store_name}
                      </div>
                    </div>
                    <Badge variant="neutral">Tercatat</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: SLIP UPAH MANDOR */}
      {activeTab === 'payroll' && (
        <Card>
          <CardHeader>
            <CardTitle icon="ri-wallet-3-line">Slip Upah & Dana Lapangan Pribadi</CardTitle>
            <Badge variant="success">Pribadi</Badge>
          </CardHeader>
          <CardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {payrolls.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'var(--dash-muted-bg)',
                    border: '1px solid var(--dash-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--dash-text-main)' }}>
                      Periode: {p.period}
                    </span>
                    <Badge variant="success">✓ DITRANSFER</Badge>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '10px' }}>
                    <div>Gaji Pokok: <strong>{formatIDR(p.base_salary)}</strong></div>
                    <div>Operasional: <strong>{formatIDR(p.operational_allowance)}</strong></div>
                    <div>Bonus Kerajinan: <strong style={{ color: '#10b981' }}>{formatIDR(p.bonus)}</strong></div>
                    <div>Total Diterima: <strong style={{ color: '#f97316', fontSize: '13px' }}>{formatIDR(p.total_amount)}</strong></div>
                  </div>
                  {p.slip_url && (
                    <a
                      href={p.slip_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#f97316',
                        textDecoration: 'none',
                      }}
                    >
                      <i className="ri-download-2-line" /> Unduh Bukti Transfer / Slip Upah
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

