import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CHART_COLORS } from '@/lib/chart-colors';
import type { IModelVersion } from '@/types/models';

interface VersionCompareDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versionA: IModelVersion;
  versionB: IModelVersion;
}

const METRIC_LABELS: Record<string, string> = {
  accuracy: 'Accuracy',
  f1Score: 'F1 Score',
  precision: 'Precision',
  recall: 'Recall',
  sizeMB: '模型大小 (MB)',
};

const METRIC_FORMAT: Record<string, (v: number) => string> = {
  accuracy: (v) => `${(v * 100).toFixed(1)}%`,
  f1Score: (v) => v.toFixed(4),
  precision: (v) => v.toFixed(4),
  recall: (v) => v.toFixed(4),
  sizeMB: (v) => `${v} MB`,
};

const METRIC_HIGHER_BETTER: Record<string, boolean> = {
  accuracy: true,
  f1Score: true,
  precision: true,
  recall: true,
  sizeMB: false,
};

const STATUS_LABEL: Record<string, string> = {
  ready: '就绪',
  training: '训练中',
  failed: '失败',
  deployed: '已部署',
};

function DiffBadge({ valueA, valueB, metric }: { valueA: number; valueB: number; metric: string }) {
  const higherBetter = METRIC_HIGHER_BETTER[metric] ?? true;
  const diff = valueA - valueB;

  if (Math.abs(diff) < 0.0001) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
        <Minus className="size-3" />
        持平
      </span>
    );
  }

  const isUp = diff > 0;
  const isGood = higherBetter ? isUp : !isUp;
  const colorClass = isGood ? 'text-success' : 'text-destructive';

  const pctMetric = ['accuracy', 'f1Score', 'precision', 'recall'].includes(metric);
  const diffStr = pctMetric
    ? `${(diff * 100).toFixed(2)}pp`
    : `${diff > 0 ? '+' : ''}${diff.toFixed(1)} MB`;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${colorClass}`}>
      {isUp ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {diffStr}
    </span>
  );
}

export default function VersionCompareDrawer({
  open,
  onOpenChange,
  versionA,
  versionB,
}: VersionCompareDrawerProps) {
  const metrics = useMemo(() => ['accuracy', 'f1Score', 'precision', 'recall', 'sizeMB'] as const, []);

  const chartOption: EChartsOption = useMemo(
    () => ({
      color: [CHART_COLORS[0], CHART_COLORS[2]],
      backgroundColor: 'transparent',
      textStyle: { color: '#000000' },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#000000',
        borderWidth: 0,
        textStyle: { color: '#ffffff', fontSize: 12 },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#64748b', fontSize: 12 },
        icon: 'rect',
        itemWidth: 10,
        itemHeight: 10,
        data: [versionA.version, versionB.version],
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
        data: ['Accuracy', 'F1 Score', 'Precision', 'Recall'],
        axisLine: { lineStyle: { color: '#000000' } },
        axisTick: { show: false },
        axisLabel: { color: '#000000', fontSize: 10, fontWeight: 'bold' },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 0.8,
        max: 1,
        axisLine: { lineStyle: { color: '#000000' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#000000',
          fontSize: 10,
          fontWeight: 'bold',
          formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
        },
        splitLine: { lineStyle: { color: '#cccccc', type: 'dashed' } },
      },
      series: [
        {
          name: versionA.version,
          type: 'bar',
          barMaxWidth: 32,
          barGap: '20%',
          data: [versionA.accuracy, versionA.f1Score, versionA.precision, versionA.recall],
          itemStyle: { color: '#000000' },
          emphasis: { itemStyle: { color: '#444444' } },
          label: {
            show: true,
            position: 'top',
            color: '#000000',
            fontSize: 10,
            fontWeight: 'bold',
            formatter: (p: { value: number }) => `${(p.value * 100).toFixed(1)}%`,
          },
        },
        {
          name: versionB.version,
          type: 'bar',
          barMaxWidth: 32,
          data: [versionB.accuracy, versionB.f1Score, versionB.precision, versionB.recall],
          itemStyle: { color: '#888888' },
          emphasis: { itemStyle: { color: '#AAAAAA' } },
          label: {
            show: true,
            position: 'top',
            color: '#888888',
            fontSize: 10,
            fontWeight: 'bold',
            formatter: (p: { value: number }) => `${(p.value * 100).toFixed(1)}%`,
          },
        },
      ],
      animationDuration: 800,
      animationEasing: 'cubicOut' as const,
    }),
    [versionA, versionB],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto border-l border-black bg-background">
        <SheetHeader className="mb-6 border-b border-black pb-4">
          <SheetTitle className="heading-bold text-2xl">版本对比</SheetTitle>
          <SheetDescription className="text-xs font-medium text-muted-foreground mt-1">
            对比 {versionA.modelName} 的两个版本
          </SheetDescription>
        </SheetHeader>

        {/* 版本概览 */}
        <div className="grid grid-cols-2 gap-0 mb-6 border border-black">
          <div className="p-4 border-r border-black">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold border border-black px-2 py-0.5">
                {versionA.version}
              </span>
              <Badge variant="outline" className="border-black text-[10px] uppercase font-bold tracking-widest">
                {STATUS_LABEL[versionA.status]}
              </Badge>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground space-y-0.5">
              <div>框架: {versionA.framework}</div>
              <div>创建: {new Date(versionA.createdAt).toLocaleDateString('zh-CN')}</div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold border border-black px-2 py-0.5">
                {versionB.version}
              </span>
              <Badge variant="outline" className="border-black text-[10px] uppercase font-bold tracking-widest">
                {STATUS_LABEL[versionB.status]}
              </Badge>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground space-y-0.5">
              <div>框架: {versionB.framework}</div>
              <div>创建: {new Date(versionB.createdAt).toLocaleDateString('zh-CN')}</div>
            </div>
          </div>
        </div>

        {/* 柱状图对比 */}
        <div className="border-b border-black pb-6 mb-6">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-4">
            <h3 className="heading-bold text-lg">核心指标对比</h3>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M11 5L5 11M5 5H11V11" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
            </svg>
          </div>
          <ReactECharts option={chartOption} className="h-[280px] w-full" />
        </div>

        {/* 指标对比表 */}
        <div className="border border-black mb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-black hover:bg-transparent">
                <TableHead className="w-[120px] whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">指标</TableHead>
                <TableHead className="whitespace-nowrap text-right text-[10px] uppercase font-bold tracking-widest">{versionA.version}</TableHead>
                <TableHead className="whitespace-nowrap text-right text-[10px] uppercase font-bold tracking-widest">{versionB.version}</TableHead>
                <TableHead className="whitespace-nowrap text-right text-[10px] uppercase font-bold tracking-widest">差异</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => {
                const valA = versionA[metric];
                const valB = versionB[metric];
                return (
                  <TableRow key={metric} className="border-black hover:bg-black hover:text-background transition-colors">
                    <TableCell className="font-bold text-sm whitespace-nowrap">
                      {METRIC_LABELS[metric]}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium">
                      {METRIC_FORMAT[metric](valA)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium">
                      {METRIC_FORMAT[metric](valB)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DiffBadge valueA={valA} valueB={valB} metric={metric} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* 超参数对比 */}
        <div className="border border-black mb-6">
          <div className="px-4 py-3 border-b border-black">
            <h3 className="heading-bold text-sm">超参数对比</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-black hover:bg-transparent">
                <TableHead className="w-[140px] whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">参数</TableHead>
                <TableHead className="whitespace-nowrap text-right text-[10px] uppercase font-bold tracking-widest">{versionA.version}</TableHead>
                <TableHead className="whitespace-nowrap text-right text-[10px] uppercase font-bold tracking-widest">{versionB.version}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-black hover:bg-black hover:text-background transition-colors">
                <TableCell className="font-bold text-sm">学习率</TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {versionA.hyperparams.learningRate}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {versionB.hyperparams.learningRate}
                </TableCell>
              </TableRow>
              <TableRow className="border-black hover:bg-black hover:text-background transition-colors">
                <TableCell className="font-bold text-sm">Batch Size</TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {versionA.hyperparams.batchSize}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {versionB.hyperparams.batchSize}
                </TableCell>
              </TableRow>
              <TableRow className="border-black hover:bg-black hover:text-background transition-colors">
                <TableCell className="font-bold text-sm">Epochs</TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {versionA.hyperparams.epochs}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {versionB.hyperparams.epochs}
                </TableCell>
              </TableRow>
              <TableRow className="border-black hover:bg-black hover:text-background transition-colors">
                <TableCell className="font-bold text-sm">优化器</TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {versionA.hyperparams.optimizer.toUpperCase()}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {versionB.hyperparams.optimizer.toUpperCase()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* 训练环境对比 */}
        <div className="border border-black">
          <div className="px-4 py-3 border-b border-black">
            <h3 className="heading-bold text-sm">训练环境对比</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-black hover:bg-transparent">
                <TableHead className="w-[140px] whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">配置</TableHead>
                <TableHead className="whitespace-nowrap text-right text-[10px] uppercase font-bold tracking-widest">{versionA.version}</TableHead>
                <TableHead className="whitespace-nowrap text-right text-[10px] uppercase font-bold tracking-widest">{versionB.version}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-black hover:bg-black hover:text-background transition-colors">
                <TableCell className="font-bold text-sm">GPU 型号</TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {versionA.trainingEnv.gpuType}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {versionB.trainingEnv.gpuType}
                </TableCell>
              </TableRow>
              <TableRow className="border-black hover:bg-black hover:text-background transition-colors">
                <TableCell className="font-bold text-sm">GPU 数量</TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {versionA.trainingEnv.gpuCount} 卡
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {versionB.trainingEnv.gpuCount} 卡
                </TableCell>
              </TableRow>
              <TableRow className="border-black hover:bg-black hover:text-background transition-colors">
                <TableCell className="font-bold text-sm">内存</TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {versionA.trainingEnv.memoryGB} GB
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {versionB.trainingEnv.memoryGB} GB
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  );
}
