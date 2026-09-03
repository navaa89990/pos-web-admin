'use client';

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      router.push('/pengguna');
    }
  };

  const recentNotifications = [
    { id: 1, title: 'Transaksi Berhasil - Invoice #INV-20240901', time: '2 menit lalu' },
    { id: 2, title: 'Stok Produk Menipis - Kopi Arabica', time: '15 menit lalu' },
    { id: 3, title: 'Pesanan Baru Masuk - Meja 5', time: 'Kemarin' },
  ];

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari pengguna atau data..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-0 outline-none"
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full border border-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Notifikasi Terbaru</h3>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">3 Baru</span>
              </div>
              <div className="divide-y divide-gray-50">
                {recentNotifications.map(notif => (
                  <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{notif.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-100">
                <Link 
                  href="/notifikasi" 
                  onClick={() => setShowNotifications(false)}
                  className="block w-full text-center py-2 text-sm text-green-600 font-medium hover:bg-green-50 rounded-lg transition-colors"
                >
                  Lihat Selengkapnya
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-gray-900 text-sm">Admin</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}