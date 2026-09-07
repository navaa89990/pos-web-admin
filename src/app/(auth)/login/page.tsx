'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Login gagal. Periksa kembali email dan password.');
        return;
      }

      // Simpan session admin di localStorage
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      router.push('/dashboard');
      router.refresh();
    } catch {
      setErrorMsg('Gagal terhubung ke server. Pastikan database MySQL aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="/assets/logo.png" 
            alt="Logo POS Mobile" 
            width={52} 
            height={52} 
            className="mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Login Admin POS</h1>
          <p className="text-sm text-gray-600 mt-1">Silakan masuk ke akun administrator Anda</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@posmobile.com" 
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-green-600 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-gray-900">Password</label>
              <a href="#" className="text-xs text-green-700 hover:text-green-800 hover:underline font-semibold">Lupa sandi?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi" 
                required
                className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-green-600 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" defaultChecked className="rounded text-green-600 focus:ring-green-400 accent-green-600 w-4 h-4 cursor-pointer" />
            <label htmlFor="remember" className="text-sm font-medium text-gray-700 cursor-pointer">Ingat saya</label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              'Masuk ke Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}