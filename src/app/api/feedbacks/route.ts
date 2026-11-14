import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, message, subject } = body;

    if (!projectId || !message) {
      return NextResponse.json({ success: false, error: 'Pesan masukan/saran wajib diisi' }, { status: 400 });
    }

    const feedback = await prisma.clientFeedback.create({
      data: {
        project_id: Number(projectId),
        client_id: user.id,
        subject: subject || 'Masukan & Evaluasi Klien',
        message,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Terima kasih! Masukan dan evaluasi Anda telah terkirim langsung ke Direktur dan Project Manager Halo Bangun.',
      feedback,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
