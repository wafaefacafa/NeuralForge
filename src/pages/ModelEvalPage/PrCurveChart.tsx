import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { CHART_COLORS } from '@/lib/chart-colors';
import type { IPrPoint } from '@/types/models';

interface PrCurveChartProps {
  data: IPrPoint[];
  aucRoc: number;
}

export default function PrCurveChart({ data, aucRoc }: PrCurveChartProps) {
  const option: EChartsOption = {
    color: [CHART_COLORS[0], CHART_COLORS[2]],
    backgroundColor: 'transparent',
    textStyle: { color: '#000000' },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#000000',
      borderWidth: 0,
      textStyle: { color: '#ffffff', fontSize: 12 },
      formatter: (params: { name: string; value: number[] }) => {
        const p = params as { name: string; value: number[] };
        return `Recall: ${Number(p.value[0]).toFixed(3)}<br/>Precision: ${Number(p.value[1]).toFixed(3)}`;
      },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748b', fontSize: 12 },
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 20,
      data: ['PR Curve', 'Baseline'],
    },
    grid: {
      containLabel: true,
      top: 32,
      right: 16,
      bottom: 32,
      left: 16,
    },
    xAxis: {
      type: 'value',
      name: 'Recall',
      nameTextStyle: { color: '#000000', fontSize: 10, fontWeight: 'bold' },
      min: 0,
      max: 1,
      axisLine: { lineStyle: { color: '#000000' } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#cccccc', type: 'dashed' } },
      axisLabel: {
        color: '#000000',
        fontSize: 10,
        fontWeight: 'bold',
        formatter: (value: number) => value.toFixed(1),
      },
    },
    yAxis: {
      type: 'value',
      name: 'Precision',
      nameTextStyle: { color: '#000000', fontSize: 10, fontWeight: 'bold' },
      min: 0,
      max: 1,
      axisLine: { lineStyle: { color: '#000000' } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#cccccc', type: 'dashed' } },
      axisLabel: {
        color: '#000000',
        fontSize: 10,
        fontWeight: 'bold',
        formatter: (value: number) => value.toFixed(1),
      },
    },
    series: [
      {
        name: 'PR Curve',
        type: 'line',
        data: data.map((p) => [p.recall, p.precision]),
        step: 'end',
        symbol: 'none',
        lineStyle: { width: 3, color: '#000000' },
        emphasis: { disabled: true },
        areaStyle: {
          color: '#000000',
          opacity: 0.1,
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#000000', type: 'dashed', width: 1 },
          label: {
            color: '#000000',
            fontSize: 10,
            fontWeight: 'bold',
            formatter: `AUC: ${aucRoc.toFixed(3)}`,
            position: 'insideEndTop',
          },
          data: [
            {
              xAxis: aucRoc,
              label: { formatter: `AUC: ${aucRoc.toFixed(3)}` },
            },
          ],
        },
      },
      {
        name: 'Baseline',
        type: 'line',
        data: [
          [0, 0.5],
          [1, 0.5],
        ],
        symbol: 'none',
        lineStyle: { color: '#888888', type: 'dashed', width: 1.5 },
        emphasis: { disabled: true },
      },
    ],
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
  };

  return (
    <ReactECharts
      option={option}
      className="h-[350px] w-full"
      notMerge
      lazyUpdate
    />
  );
}
