import { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS } from '@/lib/chart-colors';

interface GpuUtilizationGaugeProps {
  gpuUtilization: number;
  gpuMemoryUsed: number;
  gpuMemoryTotal: number;
  gpuName?: string;
}

export default memo(function GpuUtilizationGauge({
  gpuUtilization,
  gpuMemoryUsed,
  gpuMemoryTotal,
  gpuName = 'NVIDIA A100',
}: GpuUtilizationGaugeProps) {
  const memoryPercent = Math.round((gpuMemoryUsed / gpuMemoryTotal) * 100);

  const gaugeOption: EChartsOption = {
    series: [
      {
        type: 'gauge',
        center: ['50%', '55%'],
        radius: '85%',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          show: true,
          lineStyle: {
            width: 18,
            color: [
              [0.3, CHART_COLORS[3]],
              [0.7, CHART_COLORS[1]],
              [1, CHART_COLORS[0]],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '70%',
          width: 6,
          offsetCenter: [0, '-10%'],
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          length: 10,
          lineStyle: {
            color: 'auto',
            width: 2,
          },
        },
        splitLine: {
          length: 22,
          lineStyle: {
            color: 'auto',
            width: 4,
          },
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          distance: 25,
          formatter: (value: number) => `${value}%`,
        },
        title: {
          offsetCenter: [0, '82%'],
          color: '#6b7280',
          fontSize: 13,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: '#000000',
          fontSize: 28,
          fontWeight: 'bold',
          offsetCenter: [0, '48%'],
        },
        data: [
          {
            value: gpuUtilization,
            name: 'GPU 利用率',
          },
        ],
      },
    ],
  };

  const memoryOption: EChartsOption = {
    series: [
      {
        type: 'gauge',
        center: ['50%', '55%'],
        radius: '85%',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          show: true,
          lineStyle: {
            width: 18,
            color: [
              [0.4, CHART_COLORS[3]],
              [0.75, CHART_COLORS[1]],
              [1, CHART_COLORS[0]],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '70%',
          width: 6,
          offsetCenter: [0, '-10%'],
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          length: 10,
          lineStyle: {
            color: 'auto',
            width: 2,
          },
        },
        splitLine: {
          length: 22,
          lineStyle: {
            color: 'auto',
            width: 4,
          },
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          distance: 25,
          formatter: (value: number) => `${value}%`,
        },
        title: {
          offsetCenter: [0, '82%'],
          color: '#6b7280',
          fontSize: 13,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: '#000000',
          fontSize: 28,
          fontWeight: 'bold',
          offsetCenter: [0, '48%'],
        },
        data: [
          {
            value: memoryPercent,
            name: '显存使用率',
          },
        ],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-black bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            GPU 利用率
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ReactECharts
            option={gaugeOption}
            className="h-[240px] w-full"
            notMerge
            lazyUpdate
          />
          <p className="-mt-4 text-xs text-muted-foreground">
            {gpuName}
          </p>
        </CardContent>
      </Card>

      <Card className="border-black bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            显存使用
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ReactECharts
            option={memoryOption}
            className="h-[240px] w-full"
            notMerge
            lazyUpdate
          />
          <p className="-mt-4 text-xs text-muted-foreground">
            {gpuMemoryUsed} GB / {gpuMemoryTotal} GB
          </p>
        </CardContent>
      </Card>
    </div>
  );
});
