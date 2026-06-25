import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { CHART_COLORS } from '@/lib/chart-colors';
import type { ITrainingTrendPoint } from '@/types/dashboard';

interface TrainingTrendChartProps {
  data: ITrainingTrendPoint[];
}

export default function TrainingTrendChart({ data }: TrainingTrendChartProps) {
  const option: EChartsOption = {
    color: [CHART_COLORS[0], CHART_COLORS[2]],
    backgroundColor: 'transparent',
    textStyle: { color: '#000000' },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#000000',
      borderWidth: 0,
      textStyle: { color: '#ffffff', fontSize: 12 },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#000000' },
        label: {
          backgroundColor: '#000000',
          color: '#ffffff',
        },
      },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748b', fontSize: 12 },
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 10,
      data: ['提交任务', '完成任务'],
    },
    grid: {
      containLabel: true,
      top: 32,
      right: 16,
      bottom: 32,
      left: 16,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date),
      axisLine: { lineStyle: { color: '#000000' } },
      axisTick: { show: false },
      axisLabel: { color: '#000000', fontSize: 10, fontWeight: 'bold' },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '任务数',
      nameTextStyle: { color: '#000000', fontSize: 10, fontWeight: 'bold' },
      axisLine: { lineStyle: { color: '#000000' } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#cccccc', type: 'dashed' } },
      axisLabel: { color: '#000000', fontSize: 10, fontWeight: 'bold' },
    },
    series: [
      {
        name: '提交任务',
        type: 'line',
        data: data.map((d) => d.submitted),
        step: 'end',
        symbol: 'none',
        lineStyle: { width: 3, color: '#000000' },
        emphasis: { disabled: true },
        areaStyle: {
          color: '#000000',
          opacity: 0.1,
        },
      },
      {
        name: '完成任务',
        type: 'line',
        data: data.map((d) => d.completed),
        step: 'end',
        symbol: 'none',
        lineStyle: { width: 3, color: '#888888' },
        emphasis: { disabled: true },
        areaStyle: {
          color: '#888888',
          opacity: 0.1,
        },
      },
    ],
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
  };

  return (
    <ReactECharts
      option={option}
      className="h-[300px] w-full"
      notMerge
      lazyUpdate
    />
  );
}
