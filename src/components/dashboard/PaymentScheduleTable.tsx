'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { formatSafeImageUrl } from '@/lib/imgbb';
import { formatIDR } from './PaymentSummaryCards';

export interface PaymentItem {
  id: number;
  project_id: number;
  termin_number: number;
  termin_name: string;
  percentage: number;
  amount: number;
  status: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'REJECTED';
  due_date?: string | null;
  paid_at?: string | null;
  proof_url?: string | null;
  receipt_url?: string | null;
  rejection_reason?: string | null;
  notes?: string | null;
  project?: { id: number; name: string; contract_value: number };
}

interface PaymentScheduleTableProps {
  payments: PaymentItem[];
  userRole: 'OWNER' | 'FINANCE' | 'CLIENT' | string;
  projectId: number;
  finalContractTotal?: number;
  onRefresh: () => void;
}

const formatDateID = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const PaymentScheduleTable: React.FC<PaymentScheduleTableProps> = ({
  payments = [],
  userRole,
  projectId,
  finalContractTotal = 0,
  onRefresh,
}) => {
  // Modal states
  const [activeModal, setActiveModal] = useState<'upload' | 'verify' | 'reject' | 'add' | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);

  // Form states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New termin state
  const [newTermin, setNewTermin] = useState({
    terminName: '',
    percentage: 25,
    amount: Math.round(finalContractTotal * 0.25),
    dueDate: '',
    notes: '',
  });

  const isClient = userRole === 'CLIENT';
  const isFinanceOrOwner = userRole === 'FINANCE' || userRole === 'OWNER';

  // Handler: Client Uploads Proof
  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    if (!proofFile) {
      alert('Pilih file bukti transfer terlebih dahulu');
      return;
    }

    setUploading(true);
    setStatusMsg(null);
    try {
      // 1. Upload proof file
      const formData = new FormData();
      formData.append('file', proofFile);
      formData.append('folder', 'payment_proofs');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Gagal mengunggah bukti transfer');
      }

      // 2. Patch payment
      const patchRes = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: 'upload_proof',
          proofUrl: uploadData.url,
        }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok || !patchData.success) {
        throw new Error(patchData.error || 'Gagal memperbarui status pembayaran');
      }

      setActiveModal(null);
      setProofFile(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat mengunggah bukti');
    } finally {
      setUploading(false);
    }
  };

  // Handler: Finance Verifies Payment & Uploads Receipt
  const handleVerifyPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setUploading(true);
    try {
      let finalReceiptUrl = selectedPayment.receipt_url || '/main-assets/docs/Kwitansi-Resmi-DP-HaloBangun.pdf';

      if (receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        formData.append('folder', 'receipts');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          finalReceiptUrl = uploadData.url;
        }
      }

      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: 'verify_paid',
          receiptUrl: finalReceiptUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memverifikasi pembayaran');
      }

      if (data.bastUnlocked) {
        alert('🎉 Selamat! Syarat BAST & Garansi telah terpenuhi (Lunas 100% & Progres 100%). Dokumen BAST & Garansi resmi TERBUKA untuk diunduh klien.');
      }

      setActiveModal(null);
      setReceiptFile(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal memverifikasi');
    } finally {
      setUploading(false);
    }
  };

  // Handler: Finance Rejects Proof
  const handleRejectProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setUploading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: 'reject_proof',
          rejectionReason: rejectionReason.trim() || 'Bukti transfer tidak valid atau dana belum masuk.',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menolak bukti transfer');
      }

      setActiveModal(null);
      setRejectionReason('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal memproses penolakan');
    } finally {
      setUploading(false);
    }
  };

  // Handler: Add New Termin
  const handleAddTermin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermin.terminName) {
      alert('Nama termin wajib diisi');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          terminName: newTermin.terminName,
          percentage: newTermin.percentage,
          amount: newTermin.amount,
          dueDate: newTermin.dueDate || null,
          notes: newTermin.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menambahkan termin baru');
      }

      setActiveModal(null);
      setNewTermin({
        terminName: '',
        percentage: 25,
        amount: Math.round(finalContractTotal * 0.25),
        dueDate: '',
        notes: '',
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan termin');
    } finally {
      setUploading(false);
    }
  };

  // Handler: Delete Termin
  const handleDeleteTermin = async (pId: number, tName: string) => {
    if (!confirm(`Hapus jadwal tagihan ${tName}?`)) return;
    try {
      const res = await fetch(`/api/payments?id=${pId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle icon="ri-bill-line">
              Jadwal Termin Pembayaran & Kwitansi Resmi
            </CardTitle>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
              Transparansi penagihan bertahap sesuai progres konstruksi dan penerbitan kwitansi lunas
            </div>
          </div>
          {isFinanceOrOwner && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setNewTermin({
                  terminName: `Termin ${payments.length + 1}`,
                  percentage: 20,
                  amount: Math.round(finalContractTotal * 0.2),
                  dueDate: '',
                  notes: '',
                });
                setActiveModal('add');
              }}
              icon="ri-add-line"
            >
              + Tambah Jadwal Termin Baru
            </Button>
          )}
        </CardHeader>

        <CardContent style={{ padding: '20px' }}>
          {/* Desktop Table View */}
          <div className="dash-desktop-table" style={{ overflowX: 'auto', border: '1px solid var(--dash-border)', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '2px solid var(--dash-border)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '50px' }}>No</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, minWidth: '180px' }}>Tahapan Termin</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '90px' }}>Bobot (%)</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, minWidth: '150px' }}>Nominal Tagihan</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '130px' }}>Jatuh Tempo</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '160px' }}>Status Pembayaran</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, minWidth: '200px' }}>Bukti & Kwitansi</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, width: '180px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                      Belum ada jadwal termin tagihan yang diterbitkan untuk proyek ini.
                    </td>
                  </tr>
                ) : (
                  payments.map((p, idx) => {
                    const isPaid = p.status === 'PAID';
                    const isPending = p.status === 'PENDING_VERIFICATION';
                    const isRejected = p.status === 'REJECTED';
                    const isUnpaid = p.status === 'UNPAID';

                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: '1px solid var(--dash-border)',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                        }}
                      >
                        {/* No */}
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--dash-text-muted)' }}>
                          {p.termin_number || idx + 1}
                        </td>

                        {/* Nama Termin */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>{p.termin_name}</div>
                          {p.notes && (
                            <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '2px' }}>
                              {p.notes}
                            </div>
                          )}
                          {isRejected && p.rejection_reason && (
                            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px', fontWeight: 600 }}>
                              ⚠ Alasan Tolak: {p.rejection_reason}
                            </div>
                          )}
                        </td>

                        {/* Bobot % */}
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontWeight: 600 }}>{p.percentage ? `${p.percentage}%` : '-'}</span>
                        </td>

                        {/* Nominal Tagihan (IDR) */}
                        <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: '14px', color: isPaid ? '#10b981' : '#f97316' }}>
                          {formatIDR(p.amount)}
                        </td>

                        {/* Jatuh Tempo */}
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--dash-text-muted)' }}>
                          {formatDateID(p.due_date)}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '12px 14px' }}>
                          {isPaid && (
                            <Badge variant="success">
                              <i className="ri-checkbox-circle-line" /> Lunas (PAID)
                            </Badge>
                          )}
                          {isPending && (
                            <Badge variant="warning">
                              <i className="ri-time-line" /> Verifikasi Finance
                            </Badge>
                          )}
                          {isUnpaid && (
                            <Badge variant="neutral">
                              <i className="ri-error-warning-line" /> Belum Bayar
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge variant="danger">
                              <i className="ri-close-circle-line" /> Bukti Ditolak
                            </Badge>
                          )}
                          {isPaid && p.paid_at && (
                            <div style={{ fontSize: '10px', color: 'var(--dash-text-muted)', marginTop: '3px' }}>
                              Lunas: {formatDateID(p.paid_at)}
                            </div>
                          )}
                        </td>

                        {/* Bukti & Kwitansi */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {p.proof_url && (
                              <a
                                href={formatSafeImageUrl(p.proof_url)}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: '11.5px',
                                  color: '#2563eb',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <i className="ri-image-line" /> Bukti Transfer Klien
                              </a>
                            )}
                            {p.receipt_url && (
                              <a
                                href={p.receipt_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: '11.5px',
                                  color: '#10b981',
                                  textDecoration: 'none',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <i className="ri-file-text-line" /> Kwitansi Resmi Lunas
                              </a>
                            )}
                            {!p.proof_url && !p.receipt_url && (
                              <span style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)' }}>-</span>
                            )}
                          </div>
                        </td>

                        {/* Aksi */}
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                            {/* KLIEN ACTIONS */}
                            {isClient && (isUnpaid || isRejected) && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(p);
                                  setActiveModal('upload');
                                }}
                                icon="ri-upload-2-line"
                              >
                                {isRejected ? 'Unggah Ulang Bukti' : 'Upload Bukti'}
                              </Button>
                            )}

                            {isClient && isPaid && (
                              <a
                                href={p.receipt_url || '/main-assets/docs/Kwitansi-Resmi-DP-HaloBangun.pdf'}
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: 'none' }}
                              >
                                <Button variant="success" size="sm" icon="ri-download-2-line">
                                  Download Kwitansi
                                </Button>
                              </a>
                            )}

                            {/* FINANCE & OWNER ACTIONS */}
                            {isFinanceOrOwner && isPending && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(p);
                                  setActiveModal('verify');
                                }}
                                icon="ri-check-double-line"
                              >
                                Verifikasi Bayar
                              </Button>
                            )}

                            {isFinanceOrOwner && isPaid && (
                              <a
                                href={p.receipt_url || '/main-assets/docs/Kwitansi-Resmi-DP-HaloBangun.pdf'}
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: 'none' }}
                              >
                                <Button variant="outline" size="sm" icon="ri-eye-line">
                                  Lihat Kwitansi
                                </Button>
                              </a>
                            )}

                            {isFinanceOrOwner && !isPaid && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTermin(p.id, p.termin_name)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  fontSize: '15px',
                                }}
                                title="Hapus Termin"
                              >
                                <i className="ri-delete-bin-line" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< 768px) */}
          <div className="dash-mobile-cards d-none">
            {payments.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                Belum ada jadwal termin tagihan untuk proyek ini.
              </div>
            ) : (
              payments.map((p, idx) => {
                const isPaid = p.status === 'PAID';
                const isPending = p.status === 'PENDING_VERIFICATION';
                const isRejected = p.status === 'REJECTED';
                const isUnpaid = p.status === 'UNPAID';

                return (
                  <div key={p.id} className="dash-mobile-card-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', fontWeight: 700 }}>
                          TERMIN #{p.termin_number || idx + 1} • {p.percentage ? `${p.percentage}%` : '-'}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dash-text-main)', marginTop: '2px' }}>
                          {p.termin_name}
                        </div>
                      </div>
                      <div>
                        {isPaid && (
                          <Badge variant="success">
                            <i className="ri-checkbox-circle-line" /> Lunas
                          </Badge>
                        )}
                        {isPending && (
                          <Badge variant="warning">
                            <i className="ri-time-line" /> Verifikasi
                          </Badge>
                        )}
                        {isUnpaid && (
                          <Badge variant="neutral">
                            <i className="ri-error-warning-line" /> Belum Bayar
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="danger">
                            <i className="ri-close-circle-line" /> Ditolak
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--dash-muted-bg)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Nominal:</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: isPaid ? '#10b981' : '#f97316' }}>
                          {formatIDR(p.amount)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Jatuh Tempo:</div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{formatDateID(p.due_date)}</div>
                      </div>
                    </div>

                    {isRejected && p.rejection_reason && (
                      <div style={{ fontSize: '11.5px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', padding: '8px 10px', borderRadius: '6px' }}>
                        ⚠ Alasan Penolakan: {p.rejection_reason}
                      </div>
                    )}

                    {/* Bukti & Kwitansi */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
                      {p.proof_url && (
                        <a
                          href={formatSafeImageUrl(p.proof_url)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <i className="ri-image-line" /> Bukti Transfer
                        </a>
                      )}
                      {p.receipt_url && (
                        <a
                          href={p.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <i className="ri-file-text-line" /> Kwitansi Resmi
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {isClient && (isUnpaid || isRejected) && (
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setSelectedPayment(p);
                            setActiveModal('upload');
                          }}
                          icon="ri-upload-2-line"
                        >
                          {isRejected ? 'Unggah Ulang Bukti' : 'Upload Bukti'}
                        </Button>
                      )}

                      {isClient && isPaid && (
                        <a
                          href={p.receipt_url || '/main-assets/docs/Kwitansi-Resmi-DP-HaloBangun.pdf'}
                          target="_blank"
                          rel="noreferrer"
                          style={{ flex: 1, textDecoration: 'none' }}
                        >
                          <Button variant="success" size="sm" style={{ width: '100%' }} icon="ri-download-2-line">
                            Download Kwitansi
                          </Button>
                        </a>
                      )}

                      {isFinanceOrOwner && isPending && (
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setSelectedPayment(p);
                            setActiveModal('verify');
                          }}
                          icon="ri-check-double-line"
                        >
                          Verifikasi Bayar
                        </Button>
                      )}

                      {isFinanceOrOwner && isPaid && (
                        <a
                          href={p.receipt_url || '/main-assets/docs/Kwitansi-Resmi-DP-HaloBangun.pdf'}
                          target="_blank"
                          rel="noreferrer"
                          style={{ flex: 1, textDecoration: 'none' }}
                        >
                          <Button variant="outline" size="sm" style={{ width: '100%' }} icon="ri-eye-line">
                            Lihat Kwitansi
                          </Button>
                        </a>
                      )}

                      {isFinanceOrOwner && !isPaid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTermin(p.id, p.termin_name)}
                          icon="ri-delete-bin-line"
                          style={{ color: '#ef4444' }}
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================= MODAL 1: CLIENT UPLOADS TRANSFER PROOF ================= */}
      {activeModal === 'upload' && selectedPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              background: 'var(--dash-card-bg)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              border: '1px solid var(--dash-border)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                Upload Bukti Transfer Pembayaran
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--dash-text-muted)' }}
              >
                ×
              </button>
            </div>

            <div style={{ background: 'var(--dash-muted-bg)', padding: '14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
              <div>Termin: <strong>{selectedPayment.termin_name}</strong></div>
              <div style={{ marginTop: '4px' }}>
                Nominal Tagihan: <strong style={{ color: '#f97316', fontSize: '15px' }}>{formatIDR(selectedPayment.amount)}</strong>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
                Rekening Resmi: <strong>Bank Mandiri 137-00-1234567-8</strong> a.n. PT Halo Bangun Indonesia
              </div>
            </div>

            <form onSubmit={handleUploadProof} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Pilih Berkas Bukti Transfer (Gambar JPG/PNG atau PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)}>
                  Batal
                </Button>
                <Button variant="primary" type="submit" loading={uploading} icon="ri-upload-cloud-line">
                  {uploading ? 'Mengunggah...' : 'Kirim Bukti Transfer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: FINANCE VERIFIES PAYMENT & PUBLISHES RECEIPT ================= */}
      {activeModal === 'verify' && selectedPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              background: 'var(--dash-card-bg)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '540px',
              width: '100%',
              border: '1px solid var(--dash-border)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                Verifikasi Pembayaran & Terbitkan Kwitansi Resmi
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--dash-text-muted)' }}
              >
                ×
              </button>
            </div>

            <div style={{ background: 'var(--dash-muted-bg)', padding: '14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
              <div>Termin: <strong>{selectedPayment.termin_name}</strong></div>
              <div>Nominal: <strong style={{ color: '#10b981', fontSize: '15px' }}>{formatIDR(selectedPayment.amount)}</strong></div>
              {selectedPayment.proof_url && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={formatSafeImageUrl(selectedPayment.proof_url)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      textDecoration: 'none',
                    }}
                  >
                    <i className="ri-external-link-line" /> Buka & Periksa Bukti Transfer Klien
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyPaid} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Unggah Berkas Kwitansi Resmi (PDF/Gambar - Opsional jika menggunakan template default)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <Button
                  variant="outline"
                  type="button"
                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  onClick={() => setActiveModal('reject')}
                  icon="ri-close-circle-line"
                >
                  Tolak Bukti Bayar
                </Button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="ghost" type="button" onClick={() => setActiveModal(null)}>
                    Batal
                  </Button>
                  <Button variant="success" type="submit" loading={uploading} icon="ri-check-double-line">
                    {uploading ? 'Memproses...' : 'Konfirmasi Lunas & Simpan'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: FINANCE REJECTS TRANSFER PROOF ================= */}
      {activeModal === 'reject' && selectedPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              background: 'var(--dash-card-bg)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              border: '1px solid var(--dash-border)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ef4444' }}>
                Tolak Bukti Transfer Pembayaran
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--dash-text-muted)' }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--dash-text-muted)', margin: '0 0 14px 0' }}>
              Berikan alasan penolakan agar Klien dapat memperbaiki dan mengunggah ulang bukti transfer yang benar.
            </p>

            <form onSubmit={handleRejectProof} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Alasan Penolakan <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Nominal transfer kurang dari tagihan, atau bukti struk buram/tidak terbaca."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-muted-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '12.5px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)}>
                  Batal
                </Button>
                <Button variant="danger" type="submit" loading={uploading} icon="ri-close-line">
                  {uploading ? 'Memproses...' : 'Tolak Bukti Transfer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: FINANCE ADDS NEW TERMIN ================= */}
      {activeModal === 'add' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              background: 'var(--dash-card-bg)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              border: '1px solid var(--dash-border)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                Tambah Jadwal Tagihan Termin Baru
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--dash-text-muted)' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddTermin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Nama Tahapan Termin <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Termin 3 (Pekerjaan Atap 20%)"
                  value={newTermin.terminName}
                  onChange={(e) => setNewTermin({ ...newTermin, terminName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-card-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Persentase (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={newTermin.percentage}
                    onChange={(e) => {
                      const p = parseFloat(e.target.value) || 0;
                      setNewTermin({
                        ...newTermin,
                        percentage: p,
                        amount: Math.round((p / 100) * finalContractTotal),
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-card-bg)',
                      color: 'var(--dash-text-main)',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Nominal Tagihan (Rp)
                  </label>
                  <input
                    type="number"
                    value={newTermin.amount}
                    onChange={(e) => setNewTermin({ ...newTermin, amount: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-card-bg)',
                      color: 'var(--dash-text-main)',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Tanggal Jatuh Tempo (Opsional)
                </label>
                <input
                  type="date"
                  value={newTermin.dueDate}
                  onChange={(e) => setNewTermin({ ...newTermin, dueDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-card-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Catatan Syarat Penagihan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ditagihkan saat rangka atap baja ringan terpasang"
                  value={newTermin.notes}
                  onChange={(e) => setNewTermin({ ...newTermin, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--dash-border)',
                    background: 'var(--dash-card-bg)',
                    color: 'var(--dash-text-main)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)}>
                  Batal
                </Button>
                <Button variant="primary" type="submit" loading={uploading} icon="ri-check-line">
                  {uploading ? 'Menyimpan...' : 'Terbitkan Tagihan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
