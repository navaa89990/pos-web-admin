'use client';

import { useState } from 'react';
import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export default function AktivasiPage() {
  const [activations, setActivations] = useState([
    { id: 1, name: 'agusKopling@gmail.com', date: '30 september 2026', status: 'pending' },
    { id: 2, name: 'rehanBatagor@gmail.com', date: '30 september 2026', status: 'pending' },
    { id: 3, name: 'sigitRendang@gmail.com', date: '30 september 2026', status: 'pending' },
  ]);

  const handleApprove = (id: number) => {
    setActivations(prev => 
      prev.map(item => item.id === id ? { ...item, status: 'disetujui' } : item)
    );
  };

  const handleReject = (id: number) => {
    setActivations(prev => 
      prev.map(item => item.id === id ? { ...item, status: 'ditolak' } : item)
    );
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
           <span>Admin</span>
           <span>›</span>
           <span className="text-green-600 font-medium">Aktivasi</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Manajemen aktivasi</h2>
        <p className="text-gray-500 text-sm">Kelola izin akses perangkat mobile pos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white px-6 py-8 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-green-500"><ShieldCheck className="w-10 h-10" /></div>
            <p className="text-green-600 font-bold text-lg">Aktif</p>
          </div>
          <span className="text-3xl font-bold text-green-600">9.876</span>
        </div>

        <div className="bg-white px-6 py-8 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-amber-500"><Clock className="w-10 h-10" /></div>
            <p className="text-amber-600 font-bold text-lg">Pending</p>
          </div>
          <span className="text-3xl font-bold text-amber-500">1.100</span>
        </div>

        <div className="bg-white px-6 py-8 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-red-500"><AlertTriangle className="w-10 h-10" /></div>
            <p className="text-red-600 font-bold text-lg">Non-Aktif</p>
          </div>
          <span className="text-3xl font-bold text-red-500">1.000</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 bg-[#117554]">
          <h3 className="font-bold text-white text-xl">Daftar Aktivasi</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-sm font-bold text-gray-400 uppercase">
              <tr>
                <th className="px-6 py-4 text-left">NAMA</th>
                <th className="px-6 py-4">TANGGAL</th>
                <th className="px-6 py-4">FOTO</th>
                <th className="px-6 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activations.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-5 text-left text-gray-800 text-base">{item.name}</td>
                  <td className="px-6 py-5 text-gray-800 text-base">{item.date}</td>
                  <td className="px-6 py-5">
                    <button className="px-5 py-2 bg-gray-200 text-gray-800 rounded-full text-sm hover:bg-gray-300 transition-colors">
                      lihat foto
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    {item.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleApprove(item.id)}
                          className="px-6 py-2 bg-[#86efac] text-green-800 rounded-full text-sm hover:bg-green-400 transition-colors"
                        >
                          Setujui
                        </button>
                        <button 
                          onClick={() => handleReject(item.id)}
                          className="px-6 py-2 bg-[#fca5a5] text-red-800 rounded-full text-sm hover:bg-red-400 transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : item.status === 'disetujui' ? (
                      <span className="px-6 py-2 bg-[#86efac] text-green-800 rounded-full text-sm">Disetujui</span>
                    ) : (
                      <span className="px-6 py-2 bg-[#fca5a5] text-red-800 rounded-full text-sm">Ditolak</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}