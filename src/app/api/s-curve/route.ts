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

    // MANDOR and FINANCE are strictly prohibited from viewing Kurva S
    if (['MANDOR', 'FINANCE'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses modul Kurva S dilarang untuk role Mandor & Finance' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get('projectId');

    // If client, fetch their allowed projects first
    let allowedProjects: any[] = [];
    if (user.role === 'CLIENT') {
      allowedProjects = await prisma.project.findMany({
        where: { client_id: user.id },
        select: { id: true, name: true, contract_value: true, status: true, location: true },
        orderBy: { id: 'asc' },
      });
      if (allowedProjects.length === 0) {
        return NextResponse.json({
          success: true,
          projects: [],
          project: null,
          progress: [],
          summary: null,
        });
      }
    } else {
      allowedProjects = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          contract_value: true,
          status: true,
          location: true,
          pm: { select: { name: true, phone: true } },
          client: { select: { name: true, phone: true } },
        },
        orderBy: { id: 'asc' },
      });
    }

    // Determine target project
    const targetProjectId = projectIdParam
      ? parseInt(projectIdParam, 10)
      : allowedProjects[0]?.id;

    if (!targetProjectId) {
      return NextResponse.json({
        success: true,
        projects: allowedProjects,
        project: null,
        progress: [],
      });
    }

    // Verify client has permission to this project
    if (user.role === 'CLIENT' && !allowedProjects.some((p) => p.id === targetProjectId)) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki hak akses untuk proyek ini' },
        { status: 403 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: targetProjectId },
      include: {
        pm: { select: { id: true, name: true, phone: true } },
        client: { select: { id: true, name: true, phone: true } },
        sCurveProgress: {
          orderBy: { week_number: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Proyek tidak ditemukan' }, { status: 404 });
    }

    // Recalculate/normalize cumulative values and costs if missing
    let runningPlanned = 0;
    let runningActual = 0;
    const contractVal = Number(project.contract_value) || 0;

    const normalizedProgress = project.sCurveProgress.map((item) => {
      // If planned_percentage seems cumulative (e.g. earlier seeds stored cumulative directly where last week = 100),
      // we check if cumulative_planned was stored.
      let cumPlanned = item.cumulative_planned;
      let cumActual = item.cumulative_actual;

      if (cumPlanned === 0 && item.planned_percentage > 0) {
        // If planned_percentage was used as cumulative
        cumPlanned = item.planned_percentage;
      }
      if (cumActual === 0 && item.actual_percentage > 0) {
        cumActual = item.actual_percentage;
      }

      const pCost = item.planned_cost !== null && item.planned_cost !== undefined
        ? Number(item.planned_cost)
        : Math.round((item.planned_percentage / 100) * contractVal);

      const aCost = item.actual_cost !== null && item.actual_cost !== undefined
        ? Number(item.actual_cost)
        : Math.round((item.actual_percentage / 100) * contractVal);

      return {
        id: item.id,
        project_id: item.project_id,
        week_number: item.week_number,
        planned_percentage: Number(item.planned_percentage),
        actual_percentage: Number(item.actual_percentage),
        cumulative_planned: Number(cumPlanned),
        cumulative_actual: Number(cumActual),
        planned_cost: pCost,
        actual_cost: aCost,
        status: item.status || 'IN_PROGRESS',
        notes: item.notes || '',
        target_date: item.target_date ? item.target_date.toISOString().split('T')[0] : null,
      };
    });

    // Compute summary metrics
    const totalWeeks = normalizedProgress.length;
    // Current week: the latest week where actual_percentage > 0 or week 1
    const recordedWeeks = normalizedProgress.filter((w) => w.cumulative_actual > 0);
    const latestRecorded = recordedWeeks.length > 0 ? recordedWeeks[recordedWeeks.length - 1] : normalizedProgress[0];

    const currentCumulativePlanned = latestRecorded ? latestRecorded.cumulative_planned : 0;
    const currentCumulativeActual = latestRecorded ? latestRecorded.cumulative_actual : 0;
    const deviation = parseFloat((currentCumulativeActual - currentCumulativePlanned).toFixed(2));

    let deviationStatus: 'AHEAD' | 'ON_TRACK' | 'DELAYED' = 'ON_TRACK';
    if (deviation > 0.5) deviationStatus = 'AHEAD';
    else if (deviation < -0.5) deviationStatus = 'DELAYED';

    const totalPlannedPct = normalizedProgress.reduce((sum, w) => sum + w.planned_percentage, 0);
    const totalActualPct = normalizedProgress.reduce((sum, w) => sum + w.actual_percentage, 0);

    const summary = {
      totalWeeks,
      currentWeekNumber: latestRecorded ? latestRecorded.week_number : 1,
      currentCumulativePlanned,
      currentCumulativeActual,
      deviation,
      deviationStatus,
      totalPlannedPct: parseFloat(totalPlannedPct.toFixed(2)),
      totalActualPct: parseFloat(totalActualPct.toFixed(2)),
      contractValue: contractVal,
      isCompleted: currentCumulativeActual >= 100,
    };

    return NextResponse.json({
      success: true,
      userRole: user.role,
      projects: allowedProjects,
      project: {
        id: project.id,
        name: project.name,
        location: project.location,
        contract_value: contractVal,
        status: project.status,
        pm: project.pm,
        client: project.client,
      },
      progress: normalizedProgress,
      summary,
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

    // Only PM and OWNER can update Kurva S
    if (!['PM', 'OWNER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya Pengawas Lapangan (PM) atau Direktur yang dapat memperbarui Kurva S' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectId, action, weeks, weekData, scheduleDocUrl } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'ID Proyek wajib disertakan' },
        { status: 400 }
      );
    }

    const pId = Number(projectId);
    const project = await prisma.project.findUnique({
      where: { id: pId },
      select: { id: true, name: true, contract_value: true },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Proyek tidak ditemukan' }, { status: 404 });
    }

    const contractVal = Number(project.contract_value) || 0;

    // ACTION: OWNER SAVES PLANNED TARGET MATRIX (PERENCANAAN OWNER)
    if (action === 'save_owner_plan' && Array.isArray(weeks)) {
      if (user.role !== 'OWNER') {
        return NextResponse.json(
          { success: false, error: 'Hanya Direktur / Owner yang berwenang menetapkan Perencanaan Target Kurva S' },
          { status: 403 }
        );
      }

      const sortedWeeks = [...weeks].sort((a, b) => Number(a.week_number) - Number(b.week_number));
      let runningPlanned = 0;

      for (let i = 0; i < sortedWeeks.length; i++) {
        const item = sortedWeeks[i];
        const wNum = parseInt(item.week_number, 10);
        const pPct = parseFloat(item.planned_percentage) || 0;
        runningPlanned = parseFloat((runningPlanned + pPct).toFixed(2));
        const pCost = (pPct / 100) * contractVal;

        // Upsert without altering supervisor actual percentage
        const existing = await prisma.sCurveProgress.findUnique({
          where: { project_id_week_number: { project_id: pId, week_number: wNum } },
        });

        if (existing) {
          await prisma.sCurveProgress.update({
            where: { id: existing.id },
            data: {
              planned_percentage: pPct,
              cumulative_planned: runningPlanned,
              planned_cost: pCost,
              notes: item.notes || existing.notes,
              target_date: item.target_date ? new Date(item.target_date) : existing.target_date,
            },
          });
        } else {
          await prisma.sCurveProgress.create({
            data: {
              project_id: pId,
              week_number: wNum,
              planned_percentage: pPct,
              actual_percentage: 0,
              cumulative_planned: runningPlanned,
              cumulative_actual: 0,
              planned_cost: pCost,
              actual_cost: 0,
              status: 'IN_PROGRESS',
              notes: item.notes || null,
              target_date: item.target_date ? new Date(item.target_date) : null,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Perencanaan Target Kurva S (${sortedWeeks.length} Minggu, Kumulatif: ${runningPlanned}%) berhasil ditetapkan oleh Owner.`,
      });
    }

    // ACTION: SUPERVISOR/PM SAVES ACTUAL WEEKLY PROGRESS REPORT (LAPORAN MINGGUAN PENGAWAS)
    if (action === 'save_supervisor_report' && Array.isArray(weeks)) {
      if (!['PM', 'OWNER'].includes(user.role)) {
        return NextResponse.json(
          { success: false, error: 'Hanya Pengawas Lapangan (PM) atau Owner yang dapat menginput Realisasi Mingguan' },
          { status: 403 }
        );
      }

      const sortedWeeks = [...weeks].sort((a, b) => Number(a.week_number) - Number(b.week_number));
      let runningActual = 0;

      for (let i = 0; i < sortedWeeks.length; i++) {
        const item = sortedWeeks[i];
        const wNum = parseInt(item.week_number, 10);
        const aPct = parseFloat(item.actual_percentage) || 0;

        if (aPct > 0 || (item.cumulative_actual && item.cumulative_actual > 0)) {
          runningActual = parseFloat((runningActual + aPct).toFixed(2));
        }

        const aCost = (aPct / 100) * contractVal;

        const existing = await prisma.sCurveProgress.findUnique({
          where: { project_id_week_number: { project_id: pId, week_number: wNum } },
        });

        if (existing) {
          await prisma.sCurveProgress.update({
            where: { id: existing.id },
            data: {
              actual_percentage: aPct,
              cumulative_actual: aPct > 0 ? runningActual : existing.cumulative_actual,
              actual_cost: aCost,
              status: item.status || existing.status,
              notes: item.notes || existing.notes,
            },
          });
        } else {
          await prisma.sCurveProgress.create({
            data: {
              project_id: pId,
              week_number: wNum,
              planned_percentage: 0,
              actual_percentage: aPct,
              cumulative_planned: 0,
              cumulative_actual: runningActual,
              planned_cost: 0,
              actual_cost: aCost,
              status: item.status || 'IN_PROGRESS',
              notes: item.notes || null,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Laporan Progres Mingguan Lapangan berhasil disimpan oleh Pengawas (Akumulasi Riil: ${runningActual}%).`,
      });
    }

    // ACTION: SYNC FROM DAILY REPORTS (REKAP LAPORAN HARIAN KE MINGGUAN)
    if (action === 'sync_daily_reports') {
      const dailyReports = await prisma.dailyReport.findMany({
        where: { project_id: pId },
        include: { items: true },
        orderBy: { day_number: 'asc' },
      });

      // Group reports by week: Week 1 (Days 1..7), Week 2 (Days 8..14), etc.
      const weeklyProgressMap: { [week: number]: { count: number; items: string[] } } = {};
      for (const dr of dailyReports) {
        const day = dr.day_number || 1;
        const weekNum = Math.ceil(day / 7);
        if (!weeklyProgressMap[weekNum]) {
          weeklyProgressMap[weekNum] = { count: 0, items: [] };
        }
        weeklyProgressMap[weekNum].count += 1;
        for (const itm of dr.items) {
          weeklyProgressMap[weekNum].items.push(`${itm.task_name} (${itm.status})`);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Terdapat ${dailyReports.length} laporan harian pengawas yang tersinkronisasi.`,
        weeklyProgressMap,
      });
    }

    // ACTION: BATCH SAVE / SYNC ALL WEEKS
    if (action === 'batch_save' && Array.isArray(weeks)) {
      // Sort weeks by week_number
      const sortedWeeks = [...weeks].sort((a, b) => Number(a.week_number) - Number(b.week_number));

      // Calculate running cumulative sums
      let runningCumPlanned = 0;
      let runningCumActual = 0;

      for (let i = 0; i < sortedWeeks.length; i++) {
        const item = sortedWeeks[i];
        const wNum = parseInt(item.week_number, 10);
        const pPct = parseFloat(item.planned_percentage) || 0;
        const aPct = parseFloat(item.actual_percentage) || 0;

        // If user provided cumulative explicitly, respect it or use running sum
        runningCumPlanned = item.cumulative_planned !== undefined && item.cumulative_planned !== null && item.cumulative_planned > 0
          ? parseFloat(item.cumulative_planned)
          : runningCumPlanned + pPct;

        runningCumActual = item.cumulative_actual !== undefined && item.cumulative_actual !== null && item.cumulative_actual > 0
          ? parseFloat(item.cumulative_actual)
          : runningCumActual + aPct;

        const pCost = item.planned_cost !== undefined && item.planned_cost !== null
          ? parseFloat(item.planned_cost)
          : (pPct / 100) * contractVal;

        const aCost = item.actual_cost !== undefined && item.actual_cost !== null
          ? parseFloat(item.actual_cost)
          : (aPct / 100) * contractVal;

        await prisma.sCurveProgress.upsert({
          where: {
            project_id_week_number: {
              project_id: pId,
              week_number: wNum,
            },
          },
          update: {
            planned_percentage: pPct,
            actual_percentage: aPct,
            cumulative_planned: runningCumPlanned,
            cumulative_actual: runningCumActual,
            planned_cost: pCost,
            actual_cost: aCost,
            status: item.status || 'IN_PROGRESS',
            notes: item.notes || null,
            target_date: item.target_date ? new Date(item.target_date) : null,
          },
          create: {
            project_id: pId,
            week_number: wNum,
            planned_percentage: pPct,
            actual_percentage: aPct,
            cumulative_planned: runningCumPlanned,
            cumulative_actual: runningCumActual,
            planned_cost: pCost,
            actual_cost: aCost,
            status: item.status || 'IN_PROGRESS',
            notes: item.notes || null,
            target_date: item.target_date ? new Date(item.target_date) : null,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Berhasil memperbarui data Kurva S (${sortedWeeks.length} minggu) untuk ${project.name}`,
      });
    }

    // ACTION: ADD NEW WEEK (e.g. Addendum / Pekerjaan Tambah Kurang)
    if (action === 'add_week') {
      const highestWeek = await prisma.sCurveProgress.findFirst({
        where: { project_id: pId },
        orderBy: { week_number: 'desc' },
      });

      const nextWeekNum = (highestWeek?.week_number || 0) + 1;
      const isAddendum = nextWeekNum > 6;

      const newRecord = await prisma.sCurveProgress.create({
        data: {
          project_id: pId,
          week_number: nextWeekNum,
          planned_percentage: 0,
          actual_percentage: 0,
          cumulative_planned: highestWeek?.cumulative_planned || 100,
          cumulative_actual: highestWeek?.cumulative_actual || 0,
          planned_cost: 0,
          actual_cost: 0,
          status: 'IN_PROGRESS',
          notes: isAddendum ? 'Penambahan Minggu Addendum / Tambah Kurang' : '',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menambahkan Minggu ke-${nextWeekNum} (Addendum/Jadwal Lanjutan)`,
        data: newRecord,
      });
    }

    // ACTION: DELETE LATEST WEEK
    if (action === 'delete_latest_week') {
      const highestWeek = await prisma.sCurveProgress.findFirst({
        where: { project_id: pId },
        orderBy: { week_number: 'desc' },
      });

      if (!highestWeek) {
        return NextResponse.json({ success: false, error: 'Tidak ada data minggu untuk dihapus' }, { status: 400 });
      }

      await prisma.sCurveProgress.delete({
        where: { id: highestWeek.id },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menghapus Minggu ke-${highestWeek.week_number}`,
      });
    }

    // ACTION: SINGLE WEEK UPSERT (DEFAULT)
    const {
      weekNumber,
      plannedPercentage,
      actualPercentage,
      cumulativePlanned,
      cumulativeActual,
      plannedCost,
      actualCost,
      status = 'IN_PROGRESS',
      notes,
      targetDate,
    } = weekData || body;

    if (!weekNumber) {
      return NextResponse.json(
        { success: false, error: 'Nomor Minggu wajib diisi' },
        { status: 400 }
      );
    }

    const wNum = parseInt(weekNumber, 10);
    const planned = parseFloat(plannedPercentage) || 0;
    const actual = parseFloat(actualPercentage) || 0;
    const cumPlanned = cumulativePlanned !== undefined ? parseFloat(cumulativePlanned) : planned;
    const cumActual = cumulativeActual !== undefined ? parseFloat(cumulativeActual) : actual;

    const pCost = plannedCost !== undefined && plannedCost !== null
      ? parseFloat(plannedCost)
      : (planned / 100) * contractVal;

    const aCost = actualCost !== undefined && actualCost !== null
      ? parseFloat(actualCost)
      : (actual / 100) * contractVal;

    const updated = await prisma.sCurveProgress.upsert({
      where: {
        project_id_week_number: {
          project_id: pId,
          week_number: wNum,
        },
      },
      update: {
        planned_percentage: planned,
        actual_percentage: actual,
        cumulative_planned: cumPlanned,
        cumulative_actual: cumActual,
        planned_cost: pCost,
        actual_cost: aCost,
        status,
        notes: notes || null,
        target_date: targetDate ? new Date(targetDate) : undefined,
      },
      create: {
        project_id: pId,
        week_number: wNum,
        planned_percentage: planned,
        actual_percentage: actual,
        cumulative_planned: cumPlanned,
        cumulative_actual: cumActual,
        planned_cost: pCost,
        actual_cost: aCost,
        status,
        notes: notes || null,
        target_date: targetDate ? new Date(targetDate) : undefined,
      },
    });

    // If schedule file was uploaded, register as project document
    if (scheduleDocUrl) {
      await prisma.projectDocument.create({
        data: {
          project_id: pId,
          doc_type: 'RENCANA_KERJA',
          title: `Pembaruan Jadwal Kerja Mingguan (Minggu ke-${wNum})`,
          file_url: scheduleDocUrl,
          is_locked: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Kurva S Minggu ke-${wNum} berhasil disimpan (Rencana: ${planned}%, Riil: ${actual}%)`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
