import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const { phone, email, proofImageBase64 } = await request.json();

    if (!phone || !email) {
      return NextResponse.json(
        { success: false, message: 'Nomor telepon dan email wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Cek apakah sudah pernah mengajukan aktivasi sebelumnya
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id, status FROM activations WHERE phone = ? OR email = ? ORDER BY id DESC LIMIT 1',
      [cleanPhone, cleanEmail]
    );

    if (existing.length > 0 && existing[0].status === 'disetujui') {
      return NextResponse.json(
        { success: false, message: 'Akun / perangkat ini sudah disetujui sebelumnya.' },
        { status: 400 }
      );
    }

    // Simpan data pengajuan aktivasi ke MySQL
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO activations (phone, email, proof_image, status) VALUES (?, ?, ?, ?)',
      [cleanPhone, cleanEmail, proofImageBase64 || null, 'pending']
    );

    // Tambahkan notifikasi baru untuk administrator
    await pool.query(
      'INSERT INTO notifications (category, title, description, is_unread) VALUES (?, ?, ?, ?)',
      [
        'Perangkat',
        `Pengajuan Aktivasi: ${cleanEmail}`,
        `Nomor HP: ${cleanPhone} mengajukan aktivasi aplikasi mobile POS.`,
        true,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Bukti pembayaran berhasil diterima. Menunggu approval admin.',
    });
  } catch (error: unknown) {
    console.error('Error activations/submit:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}