import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const { phone, email } = await request.json();

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, message: 'Nomor telepon atau email wajib dikirim.' },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.trim() : '';

    // 1. Cek tabel users terlebih dahulu untuk memastikan status akun aktif
    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, phone, status FROM users WHERE (email = ? AND email != "") OR (phone = ? AND phone != "") ORDER BY id DESC LIMIT 1',
      [cleanEmail, cleanPhone]
    );

    // 2. Cek tabel activations
    const [actRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, phone, email, status, approved_at, created_at FROM activations WHERE (phone = ? AND phone != "") OR (email = ? AND email != "") ORDER BY id DESC LIMIT 1',
      [cleanPhone, cleanEmail]
    );

    // KASUS 1: Data pengguna ada di tabel users
    if (userRows.length > 0) {
      const user = userRows[0];

      if (user.status === 'Nonaktif') {
        return NextResponse.json({
          success: false,
          status: 'nonaktif',
          message: 'Akun Anda telah dinonaktifkan oleh administrator.',
        });
      }

      if (user.status === 'Pending') {
        return NextResponse.json({
          success: true,
          status: 'pending',
          message: 'Akun Anda masih menunggu verifikasi administrator.',
          details: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            status: 'pending',
          },
        });
      }

      if (user.status === 'Aktif') {
        return NextResponse.json({
          success: true,
          status: 'activated',
          details: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            status: 'disetujui',
            approvedAt: actRows[0]?.approved_at || null,
            createdAt: actRows[0]?.created_at || null,
          },
        });
      }
    }

    // KASUS 2: Pengguna TIDAK ADA di tabel users, tetapi ada di tabel activations
    if (actRows.length > 0) {
      const act = actRows[0];

      // Jika di tabel activations tercatat 'disetujui' tetapi di tabel users sudah tidak ada,
      // artinya akun ini telah DIHAPUS oleh admin. Bersihkan sisa aktivasi agar tidak bisa login!
      if (act.status === 'disetujui') {
        await pool.query('DELETE FROM activations WHERE id = ?', [act.id]);

        return NextResponse.json({
          success: false,
          status: 'not_registered',
          message: 'Akun Anda telah dihapus oleh administrator.',
        });
      }

      // Jika statusnya pending atau ditolak
      return NextResponse.json({
        success: true,
        status: act.status,
        details: {
          id: act.id,
          phone: act.phone,
          email: act.email,
          status: act.status,
          createdAt: act.created_at,
          approvedAt: act.approved_at,
        },
      });
    }

    // KASUS 3: Tidak ditemukan di users maupun activations
    return NextResponse.json({
      success: true,
      status: 'not_registered',
      message: 'Belum ada data pengajuan aktivasi untuk nomor atau email ini.',
    });
  } catch (error: unknown) {
    console.error('Error activations/check:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}