import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '465', 10);
const secure = process.env.SMTP_SECURE === 'false' ? false : port === 465;
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const defaultFrom = process.env.SMTP_FROM || (user ? `"POS Mobile" <${user}>` : '"POS Mobile" <no-reply@posmobile.com>');

// Inisialisasi transporter nodemailer
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined,
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  message?: string;
  messageId?: string;
}

/**
 * Mengirim email menggunakan koneksi SMTP (seperti Gmail SMTP, Mailgun, dll)
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  // Jika konfigurasi SMTP belum diset
  if (!user || !pass) {
    console.warn(
      '[SMTP Warning] SMTP_USER atau SMTP_PASS belum diset di environment (.env). Email tidak dikirim secara fisik.'
    );
    return {
      success: false,
      message: 'Konfigurasi SMTP_USER atau SMTP_PASS belum diatur di file .env.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: from || defaultFrom,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''), // fallback plain text
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[SMTP Error] Gagal mengirim email via SMTP:', err.message || err);
    return {
      success: false,
      message: err.message || 'Gagal mengirim email via SMTP.',
    };
  }
}

