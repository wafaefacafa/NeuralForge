import ReactECharts from 'echarts-for-react';
import type { EChartsOption, CallbackDataParams } from 'echarts';
import { CHART_COLORS } from '@/lib/chart-colors';
import type { IConfusionMatrix } from '@/types/models';

interface ConfusionMatrixChartProps {
  data: IConfusionMatrix;
}

export default function ConfusionMatrixChart({ data }: ConfusionMatrixChartProps) {
  const { labels, matrix } = data;

  const maxVal = Math.max(...matrix.flat(), 1);

  const seriesData: [number, number, number][] = [];
  matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      seriesData.push([j, i, val]);
    });
  });

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#000000',
      borderWidth: 0,
      textStyle: { color: '#ffffff', fontSize: 12 },
      formatter: (params: CallbackDataParams) => {
        const d = params.data as [number, number, number];
        const actualLabel = labels[d[1]];
        const predLabel = labels[d[0]];
        const val = d[2];
        return `<div style="font-size:12px;line-height:1.6">
          <span style="color:#aaaaaa">真实:</span> <b>${actualLabel}</b><br/>
          <span style="color:#aaaaaa">预测:</span> <b>${predLabel}</b><br/>
          <span style="color:#aaaaaa">数量:</span> <b style="font-size:16px">${val}</b>
        </div>`;
      },
    },
    grid: {
      left: '12%',
      right: '8%',
      bottom: '12%',
      top: '6%',
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: labels,
      position: 'top',
      axisLine: { lineStyle: { color: '#000000' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#000000',
        fontSize: 11,
        fontWeight: 'bold',
        rotate: labels.length > 6 ? 30 : 0,
      },
      name: '预测标签',
      nameLocation: 'center',
      nameGap: 32,
      nameTextStyle: { color: '#64748b', fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: labels,
      inverse: true,
      axisLine: { lineStyle: { color: '#000000' } },
      axisTick: { show: false },
      axisLabel: { color: '#000000', fontSize: 11, fontWeight: 'bold' },
      name: '真实标签',
      nameLocation: 'center',
      nameGap: 48,
      nameTextStyle: { color: '#64748b', fontSize: 11 },
    },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: [
          '#DDDDDD',
          '#BBBBBB',
          '#888888',
          '#444444',
          '#000000',
        ],
      },
      textStyle: { color: '#64748b', fontSize: 10 },
      itemWidth: 14,
      itemHeight: 100,
      text: ['高', '低'],
    },
    series: [
      {
        type: 'heatmap',
        data: seriesData,
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold',
          formatter: (params: CallbackDataParams) => {
            const d = params.data as [number, number, number];
            return String(d[2]);
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 0,
            shadowColor: 'transparent',
            borderColor: '#000000',
            borderWidth: 2,
          },
        },
        itemStyle: {
          borderColor: '#000000',
          borderWidth: 1,
        },
      },
    ],
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
  };

  return (
    <div className="border-b border-black p-8">
      <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
        <h2 className="heading-bold text-xl">混淆矩阵</h2>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M11 5L5 11M5 5H11V11" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
        </svg>
      </div>
      <ReactECharts
        option={option}
        className="h-[420px] w-full"
        notMerge
        lazyUpdate
      />
    </div>
  );
}
