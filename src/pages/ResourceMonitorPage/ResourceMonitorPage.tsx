import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Download, RefreshCw, Clock, Filter, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import ResourceUsageCharts from './ResourceUsageCharts';
import ResourceQuotaCards from './ResourceQuotaCards';
import CostBreakdownChart from './CostBreakdownChart';
import ResourceAlertTable from './ResourceAlertTable';

import { MOCK_RESOURCE_METRICS, MOCK_RESOURCE_QUOTAS, MOCK_COST_BREAKDOWN } from '@/data/resourceMetrics';
import { MOCK_RESOURCE_ALERTS } from '@/data/resourceAlerts';
import type { IResourceTimeSeries, IResourceAlert } from '@/types/resources';

const TIME_RANGE_OPTIONS = [
  { value: '1h', label: '最近 1 小时' },
  { value: '6h', label: '最近 6 小时' },
  { value: '24h', label: '最近 24 小时' },
  { value: '7d', label: '最近 7 天' },
] as const;

type TimeRange = (typeof TIME_RANGE_OPTIONS)[number]['value'];

function sliceByTimeRange(data: IResourceTimeSeries[], range: TimeRange): IResourceTimeSeries[] {
  const countMap: Record<TimeRange, number> = { '1h': 12, '6h': 24, '24h': 48, '7d': 56 };
  const count = countMap[range];
  if (data.length <= count) return data;
  return data.slice(data.length - count);
}

export default function ResourceMonitorPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [alerts, setAlerts] = useState<IResourceAlert[]>(MOCK_RESOURCE_ALERTS);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const filteredMetrics = useMemo(
    () => ({
      cpu: sliceByTimeRange(MOCK_RESOURCE_METRICS.cpu, timeRange),
      gpu: sliceByTimeRange(MOCK_RESOURCE_METRICS.gpu, timeRange),
      memory: sliceByTimeRange(MOCK_RESOURCE_METRICS.memory, timeRange),
      storage: sliceByTimeRange(MOCK_RESOURCE_METRICS.storage, timeRange),
    }),
    [timeRange],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setLastRefresh(new Date());
      toast.success('数据已刷新');
      logger.info('Resource metrics refreshed');
    } catch (err) {
      logger.error('Refresh failed:', String(err));
      toast.error('刷新失败');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleExport = useCallback(async () => {
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success('报告已导出为 CSV');
      logger.info('Resource report exported');
    } catch (err) {
      logger.error('Export failed:', String(err));
      toast.error('导出失败');
    }
  }, []);

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'acknowledged' as const } : a)),
    );
    toast.success('告警已确认');
  }, []);

  const handleResolveAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' as const } : a)),
    );
    toast.success('告警已解决');
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const activeAlertCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div>
      {/* Header: dual-column editorial */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="p-8 border-r border-black">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="heading-bold text-6xl leading-[0.9] tracking-tighter"
          >
            资源监控
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            实时监控 CPU / GPU / 内存 / 存储使用情况
            {activeAlertCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 border border-black px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest text-destructive">
                {activeAlertCount} 条活跃告警
              </span>
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="h-9 w-[140px] border-black text-xs font-bold">
                <Filter className="mr-1.5 size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-black">
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? '刷新中' : '刷新'}
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
            >
              <Download className="size-4" />
              导出报告
            </button>
          </div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">
              最后刷新：{lastRefresh.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs mt-4">
            监控集群资源使用情况，包括 CPU、GPU、内存和存储。设置告警阈值，及时响应资源瓶颈。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* 资源配额概览卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <ResourceQuotaCards quotas={MOCK_RESOURCE_QUOTAS} />
      </motion.div>

      {/* 实时资源使用率图表（4 个折线图） */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <div className="border-b border-black p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">实时资源使用率</h2>
            <ArrowUpRight className="size-4" />
          </div>
          <ResourceUsageCharts metrics={filteredMetrics} />
        </div>
      </motion.div>

      {/* 费用统计 + 告警列表（双列布局） */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-black">
        {/* 费用统计环形图（左 4/12） */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="lg:col-span-4 border-r border-black p-8"
        >
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">本月费用构成</h2>
            <ArrowUpRight className="size-4" />
          </div>
          <CostBreakdownChart data={MOCK_COST_BREAKDOWN} />
        </motion.div>

        {/* 资源告警列表（右 8/12） */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="lg:col-span-8 p-8"
        >
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">资源告警</h2>
            {activeAlertCount > 0 && (
              <span className="text-sm font-bold text-muted-foreground">
                ({activeAlertCount} 条未处理)
              </span>
            )}
          </div>
          <ResourceAlertTable
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
          />
        </motion.div>
      </div>
    </div>
  );
}
