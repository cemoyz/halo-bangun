'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { PaymentScheduleTable } from '@/components/dashboard/PaymentScheduleTable';

interface Project {
  id: number;
  name: string;
  category: string;
  location: string;
  contract_value: number;
  status: string;
  addendums: Array<{ id: number; cost_difference: number; status: string }>;
  materialPurchases: Array<{ id: number; total_price: number }>;
  payrolls: Array<{ id: number; total_amount: number }>;
}

interface Allocation {
  id: number;
  project_id: number;
  real_cost: number;
  net_profit: number;
  tax_amount: number;
  zakat_amount: number;
  operational_amount: number;
  mitigation_fund: number;
  business_dev_fund: number;
  debt_receivable_notes?: string | null;
  project: { name: string; contract_value: number };
}

interface Payment {
  id: number;
  project_id: number;
  termin_name: string;
  amount: number;
  status: string;
  due_date?: string | null;
  paid_at?: string | null;
  proof_url?: string | null;
  receipt_url?: string | null;
  notes?: string | null;
  project: { name: string };
}

interface MaterialItem {
  id: number;
  project_id: number;
  item_name: string;
  quantity: string;
  store_name: string;
  store_wa?: string | null;
  total_price: number;
  receipt_url?: string | null;
  input_by_role: string;
  purchase_date: string | Date;
  project: { name: string };
}

interface Addendum {
  id: number;
  project_id: number;
  description: string;
  cost_difference: number;
  status: string;
  createdAt: string | Date;
  project: { name: string };
}

interface PayrollItem {
  id: number;
  user_id: number;
  project_id?: number | null;
  period: string;
  base_salary: number;
  operational_allowance: number;
  bonus: number;
  total_amount: number;
  status: string;
  slip_url?: string | null;
  user: { name: string; role: string };
}

interface UserEmployee {
  id: number;
  name: string;
  role: string;
}

interface Props {
  projects: Project[];
  initialAllocations: Allocation[];
  initialPayments: Payment[];
  initialMaterials: MaterialItem[];
  initialAddendums: Addendum[];
  initialPayrolls: PayrollItem[];
  employees: UserEmployee[];
}

export default function FinanceDashboardConsole({
  projects,
  initialAllocations,
  initialPayments,
  initialMaterials,
  initialAddendums,
  initialPayrolls,
  employees,
}: Props) {
  const [activeTab, setActiveTab] = useState<'rab_vs_real' | 'allocator' | 'materials' | 'termin' | 'addendums' | 'payroll'>('rab_vs_real');

  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [addendums, setAddendums] = useState<Addendum[]>(initialAddendums);
  const [payrolls, setPayrolls] = useState<PayrollItem[]>(initialPayrolls);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

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

  // 1. Allocator Form State
  const [allocProjectId, setAllocProjectId] = useState<number>(projects[0]?.id || 0);
  const selectedAllocProject = projects.find((p) => p.id === allocProjectId) || projects[0];
  const [allocForm, setAllocForm] = useState({
    realCost: '635000000',
    netProfit: '130000000',
    taxAmount: '17000000',
    zakatAmount: '3250000',
    operationalAmount: '35000000',
    mitigationFund: '15000000',
    businessDevFund: '14750000',
    debtReceivableNotes: 'Piutang Termin 3 belum cair. Hutang toko material nihil.',
  });

  const autoComputeAllocation = () => {
    if (!selectedAllocProject) return;
    const contract = selectedAllocProject.contract_value;
    const estRealCost = parseFloat(allocForm.realCost) || contract * 0.75;
    const net = contract - estRealCost;
    setAllocForm({
      realCost: String(estRealCost),
      netProfit: String(Math.max(net, 0)),
      taxAmount: String(contract * 0.02),
      zakatAmount: String(Math.max(net * 0.025, 0)),
      operationalAmount: String(contract * 0.05),
      mitigationFund: String(contract * 0.02),
      businessDevFund: String(contract * 0.02),
      debtReceivableNotes: allocForm.debtReceivableNotes || 'Kalkulasi otomatis proporsional',
    });
  };

  const submitAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: allocProjectId,
          ...allocForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setStatusMsg({ type: 'success', text: data.message });
      // Update local allocations list
      const idx = allocations.findIndex((a) => a.project_id === allocProjectId);
      if (idx >= 0) {
        const next = [...allocations];
        next[idx] = data.allocation;
        setAllocations(next);
      } else {
        setAllocations([...allocations, data.allocation]);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 2. Termin & Payment Verification State
  const [newTerminForm, setNewTerminForm] = useState({
    projectId: projects[0]?.id || '',
    terminName: '',
    amount: '',
    dueDate: '',
    notes: '',
  });

  const [verifyModalPayment, setVerifyModalPayment] = useState<Payment | null>(null);
  const [receiptUploadUrl, setReceiptUploadUrl] = useState('');
  const [uploadingReceiptFile, setUploadingReceiptFile] = useState(false);

  const submitNewTermin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerminForm.terminName || !newTerminForm.amount) {
      setStatusMsg({ type: 'error', text: 'Nama termin dan nominal tagihan wajib diisi.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTerminForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setPayments([...payments, data.payment]);
      setNewTerminForm({ projectId: projects[0]?.id || '', terminName: '', amount: '', dueDate: '', notes: '' });
      setStatusMsg({ type: 'success', text: data.message });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPaid = async (paymentId: number) => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'verify_paid',
          receiptUrl: receiptUploadUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setPayments(payments.map((p) => (p.id === paymentId ? data.payment : p)));
      setVerifyModalPayment(null);
      setReceiptUploadUrl('');
      let msg = data.message;
      if (data.bastUnlocked) {
        msg += ' 🔓 Seluruh syarat terpenuhi: BAST dan Garansi proyek otomatis TERBUKA bagi Klien!';
      }
      setStatusMsg({ type: 'success', text: msg });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 3. Addendum Cost Forwarding State
  const [editingAddendumId, setEditingAddendumId] = useState<number | null>(null);
  const [adjustedAddendumCost, setAdjustedAddendumCost] = useState('');

  const handleForwardAddendum = async (id: number) => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/addendums/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finance_forward',
          costDifference: adjustedAddendumCost ? parseFloat(adjustedAddendumCost) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setAddendums(addendums.map((a) => (a.id === id ? data.addendum : a)));
      setEditingAddendumId(null);
      setStatusMsg({ type: 'success', text: data.message });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 4. Payroll Creation State
  const [payrollForm, setPayrollForm] = useState({
    userId: employees[0]?.id || '',
    projectId: projects[0]?.id || '',
    period: 'November 2026',
    baseSalary: '',
    operationalAllowance: '',
    bonus: '',
    slipUrl: '',
    slipName: '',
  });
  const [uploadingSlip, setUploadingSlip] = useState(false);

  const submitPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollForm.userId || !payrollForm.baseSalary) {
      setStatusMsg({ type: 'error', text: 'Karyawan dan gaji pokok wajib diisi.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/payrolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payrollForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setPayrolls([data.payroll, ...payrolls]);
      setPayrollForm({
        userId: employees[0]?.id || '',
        projectId: projects[0]?.id || '',
        period: 'November 2026',
        baseSalary: '',
        operationalAllowance: '',
        bonus: '',
        slipUrl: '',
        slipName: '',
      });
      setStatusMsg({ type: 'success', text: data.message });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Status Alert Banner */}
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

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {[
          { key: 'rab_vs_real', label: 'RAB vs Biaya Riil', icon: 'ri-scales-3-line' },
          { key: 'allocator', label: 'Kalkulator Alokasi (FR-18)', icon: 'ri-calculator-line' },
          { key: 'termin', label: 'Termin & Kwitansi', icon: 'ri-bank-card-line', count: payments.filter((p) => p.status === 'PENDING_VERIFICATION').length },
          { key: 'addendums', label: 'Kalkulasi Addendum (COR)', icon: 'ri-file-edit-line', count: addendums.filter((a) => a.status === 'PENDING_FINANCE').length },
          { key: 'materials', label: 'Verifikasi Nota Material', icon: 'ri-shopping-cart-line', count: materials.length },
          { key: 'payroll', label: 'Manajemen Payroll', icon: 'ri-money-dollar-box-line', count: payrolls.length },
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
                    background: isActive ? 'rgba(255,255,255,0.3)' : '#ef4444',
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

      {/* Tab 1: RAB VS BIAYA RIIL (TABEL PERBANDINGAN OTOMATIS) */}
      {activeTab === 'rab_vs_real' && (
        <Card>
          <CardHeader>
            <CardTitle icon="ri-scales-3-line">
              Perbandingan Otomatis: RAB Awal (+ Addendum Approved) vs Realisasi Pengeluaran Riil
            </CardTitle>
            <Badge variant="info">Otomatis Terintegrasi</Badge>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                    <th style={{ padding: '12px 16px' }}>Proyek</th>
                    <th style={{ padding: '12px 16px' }}>RAB Dasar</th>
                    <th style={{ padding: '12px 16px' }}>Addendum (Approved)</th>
                    <th style={{ padding: '12px 16px' }}>Total Anggaran RAB</th>
                    <th style={{ padding: '12px 16px' }}>Pengeluaran Riil</th>
                    <th style={{ padding: '12px 16px' }}>Sisa Anggaran (Varian)</th>
                    <th style={{ padding: '12px 16px' }}>Status Efisiensi</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const approvedAddendumsTotal = p.addendums
                      .filter((a) => a.status === 'APPROVED')
                      .reduce((sum, a) => sum + a.cost_difference, 0);

                    const totalRevisedBudget = p.contract_value + approvedAddendumsTotal;

                    // Real cost sum from material + payrolls
                    const totalMaterials = p.materialPurchases.reduce((sum, m) => sum + m.total_price, 0);
                    const totalPayrolls = p.payrolls.reduce((sum, pay) => sum + pay.total_amount, 0);
                    const realCostTotal = totalMaterials + totalPayrolls;

                    const variance = totalRevisedBudget - realCostTotal;
                    const isSurplus = variance >= 0;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>{p.location}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{formatIDR(p.contract_value)}</td>
                        <td style={{ padding: '14px 16px', color: approvedAddendumsTotal > 0 ? '#10b981' : 'inherit' }}>
                          {approvedAddendumsTotal > 0 ? `+ ${formatIDR(approvedAddendumsTotal)}` : 'Rp 0'}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#f97316' }}>
                          {formatIDR(totalRevisedBudget)}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#ef4444', fontWeight: 600 }}>
                          {formatIDR(realCostTotal)}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: isSurplus ? '#10b981' : '#ef4444' }}>
                          {isSurplus ? `+ ${formatIDR(variance)}` : `- ${formatIDR(Math.abs(variance))}`}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {isSurplus ? (
                            <Badge variant="success">✓ Efisien ({((variance / (totalRevisedBudget || 1)) * 100).toFixed(1)}% Sisa)</Badge>
                          ) : (
                            <Badge variant="danger">⚠️ Over Budget</Badge>
                          )}
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

      {/* Tab 2: KALKULATOR ALOKASI PROYEK (FR-18) */}
      {activeTab === 'allocator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Form Kalkulator */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-calculator-line">Kalkulator Pos Keuangan Proyek (FR-18)</CardTitle>
              <Button size="sm" variant="secondary" onClick={autoComputeAllocation}>
                ⚡ Auto Hitung Proporsional
              </Button>
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              <form onSubmit={submitAllocation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Pilih Proyek Konstruksi
                  </label>
                  <select
                    value={allocProjectId}
                    onChange={(e) => setAllocProjectId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-muted-bg)',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Kontrak: {formatIDR(p.contract_value)})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Realisasi Biaya Riil (Rp)
                    </label>
                    <input
                      type="number"
                      value={allocForm.realCost}
                      onChange={(e) => setAllocForm({ ...allocForm, realCost: e.target.value })}
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
                      Laba Bersih Proyek (Rp)
                    </label>
                    <input
                      type="number"
                      value={allocForm.netProfit}
                      onChange={(e) => setAllocForm({ ...allocForm, netProfit: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#10b981',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Kewajiban Pajak (PPh/PPN 2%)
                    </label>
                    <input
                      type="number"
                      value={allocForm.taxAmount}
                      onChange={(e) => setAllocForm({ ...allocForm, taxAmount: e.target.value })}
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
                      Alokasi Zakat Perusahaan (2.5%)
                    </label>
                    <input
                      type="number"
                      value={allocForm.zakatAmount}
                      onChange={(e) => setAllocForm({ ...allocForm, zakatAmount: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--dash-border)',
                        background: 'var(--dash-muted-bg)',
                        fontSize: '13px',
                        color: '#059669',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Operasional Kantor (5%)
                    </label>
                    <input
                      type="number"
                      value={allocForm.operationalAmount}
                      onChange={(e) => setAllocForm({ ...allocForm, operationalAmount: e.target.value })}
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
                      Dana Mitigasi Risiko (2%)
                    </label>
                    <input
                      type="number"
                      value={allocForm.mitigationFund}
                      onChange={(e) => setAllocForm({ ...allocForm, mitigationFund: e.target.value })}
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
                    Dana Pengembangan Usaha (2%)
                  </label>
                  <input
                    type="number"
                    value={allocForm.businessDevFund}
                    onChange={(e) => setAllocForm({ ...allocForm, businessDevFund: e.target.value })}
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
                    Pencatatan Hutang & Piutang per Proyek
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Piutang termin 3 Rp 84.000.000 menunggu pelunasan saat BAST. Tidak ada hutang ke toko material."
                    value={allocForm.debtReceivableNotes}
                    onChange={(e) => setAllocForm({ ...allocForm, debtReceivableNotes: e.target.value })}
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

                <Button variant="primary" type="submit" disabled={loading} icon="ri-save-line">
                  {loading ? 'Menyimpan...' : 'Simpan Alokasi Finansial (FR-18)'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Pos Alokasi Rekap */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-pie-chart-line">Rekap Alokasi Tercatat</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {allocations.map((al) => (
                  <div
                    key={al.id}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: 'var(--dash-muted-bg)',
                      border: '1px solid var(--dash-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                        {al.project.name}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>
                        Laba: {formatIDR(al.net_profit)}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                      <div>Biaya Riil: {formatIDR(al.real_cost)}</div>
                      <div>Pajak: {formatIDR(al.tax_amount)}</div>
                      <div>Zakat: {formatIDR(al.zakat_amount)}</div>
                      <div>Mitigasi: {formatIDR(al.mitigation_fund)}</div>
                    </div>
                    {al.debt_receivable_notes && (
                      <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)', marginTop: '8px', borderTop: '1px solid var(--dash-border)', paddingTop: '6px' }}>
                        📌 {al.debt_receivable_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: MANAJEMEN TERMIN & KWITANSI RESMI */}
      {activeTab === 'termin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--dash-text-main)' }}>
                Manajemen Termin Penagihan & Verifikasi Kwitansi
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--dash-text-muted)', margin: '4px 0 0 0' }}>
                Verifikasi bukti transfer dari klien, unggah kwitansi resmi, dan kelola jadwal penagihan bertahap.
              </p>
            </div>
            <a href="/dashboard/payments" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" icon="ri-external-link-line">
                Buka Modul Termin & Kwitansi Penuh
              </Button>
            </a>
          </div>

          <PaymentScheduleTable
            payments={payments as any}
            userRole="FINANCE"
            projectId={Number(newTerminForm.projectId) || projects[0]?.id || 1}
            finalContractTotal={projects.find((p) => p.id === Number(newTerminForm.projectId))?.contract_value || 0}
            onRefresh={() => window.location.reload()}
          />
        </div>
      )}

      {/* Modal Upload Kwitansi & Verifikasi */}
      {verifyModalPayment && (
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
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
              Verifikasi Pelunasan Termin & Terbitkan Kwitansi
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--dash-text-muted)', margin: '0 0 16px 0' }}>
              Memverifikasi <strong>{verifyModalPayment.termin_name}</strong> senilai{' '}
              <strong style={{ color: '#10b981' }}>{formatIDR(verifyModalPayment.amount)}</strong>.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Unggah File Kwitansi Resmi Halo Bangun (PDF / JPG)
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingReceiptFile(true);
                  try {
                    const res = await handleFileUpload(file, 'receipts');
                    setReceiptUploadUrl(res.url);
                  } catch (err: any) {
                    setStatusMsg({ type: 'error', text: err.message });
                  } finally {
                    setUploadingReceiptFile(false);
                  }
                }}
                style={{ fontSize: '12px' }}
              />
              {uploadingReceiptFile && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '4px' }}>Mengunggah kwitansi...</div>}
              {receiptUploadUrl && <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>✓ File Kwitansi Siap Diterbitkan</div>}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setVerifyModalPayment(null)}>
                Batal
              </Button>
              <Button
                variant="success"
                onClick={() => handleVerifyPaid(verifyModalPayment.id)}
                disabled={loading}
                icon="ri-check-line"
              >
                {loading ? 'Memverifikasi...' : 'Konfirmasi Lunas & Terbitkan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: KALKULASI BIAYA ADDENDUM (COR) */}
      {activeTab === 'addendums' && (
        <Card>
          <CardHeader>
            <CardTitle icon="ri-file-edit-line">Kalkulasi Draf Addendum (Pekerjaan Tambah/Kurang dari PM)</CardTitle>
            <Badge variant="warning">Verifikasi Biaya Finance</Badge>
          </CardHeader>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {addendums.map((ad) => (
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
                        {ad.project.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>
                        Diajukan pada: {new Date(ad.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <Badge variant={ad.status === 'APPROVED' ? 'success' : ad.status === 'PENDING_CLIENT' ? 'info' : 'warning'}>
                      {ad.status}
                    </Badge>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--dash-text-main)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    "{ad.description}"
                  </p>

                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#f97316', marginBottom: '12px' }}>
                    Estimasi Selisih Biaya: {ad.cost_difference >= 0 ? `+ ${formatIDR(ad.cost_difference)}` : formatIDR(ad.cost_difference)}
                  </div>

                  {ad.status === 'PENDING_FINANCE' && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Koreksi Nominal (Rp)"
                        defaultValue={ad.cost_difference}
                        onChange={(e) => setAdjustedAddendumCost(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--dash-border)',
                          background: 'var(--dash-card-bg)',
                          fontSize: '13px',
                          width: '180px',
                        }}
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleForwardAddendum(ad.id)}
                        disabled={loading}
                        icon="ri-send-plane-line"
                      >
                        Kirim ke Klien untuk Persetujuan
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: VERIFIKASI NOTA MATERIAL */}
      {activeTab === 'materials' && (
        <Card>
          <CardHeader>
            <CardTitle icon="ri-shopping-cart-line">Verifikasi Pembelian Material & Nota Lapangan</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                    <th style={{ padding: '12px 16px' }}>Proyek</th>
                    <th style={{ padding: '12px 16px' }}>Nama Barang</th>
                    <th style={{ padding: '12px 16px' }}>Kuantitas</th>
                    <th style={{ padding: '12px 16px' }}>Toko & WA</th>
                    <th style={{ padding: '12px 16px' }}>Total Biaya</th>
                    <th style={{ padding: '12px 16px' }}>Input Oleh</th>
                    <th style={{ padding: '12px 16px' }}>Foto Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{m.project.name}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{m.item_name}</td>
                      <td style={{ padding: '12px 16px' }}>{m.quantity}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{m.store_name}</div>
                        {m.store_wa && <div style={{ fontSize: '11px', color: '#10b981' }}>WA: {m.store_wa}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                        {formatIDR(m.total_price)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge variant="neutral">{m.input_by_role}</Badge>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {m.receipt_url ? (
                          <a
                            href={m.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#f97316', fontWeight: 700, textDecoration: 'none' }}
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
          </CardContent>
        </Card>
      )}

      {/* Tab 6: MANAJEMEN PAYROLL PEGAWAI */}
      {activeTab === 'payroll' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Form Buat Slip Gaji */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-user-add-line">Input Slip Gaji Pegawai / Mandor / PM</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '20px' }}>
              <form onSubmit={submitPayroll} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Pilih Pegawai / Mandor / PM <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={payrollForm.userId}
                    onChange={(e) => setPayrollForm({ ...payrollForm, userId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--dash-border)',
                      background: 'var(--dash-muted-bg)',
                      fontSize: '13px',
                    }}
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Periode Gaji
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: November 2026"
                      value={payrollForm.period}
                      onChange={(e) => setPayrollForm({ ...payrollForm, period: e.target.value })}
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
                      Gaji Pokok (Rp) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 6000000"
                      value={payrollForm.baseSalary}
                      onChange={(e) => setPayrollForm({ ...payrollForm, baseSalary: e.target.value })}
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
                      Tunjangan Operasional (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 1500000"
                      value={payrollForm.operationalAllowance}
                      onChange={(e) => setPayrollForm({ ...payrollForm, operationalAllowance: e.target.value })}
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
                      Bonus Kerajinan / Progres (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 500000"
                      value={payrollForm.bonus}
                      onChange={(e) => setPayrollForm({ ...payrollForm, bonus: e.target.value })}
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
                    Unggah Bukti Slip Gaji (PDF)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingSlip(true);
                      try {
                        const res = await handleFileUpload(file, 'slips');
                        setPayrollForm((prev) => ({
                          ...prev,
                          slipUrl: res.url,
                          slipName: file.name,
                        }));
                      } catch (err: any) {
                        setStatusMsg({ type: 'error', text: err.message });
                      } finally {
                        setUploadingSlip(false);
                      }
                    }}
                    style={{ fontSize: '12px' }}
                  />
                  {uploadingSlip && <div style={{ fontSize: '11px', color: '#f97316', marginTop: '4px' }}>Mengunggah slip...</div>}
                  {payrollForm.slipName && <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>✓ {payrollForm.slipName}</div>}
                </div>

                <Button variant="primary" type="submit" disabled={loading} icon="ri-check-line">
                  {loading ? 'Menyimpan...' : 'Simpan & Terbitkan Slip Gaji'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Rekap Slip Gaji Terbit */}
          <Card>
            <CardHeader>
              <CardTitle icon="ri-file-list-3-line">Daftar Payroll Pegawai</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                      <th style={{ padding: '10px 14px' }}>Pegawai</th>
                      <th style={{ padding: '10px 14px' }}>Periode</th>
                      <th style={{ padding: '10px 14px' }}>Total Gaji</th>
                      <th style={{ padding: '10px 14px' }}>Slip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((py) => (
                      <tr key={py.id} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>{py.user.name}</div>
                          <Badge variant="neutral">{py.user.role}</Badge>
                        </td>
                        <td style={{ padding: '10px 14px' }}>{py.period}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#10b981' }}>
                          {formatIDR(py.total_amount)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {py.slip_url ? (
                            <a
                              href={py.slip_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}
                            >
                              Unduh Slip 📄
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

