export type ActivationStatus = 'pending' | 'disetujui' | 'ditolak' | 'Menunggu' | 'Disetujui' | 'Ditolak';

export interface ActivationItem {
  id: number;
  name?: string;
  nama?: string;
  email?: string;
  date?: string;
  tgl?: string;
  status: ActivationStatus;
}

