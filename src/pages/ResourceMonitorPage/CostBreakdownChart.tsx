import ReactECharts from 'echarts-for-react';
import type { EChartsOption, CallbackDataParams } from 'echarts';
import { CHART_COLORS } from '@/lib/chart-colors';
import type { ICostBreakdown } from '@/types/resources';

interface CostBreakdownChartProps {
  data: ICostBreakdown[];
  totalCost: number;
  changePercent: number;
}

const COST_COLORS = [
  CHART_COLORS[0], // 计算
  CHART_COLORS[1], // 存储
  CHART_COLORS[3], // 网络
  CHART_COLORS[2], // 其他
];

export default function CostBreakdownChart({ data, totalCost, changePercent }: CostBreakdownChartProps) {
  const pieData = data.map((item, i) => ({
    name: item.category,
    value: item.amount,
    itemStyle: { color: COST_COLORS[i % COST_COLORS.length] },
  }));

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(20, 24, 36, 0.95)',
      borderColor: '#374151',
      textStyle: { color: '#e5e7eb', fontSize: 13 },
      formatter: (params: CallbackDataParams) => {
        return `${params.name}<br/>费用: <b>$${params.value}</b> (${params.percent}%)`;
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#9ca3af', fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      formatter: (name: string) => {
        const item = data.find((d) => d.category === name);
        return item ? `${name}  $${item.amount}` : name;
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '78%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: false },
          scaleSize: 8,
        },
        itemStyle: {
          borderColor: 'rgba(20, 24, 36, 0.95)',
          borderWidth: 3,
          borderRadius: 4,
        },
        data: pieData,
      },
    ],
  };

  const isPositive = changePercent >= 0;

  return (
    <div className="flex flex-col items-center">
      <ReactECharts
        option={option}
        theme="ud"
        className="h-[260px] w-full"
        notMerge
        lazyUpdate
      />
      <div className="flex items-center gap-6 -mt-2">
        <div className="text-center">
          <div className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
            ${totalCost.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">本月累计费用</div>
        </div>
        <div className="text-center">
          <div
            className={`text-lg font-semibold tabular-nums ${
              isPositive ? 'text-destructive' : 'text-success'
            }`}
          >
            {isPositive ? '+' : ''}
            {changePercent}%
          </div>
          <div className="text-xs text-muted-foreground">环比变化</div>
        </div>
      </div>
    </div>
  );
}
