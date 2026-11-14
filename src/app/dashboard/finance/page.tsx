import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/ui';
import FinanceDashboardConsole from '@/components/dashboard/FinanceDashboardConsole';

export const dynamic = 'force-dynamic';

export default async function FinanceDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');
  if (user.role !== 'FINANCE' && user.role !== 'OWNER') {
    redirect('/dashboard?forbidden=1');
  }

  const [projects, allocations, payments, materials, addendums, payrolls, employees] = await Promise.all([
    prisma.project.findMany({
      include: {
        addendums: true,
        materialPurchases: true,
        payrolls: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.projectFinancialAllocation.findMany({
      include: { project: { select: { name: true, contract_value: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.findMany({
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.materialPurchase.findMany({
      include: { project: { select: { name: true } } },
      orderBy: { purchase_date: 'desc' },
    }),
    prisma.addendum.findMany({
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payroll.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: { in: ['PM', 'MANDOR', 'FINANCE'] } },
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <DashboardLayout title="Dashboard Keuangan & Akuntansi (Finance Admin)">
      <PageHeader
        breadcrumb="Finance & Accounting Lead"
        title="Pusat Kontrol Anggaran, Termin & Laba Rugi Proyek"
        subtitle="Analisis perbandingan RAB vs biaya riil, kalkulator alokasi finansial (FR-18), verifikasi termin kwitansi, dan manajemen payroll."
      />

      <FinanceDashboardConsole
        projects={projects as any}
        initialAllocations={allocations as any}
        initialPayments={payments as any}
        initialMaterials={materials as any}
        initialAddendums={addendums as any}
        initialPayrolls={payrolls as any}
        employees={employees as any}
      />
    </DashboardLayout>
  );
}
