'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Inbox, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderNotification {
  id: number;
  title: string;
  time: string;
  unread: boolean;
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [adminName] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.name) return String(parsed.name);
        }
      } catch {
        // ignore
      }
    }
    return 'Administrator';
  });
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    // Ambil notifikasi dari database MySQL
    fetch('/api/admin/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications.slice(0, 5));
        }
      })
      .catch((err) => console.error('Gagal mengambil notifikasi header:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      router.push('/pengguna');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

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
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Notifikasi Sistem
                </h3>
                {unreadCount > 0 ? (
                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} Baru
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium">0 Baru</span>
                )}
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                    <Inbox className="w-8 h-8 mb-2 stroke-[1.5] text-gray-300" />
                    <p className="text-xs font-medium text-gray-600">Tidak ada notifikasi baru</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-gray-100">
                <Link
                  href="/notifikasi"
                  onClick={() => setShowNotifications(false)}
                  className="block w-full text-center py-2 text-xs text-green-600 font-semibold hover:bg-green-50 rounded-lg transition-colors"
                >
                  Lihat Selengkapnya
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-gray-900 text-sm">{adminName}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
