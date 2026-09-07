'use client';

import { useState, useEffect, useCallback } from 'react';
import { Filter, Edit, Trash2, X, AlertTriangle, Inbox, Check } from 'lucide-react';
import { User, UserStatus } from '@/types';

export default function PenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // State Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // State Modal Edit & Hapus
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Ambil data pengguna dari database MySQL
  const refreshUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Gagal mengambil data pengguna:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setUsers(data.users);
        }
      })
      .catch((err) => console.error('Gagal mengambil data pengguna:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fungsi Simpan Edit Status
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser.id, status: editingUser.status }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUsers();
        setEditingUser(null);
      } else {
        alert(data.message || 'Gagal mengubah status.');
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan perubahan.');
    }
  };

  // Fungsi Hapus Pengguna
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      const res = await fetch(`/api/admin/users?id=${deletingUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await refreshUsers();
        setDeletingUser(null);
      } else {
        alert(data.message || 'Gagal menghapus pengguna.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus pengguna.');
    }
  };

  // Filter & Urutan Data
  const filteredUsers = users.filter((u) => {
    if (statusFilter === 'Semua') return true;
    return u.status === statusFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusStyle = (status: string) => {
    const baseClass = 'px-3 py-1 text-xs font-medium rounded-md inline-block';
    switch (status) {
      case 'Aktif':
        return `${baseClass} bg-green-50 text-green-600`;
      case 'Pending':
        return `${baseClass} bg-amber-50 text-amber-600`;
      case 'Nonaktif':
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
          <span className="text-green-600 font-medium">Pengguna</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Pengguna</h2>
        <p className="text-gray-500 text-sm">Data merchant dan pengguna terdaftar aplikasi POS Mobile</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Daftar Pengguna</h3>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? 'Memuat data...' : `Total ${users.length} pengguna terdaftar di sistem`}
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-100 transition-colors"
            >
              <Filter className="w-4 h-4" /> Filter {statusFilter !== 'Semua' && `(${statusFilter})`}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Status Pengguna
                </p>
                {['Semua', 'Aktif', 'Pending', 'Nonaktif'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                      statusFilter === status
                        ? 'bg-green-50 text-green-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{status}</span>
                    {statusFilter === status && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {filteredUsers.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center text-gray-400">
              <Inbox className="w-14 h-14 mb-3 stroke-[1.5] text-gray-300" />
              <p className="font-semibold text-base text-gray-700">Belum ada pengguna terdaftar</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Pengguna baru akan otomatis ditambahkan ke daftar ini ketika permohonan aktivasi akun disetujui.
              </p>
            </div>
          ) : (
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
                      <div className="w-9 h-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={getStatusStyle(user.status)}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4">{user.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          title="Edit"
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          title="Hapus"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginasi Dinamis */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
            <span>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length}{' '}
              pengguna
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between text-xs text-gray-500 py-4 mt-auto">
        <p>© 2026 Pos Mobile - Panel Admin</p>
        <a href="#" className="hover:text-green-600 underline">
          Kebijakan Privasi
        </a>
      </footer>

      {/* Modal Edit Status */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Ubah Status Pengguna</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6">
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Nama Pengguna</p>
                <p className="font-semibold text-gray-900">{editingUser.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{editingUser.email}</p>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Status Akun
                </label>
                <select
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, status: e.target.value as UserStatus })
                  }
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 outline-none focus:border-green-500 bg-white"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pending">Pending</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Simpan Perubahan
                </button>
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
            <p className="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus data{' '}
              <span className="font-semibold text-gray-700">{deletingUser.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Tidak, Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}