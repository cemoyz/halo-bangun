import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
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
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'documents';
    const forceLocal = formData.get('forceLocal') === 'true';
    const customImgBBKey = formData.get('imgbbKey') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Max 32MB (ImgBB max limit is 32MB)
    if (buffer.length > 32 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Ukuran file maksimal 32MB' }, { status: 400 });
    }

    const originalName = file.name || 'uploaded_file';
    const ext = path.extname(originalName).toLowerCase() || '.bin';
    const isImage = /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(originalName) || file.type.startsWith('image/');

    // 1. Always save a local copy first for guaranteed zero-downtime availability and local proxy cache
    const allowedFolders = ['documents', 'daily-reports', 'receipts', 'schedules', 'slips', 'cms', 'portfolio'];
    const safeFolder = allowedFolders.includes(folder) ? folder : 'documents';

    const cleanBaseName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);

    const uniqueName = `${Date.now()}_${cleanBaseName}${ext}`;
    const targetDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
    await mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, uniqueName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeFolder}/${uniqueName}`;

    // 2. If it is an image and not forced to local, upload to ImgBB CDN
    const apiKey = await getImgBBApiKey(customImgBBKey || undefined);
    if (isImage && !forceLocal && apiKey) {
      try {
        const imgbbRes = await uploadToImgBB(buffer, originalName, apiKey);
        if (imgbbRes.success && imgbbRes.url) {
          const directImgUrl = imgbbRes.display_url || imgbbRes.url;
          return NextResponse.json({
            success: true,
            url: directImgUrl,
            display_url: directImgUrl,
            thumb_url: imgbbRes.thumb_url || directImgUrl,
            delete_url: imgbbRes.delete_url,
            local_url: publicUrl,
            proxy_url: `/api/image-proxy?url=${encodeURIComponent(directImgUrl)}`,
            provider: 'imgbb',
            filename: originalName,
            size: buffer.length,
          });
        } else {
          console.warn('ImgBB upload gagal, fallback ke penyimpanan lokal:', imgbbRes.error);
        }
      } catch (uploadErr) {
        console.warn('ImgBB upload exception, fallback ke penyimpanan lokal:', uploadErr);
      }
    }

    // 3. Fallback to local storage
    return NextResponse.json({
      success: true,
      url: publicUrl,
      local_url: publicUrl,
      proxy_url: publicUrl,
      provider: 'local',
      filename: originalName,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengunggah file' },
      { status: 500 }
    );
  }
}
