import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/ui';
import ProjectOnboardingWizard from '@/components/dashboard/ProjectOnboardingWizard';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');

  // Strictly only OWNER can access project onboarding wizard
  if (user.role !== 'OWNER') {
    redirect('/dashboard?forbidden=1');
  }

  // Fetch clients and PMs for selection
  const [clients, pms] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'PM' },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <DashboardLayout title="Wizard Buat Proyek Baru">
      <PageHeader
        breadcrumb="Direktur / Owner"
        title="Inisiasi Proyek Baru (Onboarding Wizard)"
        subtitle="Formulir multi-langkah pendaftaran proyek konstruksi, penugasan PM, dan unggah 5 paket dokumen resmi awal."
      />

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <ProjectOnboardingWizard clients={clients} pms={pms} />
      </div>
    </DashboardLayout>
  );
}

