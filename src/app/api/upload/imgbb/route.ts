import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { uploadToImgBB, getImgBBApiKey } from '@/lib/imgbb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const customKey = (formData.get('key') as string) || undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File gambar wajib disertakan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save a local cache copy as backup
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const targetDir = path.join(process.cwd(), 'public', 'uploads', 'cms');
      await fs.mkdir(targetDir, { recursive: true });
      const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9_.-]/g, '_') : 'image.jpg';
      await fs.writeFile(path.join(targetDir, safeName), buffer);
    } catch (e) {
      // cache save error is non-blocking
    }

    const result = await uploadToImgBB(buffer, file.name, customKey);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const directUrl = result.display_url || result.url;
    return NextResponse.json({
      success: true,
      data: {
        url: directUrl,
        display_url: directUrl,
        thumb_url: result.thumb_url || directUrl,
        delete_url: result.delete_url,
        proxy_url: `/api/image-proxy?url=${encodeURIComponent(directUrl || '')}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses upload ImgBB' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if ImgBB API key is active
export async function GET() {
  const key = await getImgBBApiKey();
  return NextResponse.json({
    configured: !!key,
    maskedKey: key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : null,
  });
}

