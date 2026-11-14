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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let where: any = {};
    if (projectId) where.project_id = Number(projectId);

    const items = await prisma.equipmentInventory.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, equipment: items });
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

    if (!['PM', 'MANDOR', 'OWNER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Role tidak diizinkan menambah inventaris' }, { status: 403 });
    }

    const body = await request.json();
    const { projectId, itemName, status, rentalDuration, rentalCost, notes } = body;

    if (!itemName) {
      return NextResponse.json({ success: false, error: 'Nama peralatan wajib diisi' }, { status: 400 });
    }

    const item = await prisma.equipmentInventory.create({
      data: {
        project_id: projectId ? Number(projectId) : null,
        item_name: itemName,
        status: status === 'SEWA' ? 'SEWA' : 'MILIK_SENDIRI',
        rental_duration: rentalDuration || '',
        rental_cost: parseFloat(rentalCost) || 0,
        notes: notes || '',
      },
      include: { project: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Inventaris alat kerja berhasil dicatat',
      equipment: item,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

