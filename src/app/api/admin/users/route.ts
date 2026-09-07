import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, phone, status, avatar, created_at FROM users ORDER BY id DESC'
    );

    const users = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '-',
      status: row.status,
      avatar:
        row.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=117554&color=fff`,
      date: new Date(row.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }));

    return NextResponse.json({ success: true, users });
  } catch (error: unknown) {
    console.error('Error GET admin/users:', error);
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

    const validStatuses = ['Aktif', 'Pending', 'Nonaktif'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status tidak valid.' },
        { status: 400 }
      );
    }

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

    return NextResponse.json({
      success: true,
      message: `Status pengguna berhasil diperbarui menjadi ${status}.`,
    });
  } catch (error: unknown) {
    console.error('Error PUT admin/users:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pengguna wajib disertakan.' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Pengguna berhasil dihapus.',
    });
  } catch (error: unknown) {
    console.error('Error DELETE admin/users:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

