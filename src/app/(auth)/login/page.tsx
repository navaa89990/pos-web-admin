'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="/assets/logo.png" 
            alt="Logo POS Mobile" 
            width={48} 
            height={48} 
            className="mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">Login Admin POS</h1>
          <p className="text-sm text-gray-500 mt-1">Silakan masuk ke akun administrator Anda</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="admin@posmobile.com" 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-xs text-green-600 hover:underline font-medium">Lupa sandi?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="rounded text-green-500 focus:ring-green-400 accent-green-600" />
            <label htmlFor="remember" className="text-sm text-gray-600">Ingat saya</label>
          </div>

          <button 
            type="button" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
          >
            Masuk ke Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}