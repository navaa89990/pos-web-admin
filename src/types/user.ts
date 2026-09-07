export type UserStatus = 'Aktif' | 'Pending' | 'Nonaktif';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: UserStatus;
  date: string;
  avatar: string;
}

export type UserFilterType = 'terbaru' | 'terlama' | 'custom';

