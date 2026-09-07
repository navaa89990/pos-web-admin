'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, X, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset Password Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'newPassword' | 'success'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

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

  // 1. Kirim OTP untuk Reset Password
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setResetError(data.message || 'Gagal mengirim OTP reset password.');
        return;
      }

      setResetStep('otp');
    } catch {
      setResetError('Terjadi kesalahan koneksi saat mengirim OTP.');
    } finally {
      setResetLoading(false);
    }
  };

  // 2. Verifikasi Kode OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setResetError(data.message || 'Kode OTP salah atau telah kedaluwarsa.');
        return;
      }

      setResetToken(data.resetToken || '');
      setResetStep('newPassword');
    } catch {
      setResetError('Terjadi kesalahan saat memverifikasi kode OTP.');
    } finally {
      setResetLoading(false);
    }
  };

  // 3. Simpan Password Baru
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 6) {
      setResetError('Password minimal harus terdiri dari 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch('/api/otp/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: resetEmail, 
          resetToken, 
          otp: resetOtp, 
          newPassword 
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setResetError(data.message || 'Gagal mengatur ulang password.');
        return;
      }

      setResetSuccessMsg(data.message || 'Kata sandi berhasil diperbarui!');
      setResetStep('success');
      setEmail(resetEmail); // Isi otomatis email di login form
    } catch {
      setResetError('Terjadi kesalahan saat menyimpan kata sandi baru.');
    } finally {
      setResetLoading(false);
    }
  };

  const openResetModal = () => {
    setResetStep('email');
    setResetEmail(email || '');
    setResetOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccessMsg('');
    setShowResetModal(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4 relative">
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
              <button 
                type="button" 
                onClick={openResetModal} 
                className="text-xs text-green-700 hover:text-green-800 hover:underline font-semibold cursor-pointer"
              >
                Lupa sandi?
              </button>
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

      {/* MODAL RESET PASSWORD (OTP FLOW) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Modal */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                <p className="text-xs text-gray-500">Atur ulang kata sandi melalui kode OTP email</p>
              </div>
            </div>

            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{resetError}</span>
              </div>
            )}

            {/* STEP 1: INPUT EMAIL */}
            {resetStep === 'email' && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email Akun</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Masukkan email terdaftar"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-600 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Kode 6-digit OTP akan dikirim ke alamat email di atas.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Kode OTP'}
                </button>
              </form>
            )}

            {/* STEP 2: INPUT OTP */}
            {resetStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Kode OTP 6-Digit</label>
                    <button
                      type="button"
                      onClick={() => setResetStep('email')}
                      className="text-[11px] text-green-700 hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Ganti Email
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="Contoh: 849201"
                    className="w-full text-center tracking-[8px] font-mono text-xl py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-green-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5 text-center">
                    Cek kotak masuk atau spam email <b>{resetEmail}</b>. Kode berlaku 5 menit.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || resetOtp.length < 6}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verifikasi OTP'}
                </button>
              </form>
            )}

            {/* STEP 3: INPUT PASSWORD BARU */}
            {resetStep === 'newPassword' && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Password Baru'}
                </button>
              </form>
            )}

            {/* STEP 4: SUCCESS */}
            {resetStep === 'success' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Password Berhasil Diubah!</h4>
                  <p className="text-xs text-gray-500 mt-1">{resetSuccessMsg}</p>
                </div>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-all cursor-pointer"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}