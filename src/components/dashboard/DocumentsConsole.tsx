'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { formatIDR, terbilang } from '@/lib/currency';

interface Project {
  id: number;
  name: string;
  category: string;
  location: string;
  contract_value: number;
  status: string;
  bast_unlocked: boolean;
  client?: { id: number; name: string; email: string } | null;
  pm?: { id: number; name: string } | null;
  startDate?: string | Date | null;
  targetCompletionDate?: string | Date | null;
  warrantyClaims?: WarrantyClaimItem[];
}

interface WarrantyClaimItem {
  id: number;
  project_id: number;
  claim_date: string | Date;
  item_name: string;
  description?: string | null;
  status: string;
  repaired_at?: string | Date | null;
  notes?: string | null;
}

interface PayrollItem {
  id: number;
  user_id: number;
  period: string;
  base_salary: number;
  bonus?: number;
  total_amount: number;
  status: string;
  paid_date: string | Date;
  user: { id: number; name: string; role: string };
  breakdown?: any;
}

interface UserOption {
  id: number;
  name: string;
  role: string;
}

interface Props {
  projects: Project[];
  payrolls: PayrollItem[];
  employees: UserOption[];
  userRole: string;
  currentUserId: number;
}

export default function DocumentsConsole({
  projects,
  payrolls,
  employees,
  userRole,
  currentUserId,
}: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState<number>(projects[0]?.id || 1);
  const [activeTab, setActiveTab] = useState<'bast' | 'warranty' | 'spkpr' | 'slip_gaji'>('bast');
  
  // Warranty form state
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaimItem[]>(
    projects.flatMap((p) => p.warrantyClaims || [])
  );
  const [newClaimItem, setNewClaimItem] = useState('');
  const [newClaimDesc, setNewClaimDesc] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  // Selected payroll state
  const [selectedPayrollId, setSelectedPayrollId] = useState<number>(payrolls[0]?.id || 0);

  // New slip form state (Finance & Owner)
  const [showSlipForm, setShowSlipForm] = useState(false);
  const [slipForm, setSlipForm] = useState({
    userId: employees[0]?.id || 1,
    period: 'November 2026',
    nik: 'AIG-2024-099',
    jobTitle: 'Mandor Proyek Konstruksi',
    bankAccount: 'Bank BCA - 869-092-1823',
    // 10 Earnings
    baseSalary: 4500000,
    allowanceJabatan: 750000,
    mealAllowance: 650000,
    transportAllowance: 400000,
    tenureAllowance: 200000,
    educationAllowance: 0,
    functionalAllowance: 0,
    overtime: 350000,
    otherAllowance: 200000,
    bonus: 500000,
    // 8 Deductions
    lateDeduction: 0,
    pph21: 125000,
    bpjsTk: 85000,
    bpjsKes: 45000,
    loanInstallment: 0,
    cashBon: 0,
    otherDeduction: 0,
    socialFund: 20000,
  });

  const fallbackProject: Project = {
    id: 1,
    name: 'Proyek Halo Bangun',
    category: 'Konstruksi',
    location: 'Sleman, D.I. Yogyakarta',
    contract_value: 0,
    status: 'ONGOING',
    bast_unlocked: false,
    client: { id: 1, name: 'Klien Terdaftar', email: 'klien@halobangun.id' },
    warrantyClaims: [],
  };

  const selectedProject = (projects && projects.length > 0)
    ? (projects.find((p) => p.id === selectedProjectId) || projects[0])
    : fallbackProject;
  const projectClaims = warrantyClaims.filter((c) => c.project_id === (selectedProject?.id || selectedProjectId));

  // Current selected payroll item
  const currentPayroll = (payrolls && payrolls.length > 0)
    ? (payrolls.find((p) => p.id === selectedPayrollId) || payrolls[0])
    : null;

  // Calculate slip totals
  const totalEarnings =
    Number(slipForm.baseSalary) +
    Number(slipForm.allowanceJabatan) +
    Number(slipForm.mealAllowance) +
    Number(slipForm.transportAllowance) +
    Number(slipForm.tenureAllowance) +
    Number(slipForm.educationAllowance) +
    Number(slipForm.functionalAllowance) +
    Number(slipForm.overtime) +
    Number(slipForm.otherAllowance) +
    Number(slipForm.bonus);

  const totalDeductions =
    Number(slipForm.lateDeduction) +
    Number(slipForm.pph21) +
    Number(slipForm.bpjsTk) +
    Number(slipForm.bpjsKes) +
    Number(slipForm.loanInstallment) +
    Number(slipForm.cashBon) +
    Number(slipForm.otherDeduction) +
    Number(slipForm.socialFund);

  const netSalary = Math.max(0, totalEarnings - totalDeductions);

  const handlePrint = () => {
    window.print();
  };

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimItem.trim()) return;
    setClaimLoading(true);
    try {
      const res = await fetch('/api/warranty-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProjectId,
          item_name: newClaimItem,
          description: newClaimDesc,
        }),
      });
      const data = await res.json();
      if (data.claim) {
        setWarrantyClaims([data.claim, ...warrantyClaims]);
        setNewClaimItem('');
        setNewClaimDesc('');
        alert('Klaim perbaikan masa garansi berhasil dikirimkan ke tim pengawas!');
      } else {
        alert(data.error || 'Gagal menambahkan klaim perbaikan.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleUpdateClaimStatus = async (claimId: number, status: string, notes?: string) => {
    try {
      const res = await fetch('/api/warranty-claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: claimId, status, notes }),
      });
      const data = await res.json();
      if (data.claim) {
        setWarrantyClaims(
          warrantyClaims.map((c) => (c.id === claimId ? { ...c, status, notes: notes || c.notes } : c))
        );
      }
    } catch (err: any) {
      alert('Gagal memperbarui status perbaikan: ' + err.message);
    }
  };

  const handleSaveSlipGaji = async (e: React.FormEvent) => {
    e.preventDefault();
    const employee = employees.find((emp) => emp.id === Number(slipForm.userId));
    const breakdown = {
      nik: slipForm.nik,
      job_title: slipForm.jobTitle,
      company_name: 'PT. AULIA INDOLAND GRUP',
      period: slipForm.period,
      bank_account: slipForm.bankAccount,
      earnings: {
        base_salary: Number(slipForm.baseSalary),
        allowance_jabatan: Number(slipForm.allowanceJabatan),
        meal_allowance: Number(slipForm.mealAllowance),
        transport_allowance: Number(slipForm.transportAllowance),
        tenure_allowance: Number(slipForm.tenureAllowance),
        education_allowance: Number(slipForm.educationAllowance),
        functional_allowance: Number(slipForm.functionalAllowance),
        overtime: Number(slipForm.overtime),
        other_allowance: Number(slipForm.otherAllowance),
        bonus: Number(slipForm.bonus),
        total_gross: totalEarnings,
      },
      deductions: {
        late_deduction: Number(slipForm.lateDeduction),
        pph21: Number(slipForm.pph21),
        bpjs_tk: Number(slipForm.bpjsTk),
        bpjs_kes: Number(slipForm.bpjsKes),
        loan_installment: Number(slipForm.loanInstallment),
        cash_bon: Number(slipForm.cashBon),
        other_deduction: Number(slipForm.otherDeduction),
        social_fund: Number(slipForm.socialFund),
        total_deduction: totalDeductions,
      },
      net_salary: netSalary,
      terbilang: terbilang(netSalary),
      signature_place: 'Yogyakarta',
      signature_date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };

    try {
      const res = await fetch('/api/payrolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: slipForm.userId,
          projectId: selectedProjectId,
          period: slipForm.period,
          baseSalary: slipForm.baseSalary,
          operationalAllowance: slipForm.allowanceJabatan + slipForm.mealAllowance + slipForm.transportAllowance,
          bonus: slipForm.bonus,
          totalAmount: netSalary,
          breakdown,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Slip gaji resmi PT. AIG untuk ${employee?.name} berhasil diterbitkan!`);
        window.location.reload();
      } else {
        alert(data.error || 'Gagal menyimpan slip gaji');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Print CSS isolated for professional A4 documentation */}
      <style jsx global>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          nav,
          aside,
          header,
          .no-print,
          .dash-sidebar,
          .dash-header,
          .print-hide {
            display: none !important;
          }
          .printable-doc {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .printable-page {
            page-break-after: always;
          }
        }
      `}</style>

      {/* Top Header & Project Selector (Hidden on Print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          padding: '20px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                background: '#f97316',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Standar Dokumen Resmi
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>PT. Aulia Indoland Grup • Halo Bangun</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
            Pusat Dokumen Kontrak, BAST, Garansi & Payroll
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>
            Format sah berkekuatan hukum sesuai dokumen SPKPR, Berita Acara Serah Terima 60 Hari, Form Garansi, dan Slip Gaji PT. AIG.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
              PILIH PROYEK AKTIF:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#334155',
                color: '#fff',
                border: '1px solid #475569',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status === 'COMPLETED' ? 'Selesai & Lunas' : 'Konstruksi Berjalan'})
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handlePrint}
            variant="primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: '#f97316',
              border: 'none',
              fontWeight: 700,
            }}
          >
            <i className="ri-printer-line" style={{ fontSize: '16px' }}></i> Cetak Dokumen (A4)
          </Button>
        </div>
      </div>

      {/* Tabs Navigation (Hidden on Print) */}
      <div className="no-print dash-tabs-responsive-grid">
        {[
          { key: 'bast', label: '1. Berita Acara Serah Terima (BAST)', icon: 'ri-file-shield-line' },
          { key: 'warranty', label: '2. Form Garansi Retensi (60 Hari)', icon: 'ri-tools-line' },
          { key: 'spkpr', label: '3. Surat Perjanjian Kerja (SPKPR)', icon: 'ri-draft-line' },
          { key: 'slip_gaji', label: '4. Slip Gaji PT. AIG (Resmi)', icon: 'ri-money-dollar-circle-line' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="dash-tab-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderColor: isActive ? '#f97316' : 'var(--dash-border)',
                background: isActive ? '#f97316' : 'var(--dash-card-bg)',
                color: isActive ? '#ffffff' : 'var(--dash-text-muted)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <i className={tab.icon} style={{ fontSize: '15px', flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'center' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BERITA ACARA SERAH TERIMA BANGUNAN (BAST)         */}
      {/* ======================================================== */}
      {activeTab === 'bast' && (
        <div>
          {/* Status Alert Banner */}
          <div
            className="no-print"
            style={{
              padding: '14px 18px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: selectedProject.bast_unlocked
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(234, 179, 8, 0.1)',
              border: `1px solid ${selectedProject.bast_unlocked ? '#22c55e' : '#eab308'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i
                className={selectedProject.bast_unlocked ? 'ri-checkbox-circle-fill' : 'ri-lock-line'}
                style={{
                  fontSize: '24px',
                  color: selectedProject.bast_unlocked ? '#22c55e' : '#eab308',
                }}
              ></i>
              <div>
                <strong style={{ fontSize: '14px', color: selectedProject.bast_unlocked ? '#166534' : '#854d0e' }}>
                  {selectedProject.bast_unlocked
                    ? 'Status Dokumen: RESMI DITERBITKAN & AKTIF (Termin Lunas 100%)'
                    : 'Status Dokumen: DRAF MENUNGGU PELUNASAN TERMIN 100%'}
                </strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  {selectedProject.bast_unlocked
                    ? 'Proyek telah selesai verifikasi fisik dan seluruh termin lunas. Masa Garansi 60 Hari kalender sedang berlaku.'
                    : 'Dokumen ini otomatis terbit resmi dan mengaktifkan masa pemeliharaan 60 hari begitu Klien melunasi seluruh termin pembayaran.'}
                </p>
              </div>
            </div>
            <Badge variant={selectedProject.bast_unlocked ? 'success' : 'warning'}>
              {selectedProject.bast_unlocked ? 'BAST AKTIF' : 'TERKUNCI'}
            </Badge>
          </div>

          {/* Printable BAST Document (Matches doc/Berita Acara Bapak Eko Yuwono_Ibu Sri Mahargiantie.docx) */}
          <div
            className="printable-doc"
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              background: '#fff',
              color: '#1e293b',
              padding: '50px 60px',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              fontFamily: '"Times New Roman", Times, serif',
              lineHeight: 1.6,
            }}
          >
            {/* Kop Perusahaan */}
            <div
              style={{
                borderBottom: '3px double #000',
                paddingBottom: '14px',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  margin: '0 0 4px 0',
                  color: '#0f172a',
                }}
              >
                PT. AULIA INDOLAND GRUP
              </h1>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f97316', margin: '0 0 4px 0' }}>
                HALO BANGUN — JASA ARSITEKTUR, KONSTRUKSI & RENOVASI
              </div>
              <p style={{ fontSize: '11px', margin: 0, color: '#475569', fontStyle: 'italic' }}>
                Kantor Operasional: Sleman, D.I. Yogyakarta • Kantor Legal: Gading Tutuka 1 Blok D3 No. 24-25, Bandung, Jawa Barat
                <br />
                Website: www.halobangun.id • Layanan Klien: (0821-3545-0404)
              </p>
            </div>

            {/* Judul Dokumen */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  margin: '0 0 4px 0',
                  letterSpacing: '0.5px',
                }}
              >
                BERITA ACARA SERAH TERIMA BANGUNAN (BAST)
              </h2>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Nomor: BAST/HB-AIG/{selectedProject.id.toString().padStart(3, '0')}/
                {new Date().getFullYear()}
              </div>
            </div>

            {/* Pembukaan */}
            <p style={{ fontSize: '13px', margin: '0 0 16px 0', textAlign: 'justify' }}>
              Yang bertanda tangan di bawah ini:
            </p>

            {/* Pihak Pertama */}
            <table style={{ width: '100%', fontSize: '13px', marginBottom: '14px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '130px', verticalAlign: 'top', padding: '2px 0' }}>Nama</td>
                  <td style={{ width: '15px', verticalAlign: 'top' }}>:</td>
                  <td style={{ fontWeight: 'bold' }}>Irfan Aulia Ulumuddin</td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: 'top', padding: '2px 0' }}>Alamat</td>
                  <td style={{ verticalAlign: 'top' }}>:</td>
                  <td>Gading Tutuka 1 Blok D3 No. 24-25 RT/RW 002/012 Desa Cingcin Kec. Soreang Kab. Bandung – Jawa Barat</td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: 'top', padding: '2px 0' }}>NIK</td>
                  <td style={{ verticalAlign: 'top' }}>:</td>
                  <td>3204372212900001</td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: 'top', padding: '2px 0' }}>Jabatan</td>
                  <td style={{ verticalAlign: 'top' }}>:</td>
                  <td>Direktur PT. Aulia Indoland Grup</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: '13px', margin: '0 0 16px 0', fontStyle: 'italic' }}>
              Dalam hal ini bertindak untuk dan atas nama kontraktor pelaksana, selanjutnya disebut sebagai <strong>Pihak Pertama</strong>.
            </p>

            {/* Pihak Kedua */}
            <table style={{ width: '100%', fontSize: '13px', marginBottom: '14px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '130px', verticalAlign: 'top', padding: '2px 0' }}>Nama</td>
                  <td style={{ width: '15px', verticalAlign: 'top' }}>:</td>
                  <td style={{ fontWeight: 'bold' }}>{selectedProject.client?.name || 'Bapak / Ibu Pemilik Proyek'}</td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: 'top', padding: '2px 0' }}>Alamat</td>
                  <td style={{ verticalAlign: 'top' }}>:</td>
                  <td>{selectedProject.location}</td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: 'top', padding: '2px 0' }}>NIK / Identitas</td>
                  <td style={{ verticalAlign: 'top' }}>:</td>
                  <td>3404071802800002</td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: 'top', padding: '2px 0' }}>Jabatan</td>
                  <td style={{ verticalAlign: 'top' }}>:</td>
                  <td>Pemilik Bangunan</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: '13px', margin: '0 0 18px 0', fontStyle: 'italic' }}>
              Dalam hal ini bertindak selaku pemilik bangunan, selanjutnya disebut sebagai <strong>Pihak Kedua</strong>.
            </p>

            {/* Pernyataan Serah Terima */}
            <p style={{ fontSize: '13px', margin: '0 0 14px 0', textAlign: 'justify' }}>
              Pada hari ini,{' '}
              <strong>
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
              , Pihak Pertama dan Pihak Kedua yang kemudian secara bersama-sama disebut sebagai <strong>Kedua Belah Pihak</strong> menerangkan hal-hal sebagai berikut:
            </p>

            {/* Detail Objek */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '6px', marginBottom: '18px' }}>
              <p style={{ fontSize: '13px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                Kedua Belah Pihak sepakat untuk melakukan serah terima pekerjaan pada bangunan dengan identitas sebagai berikut:
              </p>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '140px', padding: '3px 0' }}>Nama Proyek</td>
                    <td style={{ width: '15px' }}>:</td>
                    <td style={{ fontWeight: 'bold' }}>{selectedProject.name}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0' }}>Lokasi Bangunan</td>
                    <td>:</td>
                    <td>{selectedProject.location}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0' }}>Jumlah Lantai</td>
                    <td>:</td>
                    <td>1 (Satu) Lantai / 2 Lantai Standar Desain</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0' }}>Nilai Kontrak Total</td>
                    <td>:</td>
                    <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatIDR(selectedProject.contract_value)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0' }}>Pelaksana Fisik</td>
                    <td>:</td>
                    <td><strong>Halo Bangun</strong> (PT. Aulia Indoland Grup)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 7 Klausul Hukum Sah */}
            <div style={{ fontSize: '13px', textAlign: 'justify' }}>
              <ol style={{ paddingLeft: '20px', margin: '0 0 20px 0' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Kondisi Fisik:</strong> Pihak Kedua telah menerima penyerahan bangunan tersebut dalam kondisi baik, rapi, dan sesuai dengan spesifikasi standar pekerjaan pembangunan serta gambar kerja yang telah disepakati bersama.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Pemeriksaan Bersama:</strong> Kedua Belah Pihak telah melakukan pengecekan visual dan fungsional secara bersama-sama dan menyatakan bahwa seluruh lingkup pekerjaan telah selesai secara tuntas, tidak ada kekurangan apapun, dan hasilnya diterima dengan baik oleh Pihak Kedua.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Peralihan Tanggung Jawab:</strong> Kedua Belah Pihak sepakat bahwa terhitung sejak tanggal penandatanganan Berita Acara Serah Terima ini, segala hak dan kewajiban serta seluruh keuntungan dan/atau kerugian operasional yang timbul dari bangunan tersebut sepenuhnya beralih menjadi tanggung jawab Pihak Kedua.
                </li>
                <li style={{ marginBottom: '8px', color: '#0f172a' }}>
                  <strong>Masa Pemeliharaan & Garansi Resmi (60 Hari):</strong> Kedua Belah Pihak sepakat bahwa masa pemeliharaan (retensi garansi) dilakukan selama <strong>60 (enam puluh) hari kalender</strong> dengan maksimal pemeliharaan sebanyak <strong>3 (tiga) kali</strong> terhitung sejak tanggal Berita Acara Serah Terima ini ditandatangani.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Batas Tanggung Jawab:</strong> Kedua Belah Pihak sepakat bahwa jika masa pemeliharaan 60 hari telah berakhir, maka Pihak Pertama bebas dari segala tanggung jawab atas kekurangan, kerusakan, dan/atau hal apapun yang timbul pasca masa pemeliharaan.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Legalitas Perizinan:</strong> Pihak Pertama telah/akan menyerahkan kelengkapan dokumen Persetujuan Bangunan Gedung (PBG) dan Gambar As-Built Drawing kepada Pihak Kedua.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Kekuatan Hukum:</strong> Berita Acara Serah Terima ini dibuat dalam 2 (dua) rangkap asli bermaterai cukup dan masing-masing pihak memegang 1 (satu) rangkap yang mempunyai kekuatan hukum pembuktian yang sama.
                </li>
              </ol>
            </div>

            {/* Kolom Tanda Tangan */}
            <div style={{ marginTop: '30px', fontSize: '13px' }}>
              <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                Sleman, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              <div className="signature-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', textAlign: 'center' }}>
                <div>
                  <div style={{ marginBottom: '8px' }}>Pihak Pertama (Pelaksana / Kontraktor),</div>
                  <div style={{ fontWeight: 'bold' }}>PT. AULIA INDOLAND GRUP</div>
                  <div
                    style={{
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      fontSize: '11px',
                    }}
                  >
                    [ Tanda Tangan & Cap Stempel Resmi ]
                  </div>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    ( Irfan Aulia Ulumuddin )
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Direktur Utama</div>
                </div>

                <div>
                  <div style={{ marginBottom: '8px' }}>Pihak Kedua (Pemilik Bangunan),</div>
                  <div
                    style={{
                      width: '80px',
                      height: '45px',
                      border: '1px dashed #94a3b8',
                      margin: '0 auto 8px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      color: '#64748b',
                    }}
                  >
                    MATERAI
                    <br />
                    Rp 10.000
                  </div>
                  <div style={{ height: '35px' }}></div>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    ( {selectedProject.client?.name || 'Pemilik Bangunan'} )
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Pihak Kedua</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FORM PERBAIKAN BANGUNAN (GARANSI RETENSI 60 HARI) */}
      {/* ======================================================== */}
      {activeTab === 'warranty' && (
        <div>
          {/* Form Klaim Garansi Baru (Hidden on Print) */}
          <div className="no-print" style={{ marginBottom: '24px' }}>
            <Card>
              <CardHeader>
                <CardTitle icon="ri-tools-line">
                  Pengajuan Perbaikan Masa Garansi (Maksimal 3 Kali dalam 60 Hari)
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '20px' }}>
                <form onSubmit={handleAddClaim} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Item Kerusakan / Kendala Mutu <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Retak rambut dinding barat / Nat keramik bocor"
                      value={newClaimItem}
                      onChange={(e) => setNewClaimItem(e.target.value)}
                      required
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
                      Detail Lokasi & Deskripsi Permohonan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kamar mandi lantai 1, air merembes ke celah pintu"
                      value={newClaimDesc}
                      onChange={(e) => setNewClaimDesc(e.target.value)}
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
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={claimLoading}
                    style={{ padding: '9px 20px', background: '#f97316', border: 'none', fontWeight: 700 }}
                  >
                    {claimLoading ? 'Mengirim...' : 'Kirim Laporan'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Printable Warranty Form (Matches Halaman 2 doc/Berita Acara Bapak Eko Yuwono_Ibu Sri Mahargiantie.docx) */}
          <div
            className="printable-doc"
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              background: '#fff',
              color: '#1e293b',
              padding: '50px 60px',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              fontFamily: '"Times New Roman", Times, serif',
              lineHeight: 1.6,
            }}
          >
            {/* Header Form */}
            <div
              style={{
                borderBottom: '2px solid #000',
                paddingBottom: '12px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  margin: '0 0 4px 0',
                }}
              >
                FORM PERBAIKAN BANGUNAN
              </h2>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f97316' }}>
                HALO BANGUN — KLAIM GARANSI RETENSI PEMELIHARAAN PASCA-BAST
              </div>
            </div>

            {/* Identitas Pemohon */}
            <table style={{ width: '100%', fontSize: '13px', marginBottom: '18px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '150px', padding: '3px 0' }}>Nama Pemilik</td>
                  <td style={{ width: '15px' }}>:</td>
                  <td style={{ fontWeight: 'bold' }}>{selectedProject.client?.name || 'Bapak / Ibu Pemilik'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0' }}>No. Handphone / WhatsApp</td>
                  <td>:</td>
                  <td>0812-3456-7890 (Klien Terdaftar)</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0' }}>Lokasi Bangunan</td>
                  <td>:</td>
                  <td>{selectedProject.location}</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0' }}>Masa Garansi Resmi</td>
                  <td>:</td>
                  <td style={{ fontWeight: 'bold', color: '#f97316' }}>
                    2 Bulan (60 Hari Kalender) terhitung sejak tanggal penandatanganan BAST
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0' }}>Penanggung Jawab</td>
                  <td>:</td>
                  <td style={{ fontWeight: 'bold' }}>Halo Bangun (PT. Aulia Indoland Grup)</td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontSize: '13px', margin: '0 0 14px 0', textAlign: 'justify' }}>
              Bermaksud untuk menyampaikan permohonan perbaikan bangunan selama masa garansi pemeliharaan, maka diajukan perbaikan unit bangunan tersebut dengan rincian sebagai berikut:
            </p>

            {/* Tabel Item Perbaikan */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                marginBottom: '20px',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ background: '#f1f5f9', borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                  <th style={{ width: '35px', padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>NO</th>
                  <th style={{ width: '90px', padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>TANGGAL</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>ITEM PERBAIKAN & DESKRIPSI</th>
                  <th style={{ width: '110px', padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>STATUS FISIK</th>
                  <th style={{ width: '160px', padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                    MENGETAHUI
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '10px', marginTop: '4px', borderTop: '1px solid #cbd5e1', paddingTop: '2px' }}>
                      <span>PEMILIK</span>
                      <span>HALO BANGUN</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectClaims.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', border: '1px solid #cbd5e1' }}>
                      Belum ada komplain perbaikan bangunan diajukan pada masa garansi ini.
                    </td>
                  </tr>
                ) : (
                  projectClaims.map((claim, idx) => (
                    <tr key={claim.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                        {new Date(claim.claim_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontWeight: 'bold' }}>{claim.item_name}</div>
                        {claim.description && (
                          <div style={{ fontSize: '11px', color: '#475569' }}>{claim.description}</div>
                        )}
                        {claim.notes && (
                          <div style={{ fontSize: '11px', color: '#166534', marginTop: '3px', fontStyle: 'italic' }}>
                            ✓ Tindakan: {claim.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: claim.status === 'SELESAI' ? '#dcfce7' : '#fef3c7',
                            color: claim.status === 'SELESAI' ? '#166534' : '#854d0e',
                          }}
                        >
                          {claim.status}
                        </span>
                        {/* Status Switcher for PM / Owner */}
                        {userRole !== 'CLIENT' && (
                          <div className="no-print" style={{ marginTop: '4px' }}>
                            <select
                              value={claim.status}
                              onChange={(e) => handleUpdateClaimStatus(claim.id, e.target.value)}
                              style={{ fontSize: '10px', padding: '2px 4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            >
                              <option value="DILAPORKAN">DILAPORKAN</option>
                              <option value="DIJADWALKAN">DIJADWALKAN</option>
                              <option value="SEDANG_DIKERJAKAN">PROSES</option>
                              <option value="SELESAI">SELESAI</option>
                            </select>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', height: '40px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#166534' }}>✓ Terverifikasi</span>
                          <span style={{ fontSize: '10px', color: '#166534' }}>✓ Halo Bangun</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Ketentuan Garansi Footer */}
            <div style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic', marginBottom: '24px' }}>
              * Catatan: Masa garansi pemeliharaan berlaku maksimal 60 hari kalender sejak penandatanganan BAST dengan kuota perbaikan maksimal 3 (tiga) kali pemanggilan teknisi lapangan. Pekerjaan perbaikan mencakup kebocoran, retak plesteran/acian, kelonggaran instalasi saniter, dan penyetelan kusen/pintu.
            </div>

            {/* Sign-off Form Garansi */}
            <div className="signature-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center', fontSize: '12px' }}>
              <div>
                <div style={{ marginBottom: '6px' }}>Pemilik Bangunan,</div>
                <div style={{ height: '60px' }}></div>
                <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                  ( {selectedProject.client?.name || 'Pemilik Bangunan'} )
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '6px' }}>Penanggung Jawab Lapangan (Halo Bangun),</div>
                <div style={{ height: '60px' }}></div>
                <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                  ( Dimas Pratama, S.T. / Arizal )
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Project Manager / Pengawas</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SURAT PERJANJIAN KERJA PELAKSANAAN RENOVASI (SPK) */}
      {/* ======================================================== */}
      {activeTab === 'spkpr' && (
        <div>
          <div
            className="printable-doc"
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              background: '#fff',
              color: '#1e293b',
              padding: '50px 60px',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              fontFamily: '"Times New Roman", Times, serif',
              lineHeight: 1.6,
            }}
          >
            {/* Kop Kontrak */}
            <div
              style={{
                borderBottom: '3px double #000',
                paddingBottom: '14px',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                PT. AULIA INDOLAND GRUP
              </h1>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f97316', margin: '0 0 4px 0' }}>
                HALO BANGUN — KONTRAKTOR, ARSITEKTUR & RENOVASI
              </div>
              <p style={{ fontSize: '11px', margin: 0, color: '#475569' }}>
                Jalan Ring Road Utara, Sleman, D.I. Yogyakarta • Telp/WA: 0821-3545-0404 • Email: halo@halobangun.id
              </p>
            </div>

            {/* Judul Perjanjian */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  margin: '0 0 4px 0',
                }}
              >
                SURAT PERJANJIAN KERJA PELAKSANAAN RENOVASI & BANGUNAN (SPKPR)
              </h2>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Nomor: SPKPR/HB-PTAIG/{selectedProject.id.toString().padStart(3, '0')}/2026
              </div>
            </div>

            <p style={{ fontSize: '13px', textAlign: 'justify', marginBottom: '14px' }}>
              Pada hari ini, bertempat di kantor Halo Bangun D.I. Yogyakarta, telah disepakati perjanjian kerja pelaksanaan konstruksi fisik antara:
            </p>

            <table style={{ width: '100%', fontSize: '13px', marginBottom: '14px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '120px', padding: '2px 0' }}><strong>1. Nama Klien</strong></td>
                  <td style={{ width: '15px' }}>:</td>
                  <td style={{ fontWeight: 'bold' }}>{selectedProject.client?.name || 'Klien Terdaftar'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0' }}>Alamat</td>
                  <td>:</td>
                  <td>{selectedProject.location}</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0' }}>Peran</td>
                  <td>:</td>
                  <td>Pemilik Bangunan, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0 2px 0' }}><strong>2. Kontraktor</strong></td>
                  <td style={{ padding: '8px 0 2px 0' }}>:</td>
                  <td style={{ padding: '8px 0 2px 0', fontWeight: 'bold' }}>
                    Irfan Aulia Ulumuddin (PT. Aulia Indoland Grup / Halo Bangun)
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0' }}>Alamat</td>
                  <td>:</td>
                  <td>Gading Tutuka 1 Blok D3 Soreang Bandung & Sleman Yogyakarta</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0' }}>Peran</td>
                  <td>:</td>
                  <td>Pelaksana Konstruksi, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.</td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontSize: '13px', textAlign: 'justify', marginBottom: '14px' }}>
              Kedua Belah Pihak telah bersepakat mengadakan perjanjian kerja pelaksanaan renovasi/pembangunan yang berlokasi di <strong>{selectedProject.location}</strong> dengan ketentuan pasal-pasal berikut:
            </p>

            {/* Pasal 1 */}
            <div style={{ marginBottom: '12px', fontSize: '13px', textAlign: 'justify' }}>
              <div style={{ fontWeight: 'bold' }}>PASAL 1 — TUGAS PEKERJAAN & STANDAR MUTU</div>
              <p style={{ margin: '4px 0' }}>
                PIHAK PERTAMA memberikan tugas kepada PIHAK KEDUA dan PIHAK KEDUA menerima tugas tersebut untuk melaksanakan pekerjaan fisik pada proyek <strong>{selectedProject.name}</strong> sesuai gambar kerja, rincian BoQ (Bill of Quantities), dan spesifikasi teknis SNI yang telah disetujui.
              </p>
            </div>

            {/* Pasal 2 */}
            <div style={{ marginBottom: '12px', fontSize: '13px', textAlign: 'justify' }}>
              <div style={{ fontWeight: 'bold' }}>PASAL 2 — NILAI KONTRAK BORONGAN</div>
              <p style={{ margin: '4px 0' }}>
                Harga kontrak borongan pekerjaan ini ditetapkan mengikat sebesar <strong>{formatIDR(selectedProject.contract_value)}</strong> (<em>{terbilang(selectedProject.contract_value)}</em>), tidak termasuk pekerjaan tambah kurang (addendum) yang disepakati terpisah secara tertulis.
              </p>
            </div>

            {/* Pasal 3 */}
            <div style={{ marginBottom: '12px', fontSize: '13px', textAlign: 'justify' }}>
              <div style={{ fontWeight: 'bold' }}>PASAL 3 — TATA CARA PEMBAYARAN TERMIN</div>
              <p style={{ margin: '4px 0' }}>
                Pembayaran dilakukan secara bertahap melalui transfer rekening resmi atas nama PT. Aulia Indoland Grup berdasarkan verifikasi kemajuan fisik mingguan (Kurva S):
              </p>
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                <li>Termin I (Uang Muka / DP): 30% saat penandatanganan SPKPR.</li>
                <li>Termin II: 30% setelah progres fisik mencapai 50%.</li>
                <li>Termin III: 20% setelah progres fisik mencapai 75%.</li>
                <li>Termin IV (Pelunasan): 20% saat pekerjaan fisik 100% tuntas dan sebelum serah terima BAST.</li>
              </ul>
            </div>

            {/* Pasal 4 */}
            <div style={{ marginBottom: '12px', fontSize: '13px', textAlign: 'justify' }}>
              <div style={{ fontWeight: 'bold' }}>PASAL 4 — JANGKA WAKTU & MASA PEMELIHARAAN (GARANSI)</div>
              <p style={{ margin: '4px 0' }}>
                Pekerjaan diselesaikan dalam jangka waktu kerja yang disepakati. Setelah serah terima pertama melalui Berita Acara Serah Terima (BAST), PIHAK KEDUA memberikan masa pemeliharaan garansi selama <strong>60 (enam puluh) hari kalender</strong> dengan maksimal pemanggilan teknisi 3 (tiga) kali.
              </p>
            </div>

            {/* Pasal 5 */}
            <div style={{ marginBottom: '16px', fontSize: '13px', textAlign: 'justify' }}>
              <div style={{ fontWeight: 'bold' }}>PASAL 5 — PEKERJAAN TAMBAH KURANG (ADDENDUM)</div>
              <p style={{ margin: '4px 0' }}>
                Segala bentuk penambahan atau pengurangan item pekerjaan hanya sah apabila diajukan secara tertulis, dihitung selisih biayanya dalam dokumen Addendum resmi, dan ditandatangani oleh Kedua Belah Pihak.
              </p>
            </div>

            {/* Signatures */}
            <div style={{ marginTop: '30px', fontSize: '13px' }}>
              <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="signature-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', textAlign: 'center' }}>
                <div>
                  <div>PIHAK PERTAMA (Pemilik),</div>
                  <div style={{ height: '70px' }}></div>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    ( {selectedProject.client?.name || 'Pemilik Bangunan'} )
                  </div>
                </div>
                <div>
                  <div>PIHAK KEDUA (Kontraktor),</div>
                  <div style={{ fontWeight: 'bold' }}>PT. AULIA INDOLAND GRUP</div>
                  <div style={{ height: '50px' }}></div>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    ( Irfan Aulia Ulumuddin )
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Direktur Utama</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SLIP GAJI RESMI (PT. AULIA INDOLAND GRUP)         */}
      {/* ======================================================== */}
      {activeTab === 'slip_gaji' && (
        <div>
          {/* Slip Gaji Controls & Selector (Hidden on Print) */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '20px',
              padding: '16px',
              borderRadius: '8px',
              background: 'var(--dash-card-bg)',
              border: '1px solid var(--dash-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Pilih Slip Gaji Karyawan:</label>
              <select
                value={selectedPayrollId}
                onChange={(e) => setSelectedPayrollId(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--dash-border)',
                  background: 'var(--dash-muted-bg)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {payrolls.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.name || 'Karyawan'} ({p.user?.role || '-'}) — {p.period} ({formatIDR(p.total_amount)})
                  </option>
                ))}
              </select>
            </div>

            {(userRole === 'FINANCE' || userRole === 'OWNER') && (
              <Button
                onClick={() => setShowSlipForm(!showSlipForm)}
                variant="outline"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className={showSlipForm ? 'ri-close-line' : 'ri-add-line'}></i>
                {showSlipForm ? 'Tutup Form Generator' : 'Buat Slip Gaji Baru (10+8 Komponen)'}
              </Button>
            )}
          </div>

          {/* Form Buat Slip Gaji Baru (Hidden on Print) */}
          {showSlipForm && (userRole === 'FINANCE' || userRole === 'OWNER') && (
            <div className="no-print" style={{ marginBottom: '24px' }}>
              <Card>
                <CardHeader>
                  <CardTitle icon="ri-calculator-line">
                    Generator Slip Gaji Resmi PT. Aulia Indoland Grup (Format Excel Standar)
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '20px' }}>
                  <form onSubmit={handleSaveSlipGaji}>
                    {/* Data Karyawan Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                          Pilih Pegawai / Mandor / PM
                        </label>
                        <select
                          value={slipForm.userId}
                          onChange={(e) => setSlipForm({ ...slipForm, userId: Number(e.target.value) })}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--dash-border)', background: 'var(--dash-muted-bg)', fontSize: '12px' }}
                        >
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>NIK Pegawai</label>
                        <input
                          type="text"
                          value={slipForm.nik}
                          onChange={(e) => setSlipForm({ ...slipForm, nik: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--dash-border)', background: 'var(--dash-muted-bg)', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Jabatan</label>
                        <input
                          type="text"
                          value={slipForm.jobTitle}
                          onChange={(e) => setSlipForm({ ...slipForm, jobTitle: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--dash-border)', background: 'var(--dash-muted-bg)', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Periode Gaji</label>
                        <input
                          type="text"
                          value={slipForm.period}
                          onChange={(e) => setSlipForm({ ...slipForm, period: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--dash-border)', background: 'var(--dash-muted-bg)', fontSize: '12px' }}
                        />
                      </div>
                    </div>

                    {/* Grid 10 Penerimaan vs 8 Potongan */}
                    <div className="signature-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' }}>
                      {/* 10 Penerimaan */}
                      <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#166534', margin: '0 0 12px 0' }}>
                          10 Komponen Penerimaan (Gaji Bruto)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                          <div>
                            <label>1. Gaji Pokok (Rp):</label>
                            <input type="number" value={slipForm.baseSalary} onChange={(e) => setSlipForm({ ...slipForm, baseSalary: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>2. T. Jabatan (Rp):</label>
                            <input type="number" value={slipForm.allowanceJabatan} onChange={(e) => setSlipForm({ ...slipForm, allowanceJabatan: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>3. U. Makan (Rp):</label>
                            <input type="number" value={slipForm.mealAllowance} onChange={(e) => setSlipForm({ ...slipForm, mealAllowance: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>4. T. Transport (Rp):</label>
                            <input type="number" value={slipForm.transportAllowance} onChange={(e) => setSlipForm({ ...slipForm, transportAllowance: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>5. T. Masa Kerja (Rp):</label>
                            <input type="number" value={slipForm.tenureAllowance} onChange={(e) => setSlipForm({ ...slipForm, tenureAllowance: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>6. T. Pendidikan (Rp):</label>
                            <input type="number" value={slipForm.educationAllowance} onChange={(e) => setSlipForm({ ...slipForm, educationAllowance: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>7. Tunj. Fungsional (Rp):</label>
                            <input type="number" value={slipForm.functionalAllowance} onChange={(e) => setSlipForm({ ...slipForm, functionalAllowance: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>8. Lembur (Rp):</label>
                            <input type="number" value={slipForm.overtime} onChange={(e) => setSlipForm({ ...slipForm, overtime: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>9. T. Lain (Pulsa+Svc):</label>
                            <input type="number" value={slipForm.otherAllowance} onChange={(e) => setSlipForm({ ...slipForm, otherAllowance: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>10. Bonus (Rp):</label>
                            <input type="number" value={slipForm.bonus} onChange={(e) => setSlipForm({ ...slipForm, bonus: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                        </div>
                        <div style={{ marginTop: '12px', fontWeight: 'bold', fontSize: '13px', color: '#166534', textAlign: 'right' }}>
                          Total Bruto: {formatIDR(totalEarnings)}
                        </div>
                      </div>

                      {/* 8 Potongan */}
                      <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b', margin: '0 0 12px 0' }}>
                          8 Komponen Pemotongan Gaji
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                          <div>
                            <label>1. Terlambat Hadir (Rp):</label>
                            <input type="number" value={slipForm.lateDeduction} onChange={(e) => setSlipForm({ ...slipForm, lateDeduction: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>2. PPh 21 (Rp):</label>
                            <input type="number" value={slipForm.pph21} onChange={(e) => setSlipForm({ ...slipForm, pph21: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>3. BPJS TK (Rp):</label>
                            <input type="number" value={slipForm.bpjsTk} onChange={(e) => setSlipForm({ ...slipForm, bpjsTk: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>4. BPJS Kes (Rp):</label>
                            <input type="number" value={slipForm.bpjsKes} onChange={(e) => setSlipForm({ ...slipForm, bpjsKes: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>5. Angsuran Pinjaman:</label>
                            <input type="number" value={slipForm.loanInstallment} onChange={(e) => setSlipForm({ ...slipForm, loanInstallment: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>6. Cash Bon (Rp):</label>
                            <input type="number" value={slipForm.cashBon} onChange={(e) => setSlipForm({ ...slipForm, cashBon: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>7. Potongan Lain:</label>
                            <input type="number" value={slipForm.otherDeduction} onChange={(e) => setSlipForm({ ...slipForm, otherDeduction: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label>8. Iuran Sosial (Rp):</label>
                            <input type="number" value={slipForm.socialFund} onChange={(e) => setSlipForm({ ...slipForm, socialFund: Number(e.target.value) })} style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          </div>
                        </div>
                        <div style={{ marginTop: '12px', fontWeight: 'bold', fontSize: '13px', color: '#991b1b', textAlign: 'right' }}>
                          Total Potongan: {formatIDR(totalDeductions)}
                        </div>
                      </div>
                    </div>

                    {/* Summary Result & Save */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--dash-muted-bg)', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--dash-text-muted)' }}>GAJI BERSIH (TAKE HOME PAY):</span>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>{formatIDR(netSalary)}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>Terbilang: {terbilang(netSalary)}</div>
                      </div>
                      <Button type="submit" variant="primary" style={{ padding: '10px 24px', background: '#f97316', border: 'none', fontWeight: 700 }}>
                        Terbitkan & Simpan Slip Gaji
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Printable Official Slip Gaji (Matches doc/SLIP GAJI_PT AIG.xlsx) */}
          <div
            className="printable-doc"
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              background: '#fff',
              color: '#0f172a',
              padding: '40px 50px',
              borderRadius: '8px',
              border: '2px solid #000',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              fontFamily: 'Arial, sans-serif',
              lineHeight: 1.4,
            }}
          >
            {/* Header Slip Gaji */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #000',
                paddingBottom: '10px',
                marginBottom: '14px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 2px 0', letterSpacing: '1px' }}>
                  SLIP GAJI
                </h2>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>
                  Nama Perusahaan : PT. AULIA INDOLAND GRUP
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    fontWeight: 900,
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '1px',
                  }}
                >
                  RAHASIA
                </span>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Halo Bangun • Kantor Operasional Yogyakarta
                </div>
              </div>
            </div>

            {/* Employee Metadata */}
            <div className="signature-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px', fontSize: '12px' }}>
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '90px', padding: '2px 0' }}>Nik</td>
                      <td style={{ width: '15px' }}>:</td>
                      <td style={{ fontWeight: 'bold' }}>{currentPayroll?.breakdown?.nik || 'AIG-2024-089'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0' }}>Nama</td>
                      <td>:</td>
                      <td style={{ fontWeight: 'bold' }}>{currentPayroll?.user.name}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0' }}>Jabatan</td>
                      <td>:</td>
                      <td>{currentPayroll?.breakdown?.job_title || currentPayroll?.user.role}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '100px', padding: '2px 0' }}>Gaji Bulan</td>
                      <td style={{ width: '15px' }}>:</td>
                      <td style={{ fontWeight: 'bold' }}>{currentPayroll?.period || 'November 2026'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0' }}>No. Rekening</td>
                      <td>:</td>
                      <td>{currentPayroll?.breakdown?.bank_account || 'Bank Mandiri - 137-00-1928374-1'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0' }}>Status</td>
                      <td>:</td>
                      <td style={{ fontWeight: 'bold', color: '#166534' }}>LUNAS / DITRANSFER</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Two-Column Grid: Penerimaan vs Potongan */}
            <div
              className="slip-two-column-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                border: '1px solid #000',
                marginBottom: '12px',
              }}
            >
              {/* Kolom Penerimaan */}
              <div style={{ borderRight: '1px solid #000' }}>
                <div
                  style={{
                    background: '#f1f5f9',
                    borderBottom: '1px solid #000',
                    padding: '6px 10px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                >
                  Penerimaan ( Gaji Bruto)
                </div>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Gaji Pokok</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.base_salary ?? currentPayroll?.base_salary ?? 4500000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>T. Jabatan</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.allowance_jabatan ?? 750000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>U. Makan</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.meal_allowance ?? 650000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>T. Transport</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.transport_allowance ?? 400000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>T. Masa kerja</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.tenure_allowance ?? 200000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>T Pendidikan</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.education_allowance ?? 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Tunj. Fungsional</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.functional_allowance ?? 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Lembur</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.overtime ?? 350000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Tunj. Lain- Lain (Pulsa+ Service)</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.other_allowance ?? 200000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Bonus</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.earnings?.bonus ?? currentPayroll?.bonus ?? 500000)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    padding: '6px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    background: '#fafafa',
                  }}
                >
                  <span>Jumlah Penerimaan Bruto</span>
                  <span>
                    {formatIDR(
                      currentPayroll?.breakdown?.earnings?.total_gross ||
                        (currentPayroll?.total_amount ? currentPayroll.total_amount + 475000 : 7550000)
                    )}
                  </span>
                </div>
              </div>

              {/* Kolom Potongan */}
              <div>
                <div
                  style={{
                    background: '#f1f5f9',
                    borderBottom: '1px solid #000',
                    padding: '6px 10px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                >
                  Potongan
                </div>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Terlambat Hadir</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.deductions?.late_deduction ?? 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Pajak Penghasilan (pph 21)</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.deductions?.pph21 ?? 125000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>BPJS Ketenagakerjaan</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.deductions?.bpjs_tk ?? 85000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>BPJS Kesehatan</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.deductions?.bpjs_kes ?? 45000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Angsuran Pinjaman</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.deductions?.loan_installment ?? 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Cash Bon</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.deductions?.cash_bon ?? 200000)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Potongan Lain- Lain</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.deductions?.other_deduction ?? 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 10px' }}>Iuran Dana Sosial</td>
                      <td style={{ textAlign: 'right', padding: '3px 10px' }}>
                        {formatIDR(currentPayroll?.breakdown?.deductions?.social_fund ?? 20000)}
                      </td>
                    </tr>
                    {/* Empty spacer rows to align with 10 rows on left */}
                    <tr><td style={{ padding: '3px 10px' }}>-</td><td style={{ textAlign: 'right', padding: '3px 10px' }}>Rp 0</td></tr>
                    <tr><td style={{ padding: '3px 10px' }}>-</td><td style={{ textAlign: 'right', padding: '3px 10px' }}>Rp 0</td></tr>
                  </tbody>
                </table>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    padding: '6px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    background: '#fafafa',
                  }}
                >
                  <span>Total Potongan</span>
                  <span>
                    {formatIDR(currentPayroll?.breakdown?.deductions?.total_deduction ?? 475000)}
                  </span>
                </div>
              </div>
            </div>

            {/* Gaji Bersih Box */}
            <div
              style={{
                border: '2px solid #000',
                padding: '10px 14px',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', fontWeight: 900 }}>Gaji Bersih (Take Home Pay)</span>
              </div>
              <div>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                  {formatIDR(currentPayroll?.total_amount || currentPayroll?.breakdown?.net_salary || 7075000)}
                </span>
              </div>
            </div>

            {/* Terbilang */}
            <div style={{ fontSize: '11px', marginBottom: '16px', paddingLeft: '4px' }}>
              <strong>Terbilang : </strong>
              <span style={{ fontStyle: 'italic', fontWeight: 600 }}>
                {currentPayroll?.breakdown?.terbilang || terbilang(currentPayroll?.total_amount || 7075000)}
              </span>
            </div>

            {/* Footer Notes & Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', fontSize: '11px', borderTop: '1px solid #cbd5e1', paddingTop: '12px' }}>
              <div>
                <strong>Catatan:</strong>
                <ol style={{ paddingLeft: '16px', margin: '4px 0', lineHeight: 1.5 }}>
                  <li>Tidak memperlihatkan Slip Gaji anda pada karyawan lain apapun alasannya.</li>
                  <li>Jika tidak ada kejelasan slip gaji silakan lapor HRD / Finance Admin.</li>
                </ol>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '4px' }}>
                  Yogyakarta, {new Date(currentPayroll?.paid_date || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                  <div>
                    <div>TTD Keuangan / HRD</div>
                    <div style={{ height: '45px' }}></div>
                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                      ( Ratna Dewi, S.E. )
                    </div>
                  </div>
                  <div>
                    <div>Penerima</div>
                    <div style={{ height: '45px' }}></div>
                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                      ( {currentPayroll?.user.name} )
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
