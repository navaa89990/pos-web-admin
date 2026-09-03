import { redirect } from 'next/navigation';

export default function RootPage() {
  // Otomatis melempar pengunjung ke halaman form login
  redirect('/login');
}