import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { hashPassword, verifyResetToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, resetToken, otp, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Email dan password baru wajib diisi.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password baru minimal harus terdiri dari 6 karakter.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verifikasi Otorisasi: Baik melalui resetToken maupun kode OTP langsung
    let isAuthorized = false;

    if (resetToken) {
      const decoded = verifyResetToken(resetToken);
      if (decoded && decoded.email === cleanEmail) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && otp) {
      const cleanOtp = String(otp).trim();
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, otp, expires_at FROM otps WHERE email = ? ORDER BY id DESC LIMIT 1',
        [cleanEmail]
      );

      if (rows.length > 0) {
        const stored = rows[0];
        if (Date.now() <= Number(stored.expires_at) && stored.otp === cleanOtp) {
          isAuthorized = true;
          // Hapus OTP setelah berhasil diverifikasi
          await pool.query('DELETE FROM otps WHERE id = ?', [stored.id]);
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Sesi reset password tidak valid atau telah kedaluwarsa. Silakan minta kode OTP baru.' 
        },
        { status: 401 }
      );
    }

    // 2. Hash password baru dengan bcrypt
    const hashedPassword = await hashPassword(newPassword);

    // 3. Pastikan kolom password ada di tabel users (jika belum ada)
    try {
      await pool.query(
        "ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL AFTER email"
      );
    } catch {
      // Abaikan jika kolom sudah ada
    }

    // 4. Update password di tabel admins atau users
    const [adminResult] = await pool.query<ResultSetHeader>(
      'UPDATE admins SET password = ? WHERE email = ?',
      [hashedPassword, cleanEmail]
    );

    const [userResult] = await pool.query<ResultSetHeader>(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, cleanEmail]
    );

    if (adminResult.affectedRows === 0 && userResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Akun dengan email ini tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 5. Bersihkan semua OTP tersisa untuk email ini
    await pool.query('DELETE FROM otps WHERE email = ?', [cleanEmail]);

    // 6. Catat notifikasi sistem
    await pool.query(
      `INSERT INTO notifications (category, title, description) 
       VALUES ('Keamanan', 'Reset Password Berhasil', ?)`,
      [`Kata sandi untuk akun ${cleanEmail} telah berhasil diperbarui.`]
    );

    return NextResponse.json({
      success: true,
      message: 'Password baru berhasil disimpan. Silakan masuk menggunakan kata sandi baru Anda.',
    });
  } catch (error: unknown) {
    console.error('Error otp/reset-password:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

