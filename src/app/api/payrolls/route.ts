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

    // Role check: CLIENT has NO ACCESS to payrolls
    if (user.role === 'CLIENT') {
      return NextResponse.json({ success: false, error: 'Klien tidak memiliki akses ke data penggajian' }, { status: 403 });
    }

    // PM and Mandor only see their own payroll
    let where: any = {};
    if (user.role === 'PM' || user.role === 'MANDOR') {
      where.user_id = user.id;
    }

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true, designation: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, payrolls });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || (user.role !== 'FINANCE' && user.role !== 'OWNER')) {
      return NextResponse.json({ success: false, error: 'Hanya Finance atau Owner yang dapat menginput payroll' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, projectId, period, baseSalary, operationalAllowance, bonus, slipUrl } = body;

    if (!userId || !period) {
      return NextResponse.json({ success: false, error: 'Karyawan dan periode gaji wajib dipilih' }, { status: 400 });
    }

    const base = parseFloat(baseSalary) || 0;
    const oper = parseFloat(operationalAllowance) || 0;
    const bon = parseFloat(bonus) || 0;
    const total = base + oper + bon;

    const payroll = await prisma.payroll.create({
      data: {
        user_id: Number(userId),
        project_id: projectId ? Number(projectId) : null,
        period,
        base_salary: base,
        operational_allowance: oper,
        bonus: bon,
        total_amount: total,
        slip_url: slipUrl || null,
        status: 'PAID',
      },
      include: {
        user: { select: { name: true, role: true } },
        project: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Slip gaji periode ${period} untuk ${payroll.user.name} berhasil dibuat!`,
      payroll,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

