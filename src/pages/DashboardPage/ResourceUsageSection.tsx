import { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { CHART_COLORS } from '@/lib/chart-colors';
import type { IResourceUsage } from '@/types/dashboard';

interface ResourceUsageSectionProps {
  data: IResourceUsage[];
}

export default memo(function ResourceUsageSection({ data }: ResourceUsageSectionProps) {
  const option: EChartsOption = {
    color: CHART_COLORS as unknown as string[],
    backgroundColor: 'transparent',
    textStyle: { color: '#000000' },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#000000',
      borderWidth: 0,
      textStyle: { color: '#ffffff', fontSize: 12 },
      formatter: (params: { name: string; value: number; percent: number }) => {
        const item = data.find((d) => d.label === params.name);
        if (!item) return `${params.name}: ${params.value}%`;
        return `${item.label}<br/>已用: ${item.used}${item.unit} / 总量: ${item.total}${item.unit}<br/>使用率: ${params.value}%`;
      },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748b', fontSize: 12 },
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 20,
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '78%'],
        center: ['50%', '43%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          scale: false,
          label: { show: false },
        },
        itemStyle: {
          borderColor: 'hsl(36 17% 87%)',
          borderWidth: 2,
        },
        data: data.map((item, idx) => ({
          name: item.label,
          value: item.used,
          itemStyle: {
            color: CHART_COLORS[idx % CHART_COLORS.length],
          },
        })),
      },
    ],
    animationDuration: 800,
    animationEasing: 'cubicOut' as const,
  };

  return (
    <div className="border-b border-black p-8">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="heading-bold text-xl">资源使用率</h3>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M11 5L5 11M5 5H11V11" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
        </svg>
      </div>

      <ReactECharts option={option} style={{ height: 300 }} />

      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((item, idx) => {
          const pct = Math.min(item.used / (item.total || 1) * 100, 100);
          const isOverThreshold = pct >= item.threshold;
          return (
            <div key={item.type} className="flex items-center gap-3">
              <div
                className="size-3 shrink-0"
                style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-xs font-bold tabular-nums">
                    {item.used}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      /{item.total}{item.unit}
                    </span>
                  </span>
                </div>
                <div className="w-full h-6 border border-black overflow-hidden bg-black/10">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isOverThreshold ? '#DC2626' : '#000000',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
