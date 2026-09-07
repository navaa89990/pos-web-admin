import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    // 1. Hitung total metrik dari tabel users dan activations
    const [userCountRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users'
    );
    const totalUsers = userCountRows[0]?.count || 0;

    const [activationCounts] = await pool.query<RowDataPacket[]>(
      `SELECT 
        SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as rejected,
        COUNT(*) as total
       FROM activations`
    );

    const activeCount = Number(activationCounts[0]?.active || 0);
    const pendingCount = Number(activationCounts[0]?.pending || 0);
    const rejectedCount = Number(activationCounts[0]?.rejected || 0);
    const totalActivations = Number(activationCounts[0]?.total || 0);

    // 2. Data aktivasi per bulan (6 bulan default)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
    const monthlyData = months.map((month) => ({
      bulan: month,
      disetujui: 0,
      ditolak: 0,
    }));

    // Hitung aktivasi riil per bulan dari DB jika ada
    const [monthlyRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        MONTH(created_at) as month_num,
        SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) as disetujui,
        SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as ditolak
       FROM activations
       GROUP BY MONTH(created_at)`
    );

    for (const row of monthlyRows) {
      const idx = Number(row.month_num) - 1;
      if (idx >= 0 && idx < monthlyData.length) {
        monthlyData[idx].disetujui = Number(row.disetujui || 0);
        monthlyData[idx].ditolak = Number(row.ditolak || 0);
      }
    }

    // 3. Status terkini (5 riwayat aktivasi terakhir)
    const [recentRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, email as nama, status, created_at
       FROM activations
       ORDER BY id DESC
       LIMIT 5`
    );

    const recentStatus = recentRows.map((r) => {
      const statusMap: Record<string, string> = {
        disetujui: 'Disetujui',
        pending: 'Menunggu',
        ditolak: 'Ditolak',
      };
      return {
        id: r.id,
        nama: r.nama,
        waktu: new Date(r.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: statusMap[r.status] || r.status,
      };
    });

    // 4. Hitung persentase untuk donut chart
    let donutSeries = [0, 0, 0];
    if (totalActivations > 0) {
      const pActive = Math.round((activeCount / totalActivations) * 100);
      const pPending = Math.round((pendingCount / totalActivations) * 100);
      const pRejected = Math.max(0, 100 - pActive - pPending);
      donutSeries = [pActive, pPending, pRejected];
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeActivations: activeCount,
        pendingActivations: pendingCount,
        rejectedActivations: rejectedCount,
        monthlyData,
        recentStatus,
        donutSeries,
      },
    });
  } catch (error: unknown) {
    console.error('Error admin/stats:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

