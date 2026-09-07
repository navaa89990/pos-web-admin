import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil.',
  });

  // Hapus cookie session admin
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}

