export default function StatCard({ icon: Icon, title, value, change, changeColor = "text-green-600" }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 min-w-60">
      <div className="flex justify-between items-start mb-4">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <div className={`${changeColor} bg-gray-50 p-2 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-xs font-semibold px-2 py-1 bg-gray-50 rounded-md ${changeColor}`}>{change}</span>
        <span className="text-xs text-gray-400">dari bulan lalu</span>
      </div>
    </div>
  );
}