'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Clock, AlertTriangle, Inbox, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { ActivationTrendChart } from '@/components/dashboard';

interface ActivationItem {
  id: number;
  name: string;
  phone: string;
  email: string;
  proofImage?: string | null;
  date: string;
  status: 'pending' | 'disetujui' | 'ditolak' | string;
  createdAt: string;
}

export default function AktivasiPage() {
  const [activations, setActivations] = useState<ActivationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const refreshActivations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/activations');
      const data = await res.json();
      if (data.success) {
        setActivations(data.activations);
      }
    } catch (err) {
      console.error('Gagal mengambil data aktivasi:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/admin/activations')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setActivations(data.activations);
        }
      })
      .catch((err) => console.error('Gagal mengambil data aktivasi:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch('/api/admin/activations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'disetujui' }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshActivations();
      } else {
        alert(data.message || 'Gagal menyetujui aktivasi.');
      }
    } catch {
      alert('Terjadi kesalahan saat memproses permohonan.');
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch('/api/admin/activations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'ditolak' }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshActivations();
      } else {
        alert(data.message || 'Gagal menolak aktivasi.');
      }
    } catch {
      alert('Terjadi kesalahan saat memproses permohonan.');
    }
  };

  // Hitung metrik riil dari data
  const countAktif = activations.filter((a) => a.status === 'disetujui').length;
  const countPending = activations.filter((a) => a.status === 'pending').length;
  const countDitolak = activations.filter((a) => a.status === 'ditolak').length;

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
          <span>Admin</span>
          <span>›</span>
          <span className="text-green-600 font-medium">Aktivasi</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Manajemen Aktivasi</h2>
        <p className="text-gray-500 text-sm">Kelola izin akses perangkat mobile POS</p>
      </div>

      {/* Kartu Ringkasan Metrik Terhubung ke Database */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white px-6 py-8 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-green-500">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Aktivasi Disetujui</p>
              <p className="text-green-600 font-bold text-lg">Aktif</p>
            </div>
          </div>
          <span className="text-3xl font-bold text-green-600">
            {loading ? '...' : countAktif.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="bg-white px-6 py-8 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-amber-500">
              <Clock className="w-10 h-10" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Menunggu Verifikasi</p>
              <p className="text-amber-600 font-bold text-lg">Pending</p>
            </div>
          </div>
          <span className="text-3xl font-bold text-amber-500">
            {loading ? '...' : countPending.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="bg-white px-6 py-8 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-red-500">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Aktivasi Ditolak</p>
              <p className="text-red-600 font-bold text-lg">Non-Aktif</p>
            </div>
          </div>
          <span className="text-3xl font-bold text-red-500">
            {loading ? '...' : countDitolak.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Grafik Tren Permohonan Aktivasi */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="mb-4">
          <h3 className="font-bold text-gray-900">Tren Permohonan Aktivasi</h3>
          <p className="text-xs text-gray-500 mt-1">
            Visualisasi aktivitas pengajuan dan persetujuan aktivasi
          </p>
        </div>
        <ActivationTrendChart />
      </div>

      {/* Tabel Daftar Aktivasi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 bg-[#117554] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">Daftar Pengajuan Aktivasi</h3>
            <p className="text-green-100 text-xs mt-0.5">Seluruh permohonan dari aplikasi mobile</p>
          </div>
          <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
            Total: {activations.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          {activations.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center text-gray-400">
              <Inbox className="w-14 h-14 mb-3 stroke-[1.5] text-gray-300" />
              <p className="font-semibold text-base text-gray-700">Belum ada data aktivasi</p>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                Ketika pengguna mengajukan aktivasi dari aplikasi mobile POS, data permohonan akan secara otomatis muncul di sini.
              </p>
            </div>
          ) : (
            <table className="w-full text-center text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">EMAIL / MERCHANT</th>
                  <th className="px-6 py-4 text-left">NO. TELEPON</th>
                  <th className="px-6 py-4">TANGGAL</th>
                  <th className="px-6 py-4">BUKTI FOTO</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-left font-medium text-gray-900">{item.email}</td>
                    <td className="px-6 py-4 text-left text-gray-600">{item.phone}</td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{item.date}</td>
                    <td className="px-6 py-4">
                      {item.proofImage ? (
                        <button
                          onClick={() => setPreviewImage(item.proofImage || null)}
                          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Foto
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'disetujui' ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          Disetujui
                        </span>
                      ) : item.status === 'ditolak' ? (
                        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                          Ditolak
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                          Menunggu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Setujui
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Preview Bukti Foto */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Bukti Pembayaran / Dokumen</h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex justify-center bg-gray-50 rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Bukti Aktivasi"
                className="max-h-[60vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}