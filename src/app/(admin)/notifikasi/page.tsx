'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

export default function HalamanNotifikasi() {
  const [activeTab, setActiveTab] = useState('Semua');

  const notifications = [
    { id: 1, category: 'Transaksi', title: 'Transaksi Berhasil - Invoice #INV-20240901', description: 'Pembayaran berhasil diterima dan invoice telah dikirim ke pelanggan.', time: '2 menit lalu', unread: true },
    { id: 2, category: 'Perangkat', title: 'Stok Produk Menipis - Kopi Arabica', description: 'Sisa stok 5 unit. Saran: lakukan restock untuk menghindari kehabisan.', time: '15 menit lalu', unread: true },
    { id: 3, category: 'Perangkat', title: 'Printer Bluetooth Terputus', description: 'Perangkat printer tidak terdeteksi. Pastikan Bluetooth aktif dan printer dalam jangkauan.', time: '1 jam lalu', unread: false },
    { id: 4, category: 'Keuangan', title: 'Tutup Kasir Shift Pagi - Rp 2.450.000', description: 'Rekap shift pagi telah selesai. Total penjualan Rp 2.450.000.', time: '3 jam lalu', unread: false },
    { id: 5, category: 'Transaksi', title: 'Pesanan Baru Masuk - Meja 5', description: 'Pesanan baru dari Meja 5. Silahkan cek detail pesanan untuk diproses.', time: 'Kemarin', unread: true },
    { id: 6, category: 'Perangkat', title: 'Pembaruan Sistem Tersedia v2.1.0', description: 'Versi terbaru tersedia. Update untuk mendapatkan fitur baru dan perbaikan performa.', time: '1 hari lalu', unread: false },
    { id: 7, category: 'Keuangan', title: 'Refund Diproses - Invoice #INV-20240830', description: 'Refund telah diproses dan dana akan dikembalikan ke pelanggan.', time: '2 hari lalu', unread: false },
    { id: 8, category: 'Keuangan', title: 'Saldo Penarikan Dana Berhasil', description: 'Penarikan dana ke rekening tujuan telah berhasil diproses.', time: '3 hari lalu', unread: false },
  ];

  const filteredNotifications = activeTab === 'Semua' 
    ? notifications 
    : notifications.filter(item => item.category === activeTab);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
           <span>Admin</span>
           <span>›</span>
           <span className="text-green-600 font-medium">Notifikasi</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Notifikasi sistem</h2>
      </div>

      <div className="flex gap-3 mb-6">
        {['Semua', 'Transaksi', 'Perangkat', 'Keuangan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#117554] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-8">
        {filteredNotifications.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-colors hover:border-[#117554]/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#117554] text-white flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 shrink-0 min-w-[80px]">
              {item.unread ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[#117554]"></div>
              ) : (
                <div className="w-2.5 h-2.5"></div>
              )}
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          </div>
        ))}
      </div>

      <footer className="flex items-center justify-between text-xs text-gray-500 py-4 mt-auto">
         <p>© 2026 AppActivator - Panel Admin</p>
         <a href="#" className="hover:text-[#117554] underline">Kebijakan Privasi</a>
      </footer>
    </>
  );
}