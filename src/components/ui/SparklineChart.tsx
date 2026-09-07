'use client';

import { useEffect, useRef } from 'react';
import type ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function SparklineChart({
  data,
  color = '#16a34a',
  height = 40,
}: SparklineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chartInstance: ApexCharts | null = null;

    import('apexcharts').then((ApexChartsModule) => {
      if (!chartRef.current) return;
      const ApexChartsClass = ApexChartsModule.default;

      const options: ApexOptions = {
        series: [
          {
            name: 'Trend',
            data,
          },
        ],
        chart: {
          type: 'area',
          height,
          sparkline: {
            enabled: true,
          },
          animations: {
            enabled: true,
            speed: 400,
          },
        },
        stroke: {
          curve: 'smooth',
          width: 2,
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [0, 90, 100],
          },
        },
        colors: [color],
        tooltip: {
          fixed: {
            enabled: false,
          },
          x: {
            show: false,
          },
          y: {
            title: {
              formatter: () => '',
            },
          },
          marker: {
            show: false,
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
  }, [data, color, height]);

  return <div ref={chartRef} className="w-24 overflow-hidden" />;
}

