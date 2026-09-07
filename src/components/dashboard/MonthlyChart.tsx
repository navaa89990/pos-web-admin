'use client';

import { useEffect, useRef, useState } from 'react';
import type ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';

interface MonthlyChartProps {
  data?: {
    bulan: string;
    disetujui: number;
    ditolak: number;
  }[];
}

const defaultChartData = [
  { bulan: 'Jan', disetujui: 35, ditolak: 8 },
  { bulan: 'Feb', disetujui: 50, ditolak: 12 },
  { bulan: 'Mar', disetujui: 45, ditolak: 10 },
  { bulan: 'Apr', disetujui: 65, ditolak: 15 },
  { bulan: 'Mei', disetujui: 75, ditolak: 18 },
  { bulan: 'Jun', disetujui: 90, ditolak: 12 },
];

export default function MonthlyChart({ data = defaultChartData }: MonthlyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  useEffect(() => {
    let chartInstance: ApexCharts | null = null;

    import('apexcharts').then((ApexChartsModule) => {
      if (!chartRef.current) return;
      const ApexChartsClass = ApexChartsModule.default;

      const categories = data.map((d) => d.bulan);
      const disetujuiSeries = data.map((d) => d.disetujui);
      const ditolakSeries = data.map((d) => d.ditolak);

      const options: ApexOptions = {
        series: [
          {
            name: 'Disetujui',
            data: disetujuiSeries,
          },
          {
            name: 'Ditolak',
            data: ditolakSeries,
          },
        ],
        chart: {
          type: chartType,
          height: 280,
          toolbar: {
            show: false,
          },
          fontFamily: 'inherit',
          animations: {
            enabled: true,
            speed: 500,
          },
        },
        colors: ['#16a34a', '#ef4444'], // green-600 (disetujui) & red-500 (ditolak)
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '40%',
            borderRadius: 4,
            borderRadiusApplication: 'end',
          },
        },
        stroke: {
          curve: 'smooth',
          width: chartType === 'area' ? 2.5 : 2,
          colors: chartType === 'area' ? ['#16a34a', '#ef4444'] : ['transparent'],
        },
        fill: {
          type: chartType === 'area' ? 'gradient' : 'solid',
          opacity: chartType === 'area' ? 1 : 1,
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.05,
            stops: [0, 90, 100],
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories,
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            style: {
              colors: '#6b7280',
              fontSize: '12px',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#6b7280',
              fontSize: '12px',
            },
          },
        },
        grid: {
          borderColor: '#f3f4f6',
          strokeDashArray: 4,
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          fontSize: '12px',
          fontWeight: 500,
          markers: {
            size: 6,
            shape: 'circle',
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} Aktivasi`,
          },
        },
      };

      if (chartRef.current) {
        chartRef.current.innerHTML = '';
      }
      chartInstance = new ApexChartsClass(chartRef.current, options);
      chartInstance.render();
    });

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [data, chartType]);

  return (
    <div className="w-full">
      <div className="flex justify-end gap-1 mb-2">
        <button
          type="button"
          onClick={() => setChartType('bar')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
            chartType === 'bar'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Kolom
        </button>
        <button
          type="button"
          onClick={() => setChartType('area')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
            chartType === 'area'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Area Tren
        </button>
      </div>
      <div ref={chartRef} className="min-h-[280px]" />
    </div>
  );
}
