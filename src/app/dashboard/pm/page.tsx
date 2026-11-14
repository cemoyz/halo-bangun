import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/ui';
import PmDashboardConsole from '@/components/dashboard/PmDashboardConsole';

export const dynamic = 'force-dynamic';

export default async function PmDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');
  if (user.role !== 'PM' && user.role !== 'OWNER') {
    redirect('/dashboard?forbidden=1');
  }

  // Fetch PM's assigned projects (or all projects if OWNER)
  const [projects, dailyReports, materials, equipment, addendums, payrolls] = await Promise.all([
    prisma.project.findMany({
      where: user.role === 'PM' ? { pm_id: user.id } : {},
      select: {
        id: true,
        name: true,
        category: true,
        location: true,
        contract_value: true,
        cctv_url: true,
        sCurveProgress: {
          select: {
            id: true,
            week_number: true,
            planned_percentage: true,
            actual_percentage: true,
            cumulative_planned: true,
            cumulative_actual: true,
            planned_cost: true,
            actual_cost: true,
            status: true,
            notes: true,
            target_date: true,
          },
          orderBy: { week_number: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dailyReport.findMany({
      where: user.role === 'PM' ? { project: { pm_id: user.id } } : {},
      include: {
        project: { select: { id: true, name: true, location: true } },
        author: { select: { id: true, name: true, role: true } },
        items: true,
      },
      orderBy: { date: 'desc' },
      take: 60,
    }),
    prisma.materialPurchase.findMany({
      where: user.role === 'PM' ? { project: { pm_id: user.id } } : {},
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.equipmentInventory.findMany({
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.addendum.findMany({
      where: user.role === 'PM' ? { project: { pm_id: user.id } } : {},
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payroll.findMany({
      where: { user_id: user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const serializedProjects = projects.map((p) => ({
    ...p,
    sCurveProgress: p.sCurveProgress.map((item) => ({
      ...item,
      planned_cost: item.planned_cost ? Number(item.planned_cost) : null,
      actual_cost: item.actual_cost ? Number(item.actual_cost) : null,
      target_date: item.target_date ? item.target_date.toISOString() : null,
    })),
  }));

  const serializedReports = dailyReports.map((dr) => ({
    ...dr,
    date: dr.date ? dr.date.toISOString() : null,
    createdAt: dr.createdAt ? dr.createdAt.toISOString() : null,
    updatedAt: dr.updatedAt ? dr.updatedAt.toISOString() : null,
  }));

  return (
    <DashboardLayout title="Pengawasan Lapangan & Progres (Project Manager)">
      <PageHeader
        breadcrumb="Senior Project Manager"
        title="Pusat Kendali Pengawasan Lapangan & Kurva S"
        subtitle="Kelola laporan harian (maks. 3 foto), perbarui Kurva S mingguan, monitoring CCTV, dan catat nota belanja material."
      />

      {projects.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: 'var(--dash-card-bg)',
            border: '1px solid var(--dash-border)',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '36px', color: 'var(--dash-text-muted)', marginBottom: '12px' }}>
            <i className="ri-folder-open-line" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
            Belum ada proyek yang ditugaskan ke Anda
          </div>
          <div style={{ fontSize: '13px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
            Direktur / Owner akan menetapkan Anda sebagai penanggung jawab proyek melalui Wizard Onboarding.
          </div>
        </div>
      ) : (
        <PmDashboardConsole
          projects={serializedProjects as any}
          initialReports={serializedReports as any}
          initialMaterials={materials as any}
          initialEquipment={equipment as any}
          initialAddendums={addendums as any}
          initialPayrolls={payrolls as any}
        />
      )}
    </DashboardLayout>
  );
}
