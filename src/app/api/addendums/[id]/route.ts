import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const addendumId = Number(id);
    const body = await request.json();
    const { action, costDifference, clientNote } = body;

    const addendum = await prisma.addendum.findUnique({
      where: { id: addendumId },
      include: { project: true },
    });

    if (!addendum) {
      return NextResponse.json({ success: false, error: 'Addendum tidak ditemukan' }, { status: 404 });
    }

    // Action A: Finance forwards calculated addendum to client
    if (action === 'finance_forward') {
      if (user.role !== 'FINANCE' && user.role !== 'OWNER') {
        return NextResponse.json({ success: false, error: 'Hanya Finance yang dapat mengkalkulasi dan mengirim addendum ke Klien' }, { status: 403 });
      }

      const updated = await prisma.addendum.update({
        where: { id: addendumId },
        data: {
          cost_difference: costDifference !== undefined ? parseFloat(costDifference) : addendum.cost_difference,
          status: 'PENDING_CLIENT',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Kalkulasi biaya Addendum berhasil disimpan dan dikirimkan ke Klien untuk disetujui',
        addendum: updated,
      });
    }

    // Action B: Client Approves Addendum
    if (action === 'client_approve') {
      if (user.role !== 'CLIENT' && user.role !== 'OWNER') {
        return NextResponse.json({ success: false, error: 'Hanya Klien yang berwenang menyetujui addendum' }, { status: 403 });
      }

      const updated = await prisma.addendum.update({
        where: { id: addendumId },
        data: {
          status: 'APPROVED',
          client_note: clientNote || 'Disetujui oleh Klien via Portal Klien.',
        },
      });

      // Automatically adjust project contract value
      await prisma.project.update({
        where: { id: addendum.project_id },
        data: {
          contract_value: {
            increment: addendum.cost_difference,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Addendum (Pekerjaan Tambah/Kurang) berhasil Anda setujui! Nilai kontrak proyek telah diperbarui.',
        addendum: updated,
      });
    }

    // Action C: Client Rejects Addendum
    if (action === 'client_reject') {
      if (user.role !== 'CLIENT' && user.role !== 'OWNER') {
        return NextResponse.json({ success: false, error: 'Hanya Klien yang berwenang menolak addendum' }, { status: 403 });
      }

      const updated = await prisma.addendum.update({
        where: { id: addendumId },
        data: {
          status: 'REJECTED',
          client_note: clientNote || 'Ditolak oleh Klien.',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Addendum ditolak oleh Klien.',
        addendum: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

