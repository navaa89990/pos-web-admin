import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_for_build');

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Pastikan email terdaftar di tabel admins atau users
    const [adminRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM admins WHERE email = ? LIMIT 1',
      [cleanEmail]
    );
    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (adminRows.length === 0 && userRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email tidak terdaftar dalam sistem.' },
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // Hapus OTP lama dan simpan yang baru
    await pool.query('DELETE FROM otps WHERE email = ?', [cleanEmail]);
    await pool.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)',
      [cleanEmail, otp, expiresAt]
    );

    if (process.env.RESEND_API_KEY) {
      const { error } = await resend.emails.send({
        from: 'POS Mobile <onboarding@resend.dev>',
        to: [cleanEmail],
        subject: 'Kode OTP Reset Password POS Mobile',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #117554; margin-top: 0;">Reset Password POS Mobile</h2>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi (reset password) akun POS Mobile Anda.</p>
            <p>Gunakan kode OTP berikut untuk melanjutkan proses reset kata sandi:</p>
            <div style="background-color: #f0fdf4; border: 1px dashed #16a34a; border-radius: 8px; text-align: center; padding: 16px; margin: 20px 0;">
              <span style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #15803d;">${otp}</span>
            </div>
            <p style="font-size: 13px; color: #4b5563;">Kode OTP ini hanya berlaku selama <b>5 menit</b>. Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.</p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 12px;">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Kode OTP reset password berhasil dikirim ke email.' });
  } catch (err: unknown) {
    console.error('Error otp/send:', err);
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}