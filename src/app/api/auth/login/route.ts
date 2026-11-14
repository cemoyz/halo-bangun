import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { ROLE_CONFIGS, Role } from '@/lib/rbac';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak valid.' },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak valid.' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      phone: user.phone,
      avatar: user.avatar,
      designation: user.designation,
    };

    const token = await signToken(tokenPayload);

    const redirectUrl = ROLE_CONFIGS[user.role as Role]?.defaultRedirect || '/dashboard';

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      user: tokenPayload,
      redirectUrl,
    });

    // Set HTTP-Only Cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server: ' + error.message },
      { status: 500 }
    );
  }
}

