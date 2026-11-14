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

    // Mandor sees only their project materials or their inputs
    if (user.role === 'MANDOR') {
      where.input_by_role = 'MANDOR';
    }

    const purchases = await prisma.materialPurchase.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, purchases });
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

    if (!['PM', 'MANDOR', 'FINANCE', 'OWNER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Role tidak diizinkan mencatat material' }, { status: 403 });
    }

    const body = await request.json();
    const { projectId, itemName, quantity, storeName, storeWa, totalPrice, receiptUrl } = body;

    if (!projectId || !itemName || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Proyek, nama barang, dan jumlah material wajib diisi' },
        { status: 400 }
      );
    }

    const purchase = await prisma.materialPurchase.create({
      data: {
        project_id: Number(projectId),
        item_name: itemName,
        quantity,
        store_name: storeName || 'Toko Material Lapangan',
        store_wa: storeWa || '',
        total_price: parseFloat(totalPrice) || 0,
        receipt_url: receiptUrl || null,
        input_by_role: user.role,
      },
      include: { project: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Pembelian material berhasil dicatat',
      purchase,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

