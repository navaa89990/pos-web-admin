import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pos_mobile_super_secret_jwt_key_2026_x89a';
const TOKEN_EXPIRY = '7d';

export interface AdminTokenPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

/**
 * Hash password menggunakan bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Membandingkan password teks mentah dengan hash bcrypt (atau plaintext fallback saat transisi)
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Membuat token JWT
 */
export function signToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verifikasi token JWT
 */
export function verifyToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Membuat token reset password khusus (berlaku 15 menit)
 */
export function signResetToken(email: string): string {
  return jwt.sign({ email, purpose: 'reset_password' }, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Verifikasi token reset password
 */
export function verifyResetToken(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; purpose: string };
    if (decoded.purpose !== 'reset_password') {
      return null;
    }
    return { email: decoded.email };
  } catch {
    return null;
  }
}


