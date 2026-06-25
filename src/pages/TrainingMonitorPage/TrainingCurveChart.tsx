import { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption, CallbackDataParams } from 'echarts';
import { CHART_COLORS } from '@/lib/chart-colors';
import type { ITrainingEpochMetrics } from '@/types/training';

interface TrainingCurveChartProps {
  metrics: ITrainingEpochMetrics[];
}

function TrainingCurveChart({ metrics }: TrainingCurveChartProps) {
  const epochs = metrics.map((m) => `E${m.epoch}`);

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 24, 36, 0.95)',
      borderColor: '#374151',
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#6b7280' },
        label: {
          backgroundColor: '#374151',
          color: '#e5e7eb',
        },
      },
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        const epoch = list[0]?.axisValue ?? '';
        let html = `<div style="font-weight:600;margin-bottom:4px;">${epoch}</div>`;
        list.forEach((p) => {
          html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};"></span>
            <span>${p.seriesName}: <b>${typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</b></span>
          </div>`;
        });
        return html;
      },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#9ca3af', fontSize: 11 },
      itemWidth: 14,
      itemHeight: 8,
      itemGap: 16,
      data: ['训练 Loss', '验证 Loss', '训练 Accuracy', '验证 Accuracy'],
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '20%',
      top: '6%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: epochs,
      axisLine: { lineStyle: { color: '#374151' } },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 10 },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Loss',
        nameTextStyle: { color: '#9ca3af', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#1f2937', type: 'dashed' } },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10,
          formatter: (value: number) => value.toFixed(2),
        },
      },
      {
        type: 'value',
        name: 'Accuracy',
        min: 0,
        max: 100,
        nameTextStyle: { color: '#9ca3af', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10,
          formatter: (value: number) => `${value}%`,
        },
      },
    ],
    series: [
      {
        name: '训练 Loss',
        type: 'line',
        yAxisIndex: 0,
        data: metrics.map((m) => m.trainLoss),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2, color: CHART_COLORS[0] },
        itemStyle: { color: CHART_COLORS[0] },
      },
      {
        name: '验证 Loss',
        type: 'line',
        yAxisIndex: 0,
        data: metrics.map((m) => m.valLoss),
        smooth: true,
        symbol: 'diamond',
        symbolSize: 4,
        lineStyle: { width: 2, color: CHART_COLORS[3], type: 'dashed' },
        itemStyle: { color: CHART_COLORS[3] },
      },
      {
        name: '训练 Accuracy',
        type: 'line',
        yAxisIndex: 1,
        data: metrics.map((m) => +(m.trainAccuracy * 100).toFixed(1)),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2, color: CHART_COLORS[1] },
        itemStyle: { color: CHART_COLORS[1] },
      },
      {
        name: '验证 Accuracy',
        type: 'line',
        yAxisIndex: 1,
        data: metrics.map((m) => +(m.valAccuracy * 100).toFixed(1)),
        smooth: true,
        symbol: 'diamond',
        symbolSize: 4,
        lineStyle: { width: 2, color: CHART_COLORS[4], type: 'dashed' },
        itemStyle: { color: CHART_COLORS[4] },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      theme="ud"
      className="h-[360px] w-full"
      notMerge
      lazyUpdate
    />
  );
}

export default memo(TrainingCurveChart);
