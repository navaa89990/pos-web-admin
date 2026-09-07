import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import type { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query admin dari tabel admins MySQL
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, password, role FROM admins WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email administrator tidak terdaftar.' },
        { status: 401 }
      );
    }

    const admin = rows[0];

    // Verifikasi password menggunakan bcrypt compare
    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Password yang dimasukkan salah.' },
        { status: 401 }
      );
    }

    // Buat JWT token untuk session admin
    const tokenPayload = {
      id: Number(admin.id),
      name: String(admin.name),
      email: String(admin.email),
      role: String(admin.role),
    };

    const token = signToken(tokenPayload);

    // Kirim response dan pasang httpOnly cookie admin_token
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: tokenPayload,
    });

    // Cek protokol HTTPS dari reverse proxy / request URL
    const isHttps =
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.url.startsWith('https:');

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (error: unknown) {
    console.error('Error admin/auth/login:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
