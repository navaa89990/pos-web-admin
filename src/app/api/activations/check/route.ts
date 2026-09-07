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

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, phone, email, status, approved_at, created_at FROM activations WHERE (phone = ? AND phone != "") OR (email = ? AND email != "") ORDER BY id DESC LIMIT 1',
      [cleanPhone, cleanEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        status: 'not_registered',
        message: 'Belum ada data pengajuan aktivasi untuk nomor atau email ini.',
      });
    }

    const record = rows[0];

    return NextResponse.json({
      success: true,
      status: record.status === 'disetujui' ? 'activated' : record.status,
      details: {
        id: record.id,
        phone: record.phone,
        email: record.email,
        status: record.status,
        createdAt: record.created_at,
        approvedAt: record.approved_at,
      },
    });
  } catch (error: unknown) {
    console.error('Error activations/check:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}