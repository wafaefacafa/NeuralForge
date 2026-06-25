import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import {
  Server,
  Search,
  RefreshCw,
  Play,
  Square,
  Maximize2,
  RotateCcw,
  Trash2,
  ExternalLink,
  Copy,
  ChevronDown,
  Activity,
  Clock,
  Zap,
  Cpu,
  HardDrive,
  Terminal,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Pause,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { MOCK_DEPLOY_INSTANCES } from '@/data/deployInstances';
import type { IDeployInstance } from '@/types/deploy';

// ============================================================
// 状态映射 — 新闻印刷风格：纯黑/灰度状态灯
// ============================================================
const STATUS_CONFIG: Record<
  IDeployInstance['status'],
  { label: string; icon: React.ComponentType<{ className?: string }>; dotColor: string }
> = {
  running: { label: '运行中', icon: CheckCircle2, dotColor: 'bg-black' },
  stopped: { label: '已停止', icon: Pause, dotColor: 'bg-[#888]' },
  deploying: { label: '部署中', icon: Loader2, dotColor: 'bg-[#444]' },
  failed: { label: '异常', icon: XCircle, dotColor: 'bg-destructive' },
  scaling: { label: '扩缩容中', icon: Activity, dotColor: 'bg-[#444]' },
};

// ============================================================
// 模拟日志
// ============================================================
function generateMockLogs(instanceId: string) {
  const base = new Date();
  const messages = [
    { level: 'info' as const, msg: `[${instanceId}] 健康检查通过 - 状态码 200` },
    { level: 'info' as const, msg: `[${instanceId}] 推理请求处理完成 - 耗时 45ms` },
    { level: 'info' as const, msg: `[${instanceId}] 模型版本 v2.3.1 已加载` },
    { level: 'warn' as const, msg: `[${instanceId}] GPU 显存使用率 78%，接近阈值` },
    { level: 'info' as const, msg: `[${instanceId}] 批量推理请求 (batch_size=32) 完成` },
    { level: 'info' as const, msg: `[${instanceId}] 自动扩缩容检查 - 当前实例数 3，无需调整` },
    { level: 'error' as const, msg: `[${instanceId}] 请求超时 - endpoint /v1/predict, timeout 30s` },
    { level: 'info' as const, msg: `[${instanceId}] 连接池状态 - active=12, idle=8` },
    { level: 'warn' as const, msg: `[${instanceId}] 内存使用率 82%，建议关注` },
    { level: 'info' as const, msg: `[${instanceId}] 日志轮转完成 - 归档 150MB` },
    { level: 'info' as const, msg: `[${instanceId}] 新版本模型预热完成 - 缓存命中率 94%` },
    { level: 'info' as const, msg: `[${instanceId}] gRPC 流式响应通道已建立` },
  ];

  return messages.map((m, i) => {
    const ts = new Date(base.getTime() - (messages.length - i) * 30000);
    return {
      timestamp: ts.toISOString().slice(11, 19),
      level: m.level,
      message: m.msg,
    };
  });
}

// ============================================================
// 迷你折线图 — 纯黑 SVG
// ============================================================
function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="shrink-0" aria-label="请求趋势">
      <polyline
        points={points}
        fill="none"
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================
// Page
// ============================================================
export default function DeployInstancesPage() {
  const [instances, setInstances] = useState<IDeployInstance[]>(MOCK_DEPLOY_INSTANCES);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [envFilter, setEnvFilter] = useState('all');

  const [logInstance, setLogInstance] = useState<IDeployInstance | null>(null);
  const [logs, setLogs] = useState<ReturnType<typeof generateMockLogs>>([]);
  const [logAutoScroll, setLogAutoScroll] = useState(true);

  const [actionTarget, setActionTarget] = useState<{
    instance: IDeployInstance;
    action: 'start' | 'stop' | 'delete' | 'rollback';
  } | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  // ---------- 筛选 ----------
  const filteredInstances = useMemo(() => {
    return instances.filter((inst) => {
      const matchSearch =
        !searchKeyword.trim() ||
        inst.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        inst.modelName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        inst.endpoint.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchStatus = statusFilter === 'all' || inst.status === statusFilter;
      const matchEnv = envFilter === 'all' || inst.environment === envFilter;
      return matchSearch && matchStatus && matchEnv;
    });
  }, [instances, searchKeyword, statusFilter, envFilter]);

  // ---------- 统计 ----------
  const stats = useMemo(() => {
    const total = instances.length;
    const running = instances.filter((i) => i.status === 'running').length;
    const failed = instances.filter((i) => i.status === 'failed').length;
    const stopped = instances.filter((i) => i.status === 'stopped').length;
    return { total, running, failed, stopped };
  }, [instances]);

  // ---------- 刷新 ----------
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setInstances((prev) =>
        prev.map((inst) => ({
          ...inst,
          qps: inst.qps + Math.floor(Math.random() * 20 - 10),
          cpuUsage: Math.min(100, Math.max(5, inst.cpuUsage + Math.floor(Math.random() * 6 - 3))),
          memoryUsage: Math.min(100, Math.max(10, inst.memoryUsage + Math.floor(Math.random() * 6 - 3))),
          requestHistory: [
            ...inst.requestHistory.slice(1),
            inst.qps + Math.floor(Math.random() * 30 - 15),
          ],
        })),
      );
      toast.success('数据已刷新');
    } catch {
      toast.error('刷新失败');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ---------- 操作 ----------
  const handleStart = useCallback((instance: IDeployInstance) => {
    setInstances((prev) =>
      prev.map((i) => (i.id === instance.id ? { ...i, status: 'deploying' as const } : i)),
    );
    toast.success(`实例 ${instance.name} 正在启动...`);
    logger.info('Instance start:', instance.id);
    setTimeout(() => {
      setInstances((prev) =>
        prev.map((i) =>
          i.id === instance.id ? { ...i, status: 'running' as const, uptime: '0 分钟' } : i,
        ),
      );
      toast.success(`实例 ${instance.name} 已启动`);
    }, 2000);
  }, []);

  const handleStop = useCallback((instance: IDeployInstance) => {
    setInstances((prev) =>
      prev.map((i) => (i.id === instance.id ? { ...i, status: 'stopped' as const } : i)),
    );
    toast.success(`实例 ${instance.name} 已停止`);
    logger.info('Instance stopped:', instance.id);
  }, []);

  const handleDelete = useCallback((instance: IDeployInstance) => {
    setInstances((prev) => prev.filter((i) => i.id !== instance.id));
    toast.success(`实例 ${instance.name} 已删除`);
    logger.info('Instance deleted:', instance.id);
  }, []);

  const handleRollback = useCallback((instance: IDeployInstance) => {
    toast.success(`实例 ${instance.name} 正在回滚至上一版本...`);
    logger.info('Instance rollback:', instance.id);
    setTimeout(() => {
      toast.success(`实例 ${instance.name} 回滚完成`);
    }, 1500);
  }, []);

  const confirmAction = useCallback(() => {
    if (!actionTarget) return;
    const { instance, action } = actionTarget;
    switch (action) {
      case 'start': handleStart(instance); break;
      case 'stop': handleStop(instance); break;
      case 'delete': handleDelete(instance); break;
      case 'rollback': handleRollback(instance); break;
    }
    setActionTarget(null);
  }, [actionTarget, handleStart, handleStop, handleDelete, handleRollback]);

  // ---------- 日志 ----------
  const handleOpenLogs = useCallback((instance: IDeployInstance) => {
    setLogInstance(instance);
    setLogs(generateMockLogs(instance.id));
    setLogAutoScroll(true);
  }, []);

  const handleCloseLogs = useCallback(() => {
    setLogInstance(null);
    setLogs([]);
  }, []);

  const handleRefreshLogs = useCallback(() => {
    if (!logInstance) return;
    const newLog = {
      timestamp: new Date().toISOString().slice(11, 19),
      level: (['info', 'info', 'info', 'warn'] as const)[Math.floor(Math.random() * 4)],
      message: `[${logInstance.id}] 健康检查通过 - QPS ${logInstance.qps + Math.floor(Math.random() * 10)}`,
    };
    setLogs((prev) => [...prev, newLog]);
    toast.success('日志已刷新');
  }, [logInstance]);

  // ---------- 复制端点 ----------
  const handleCopyEndpoint = useCallback(async (endpoint: string) => {
    try {
      await navigator.clipboard.writeText(endpoint);
      toast.success('端点已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  }, []);

  // ---------- 环境选项 ----------
  const envOptions = useMemo(() => {
    return [...new Set(instances.map((i) => i.environment))];
  }, [instances]);

  return (
    <div>
      {/* ========== Header: dual-column editorial ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="p-8 border-r border-black">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="heading-bold text-6xl leading-[0.9] tracking-tighter"
          >
            部署实例
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            管理所有部署实例，监控运行状态与日志
            {filteredInstances.length !== instances.length && (
              <span className="ml-2 font-bold">
                （筛选 {filteredInstances.length}/{instances.length}）
              </span>
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
              刷新数据
            </button>
          </div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            实时监控部署实例的运行状态、资源使用率和请求趋势。支持启动/停止、扩容、日志查看和版本回滚。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* ========== KPI 统计行 ========== */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-black">
        {[
          { label: '实例总数', value: stats.total, icon: Server },
          { label: '运行中', value: stats.running, icon: CheckCircle2 },
          { label: '异常', value: stats.failed, icon: AlertTriangle },
          { label: '已停止', value: stats.stopped, icon: Pause },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 border-r border-black last:border-r-0"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="heading-bold text-xl">{card.label}</span>
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <div className="heading-bold text-4xl tabular-nums">{card.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* ========== 搜索 & 筛选栏 ========== */}
      <div className="p-8 border-b border-black">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索实例名称、模型..."
                className="bg-background pl-9 text-sm border-black"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] border-black text-sm">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent className="border-black">
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="running">运行中</SelectItem>
                <SelectItem value="stopped">已停止</SelectItem>
                <SelectItem value="deploying">部署中</SelectItem>
                <SelectItem value="failed">异常</SelectItem>
                <SelectItem value="scaling">扩缩容中</SelectItem>
              </SelectContent>
            </Select>

            <Select value={envFilter} onValueChange={setEnvFilter}>
              <SelectTrigger className="w-[130px] border-black text-sm">
                <SelectValue placeholder="环境" />
              </SelectTrigger>
              <SelectContent className="border-black">
                <SelectItem value="all">全部环境</SelectItem>
                {envOptions.map((env) => (
                  <SelectItem key={env} value={env}>
                    {env === 'production' ? '生产环境' : env === 'staging' ? '预发布' : '测试'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ========== 实例列表表格 ========== */}
      <div className="border-b border-black">
        {filteredInstances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Server className="size-14 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">没有找到匹配的实例</p>
            <p className="text-xs text-muted-foreground mt-1">尝试调整搜索关键词或筛选条件</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-black">
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">实例名称</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">模型版本</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">状态</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">端点</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">规格</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">运行时长</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">QPS</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">资源使用</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">请求趋势</TableHead>
                  <TableHead className="whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstances.map((inst, idx) => {
                  const statusCfg = STATUS_CONFIG[inst.status];
                  const StatusIcon = statusCfg.icon;

                  return (
                    <motion.tr
                      key={inst.id}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.03 }}
                      className="border-b border-black hover:bg-black hover:text-background transition-colors group"
                    >
                      {/* 实例名称 */}
                      <TableCell className="group-hover:text-background">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`size-2 shrink-0 ${statusCfg.dotColor}`} />
                          <div className="min-w-0">
                            <span className="block truncate max-w-[140px] text-sm font-bold">
                              {inst.name}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60">
                              {inst.modelName}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* 模型版本 */}
                      <TableCell className="group-hover:text-background">
                        <span className="text-xs font-bold font-mono">{inst.modelVersionName}</span>
                      </TableCell>

                      {/* 状态 */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon
                            className={`size-3.5 ${inst.status === 'deploying' ? 'animate-spin' : ''} group-hover:text-background`}
                          />
                          <span className="text-xs font-bold group-hover:text-background">
                            {statusCfg.label}
                          </span>
                        </div>
                      </TableCell>

                      {/* 端点 */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <code className="block truncate max-w-[160px] bg-card px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground group-hover:bg-background/20 group-hover:text-background">
                            {inst.endpoint}
                          </code>
                          <button
                            onClick={() => handleCopyEndpoint(inst.endpoint)}
                            className="shrink-0 p-0.5 hover:bg-background/20 transition-colors"
                            aria-label="复制端点"
                          >
                            <Copy className="size-3 group-hover:text-background" />
                          </button>
                          <button
                            onClick={() => window.open(`https://${inst.endpoint}`, '_blank')}
                            className="shrink-0 p-0.5 hover:bg-background/20 transition-colors"
                            aria-label="打开端点"
                          >
                            <ExternalLink className="size-3 group-hover:text-background" />
                          </button>
                        </div>
                      </TableCell>

                      {/* 规格 */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-nowrap group-hover:text-background/70">
                          {inst.spec}
                        </span>
                      </TableCell>

                      {/* 运行时长 */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground group-hover:text-background/70">
                          <Clock className="size-3" />
                          {inst.uptime}
                        </div>
                      </TableCell>

                      {/* QPS */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Zap className="size-3 group-hover:text-background" />
                          <span className="text-sm font-bold tabular-nums group-hover:text-background">
                            {inst.qps}
                          </span>
                        </div>
                      </TableCell>

                      {/* 资源使用 */}
                      <TableCell>
                        <div className="space-y-1.5 min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <Cpu className="size-3 text-muted-foreground shrink-0 group-hover:text-background/60" />
                            <div className="flex-1 h-2 border border-black overflow-hidden bg-black/10 group-hover:border-background/40">
                              <div
                                className="h-full bg-black transition-all duration-1000 group-hover:bg-background"
                                style={{ width: `${inst.cpuUsage}%` }}
                              />
                            </div>
                            <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right group-hover:text-background/70">
                              {inst.cpuUsage}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HardDrive className="size-3 text-muted-foreground shrink-0 group-hover:text-background/60" />
                            <div className="flex-1 h-2 border border-black overflow-hidden bg-black/10 group-hover:border-background/40">
                              <div
                                className="h-full bg-[#444] transition-all duration-1000 group-hover:bg-background/70"
                                style={{ width: `${inst.memoryUsage}%` }}
                              />
                            </div>
                            <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right group-hover:text-background/70">
                              {inst.memoryUsage}%
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* 请求趋势 */}
                      <TableCell>
                        <MiniSparkline data={inst.requestHistory} />
                      </TableCell>

                      {/* 操作 */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-xs font-bold border border-black hover:bg-black hover:text-background transition-colors group-hover:border-background group-hover:text-background"
                            >
                              操作
                              <ChevronDown className="size-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 border-black">
                            {inst.status === 'stopped' || inst.status === 'failed' ? (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setActionTarget({ instance: inst, action: 'start' })}
                              >
                                <Play className="mr-2 size-3.5" />
                                启动
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setActionTarget({ instance: inst, action: 'stop' })}
                              >
                                <Square className="mr-2 size-3.5" />
                                停止
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => toast.info('扩容功能')}
                            >
                              <Maximize2 className="mr-2 size-3.5" />
                              扩容
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleOpenLogs(inst)}
                            >
                              <Terminal className="mr-2 size-3.5" />
                              查看日志
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => setActionTarget({ instance: inst, action: 'rollback' })}
                            >
                              <RotateCcw className="mr-2 size-3.5" />
                              版本回滚
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => setActionTarget({ instance: inst, action: 'delete' })}
                            >
                              <Trash2 className="mr-2 size-3.5" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ========== 操作确认对话框 ========== */}
      <AlertDialog
        open={!!actionTarget}
        onOpenChange={(open) => {
          if (!open) setActionTarget(null);
        }}
      >
        <AlertDialogContent className="border-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="heading-bold text-lg flex items-center gap-2">
              {actionTarget?.action === 'start' && <Play className="size-5" />}
              {actionTarget?.action === 'stop' && <Square className="size-5" />}
              {actionTarget?.action === 'delete' && <Trash2 className="size-5 text-destructive" />}
              {actionTarget?.action === 'rollback' && <RotateCcw className="size-5" />}
              {actionTarget?.action === 'start' && '启动实例'}
              {actionTarget?.action === 'stop' && '停止实例'}
              {actionTarget?.action === 'delete' && '删除实例'}
              {actionTarget?.action === 'rollback' && '版本回滚'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {actionTarget?.action === 'start' &&
                `确定要启动实例「${actionTarget?.instance.name}」吗？启动后实例将开始接收推理请求。`}
              {actionTarget?.action === 'stop' &&
                `确定要停止实例「${actionTarget?.instance.name}」吗？停止后该实例将不再处理请求，可能影响在线服务。`}
              {actionTarget?.action === 'delete' &&
                `确定要删除实例「${actionTarget?.instance.name}」吗？此操作不可撤销，所有相关配置和日志将被永久删除。`}
              {actionTarget?.action === 'rollback' &&
                `确定要将实例「${actionTarget?.instance.name}」回滚至上一版本吗？回滚期间服务可能短暂中断。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionTarget?.action === 'delete'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive'
                  : 'bg-black text-background hover:bg-black/80 border border-black'
              }
            >
              {actionTarget?.action === 'start' && '确认启动'}
              {actionTarget?.action === 'stop' && '确认停止'}
              {actionTarget?.action === 'delete' && '确认删除'}
              {actionTarget?.action === 'rollback' && '确认回滚'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== 日志抽屉 ========== */}
      <Sheet open={!!logInstance} onOpenChange={(open) => { if (!open) handleCloseLogs(); }}>
        <SheetContent side="right" className="w-full sm:max-w-[560px] flex flex-col p-0 border-l border-black">
          {/* 日志头部 */}
          <SheetHeader className="px-5 py-4 border-b border-black shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center bg-black">
                  <Terminal className="size-4.5 text-background" />
                </div>
                <div className="min-w-0">
                  <SheetTitle className="heading-bold text-base truncate">
                    {logInstance?.name}
                  </SheetTitle>
                  <SheetDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground truncate">
                    {logInstance?.modelName} · {logInstance?.modelVersionName}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-black hover:text-background transition-colors"
                  onClick={handleRefreshLogs}
                  aria-label="刷新日志"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-black hover:text-background transition-colors"
                  onClick={handleCloseLogs}
                  aria-label="关闭"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {logInstance && (
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Activity className="size-3" />
                  <span>QPS: <span className="font-bold tabular-nums">{logInstance.qps}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="size-3" />
                  <span>CPU: <span className="font-bold tabular-nums">{logInstance.cpuUsage}%</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive className="size-3" />
                  <span>内存: <span className="font-bold tabular-nums">{logInstance.memoryUsage}%</span></span>
                </div>
              </div>
            )}
          </SheetHeader>

          {/* 日志内容 — 终端风格 */}
          <div className="flex-1 overflow-y-auto bg-black font-mono text-xs">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#888]">
                <Terminal className="size-10 mb-3 opacity-30" />
                <p>暂无日志</p>
              </div>
            ) : (
              <div className="py-3">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 px-4 py-1 hover:bg-white/[0.03] transition-colors ${
                      log.level === 'error'
                        ? 'text-[#DC2626]'
                        : log.level === 'warn'
                          ? 'text-[#D97706]'
                          : 'text-[#888]'
                    }`}
                  >
                    <span className="shrink-0 text-[10px] text-[#555] w-14 tabular-nums">
                      {log.timestamp}
                    </span>
                    <span
                      className={`shrink-0 w-8 text-[10px] uppercase font-bold ${
                        log.level === 'error'
                          ? 'text-[#DC2626]'
                          : log.level === 'warn'
                            ? 'text-[#D97706]'
                            : 'text-[#888]'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 日志底部操作栏 */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-black bg-card shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                {logs.length} 条
              </span>
              <label className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={logAutoScroll}
                  onChange={(e) => setLogAutoScroll(e.target.checked)}
                  className="size-3 border-black accent-black"
                />
                自动滚动
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs font-bold hover:bg-black hover:text-background transition-colors"
              onClick={handleRefreshLogs}
            >
              <RefreshCw className="mr-1 size-3" />
              刷新
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
