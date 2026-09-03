'use client';

import { useState } from 'react';
import { Filter, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

export default function PenggunaPage() {
  // 1. State Data Pengguna (diperbanyak untuk test paginasi)
  const [users, setUsers] = useState([
    { id: 1, name: 'Anisa Rahmawati', email: 'anisa.rahma@company.com', status: 'Aktif', date: '24 Mei 2026', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
    { id: 2, name: 'Budi Setiawan', email: 'budi.setiawan@gmail.com', status: 'Aktif', date: '23 Mei 2026', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
    { id: 3, name: 'Chandra Wijaya', email: 'chandra.wijaya@outlook.co.id', status: 'Pending', date: '22 Mei 2026', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' },
    { id: 4, name: 'Diana Lestari', email: 'diana.lestari@tech.net', status: 'Aktif', date: '20 Mei 2026', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
    { id: 5, name: 'Fajar Pratama', email: 'fajar.pratama@enterprise.org', status: 'Nonaktif', date: '18 Mei 2026', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces' },
    { id: 6, name: 'Gilang Ramadhan', email: 'gilang.r@startup.id', status: 'Pending', date: '15 Mei 2026', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' },
    { id: 7, name: 'Hani Safitri', email: 'hani.s@mail.com', status: 'Aktif', date: '14 Mei 2026', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
  ]);

  // 2. State Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 3. State Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('terbaru'); 

  // 4. State Modal Edit & Hapus
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);

  // Fungsi Aksi
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  const handleDeleteConfirm = () => {
    setUsers(users.filter(u => u.id !== deletingUser.id));
    setDeletingUser(null);
    // Reset halaman jika item terakhir di halaman terhapus
    if (paginatedUsers.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getStatusStyle = (status: string) => {
    const baseClass = "px-3 py-1 text-xs font-medium rounded-md inline-block";
    switch (status) {
      case 'Aktif': return `${baseClass} bg-green-50 text-green-600`;
      case 'Pending': return `${baseClass} bg-amber-50 text-amber-600`;
      case 'Nonaktif': return `${baseClass} bg-red-50 text-red-600`;
      default: return baseClass;
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
           <span>Admin</span>
           <span>›</span>
           <span className="text-green-600 font-medium">Pengguna</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Pengguna</h2>
        <p className="text-gray-500 text-sm">Berikut data pengguna yang menggunakan App</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Daftar Pengguna Terbaru</h3>
            <p className="text-xs text-gray-500 mt-1">Kelola akses dan data personal pengguna</p>
          </div>
          
          {/* Komponen Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-100 transition-colors"
            >
              <Filter className="w-4 h-4" /> Filter
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-10">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="filter" checked={filterType === 'terbaru'} onChange={() => setFilterType('terbaru')} className="text-green-600 focus:ring-green-500" /> Terbaru
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="filter" checked={filterType === 'terlama'} onChange={() => setFilterType('terlama')} className="text-green-600 focus:ring-green-500" /> Terlama
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="filter" checked={filterType === 'custom'} onChange={() => setFilterType('custom')} className="text-green-600 focus:ring-green-500" /> Custom Filter
                  </label>

                  {filterType === 'custom' && (
                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Pilih Tanggal</p>
                        <input type="date" className="w-full text-sm border border-gray-200 rounded-lg p-2 outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <select className="w-full text-sm border border-gray-200 rounded-lg p-2 outline-none focus:border-green-500 bg-white">
                          <option>Semua Status</option>
                          <option>Aktif</option>
                          <option>Pending</option>
                          <option>Nonaktif</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">NAMA PENGGUNA</th>
                <th className="px-6 py-4">EMAIL</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">TANGGAL DAFTAR</th>
                <th className="px-6 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover bg-gray-100" />
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={getStatusStyle(user.status)}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4">{user.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setEditingUser(user)} title="Edit" className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingUser(user)} title="Hapus" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginasi Dinamis */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
          <span>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, users.length)} dari {users.length} pengguna</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between text-xs text-gray-500 py-4 mt-auto">
         <p>© 2026 AppActivator - Panel Admin</p>
         <a href="#" className="hover:text-green-600 underline">Kebijakan Privasi</a>
      </footer>

      {/* Modal Edit Status */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Ubah Status Pengguna</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSave} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Nama Pengguna</p>
                <p className="font-medium text-gray-900">{editingUser.name}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm text-gray-500 mb-2">Status Akun</label>
                <select 
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 outline-none focus:border-green-500 bg-white"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pending">Pending</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Konfirmasi */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Hapus Pengguna?</h3>
            <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus data <span className="font-semibold text-gray-700">{deletingUser.name}</span>? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingUser(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">Tidak, Batal</button>
              <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}