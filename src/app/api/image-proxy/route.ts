import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import http from 'http';
import dns from 'dns';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const IB_IPS = ['45.43.142.5', '45.43.142.2', '45.43.142.3', '45.43.142.4'];

function fetchRemoteImage(url: string, redirects = 0): Promise<{ buffer: Buffer; contentType: string; status: number }> {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Too many redirects'));

    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const isIb = parsed.hostname.includes('ibb.co');
    const client = isHttps ? https : http;

    const options: any = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Referer: '', // Empty referrer to avoid hotlink blocks
      },
      timeout: 12000,
    };

    if (isIb && isHttps) {
      options.agent = new https.Agent({
        lookup: (hostname, opts: any, cb: any) => {
          if (typeof opts === 'function') {
            cb = opts;
            opts = {};
          }
          if (hostname === 'i.ibb.co' || hostname === 'ibb.co') {
            const ip = IB_IPS[Math.floor(Math.random() * IB_IPS.length)];
            if (opts && opts.all) return cb(null, [{ address: ip, family: 4 }]);
            return cb(null, ip, 4);
          }
          return dns.lookup(hostname, opts, cb);
        },
        rejectUnauthorized: true,
      });
    }

    const req = client.get(url, options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).toString();
        }
        return resolve(fetchRemoteImage(redirectUrl, redirects + 1));
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || 'image/jpeg';
        resolve({ buffer, contentType, status: res.statusCode || 200 });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Proxy request timed out'));
    });
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new NextResponse('URL query parameter missing', { status: 400 });
    }

    const cleanUrl = targetUrl.trim();

    // 1. If it's a relative local URL, redirect directly
    if (cleanUrl.startsWith('/')) {
      return NextResponse.redirect(new URL(cleanUrl, request.url));
    }

    // 2. Attempt remote fetch
    try {
      const result = await fetchRemoteImage(cleanUrl);
      if (result.status === 200 && result.buffer.length > 0) {
        return new NextResponse(result.buffer, {
          status: 200,
          headers: {
            'Content-Type': result.contentType,
            'Cache-Control': 'public, max-age=2592000, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch (fetchErr) {
      console.warn('Image proxy remote fetch failed, falling back:', fetchErr);
    }

    // 3. Fallback: Search local files by basename in public/uploads/
    try {
      const filename = path.basename(new URL(cleanUrl).pathname);
      const possibleFolders = ['documents', 'daily-reports', 'receipts', 'schedules', 'slips', 'cms', 'portfolio'];
      for (const folder of possibleFolders) {
        const localPath = path.join(process.cwd(), 'public', 'uploads', folder, filename);
        if (fs.existsSync(localPath)) {
          const fileBuffer = fs.readFileSync(localPath);
          const ext = path.extname(filename).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
          };
          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              'Content-Type': mimeTypes[ext] || 'image/jpeg',
              'Cache-Control': 'public, max-age=2592000, immutable',
            },
          });
        }
      }
    } catch (localErr) {
      // ignore
    }

    // 4. Ultimate fallback: transparent 1x1 GIF so UI doesn't break
    const fallbackPixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(fallbackPixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return new NextResponse(err.message || 'Image Proxy Error', { status: 500 });
  }
}
