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

    // Mandor has NO ACCESS to addendums
    if (user.role === 'MANDOR') {
      return NextResponse.json({ success: false, error: 'Mandor tidak memiliki akses addendum' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let where: any = {};
    if (projectId) where.project_id = Number(projectId);

    if (user.role === 'CLIENT') {
      where.project = { client_id: user.id };
    }

    const addendums = await prisma.addendum.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, addendums });
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

    if (!['PM', 'OWNER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya Pengawas Lapangan atau Direktur yang dapat mengajukan draf Addendum' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectId, description, costDifference } = body;

    if (!projectId || !description) {
      return NextResponse.json(
        { success: false, error: 'Proyek dan rincian pekerjaan tambah/kurang wajib diisi' },
        { status: 400 }
      );
    }

    const addendum = await prisma.addendum.create({
      data: {
        project_id: Number(projectId),
        description,
        cost_difference: parseFloat(costDifference) || 0,
        status: 'PENDING_FINANCE',
        submitted_by: user.id,
      },
      include: { project: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Draf Addendum (COR/ADD) berhasil diajukan dan diteruskan ke tim Finance untuk kalkulasi',
      addendum,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

