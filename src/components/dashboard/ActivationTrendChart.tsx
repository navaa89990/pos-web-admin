'use client';

import { useEffect, useRef } from 'react';
import type ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';

interface ActivationTrendChartProps {
  categories?: string[];
  series?: {
    name: string;
    data: number[];
  }[];
}

const defaultCategories = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const defaultSeries = [
  {
    name: 'Pengajuan Baru',
    data: [45, 52, 38, 65, 74, 60, 85],
  },
  {
    name: 'Disetujui',
    data: [35, 41, 30, 58, 62, 55, 78],
  },
];

export default function ActivationTrendChart({
  categories = defaultCategories,
  series = defaultSeries,
}: ActivationTrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chartInstance: ApexCharts | null = null;

    import('apexcharts').then((ApexChartsModule) => {
      if (!chartRef.current) return;
      const ApexChartsClass = ApexChartsModule.default;

      const options: ApexOptions = {
        series,
        chart: {
          type: 'area',
          height: 260,
          toolbar: {
            show: false,
          },
          fontFamily: 'inherit',
          animations: {
            enabled: true,
            speed: 500,
          },
        },
        colors: ['#117554', '#86efac'], // brand green & light green
        stroke: {
          curve: 'smooth',
          width: 2.5,
        },
        fill: {
          type: 'gradient',
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
            formatter: (val: number) => `${val} Permintaan`,
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
  }, [categories, series]);

  return (
    <div className="w-full">
      <div ref={chartRef} className="min-h-[260px]" />
    </div>
  );
}

