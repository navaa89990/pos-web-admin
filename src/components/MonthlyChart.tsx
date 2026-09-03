export default function MonthlyChart() {
  const data = [15, 30, 45, 55, 75, 85];
  const maxData = Math.max(...data);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];

  return (
    <div className="flex justify-between items-end h-48 gap-4 px-2 mt-8">
      {months.map((month, index) => (
        <div key={month} className="flex flex-col items-center flex-1 gap-3">
          <div className="w-full relative flex justify-center items-end h-full">
             <div
              className="w-4 bg-green-600 rounded-t-sm"
              style={{ height: `${(data[index] / maxData) * 100}%` }}
            />
             <div className="w-4 bg-red-500 rounded-t-sm absolute bottom-0 ml-5 h-2" />
          </div>
          <span className="text-xs text-gray-500">{month}</span>
        </div>
      ))}
    </div>
  );
}