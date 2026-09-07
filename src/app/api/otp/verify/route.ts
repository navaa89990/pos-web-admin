import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email dan kode OTP wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, otp, expires_at FROM otps WHERE email = ? ORDER BY id DESC LIMIT 1',
      [cleanEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'OTP tidak ditemukan. Silakan kirim ulang OTP.' },
        { status: 400 }
      );
    }

    const stored = rows[0];

    if (Date.now() > Number(stored.expires_at)) {
      await pool.query('DELETE FROM otps WHERE id = ?', [stored.id]);
      return NextResponse.json(
        { success: false, message: 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.' },
        { status: 400 }
      );
    }

    if (stored.otp !== cleanOtp) {
      return NextResponse.json(
        { success: false, message: 'Kode OTP yang dimasukkan salah.' },
        { status: 400 }
      );
    }

    // Hapus OTP setelah berhasil diverifikasi
    await pool.query('DELETE FROM otps WHERE id = ?', [stored.id]);

    return NextResponse.json({ success: true, message: 'OTP valid dan terverifikasi.' });
  } catch (err: unknown) {
    console.error('Error otp/verify:', err);
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}