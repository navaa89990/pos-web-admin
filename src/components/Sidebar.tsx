'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, Shield, Bell } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { name: 'Pengguna', icon: Users, path: '/pengguna' },
    { name: 'Aktivasi', icon: Shield, path: '/aktivasi' },
    { name: 'Notifikasi', icon: Bell, path: '/notifikasi' },
  ];

  return (
    <aside className="w-64 bg-[#117554] text-white flex flex-col sticky top-0 h-screen">
      <div className="p-6 flex items-center gap-3">
         <Image 
           src="/assets/logo.png" 
           alt="Logo Pos Mobile" 
           width={32} 
           height={32} 
           className="object-contain"
         />
         <h1 className="text-lg font-bold tracking-wide">Pos Mobile</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'text-green-100 hover:bg-green-700/50 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}