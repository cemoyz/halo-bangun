import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // MANDOR and FINANCE are strictly prohibited from accessing Daily Reports
    if (['MANDOR', 'FINANCE'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses modul Laporan Harian dilarang untuk role Mandor & Finance' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get('projectId');

    // Get allowed projects based on role
    let allowedProjects: any[] = [];
    if (user.role === 'CLIENT') {
      allowedProjects = await prisma.project.findMany({
        where: { client_id: user.id },
        select: { id: true, name: true, location: true, status: true, contract_value: true },
        orderBy: { id: 'desc' },
      });
      if (allowedProjects.length === 0) {
        return NextResponse.json({ success: true, projects: [], reports: [], summary: null });
      }
    } else {
      allowedProjects = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          location: true,
          status: true,
          contract_value: true,
          pm: { select: { name: true, phone: true } },
          client: { select: { name: true, phone: true } },
        },
        orderBy: { id: 'desc' },
      });
    }

    const targetProjectId = projectIdParam ? parseInt(projectIdParam, 10) : allowedProjects[0]?.id;

    if (!targetProjectId) {
      return NextResponse.json({ success: true, projects: allowedProjects, reports: [] });
    }

    // Verify client has permission to this project
    if (user.role === 'CLIENT' && !allowedProjects.some((p) => p.id === targetProjectId)) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki hak akses untuk proyek ini' },
        { status: 403 }
      );
    }

    // Client only sees SUBMITTED reports (hides DRAFT)
    const reportWhere: any = {
      project_id: targetProjectId,
    };
    if (user.role === 'CLIENT') {
      reportWhere.status = 'SUBMITTED';
    }

    const reports = await prisma.dailyReport.findMany({
      where: reportWhere,
      include: {
        project: { select: { id: true, name: true, location: true, contract_value: true } },
        author: { select: { id: true, name: true, role: true } },
        items: {
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Summary calculations
    const totalReports = reports.length;
    const totalWorkersSum = reports.reduce((sum, r) => sum + (r.worker_count || 0), 0);
    const avgWorkers = totalReports > 0 ? Math.round(totalWorkersSum / totalReports) : 0;
    const totalPhotos = reports.reduce((sum, r) => sum + (r.photos?.length || 0), 0);
    const latestReport = reports[0] || null;

    return NextResponse.json({
      success: true,
      projects: allowedProjects,
      reports,
      summary: {
        totalReports,
        avgWorkers,
        totalPhotos,
        latestReportDate: latestReport?.date || null,
        latestWeather: latestReport?.weather || 'Cerah',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only PM and OWNER can submit or draft daily reports
    if (!['PM', 'OWNER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya Pengawas Lapangan (PM) atau Direktur yang dapat menginput laporan harian' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      projectId,
      dayNumber,
      date,
      weather = 'Cerah',
      weatherDetails,
      workerCount = 0,
      manpowerDetails,
      materialsDetails,
      supervisorName,
      contractorName,
      notes,
      obstacles,
      solutions,
      photos = [],
      status = 'SUBMITTED',
      items = [],
    } = body;

    if (!projectId || !notes) {
      return NextResponse.json(
        { success: false, error: 'Proyek dan ringkasan pekerjaan harian wajib diisi' },
        { status: 400 }
      );
    }

    // Strictly enforce maximum 3 photos
    const safePhotos: string[] = Array.isArray(photos) ? photos.slice(0, 3) : [];

    // Parse date
    const reportDate = date ? new Date(date) : new Date();

    // Create report with items in a transaction
    const newReport = await prisma.dailyReport.create({
      data: {
        project_id: Number(projectId),
        day_number: dayNumber ? parseInt(dayNumber, 10) : null,
        date: reportDate,
        weather,
        weather_details: weatherDetails || null,
        worker_count: parseInt(workerCount, 10) || 0,
        manpower_details: manpowerDetails || null,
        materials_details: materialsDetails || null,
        supervisor_name: supervisorName || null,
        contractor_name: contractorName || null,
        notes,
        obstacles: obstacles || null,
        solutions: solutions || null,
        photos: safePhotos,
        status: status === 'DRAFT' ? 'DRAFT' : 'SUBMITTED',
        created_by: user.id,
        items: {
          create: Array.isArray(items)
            ? items.map((it: any) => ({
                task_name: it.task_name || 'Pekerjaan Harian',
                category: it.category || 'Struktur',
                status: it.status || 'IN_PROGRESS',
                volume: it.volume || '',
                notes: it.notes || '',
              }))
            : [],
        },
      },
      include: {
        project: true,
        author: true,
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        status === 'DRAFT'
          ? 'Draf laporan harian berhasil disimpan'
          : 'Laporan harian berhasil disubmit & otomatis tersinkron ke Portal Klien',
      report: newReport,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!['PM', 'OWNER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya Pengawas Lapangan atau Direktur yang dapat mengedit laporan harian' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      dayNumber,
      weather,
      weatherDetails,
      workerCount,
      manpowerDetails,
      materialsDetails,
      supervisorName,
      contractorName,
      notes,
      obstacles,
      solutions,
      photos,
      status,
      items,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Laporan wajib diisi' }, { status: 400 });
    }

    const reportId = Number(id);
    const existing = await prisma.dailyReport.findUnique({ where: { id: reportId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const safePhotos = photos !== undefined ? (Array.isArray(photos) ? photos.slice(0, 3) : []) : existing.photos;

    // Update report
    const updated = await prisma.$transaction(async (tx) => {
      // If items provided, clear existing items and recreate
      if (Array.isArray(items)) {
        await tx.dailyReportItem.deleteMany({ where: { daily_report_id: reportId } });
        if (items.length > 0) {
          await tx.dailyReportItem.createMany({
            data: items.map((it: any) => ({
              daily_report_id: reportId,
              task_name: it.task_name || 'Pekerjaan Harian',
              category: it.category || 'Struktur',
              status: it.status || 'IN_PROGRESS',
              volume: it.volume || '',
              notes: it.notes || '',
            })),
          });
        }
      }

      return await tx.dailyReport.update({
        where: { id: reportId },
        data: {
          day_number: dayNumber !== undefined ? (dayNumber ? parseInt(dayNumber, 10) : null) : existing.day_number,
          weather: weather ?? existing.weather,
          weather_details: weatherDetails !== undefined ? weatherDetails : existing.weather_details,
          worker_count: workerCount !== undefined ? parseInt(workerCount, 10) : existing.worker_count,
          manpower_details: manpowerDetails !== undefined ? manpowerDetails : (existing.manpower_details as any),
          materials_details: materialsDetails !== undefined ? materialsDetails : (existing.materials_details as any),
          supervisor_name: supervisorName !== undefined ? supervisorName : existing.supervisor_name,
          contractor_name: contractorName !== undefined ? contractorName : existing.contractor_name,
          notes: notes ?? existing.notes,
          obstacles: obstacles !== undefined ? obstacles : existing.obstacles,
          solutions: solutions !== undefined ? solutions : existing.solutions,
          photos: safePhotos,
          status: status ?? existing.status,
        },
        include: {
          items: true,
          project: true,
          author: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Laporan harian berhasil diperbarui',
      report: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!['PM', 'OWNER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya Pengawas Lapangan atau Direktur yang dapat menghapus laporan harian' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Laporan wajib diisi' }, { status: 400 });
    }

    await prisma.dailyReport.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Laporan harian berhasil dihapus',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
