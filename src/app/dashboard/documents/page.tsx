'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DocumentsConsole from '@/components/dashboard/DocumentsConsole';

export default function DocumentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocumentsData() {
      try {
        setLoading(true);
        const res = await fetch('/api/documents');
        const resData = await res.json();
        if (!res.ok || !resData.success) {
          throw new Error(resData.error || 'Gagal memuat data dokumen');
        }
        setData(resData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDocumentsData();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ padding: '0 0 40px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <i className="ri-loader-4-line ri-spin" style={{ fontSize: '32px', color: '#f97316' }}></i>
            <p style={{ marginTop: '12px', fontSize: '14px' }}>Memuat Dokumen Resmi Konstruksi...</p>
          </div>
        ) : error ? (
          <div
            style={{
              padding: '24px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              color: '#dc2626',
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold' }}>Akses Dokumen Dibatasi</h4>
            <p style={{ margin: 0, fontSize: '13px' }}>{error}</p>
          </div>
        ) : (
          <DocumentsConsole
            projects={data?.projects || []}
            payrolls={data?.payrolls || []}
            employees={data?.employees || []}
            userRole={data?.currentUserRole || 'OWNER'}
            currentUserId={data?.currentUserId || 1}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

