import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import pool from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await pool.query('DELETE FROM otps WHERE email = ?', [cleanEmail]);
    await pool.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)',
      [cleanEmail, otp, expiresAt]
    );
    if (process.env.RESEND_API_KEY) {
      const { error } = await resend.emails.send({
        from: 'POS Mobile <onboarding@resend.dev>',
        to: [cleanEmail],
        subject: 'Kode OTP Verifikasi POS Mobile',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #117554;">Verifikasi Akun POS Mobile</h2>
            <p>Gunakan kode OTP berikut untuk melanjutkan proses di aplikasi POS Mobile Anda:</p>
            <h1 style="color: #117554; letter-spacing: 6px; font-size: 36px; margin: 20px 0;">${otp}</h1>
            <p>Kode ini hanya berlaku selama <b>5 menit</b>. Jangan berikan kode ini kepada siapapun.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'OTP berhasil dikirim ke email.' });
  } catch (err: unknown) {
    console.error('Error otp/send:', err);
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}