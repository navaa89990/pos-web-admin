export type NotificationCategory = 'Semua' | 'Transaksi' | 'Perangkat' | 'Keuangan';

export interface NotificationItem {
  id: number;
  category: NotificationCategory | string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

