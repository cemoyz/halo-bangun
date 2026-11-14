import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageHeader, Button } from '@/components/dashboard/ui';
import LandingPageCmsConsole from '@/components/dashboard/LandingPageCmsConsole';

export const metadata = {
  title: 'Manajemen Konten Landing Page || Halo Bangun Dashboard',
  description: 'Kelola seluruh teks, narasi, layanan, testimoni, dan gambar laman depan secara dinamis via Supabase & ImgBB.',
};

export default function CmsDashboardPage() {
  return (
    <DashboardLayout title="CMS Laman Depan">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <PageHeader
          breadcrumb="CMS Laman Depan"
          title="Manajemen Konten Laman Depan (CMS)"
          subtitle="Kelola teks hero banner, narasi profil, layanan utama, testimoni, dan konfigurasi API ImgBB secara dinamis."
          action={
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" icon="ri-arrow-left-line">
                  Kembali ke Dashboard
                </Button>
              </Link>
              <a href="/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="primary" icon="ri-external-link-line">
                  Buka Website Publik
                </Button>
              </a>
            </div>
          }
        />

        <LandingPageCmsConsole />
      </div>
    </DashboardLayout>
  );
}
