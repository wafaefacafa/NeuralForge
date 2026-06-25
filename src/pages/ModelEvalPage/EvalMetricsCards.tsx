import { memo } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { CHART_COLORS } from '@/lib/chart-colors';
import { ArrowUpRight } from 'lucide-react';

interface EvalMetricsCardsProps {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

const METRICS = [
  { key: 'accuracy', label: 'Accuracy', color: CHART_COLORS[0] },
  { key: 'precision', label: 'Precision', color: CHART_COLORS[1] },
  { key: 'recall', label: 'Recall', color: CHART_COLORS[2] },
  { key: 'f1Score', label: 'F1 Score', color: CHART_COLORS[3] },
] as const;

function buildGaugeOption(value: number, color: string): EChartsOption {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        center: ['50%', '55%'],
        radius: '85%',
        min: 0,
        max: 1,
        splitNumber: 10,
        axisLine: {
          show: true,
          lineStyle: {
            width: 12,
            color: [
              [value, color],
              [1, '#DDDDDD'],
            ],
          },
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          formatter: (v: number) => `${(v * 100).toFixed(1)}%`,
          color: '#000000',
          fontSize: 16,
          fontWeight: 'bold',
          offsetCenter: [0, '60%'],
        },
        data: [{ value }],
      },
    ],
  };
}

function EvalMetricsCards({ accuracy, precision, recall, f1Score }: EvalMetricsCardsProps) {
  const values: Record<string, number> = { accuracy, precision, recall, f1Score };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 border-b border-black">
      {METRICS.map((metric, i) => (
        <motion.div
          key={metric.key}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 border-r border-black last:border-r-0"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="heading-bold text-xl">{metric.label}</span>
              <ArrowUpRight className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="heading-bold text-4xl tabular-nums">
              {(values[metric.key] * 100).toFixed(1)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">%</span>
          </div>

          <div className="w-full h-[100px]">
            <ReactECharts
              option={buildGaugeOption(values[metric.key], metric.color)}
              style={{ height: '100%', width: '100%' }}
              notMerge
              lazyUpdate
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default memo(EvalMetricsCards);
