import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'halo-bangun-super-secret-jwt-key-2026-production-ready';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
export const COOKIE_NAME = process.env.COOKIE_NAME || 'halo_bangun_token';

export interface TokenPayload {
  id: number;
  name: string;
  email: string;
  role: 'OWNER' | 'FINANCE' | 'PM' | 'MANDOR' | 'CLIENT';
  phone?: string | null;
  avatar?: string | null;
  designation?: string | null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

