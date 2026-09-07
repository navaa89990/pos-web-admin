import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, category, title, description, is_unread, created_at FROM notifications ORDER BY id DESC LIMIT 50'
    );

    const notifications = rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      description: row.description || '',
      time: new Date(row.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      unread: Boolean(row.is_unread),
    }));

    return NextResponse.json({ success: true, notifications });
  } catch (error: unknown) {
    console.error('Error GET admin/notifications:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

