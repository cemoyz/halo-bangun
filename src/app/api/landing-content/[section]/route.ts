import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getLandingSectionContent, saveLandingSectionContent } from '@/lib/landingContent';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    section: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { section } = await params;
    const data = await getLandingSectionContent(section);
    return NextResponse.json({ success: true, section, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { section } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Only OWNER can modify landing page CMS content
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya Owner yang dapat mengubah konten landing page' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Payload tidak valid' }, { status: 400 });
    }

    const saved = await saveLandingSectionContent(section, body);

    return NextResponse.json({
      success: true,
      message: `Konten section "${section}" berhasil diperbarui`,
      data: saved.data,
    });
  } catch (err: any) {
    console.error('Error saving section:', err);
    return NextResponse.json({ success: false, error: err.message || 'Gagal menyimpan data' }, { status: 500 });
  }
}

