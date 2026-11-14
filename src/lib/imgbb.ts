import prisma from '@/lib/prisma';

export interface ImgBBUploadResponse {
  success: boolean;
  url?: string;
  display_url?: string;
  thumb_url?: string;
  delete_url?: string;
  error?: string;
  raw?: any;
}

/**
 * Transforms an image URL so it displays reliably on all Indonesian ISPs.
 * If the image is hosted on ImgBB (i.ibb.co / ibb.co), which is DNS-blocked by
 * Kominfo/Indonesian ISPs (redirected to lamanlabuh.aduankonten.id), this helper
 * routes the URL through /api/image-proxy which uses DoH / direct IP bypass.
 */
export function formatSafeImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Local relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('/api/image-proxy')) {
    return trimmed;
  }

  // If already proxied
  if (trimmed.includes('/api/image-proxy')) {
    return trimmed;
  }

  // ImgBB domains blocked in Indonesia
  if (trimmed.includes('i.ibb.co') || trimmed.includes('ibb.co')) {
    return `/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

/**
 * Resolves the active ImgBB API Key:
 * 1. Custom key passed directly
 * 2. Database setting (LandingPageContent 'settings' section)
 * 3. Environment variable `IMGBB_API_KEY`
 */
export async function getImgBBApiKey(customKey?: string): Promise<string | null> {
  if (customKey && customKey.trim()) return customKey.trim();

  // Check database settings
  try {
    const settingContent = await prisma.landingPageContent.findUnique({
      where: { section: 'settings' },
    });
    const dbKey = (settingContent?.data as any)?.imgbb_api_key;
    if (dbKey && typeof dbKey === 'string' && dbKey.trim()) {
      return dbKey.trim();
    }
  } catch (e) {
    // ignore if table not ready or error
  }

  // Fallback to environment variable
  return process.env.IMGBB_API_KEY?.trim() || null;
}

/**
 * Upload an image to ImgBB API v1
 * @param imageBuffer Buffer or base64 string
 * @param fileName Optional file name
 * @param customKey Optional override key
 */
export async function uploadToImgBB(
  imageBuffer: Buffer | string,
  fileName?: string,
  customKey?: string
): Promise<ImgBBUploadResponse> {
  const apiKey = await getImgBBApiKey(customKey);

  if (!apiKey) {
    return {
      success: false,
      error: 'ImgBB API Key belum dikonfigurasi. Silakan masukkan API Key di Pengaturan Dashboard atau .env',
    };
  }

  try {
    const base64Data =
      typeof imageBuffer === 'string'
        ? imageBuffer.replace(/^data:image\/\w+;base64,/, '')
        : imageBuffer.toString('base64');

    const formData = new FormData();
    formData.append('image', base64Data);
    if (fileName) {
      formData.append('name', fileName);
    }

    const endpoint = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const errorMsg =
        result?.error?.message ||
        result?.message ||
        `Gagal upload ke ImgBB (Status: ${response.status})`;
      return { success: false, error: errorMsg };
    }

    return {
      success: true,
      url: result.data.url,
      display_url: result.data.display_url,
      thumb_url: result.data.thumb?.url || result.data.display_url,
      delete_url: result.data.delete_url,
      raw: result.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Koneksi ke ImgBB gagal.',
    };
  }
}

