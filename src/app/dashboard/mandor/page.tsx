import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/ui';
import MandorFieldConsole from '@/components/dashboard/MandorFieldConsole';

export const dynamic = 'force-dynamic';

export default async function MandorDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');
  if (user.role !== 'MANDOR' && user.role !== 'OWNER') {
    redirect('/dashboard?forbidden=1');
  }

  // Fetch only mandor's allowed data (strictly NO client financial data, NO SPKPR, NO CCTV, NO Kurva S)
  const [projects, dailyReports, equipment, purchases, payrolls] = await Promise.all([
    prisma.project.findMany({
      select: { id: true, name: true, location: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dailyReport.findMany({
      take: 15,
      include: { project: { select: { name: true } } },
      orderBy: { date: 'desc' },
    }),
    prisma.equipmentInventory.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.materialPurchase.findMany({
      where: { input_by_role: 'MANDOR' },
      take: 15,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payroll.findMany({
      where: { user_id: user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <DashboardLayout title="Portal Lapangan Mandor">
      <PageHeader
        breadcrumb="Mandor & Kepala Tukang Lapangan"
        title="Pusat Kendali Pekerjaan Lapangan (Mobile-First)"
        subtitle="Pantau foto progres lapangan, cek ketersediaan alat kerja, ajukan material darurat, dan cek bukti upah pribadi."
      />

      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <MandorFieldConsole
          projects={projects}
          dailyReports={dailyReports as any}
          equipment={equipment as any}
          materials={purchases as any}
          payrolls={payrolls as any}
        />
      </div>
    </DashboardLayout>
  );
}
