'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Shield, Clock, AlertTriangle, Inbox, CheckCircle, XCircle } from 'lucide-react';
import { MonthlyChart, StatusDonutChart } from '@/components/dashboard';
import { StatCard } from '@/components/ui';

interface DashboardStats {
  totalUsers: number;
  activeActivations: number;
  pendingActivations: number;
  rejectedActivations: number;
  monthlyData: { bulan: string; disetujui: number; ditolak: number }[];
  recentStatus: { id: number; nama: string; waktu: string; status: string }[];
  donutSeries: number[];
}

interface ActivationRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeActivations: 0,
    pendingActivations: 0,
    rejectedActivations: 0,
    monthlyData: [
      { bulan: 'Jan', disetujui: 0, ditolak: 0 },
      { bulan: 'Feb', disetujui: 0, ditolak: 0 },
      { bulan: 'Mar', disetujui: 0, ditolak: 0 },
      { bulan: 'Apr', disetujui: 0, ditolak: 0 },
      { bulan: 'Mei', disetujui: 0, ditolak: 0 },
      { bulan: 'Jun', disetujui: 0, ditolak: 0 },
    ],
    recentStatus: [],
    donutSeries: [0, 0, 0],
  });

  const [pendingActivations, setPendingActivations] = useState<ActivationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [statsRes, actRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/activations'),
      ]);

      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      const actData = await actRes.json();
      if (actData.success) {
        const pendingOnly = (actData.activations as ActivationRow[]).filter(
          (item) => item.status === 'pending'
        );
        setPendingActivations(pendingOnly);
      }
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetch('/api/admin/stats'), fetch('/api/admin/activations')])
      .then(async ([statsRes, actRes]) => {
        const [statsData, actData] = await Promise.all([statsRes.json(), actRes.json()]);
        if (isMounted) {
          if (statsData.success) setStats(statsData.stats);
          if (actData.success) {
            const pendingOnly = (actData.activations as ActivationRow[]).filter(
              (item) => item.status === 'pending'
            );
            setPendingActivations(pendingOnly);
          }
        }
      })
      .catch((err) => console.error('Gagal memuat data dashboard:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fungsi aksi Setujui / Tolak
  const handleAction = async (id: number, newStatus: 'disetujui' | 'ditolak') => {
    try {
      const res = await fetch('/api/admin/activations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        // Reload data setelah aksi berhasil
        await refreshData();
      } else {
        alert(data.message || 'Gagal mengubah status aktivasi.');
      }
    } catch {
      alert('Terjadi kesalahan saat memproses permohonan.');
    }
  };

  const getStatusStyle = (status: string) => {
    const baseClass = 'px-3 py-1 text-xs font-medium rounded-md inline-block';
    switch (status) {
      case 'Disetujui':
      case 'disetujui':
        return `${baseClass} bg-green-50 text-green-600`;
      case 'Menunggu':
      case 'pending':
        return `${baseClass} bg-amber-50 text-amber-600`;
      case 'Ditolak':
      case 'ditolak':
        return `${baseClass} bg-red-50 text-red-600`;
      default:
        return baseClass;
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
          <span>Admin</span>
          <span>›</span>
          <span className="text-green-600 font-medium">Dashboard</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Selamat datang, Admin</h2>
        <p className="text-gray-500 text-sm">Kelola aktivasi aplikasi mobile POS</p>
      </div>

      {/* 4 Stat Cards Terhubung ke Database MySQL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pengguna"
          value={loading ? '...' : stats.totalUsers.toLocaleString('id-ID')}
          change={stats.totalUsers > 0 ? `${stats.totalUsers} merchant` : 'Belum ada'}
          icon={Users}
          changeColor="text-blue-600"
          chartData={stats.totalUsers > 0 ? [stats.totalUsers] : [0, 0]}
          chartColor="#2563eb"
        />
        <StatCard
          title="Aktivasi Aktif"
          value={loading ? '...' : stats.activeActivations.toLocaleString('id-ID')}
          change={stats.activeActivations > 0 ? `${stats.activeActivations} aktif` : '0 disetujui'}
          icon={Shield}
          changeColor="text-green-600"
          chartData={stats.activeActivations > 0 ? [stats.activeActivations] : [0, 0]}
          chartColor="#16a34a"
        />
        <StatCard
          title="Menunggu Aktivasi"
          value={loading ? '...' : stats.pendingActivations.toLocaleString('id-ID')}
          change={stats.pendingActivations > 0 ? 'Butuh tindakan' : 'Tidak ada antrean'}
          icon={Clock}
          changeColor="text-amber-500"
          chartData={stats.pendingActivations > 0 ? [stats.pendingActivations] : [0, 0]}
          chartColor="#f59e0b"
        />
        <StatCard
          title="Aktivasi Ditolak"
          value={loading ? '...' : stats.rejectedActivations.toLocaleString('id-ID')}
          change={stats.rejectedActivations > 0 ? `${stats.rejectedActivations} ditolak` : '0 ditolak'}
          icon={AlertTriangle}
          changeColor="text-red-500"
          chartData={stats.rejectedActivations > 0 ? [stats.rejectedActivations] : [0, 0]}
          chartColor="#ef4444"
        />
      </div>

      {/* Grid Grafik ApexCharts Terhubung ke Database */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900">Aktivasi per Bulan</h3>
          <p className="text-xs text-gray-500 mt-1">
            Statistik aktivasi disetujui & ditolak riil dari database
          </p>

          <div className="mt-4">
            <MonthlyChart data={stats.monthlyData} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Distribusi Status Aktivasi</h3>
            <p className="text-xs text-gray-500 mt-1 mb-2">Persentase status aktivasi perangkat</p>

            {/* ApexCharts Donut Chart */}
            <StatusDonutChart
              series={
                stats.donutSeries.every((v) => v === 0)
                  ? [0, 0, 0]
                  : stats.donutSeries
              }
              labels={['Disetujui', 'Menunggu', 'Ditolak']}
              totalLabel="Aktivasi"
            />
          </div>

          <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Riwayat Aktivitas Terakhir
            </p>
            {stats.recentStatus.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">Belum ada riwayat aktivitas</p>
            ) : (
              stats.recentStatus.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium text-xs">
                      {item.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs truncate max-w-[150px]">
                        {item.nama}
                      </p>
                      <p className="text-[11px] text-gray-400">{item.waktu}</p>
                    </div>
                  </div>
                  <span className={getStatusStyle(item.status)}>{item.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabel Aktivasi yang Membutuhkan Tindakan */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Aktivasi yang Perlu Tindakan</h3>
            <p className="text-xs text-gray-500 mt-1">
              Daftar pengajuan aktivasi berstatus pending yang menunggu keputusan administrator
            </p>
          </div>
          {pendingActivations.length > 0 && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-600 rounded-full">
              {pendingActivations.length} Permohonan
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          {pendingActivations.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
              <Inbox className="w-12 h-12 mb-3 stroke-[1.5] text-gray-300" />
              <p className="font-medium text-sm text-gray-600">Tidak ada aktivasi tertunda</p>
              <p className="text-xs text-gray-400 mt-1">
                Semua permohonan aktivasi telah diproses atau belum ada pengajuan baru dari aplikasi mobile.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">EMAIL / NAMA</th>
                  <th className="px-6 py-4">NO. TELEPON</th>
                  <th className="px-6 py-4">TANGGAL PENGAJUAN</th>
                  <th className="px-6 py-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingActivations.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.email}</td>
                    <td className="px-6 py-4">{row.phone}</td>
                    <td className="px-6 py-4">{row.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAction(row.id, 'disetujui')}
                          className="px-3.5 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 font-medium rounded-lg transition-colors text-xs flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleAction(row.id, 'ditolak')}
                          className="px-3.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors text-xs flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <footer className="flex items-center justify-between text-xs text-gray-500 py-4 mt-auto">
        <p>© 2026 Pos Mobile - Panel Admin</p>
        <a href="#" className="hover:text-green-600 underline">
          Kebijakan Privasi
        </a>
      </footer>
    </>
  );
}