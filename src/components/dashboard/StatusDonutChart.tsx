'use client';

import { useEffect, useRef } from 'react';
import type ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';

interface StatusDonutChartProps {
  series?: number[];
  labels?: string[];
  totalLabel?: string;
}

export default function StatusDonutChart({
  series = [72, 20, 8],
  labels = ['Disetujui', 'Menunggu', 'Ditolak'],
  totalLabel = 'Total',
}: StatusDonutChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chartInstance: ApexCharts | null = null;

    import('apexcharts').then((ApexChartsModule) => {
      if (!chartRef.current) return;
      const ApexChartsClass = ApexChartsModule.default;

      const options: ApexOptions = {
        series,
        labels,
        chart: {
          type: 'donut',
          height: 250,
          fontFamily: 'inherit',
          animations: {
            enabled: true,
            speed: 600,
          },
        },
        colors: ['#16a34a', '#f59e0b', '#ef4444'], // green, amber, red
        stroke: {
          width: 2,
          colors: ['#ffffff'],
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
          fontSize: '12px',
          fontWeight: 500,
          markers: {
            size: 6,
            shape: 'circle',
          },
          itemMargin: {
            horizontal: 10,
            vertical: 4,
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '72%',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#6b7280',
                  offsetY: -4,
                },
                value: {
                  show: true,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#111827',
                  offsetY: 6,
                  formatter: (val) => `${val}%`,
                },
                total: {
                  show: true,
                  label: totalLabel,
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#9ca3af',
                  formatter: () => '100%',
                },
              },
            },
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val}% dari total aktivasi`,
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
  }, [series, labels, totalLabel]);

  return (
    <div className="w-full flex justify-center items-center py-2">
      <div ref={chartRef} className="w-full max-w-[280px]" />
    </div>
  );
}

