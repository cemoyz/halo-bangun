import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/ui';
import ClientDashboardConsole from '@/components/dashboard/ClientDashboardConsole';

export const dynamic = 'force-dynamic';

export default async function ClientDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect('/login');
  if (user.role !== 'CLIENT' && user.role !== 'OWNER') {
    redirect('/dashboard?forbidden=1');
  }

  // Find project for this client (or first project if Owner)
  const project = await prisma.project.findFirst({
    where: user.role === 'CLIENT' ? { client_id: user.id } : {},
    include: {
      pm: { select: { name: true, phone: true } },
      documents: {
        select: { id: true, doc_type: true, title: true, file_url: true, is_locked: true },
      },
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
      dailyReports: {
        where: { status: 'SUBMITTED' },
        select: {
          id: true,
          date: true,
          weather: true,
          worker_count: true,
          notes: true,
          obstacles: true,
          solutions: true,
          photos: true,
          status: true,
          createdAt: true,
          author: { select: { id: true, name: true, role: true } },
          items: {
            select: { id: true, task_name: true, category: true, status: true, volume: true, notes: true },
          },
        },
        orderBy: { date: 'desc' },
        take: 20,
      },
      payments: {
        select: { id: true, termin_name: true, amount: true, status: true, due_date: true, proof_url: true, receipt_url: true, notes: true },
        orderBy: { createdAt: 'asc' },
      },
      addendums: {
        select: { id: true, description: true, cost_difference: true, status: true, client_note: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    return (
      <DashboardLayout title="Portal Klien">
        <PageHeader
          breadcrumb="Portal Klien"
          title="Belum Ada Proyek Aktif"
          subtitle="Proyek Anda sedang dalam tahap penyiapan kontrak awal oleh tim Halo Bangun."
        />
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: 'var(--dash-card-bg)',
            borderRadius: '12px',
            border: '1px solid var(--dash-border)',
          }}
        >
          <div style={{ fontSize: '36px', color: 'var(--dash-text-muted)', marginBottom: '10px' }}>
            <i className="ri-building-line" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
            Belum ada proyek yang dikaitkan ke akun Anda
          </div>
          <div style={{ fontSize: '12px', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
            Hubungi kontak WhatsApp Halo Bangun di 0821-3545-0404 untuk inisiasi proyek.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Safely serialize for Client Components
  const serializedProject = {
    ...project,
    sCurveProgress: project.sCurveProgress.map((item) => ({
      ...item,
      planned_cost: item.planned_cost ? Number(item.planned_cost) : null,
      actual_cost: item.actual_cost ? Number(item.actual_cost) : null,
      target_date: item.target_date ? item.target_date.toISOString() : null,
    })),
    dailyReports: project.dailyReports.map((dr) => ({
      ...dr,
      date: dr.date ? dr.date.toISOString() : null,
      createdAt: dr.createdAt ? dr.createdAt.toISOString() : null,
    })),
  };

  return (
    <DashboardLayout title="Portal Klien (Live Project Monitor)">
      <PageHeader
        breadcrumb="Portal Klien Terpadu"
        title={project.name}
        subtitle={`Lokasi: ${project.location} • Pengawas Lapangan: ${project.pm?.name || 'Senior PM Halo Bangun'} (${project.pm?.phone || '0821-3545-0404'})`}
      />

      <ClientDashboardConsole project={serializedProject as any} />
    </DashboardLayout>
  );
}
