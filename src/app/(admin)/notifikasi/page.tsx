'use client';

import { useState, useEffect } from 'react';
import { Bell, Inbox } from 'lucide-react';
import { NotificationItem } from '@/types';

export default function HalamanNotifikasi() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/admin/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setNotifications(data.notifications);
        }
      })
      .catch((err) => console.error('Gagal memuat notifikasi:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNotifications =
    activeTab === 'Semua'
      ? notifications
      : notifications.filter((item) => item.category === activeTab);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
          <span>Admin</span>
          <span>›</span>
          <span className="text-green-600 font-medium">Notifikasi</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Notifikasi Sistem</h2>
        <p className="text-gray-500 text-sm">Pusat pemantauan aktivitas perangkat dan transaksi POS</p>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {['Semua', 'Aktivasi', 'Perangkat', 'Transaksi', 'Keuangan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${
              activeTab === tab
                ? 'bg-[#117554] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-8 min-h-[300px]">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Memuat notifikasi...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center text-gray-400">
            <Inbox className="w-14 h-14 mb-3 stroke-[1.5] text-gray-300" />
            <p className="font-semibold text-base text-gray-700">Tidak ada notifikasi</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Notifikasi baru mengenai aktivasi perangkat atau aktivitas kasir akan muncul di sini.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-colors hover:border-[#117554]/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#117554]/10 text-[#117554] flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0 min-w-[80px]">
                {item.unread ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#117554]"></div>
                ) : (
                  <div className="w-2.5 h-2.5"></div>
                )}
                <span className="text-[11px] text-gray-400">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="flex items-center justify-between text-xs text-gray-500 py-4 mt-auto">
        <p>© 2026 Pos Mobile - Panel Admin</p>
        <a href="#" className="hover:text-[#117554] underline">
          Kebijakan Privasi
        </a>
      </footer>
    </>
  );
}