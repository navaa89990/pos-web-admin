interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const baseClass = "px-3 py-1 text-xs font-medium rounded-md inline-block";
  switch (status) {
    case 'Disetujui':
    case 'disetujui':
    case 'Aktif':
      return <span className={`${baseClass} bg-green-50 text-green-600`}>{status}</span>;
    case 'Menunggu':
    case 'pending':
    case 'Pending':
      return <span className={`${baseClass} bg-amber-50 text-amber-600`}>{status}</span>;
    case 'Ditolak':
    case 'ditolak':
    case 'Nonaktif':
      return <span className={`${baseClass} bg-red-50 text-red-600`}>{status}</span>;
    default:
      return <span className={`${baseClass} bg-gray-50 text-gray-600`}>{status}</span>;
  }
}

