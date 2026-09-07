import { LucideIcon } from 'lucide-react';
import SparklineChart from './SparklineChart';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  change: string;
  changeColor?: string;
  chartData?: number[];
  chartColor?: string;
}

export default function StatCard({
  icon: Icon,
  title,
  value,
  change,
  changeColor = "text-green-600",
  chartData,
  chartColor = "#16a34a",
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 min-w-60">
      <div className="flex justify-between items-start mb-4">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <div className={`${changeColor} bg-gray-50 p-2 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2 py-1 bg-gray-50 rounded-md ${changeColor}`}>{change}</span>
            <span className="text-xs text-gray-400">dari bulan lalu</span>
          </div>
        </div>
        {chartData && (
          <div className="mb-1">
            <SparklineChart data={chartData} color={chartColor} height={42} />
          </div>
        )}
      </div>
    </div>
  );
}
