'use client';

import { useState } from 'react';
import { Users, Shield, Clock, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const chartData = [
    { bulan: 'Jan', disetujui: 35, ditolak: 8 },
    { bulan: 'Feb', disetujui: 50, ditolak: 12 },
    { bulan: 'Mar', disetujui: 45, ditolak: 10 },
    { bulan: 'Apr', disetujui: 65, ditolak: 15 },
    { bulan: 'Mei', disetujui: 75, ditolak: 18 },
    { bulan: 'Jun', disetujui: 90, ditolak: 12 },
  ];
  
  const maxData = Math.max(...chartData.map(d => Math.max(d.disetujui, d.ditolak)));

  const recentStatus = [
    { nama: 'Andi Wijaya', waktu: '5 menit yang lalu', status: 'Disetujui' },
    { nama: 'Budi Santoso', waktu: '12 menit yang lalu', status: 'Menunggu' },
    { nama: 'Citra Lestari', waktu: '24 menit yang lalu', status: 'Disetujui' },
    { nama: 'Dedi Kurniawan', waktu: '1 jam yang lalu', status: 'Ditolak' },
    { nama: 'Eka Putri', waktu: '2 jam yang lalu', status: 'Menunggu' },
  ];

  // Mengubah data statis menjadi State agar bisa diubah secara interaktif
  const [activations, setActivations] = useState([
    { id: 1, nama: 'Giri Supriatna', email: 'giri@company.com', tgl: '14 Jun 2024', status: 'Menunggu' },
    { id: 2, nama: 'Hana Olivia', email: 'hana.olivia@corp.id', tgl: '14 Jun 2024', status: 'Menunggu' },
    { id: 3, nama: 'Irfan Hakim', email: 'irfan.h@mail.net', tgl: '13 Jun 2024', status: 'Menunggu' },
    { id: 4, nama: 'Karin Amalia', email: 'karin_a@startup.com', tgl: '13 Jun 2024', status: 'Menunggu' },
  ]);

  // Fungsi untuk mengubah status saat tombol diklik
  const handleAction = (id: number, newStatus: string) => {
    setActivations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const getStatusStyle = (status: string) => {
    const baseClass = "px-3 py-1 text-xs font-medium rounded-md inline-block";
    switch (status) {
      case 'Disetujui': return `${baseClass} bg-green-50 text-green-600`;
      case 'Menunggu': return `${baseClass} bg-amber-50 text-amber-600`;
      case 'Ditolak': return `${baseClass} bg-red-50 text-red-600`;
      default: return baseClass;
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
        <p className="text-gray-500 text-sm">Kelola aktivasi aplikasi mobile</p>
      </div>

      <div className="flex gap-6 mb-8 overflow-x-auto pb-2">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 min-w-60">
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-500 text-sm font-medium">Total Pengguna</p>
            <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">12.450</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-600 rounded-md">+8.2%</span>
            <span className="text-xs text-gray-400">dari bulan lalu</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 min-w-60">
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-500 text-sm font-medium">Aktivasi Aktif</p>
            <div className="text-green-600 bg-green-50 p-2 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">9.876</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-600 rounded-md">+5.1%</span>
            <span className="text-xs text-gray-400">dari bulan lalu</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 min-w-60">
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-500 text-sm font-medium">Menunggu Aktivasi</p>
            <div className="text-amber-500 bg-amber-50 p-2 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">342</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold px-2 py-1 bg-gray-50 text-amber-500 rounded-md">Butuh tindakan segera</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 min-w-60">
          <div className="flex justify-between items-start mb-4">
            <p className="text-gray-500 text-sm font-medium">Aktivasi Ditolak</p>
            <div className="text-red-500 bg-red-50 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">28</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold px-2 py-1 bg-gray-50 text-red-500 rounded-md">Kasus dicurigai spam</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900">Aktivasi per Bulan</h3>
          <p className="text-xs text-gray-500 mt-1">Jumlah aktivasi disetujui & ditolak selama Jan-Jun 2024</p>
          
          <div className="flex justify-between items-end h-48 gap-4 px-2 mt-8">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1 h-full gap-3">
                <div className="w-full flex justify-center items-end h-full gap-1.5">
                   <div 
                     className="w-4 bg-green-600 rounded-t-sm transition-all duration-500 hover:opacity-80" 
                     style={{ height: `${(data.disetujui / maxData) * 100}%` }} 
                     title={`Disetujui: ${data.disetujui}`}
                   />
                   <div 
                     className="w-4 bg-red-500 rounded-t-sm transition-all duration-500 hover:opacity-80" 
                     style={{ height: `${(data.ditolak / maxData) * 100}%` }} 
                     title={`Ditolak: ${data.ditolak}`}
                   />
                </div>
                <span className="text-xs text-gray-500">{data.bulan}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 mt-6 text-xs text-gray-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-600 rounded-sm" /> Disetujui</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm" /> Ditolak</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900">Status Aktivasi Terkini</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">Permintaan terbaru yang diproses sistem</p>
          <div className="space-y-5">
            {recentStatus.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium text-sm">
                    {item.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.nama}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.waktu}
                    </p>
                  </div>
                </div>
                <span className={getStatusStyle(item.status)}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Aktivasi Terbaru yang Perlu Tindakan</h3>
          <p className="text-xs text-gray-500 mt-1">Daftar pengajuan aktivasi tertunda yang menunggu keputusan administrator</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">NAMA</th>
                <th className="px-6 py-4">EMAIL</th>
                <th className="px-6 py-4">TANGGAL</th>
                <th className="px-6 py-4">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activations.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.nama}</td>
                  <td className="px-6 py-4">{row.email}</td>
                  <td className="px-6 py-4">{row.tgl}</td>
                  <td className="px-6 py-4">
                    {row.status === 'Menunggu' ? (
                      <div className="space-x-2 flex">
                        <button 
                          onClick={() => handleAction(row.id, 'Disetujui')}
                          className="px-4 py-1.5 bg-green-50 text-green-600 font-medium rounded-md hover:bg-green-100 transition-colors text-xs"
                        >
                          Setujui
                        </button>
                        <button 
                          onClick={() => handleAction(row.id, 'Ditolak')}
                          className="px-4 py-1.5 bg-red-50 text-red-600 font-medium rounded-md hover:bg-red-100 transition-colors text-xs"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className={getStatusStyle(row.status)}>{row.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <footer className="flex items-center justify-between text-xs text-gray-500 py-4 mt-auto">
         <p>© 2024 AppActivator - Panel Admin</p>
         <a href="#" className="hover:text-green-600 underline">Kebijakan Privasi</a>
      </footer>
    </>
  );
}