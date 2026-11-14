import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { canAccessRoute, Role, ROLE_CONFIGS } from './src/lib/rbac';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'halo-bangun-super-secret-jwt-key-2026-production-ready';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = process.env.COOKIE_NAME || 'halo_bangun_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /dashboard routes and /admin shortcut
  if (pathname.startsWith('/dashboard') || pathname === '/admin') {
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      const userRole = (payload.role as Role) || 'CLIENT';

      // Verify RBAC access for this route
      if (!canAccessRoute(userRole, pathname)) {
        // Redirect to the default dashboard for their role with an alert
        const fallbackUrl = new URL(ROLE_CONFIGS[userRole]?.defaultRedirect || '/dashboard', request.url);
        fallbackUrl.searchParams.set('forbidden', '1');
        fallbackUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(fallbackUrl);
      }

      // Forward user details in request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', String(payload.id));
      requestHeaders.set('x-user-role', String(userRole));
      requestHeaders.set('x-user-email', String(payload.email));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (err) {
      // Invalid or expired token -> redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // If already logged in and visiting /login -> redirect to appropriate dashboard
  if (pathname === '/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        const { payload } = await jose.jwtVerify(token, JWT_SECRET);
        const userRole = (payload.role as Role) || 'CLIENT';
        const targetDashboard = ROLE_CONFIGS[userRole]?.defaultRedirect || '/dashboard';
        return NextResponse.redirect(new URL(targetDashboard, request.url));
      } catch (e) {
        // token expired or invalid, let them view login page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin', '/login'],
};

