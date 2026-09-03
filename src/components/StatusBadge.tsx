export default function StatusBadge({ status }: { status: string }) {
  const baseClass = "px-3 py-1 text-xs font-medium rounded-md inline-block";
  switch (status) {
    case 'Disetujui': return <span className={`${baseClass} bg-green-50 text-green-600`}>Disetujui</span>;
    case 'Menunggu': return <span className={`${baseClass} bg-amber-50 text-amber-600`}>Menunggu</span>;
    case 'Ditolak': return <span className={`${baseClass} bg-red-50 text-red-600`}>Ditolak</span>;
    default: return null;
  }
}