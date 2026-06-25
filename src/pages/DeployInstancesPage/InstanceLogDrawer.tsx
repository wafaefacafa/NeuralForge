import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { X, Copy, Download, Play, Pause, RotateCcw, Terminal, Search, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// EXPORTS: MOCK_INSTANCE_LOGS
export const MOCK_INSTANCE_LOGS = [
  { id: '1', timestamp: '2026-06-25T14:32:01.123Z', level: 'info', message: '[HealthCheck] 健康检查通过，服务状态正常' },
  { id: '2', timestamp: '2026-06-25T14:32:00.891Z', level: 'info', message: '[Router] GET /v1/predict 200 45ms' },
  { id: '3', timestamp: '2026-06-25T14:31:59.456Z', level: 'info', message: '[Router] POST /v1/predict 200 128ms' },
  { id: '4', timestamp: '2026-06-25T14:31:58.234Z', level: 'debug', message: '[Model] 输入张量形状: [1, 3, 224, 224]' },
  { id: '5', timestamp: '2026-06-25T14:31:58.100Z', level: 'info', message: '[Router] GET /v1/predict 200 52ms' },
  { id: '6', timestamp: '2026-06-25T14:31:57.789Z', level: 'warn', message: '[GPU] 显存使用率 82%，接近阈值 85%' },
  { id: '7', timestamp: '2026-06-25T14:31:56.345Z', level: 'info', message: '[AutoScale] 当前实例数 3，QPS 1200，无需扩缩容' },
  { id: '8', timestamp: '2026-06-25T14:31:55.912Z', level: 'info', message: '[Router] POST /v1/predict 200 96ms' },
  { id: '9', timestamp: '2026-06-25T14:31:54.567Z', level: 'info', message: '[Model] 模型推理完成，输出形状: [1, 1000]' },
  { id: '10', timestamp: '2026-06-25T14:31:54.200Z', level: 'debug', message: '[Preprocess] 图像预处理耗时 12ms' },
  { id: '11', timestamp: '2026-06-25T14:31:53.890Z', level: 'info', message: '[Router] GET /v1/health 200 2ms' },
  { id: '12', timestamp: '2026-06-25T14:31:52.456Z', level: 'error', message: '[Router] POST /v1/predict 500 3001ms - CUDA out of memory (retrying...)' },
  { id: '13', timestamp: '2026-06-25T14:31:52.100Z', level: 'warn', message: '[GPU] 显存分配失败，尝试释放缓存' },
  { id: '14', timestamp: '2026-06-25T14:31:51.789Z', level: 'info', message: '[Router] GET /v1/predict 200 38ms' },
  { id: '15', timestamp: '2026-06-25T14:31:50.345Z', level: 'info', message: '[Model] 模型 v2.3.1 已加载，预热完成' },
  { id: '16', timestamp: '2026-06-25T14:31:49.912Z', level: 'info', message: '[Startup] 实例启动完成，监听端口 8080' },
  { id: '17', timestamp: '2026-06-25T14:31:48.567Z', level: 'info', message: '[Startup] 加载模型权重文件: model_v2.3.1.pt (256MB)' },
  { id: '18', timestamp: '2026-06-25T14:31:47.234Z', level: 'info', message: '[Startup] 初始化 CUDA 环境，检测到 GPU: NVIDIA A100-SXM4-80GB x2' },
  { id: '19', timestamp: '2026-06-25T14:31:46.890Z', level: 'info', message: '[Startup] 容器启动，镜像: neuralforge/serving:v2.3.1-cuda12.1' },
  { id: '20', timestamp: '2026-06-25T14:31:45.123Z', level: 'info', message: '[Orchestrator] 调度实例到节点 gpu-node-07' },
];

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

interface InstanceLogDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceName?: string;
  instanceId?: string;
}

const LEVEL_CONFIG: Record<LogEntry['level'], { label: string; className: string; badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  info: { label: 'INFO', className: 'text-foreground', badgeVariant: 'default' },
  warn: { label: 'WARN', className: 'text-warning', badgeVariant: 'outline' },
  error: { label: 'ERROR', className: 'text-destructive', badgeVariant: 'destructive' },
  debug: { label: 'DEBUG', className: 'text-muted-foreground', badgeVariant: 'secondary' },
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

export default function InstanceLogDrawer({ open, onOpenChange, instanceName, instanceId }: InstanceLogDrawerProps) {
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_INSTANCE_LOGS);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(MOCK_INSTANCE_LOGS);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logCounterRef = useRef(20);

  useEffect(() => {
    if (!open || !isStreaming) {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      return;
    }

    const sampleMessages = [
      '[Router] GET /v1/predict 200 42ms',
      '[Router] POST /v1/predict 200 115ms',
      '[HealthCheck] 健康检查通过，服务状态正常',
      '[Model] 模型推理完成，输出形状: [1, 1000]',
      '[GPU] 显存使用率 78%，正常',
      '[AutoScale] 当前实例数 3，QPS 1150，无需扩缩容',
      '[Preprocess] 图像预处理耗时 8ms',
      '[Router] GET /v1/health 200 1ms',
      '[Model] 输入张量形状: [1, 3, 224, 224]',
      '[Cache] 特征缓存命中率 94.2%',
    ];

    const sampleLevels: LogEntry['level'][] = ['info', 'info', 'info', 'info', 'info', 'info', 'info', 'debug', 'warn', 'info'];

    streamTimerRef.current = setInterval(() => {
      logCounterRef.current += 1;
      const now = new Date();
      const idx = Math.floor(Math.random() * sampleMessages.length);
      const newLog: LogEntry = {
        id: String(logCounterRef.current),
        timestamp: now.toISOString(),
        level: sampleLevels[idx],
        message: sampleMessages[idx],
      };

      setLogs((prev) => {
        const updated = [newLog, ...prev].slice(0, 500);
        return updated;
      });
    }, 3000);

    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
    };
  }, [open, isStreaming]);

  useEffect(() => {
    let result = logs;

    if (levelFilter !== 'all') {
      result = result.filter((l) => l.level === levelFilter);
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter((l) => l.message.toLowerCase().includes(kw));
    }

    setFilteredLogs(result);
  }, [logs, levelFilter, searchKeyword]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [filteredLogs, autoScroll]);

  const handleToggleStream = useCallback(() => {
    setIsStreaming((prev) => {
      const next = !prev;
      if (next) {
        toast.info('日志流已恢复');
      } else {
        toast.info('日志流已暂停');
      }
      return next;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setLogs(MOCK_INSTANCE_LOGS);
    logCounterRef.current = 20;
    setLevelFilter('all');
    setSearchKeyword('');
    setIsStreaming(true);
    setAutoScroll(true);
    toast.success('日志已刷新');
  }, []);

  const handleCopyLogs = useCallback(async () => {
    try {
      const text = filteredLogs
        .map((l) => `[${formatTimestamp(l.timestamp)}] [${l.level.toUpperCase()}] ${l.message}`)
        .join('\n');
      await navigator.clipboard.writeText(text);
      toast.success(`已复制 ${filteredLogs.length} 条日志`);
    } catch (err) {
      logger.error('Copy logs failed:', String(err));
      toast.error('复制失败');
    }
  }, [filteredLogs]);

  const handleDownload = useCallback(() => {
    try {
      const text = filteredLogs
        .map((l) => `[${formatTimestamp(l.timestamp)}] [${l.level.toUpperCase()}] ${l.message}`)
        .join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuralforge-logs-${instanceId || 'instance'}-${new Date().toISOString().slice(0, 10)}.log`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('日志文件已下载');
    } catch (err) {
      logger.error('Download logs failed:', String(err));
      toast.error('下载失败');
    }
  }, [filteredLogs, instanceId]);

  const handleScrollChange = useCallback((isAtBottom: boolean) => {
    setAutoScroll(isAtBottom);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-2xl flex-col gap-0 p-0 sm:max-w-2xl"
      >
        {/* 头部 */}
        <SheetHeader className="shrink-0 space-y-3 border-b border-black px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center bg-card border border-black">
                <Terminal className="size-4 text-foreground" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-base font-semibold truncate">
                  {instanceName || '实例'} 日志
                </SheetTitle>
                <SheetDescription className="text-xs truncate">
                  {instanceId ? `实例 ID: ${instanceId}` : '实时日志流'}
                </SheetDescription>
              </div>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>

          {/* 工具栏 */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 搜索 */}
            <div className="relative flex-1 min-w-[140px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索日志..."
                className="h-8 bg-muted pl-8 pr-2 text-xs"
              />
            </div>

            {/* 级别筛选 */}
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="h-8 w-[90px] text-xs">
                <SelectValue placeholder="级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="info">INFO</SelectItem>
                <SelectItem value="warn">WARN</SelectItem>
                <SelectItem value="error">ERROR</SelectItem>
                <SelectItem value="debug">DEBUG</SelectItem>
              </SelectContent>
            </Select>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleToggleStream}
                aria-label={isStreaming ? '暂停' : '恢复'}
              >
                {isStreaming ? (
                  <Pause className="size-3.5 text-warning" />
                ) : (
                  <Play className="size-3.5 text-success" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleRefresh}
                aria-label="刷新"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleCopyLogs}
                aria-label="复制"
              >
                <Copy className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleDownload}
                aria-label="下载"
              >
                <Download className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* 状态指示 */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'size-1.5 rounded-none',
                  isStreaming ? 'bg-success animate-pulse' : 'bg-muted-foreground',
                )}
              />
              <span>{isStreaming ? '实时流' : '已暂停'}</span>
            </div>
            <Separator orientation="vertical" className="h-3" />
            <span>共 {filteredLogs.length} 条日志</span>
            <Separator orientation="vertical" className="h-3" />
            <button
              type="button"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              onClick={() => handleScrollChange(!autoScroll)}
            >
              <span>{autoScroll ? '自动滚动' : '手动滚动'}</span>
              <ChevronDown className="size-3" />
            </button>
          </div>
        </SheetHeader>

        {/* 日志内容区 */}
        <div className="flex-1 min-h-0 bg-card" ref={scrollRef}>
          <ScrollArea className="h-full">
            <div className="p-3 font-mono text-xs leading-relaxed">
              {filteredLogs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-muted-foreground"
                >
                  <Search className="size-8 mb-3 opacity-40" />
                  <p className="text-sm">没有匹配的日志</p>
                  <p className="text-xs mt-1 opacity-60">尝试调整筛选条件或搜索关键词</p>
                </motion.div>
              ) : (
                filteredLogs.map((log, i) => {
                  const config = LEVEL_CONFIG[log.level];
                  return (
                    <motion.div
                      key={log.id}
                      initial={i < 5 ? { opacity: 0, x: -8 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.1) }}
                      className={cn(
                        'flex items-start gap-2 py-0.5 hover:bg-muted px-1 transition-colors',
                        log.level === 'error' && 'bg-destructive/10',
                        log.level === 'warn' && 'bg-warning/10',
                      )}
                    >
                      {/* 时间戳 */}
                      <span className="shrink-0 text-[11px] text-muted-foreground select-none w-[90px] tabular-nums">
                        {formatTimestamp(log.timestamp)}
                      </span>

                      {/* 级别标签 */}
                      <Badge
                        variant={config.badgeVariant}
                        className="shrink-0 h-4 px-1 py-0 text-[10px] font-mono leading-none"
                      >
                        {config.label}
                      </Badge>

                      {/* 日志消息 */}
                      <span
                        className={cn(
                          'flex-1 min-w-0 break-all',
                          config.className,
                        )}
                      >
                        {log.message}
                      </span>
                    </motion.div>
                  );
                })
              )}

              {/* 流式加载指示器 */}
              {isStreaming && filteredLogs.length > 0 && (
                <div className="flex items-center gap-2 py-1 px-1 text-muted-foreground">
                  <span className="inline-block size-1.5 bg-foreground animate-pulse" />
                  <span className="text-[11px]">等待新日志...</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
