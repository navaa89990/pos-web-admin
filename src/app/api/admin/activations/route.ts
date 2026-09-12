import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { sendEmail } from '@/lib/mail';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, phone, email, proof_image, status, approved_at, created_at FROM activations ORDER BY id DESC'
    );

    const activations = rows.map((row) => ({
      id: row.id,
      name: row.email,
      phone: row.phone,
      email: row.email,
      proofImage: row.proof_image,
      date: new Date(row.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, activations });
  } catch (error: unknown) {
    console.error('Error GET admin/activations:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'ID dan status wajib diisi.' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'disetujui', 'ditolak'];
    const cleanStatus = status.toLowerCase();

    if (!validStatuses.includes(cleanStatus)) {
      return NextResponse.json(
        { success: false, message: 'Status tidak valid.' },
        { status: 400 }
      );
    }

    // Ambil data aktivasi terlebih dahulu
    const [actRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, phone, email FROM activations WHERE id = ?',
      [id]
    );

    if (actRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Data aktivasi tidak ditemukan.' },
        { status: 404 }
      );
    }

    const activation = actRows[0];
    const approvedAt = cleanStatus === 'disetujui' ? new Date() : null;

    // Update status aktivasi
    await pool.query(
      'UPDATE activations SET status = ?, approved_at = ? WHERE id = ?',
      [cleanStatus, approvedAt, id]
    );

    // Jika disetujui, daftarkan akun merchant ke tabel users
    if (cleanStatus === 'disetujui') {
      const username = activation.email.split('@')[0];
      await pool.query(
        `INSERT INTO users (name, email, phone, status) 
         VALUES (?, ?, ?, 'Aktif')
         ON DUPLICATE KEY UPDATE status = 'Aktif'`,
        [username, activation.email, activation.phone]
      );
    }

    // Kirim email pemberitahuan ke merchant via SMTP
    if (activation.email) {
      const isApproved = cleanStatus === 'disetujui';
      const subject = isApproved
        ? 'Aktivasi POS Mobile Anda Telah Disetujui'
        : 'Pemberitahuan Status Aktivasi POS Mobile';
      const messageBody = isApproved
        ? '<p>Selamat! Akun dan perangkat POS Mobile Anda telah <b>disetujui</b>. Anda sekarang dapat masuk dan menggunakan seluruh fitur kasir di aplikasi mobile.</p>'
        : '<p>Mohon maaf, permohonan aktivasi POS Mobile Anda belum dapat disetujui saat ini. Silakan periksa kembali bukti yang Anda lampirkan atau hubungi tim bantuan.</p>';

      await sendEmail({
        to: activation.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #117554;">Status Aktivasi POS Mobile</h2>
            ${messageBody}
            <p style="margin-top: 20px; font-size: 12px; color: #888;">© POS Mobile Administrator</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Status aktivasi berhasil diubah menjadi ${cleanStatus}.`,
    });
  } catch (error: unknown) {
    console.error('Error PUT admin/activations:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id: string | number | null = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // Abaikan jika tidak ada body JSON
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID aktivasi wajib disertakan.' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, phone FROM activations WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Data pengajuan aktivasi tidak ditemukan.' },
        { status: 404 }
      );
    }

    const act = rows[0];

    // Hapus dari tabel activations
    await pool.query('DELETE FROM activations WHERE id = ?', [id]);

    // Hapus juga dari tabel users dan otps jika ada
    await pool.query('DELETE FROM users WHERE email = ? OR (phone = ? AND phone != "")', [act.email, act.phone]);
    await pool.query('DELETE FROM otps WHERE email = ?', [act.email]);

    return NextResponse.json({
      success: true,
      message: 'Data pengajuan aktivasi dan akun merchant terkait berhasil dihapus.',
    });
  } catch (error: unknown) {
    console.error('Error DELETE admin/activations:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

