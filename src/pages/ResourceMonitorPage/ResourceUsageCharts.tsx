import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CHART_COLORS } from '@/lib/chart-colors';
import type { IResourceTimeSeries } from '@/types/resources';

interface ResourceUsageChartsProps {
  cpu: IResourceTimeSeries[];
  gpu: IResourceTimeSeries[];
  memory: IResourceTimeSeries[];
  storage: IResourceTimeSeries[];
}

type TimeRange = '1h' | '6h' | '24h' | '7d';

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '1h': '1 小时',
  '6h': '6 小时',
  '24h': '24 小时',
  '7d': '7 天',
};

const CHART_CONFIGS = [
  { key: 'cpu' as const, label: 'CPU 使用率', unit: '%', color: CHART_COLORS[0], threshold: 80 },
  { key: 'gpu' as const, label: 'GPU 使用率', unit: '%', color: CHART_COLORS[1], threshold: 85 },
  { key: 'memory' as const, label: '内存使用率', unit: '%', color: CHART_COLORS[2], threshold: 80 },
  { key: 'storage' as const, label: '存储使用率', unit: '%', color: CHART_COLORS[3], threshold: 75 },
];

function filterByTimeRange(data: IResourceTimeSeries[], range: TimeRange): IResourceTimeSeries[] {
  const now = new Date(data[data.length - 1]?.timestamp ?? Date.now()).getTime();
  const ranges: Record<TimeRange, number> = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
  };
  const cutoff = now - ranges[range];
  return data.filter((d) => new Date(d.timestamp).getTime() >= cutoff);
}

function formatTimestamp(ts: string, range: TimeRange): string {
  const d = new Date(ts);
  if (range === '1h' || range === '6h') {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (range === '24h') {
    return `${String(d.getHours()).padStart(2, '0')}:00`;
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ResourceUsageCharts({ cpu, gpu, memory, storage }: ResourceUsageChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('6h');

  const dataMap = useMemo(
    () => ({
      cpu: filterByTimeRange(cpu, timeRange),
      gpu: filterByTimeRange(gpu, timeRange),
      memory: filterByTimeRange(memory, timeRange),
      storage: filterByTimeRange(storage, timeRange),
    }),
    [cpu, gpu, memory, storage, timeRange],
  );

  return (
    <div className="space-y-4">
      {/* 时间范围选择器 */}
      <div className="flex items-center justify-end">
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList className="h-8 bg-muted border border-black">
            {(Object.entries(TIME_RANGE_LABELS) as [TimeRange, string][]).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="h-7 px-3 text-xs">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 4 个图表并排 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CHART_CONFIGS.map((cfg) => {
          const seriesData = dataMap[cfg.key];
          const timestamps = seriesData.map((d) => formatTimestamp(d.timestamp, timeRange));
          const values = seriesData.map((d) => d.value);

          const option: EChartsOption = {
            tooltip: {
              trigger: 'axis',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderColor: '#000000',
              textStyle: { color: '#000000', fontSize: 12 },
              formatter: (params: { name: string; value: number }[]) => {
                const p = params[0];
                return `<div class="text-xs"><span class="text-muted-foreground">${p.name}</span><br/><span class="font-semibold" style="color:${cfg.color}">${cfg.label}: ${p.value}${cfg.unit}</span></div>`;
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '18%',
              top: '12%',
              containLabel: true,
            },
            xAxis: {
              type: 'category',
              data: timestamps,
              axisLine: { lineStyle: { color: '#000000' } },
              axisTick: { show: false },
              axisLabel: {
                color: '#666666',
                fontSize: 10,
                interval: Math.max(Math.floor(timestamps.length / 6), 0),
              },
            },
            yAxis: {
              type: 'value',
              min: 0,
              max: 100,
              name: cfg.unit,
              nameTextStyle: { color: '#666666', fontSize: 10 },
              axisLine: { show: false },
              axisTick: { show: false },
              splitLine: { lineStyle: { color: '#DDDDDD', type: 'dashed' } },
              axisLabel: { color: '#666666', fontSize: 10 },
            },
            series: [
              {
                type: 'line',
                data: values,
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2, color: cfg.color },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: 'rgba(0,0,0,0.12)' },
                      { offset: 1, color: 'rgba(0,0,0,0)' },
                    ],
                  },
                },
                markLine: {
                  silent: true,
                  symbol: 'none',
                  lineStyle: { color: '#DC2626', type: 'dashed', width: 1 },
                  label: {
                    color: '#DC2626',
                    fontSize: 10,
                    formatter: `阈值 ${cfg.threshold}%`,
                  },
                  data: [{ yAxis: cfg.threshold }],
                },
              },
            ],
          };

          return (
            <Card key={cfg.key} className="border-black bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <span
                    className="inline-block size-2.5 shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                <ReactECharts
                  option={option}
                  theme="ud"
                  className="h-[220px] w-full"
                  notMerge
                  lazyUpdate
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
