import { useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, AlertTriangle, Info, AlertCircle, Bug } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ITrainingLog } from '@/types/training';

interface TrainingLogStreamProps {
  logs: ITrainingLog[];
  maxVisible?: number;
}

const LEVEL_CONFIG: Record<
  ITrainingLog['level'],
  { icon: React.ComponentType<{ className?: string }>; badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive'; badgeClass: string; lineClass: string }
> = {
  info: {
    icon: Info,
    badgeVariant: 'default',
    badgeClass: 'bg-foreground text-background border-black',
    lineClass: 'border-l-black',
  },
  warn: {
    icon: AlertTriangle,
    badgeVariant: 'secondary',
    badgeClass: 'bg-warning/20 text-warning border-warning/30',
    lineClass: 'border-l-warning/40',
  },
  error: {
    icon: AlertCircle,
    badgeVariant: 'destructive',
    badgeClass: 'bg-destructive/20 text-destructive border-destructive/30',
    lineClass: 'border-l-destructive/50',
  },
  debug: {
    icon: Bug,
    badgeVariant: 'outline',
    badgeClass: 'bg-muted text-muted-foreground border-black',
    lineClass: 'border-l-muted-foreground/30',
  },
};

function TrainingLogStream({ logs, maxVisible = 100 }: TrainingLogStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const visibleLogs = logs.slice(-maxVisible);

  useEffect(() => {
    if (shouldAutoScroll.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLogs.length]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 40;
  };

  return (
    <Card className="border-black bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Terminal className="size-4 text-foreground" />
            训练日志
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-black text-muted-foreground">
              {logs.length} 条
            </Badge>
            <div className="flex items-center gap-1.5">
              {(['info', 'warn', 'error', 'debug'] as const).map((level) => {
                const cfg = LEVEL_CONFIG[level];
                const LevelIcon = cfg.icon;
                const count = logs.filter((l) => l.level === level).length;
                return (
                  <span
                    key={level}
                    className="flex items-center gap-0.5 text-[10px] text-muted-foreground"
                    title={`${level}: ${count}`}
                  >
                    <LevelIcon className="size-3" />
                    {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="relative max-h-[420px] overflow-y-auto overflow-x-hidden font-mono text-xs leading-relaxed"
        >
          {visibleLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Terminal className="size-8 opacity-30" />
              <span className="text-sm">等待日志输出...</span>
              <span className="text-[11px] opacity-60">训练开始后将在此处显示实时日志</span>
            </div>
          ) : (
            <div className="py-2">
              <AnimatePresence initial={false}>
                {visibleLogs.map((log, i) => {
                  const cfg = LEVEL_CONFIG[log.level];
                  const LevelIcon = cfg.icon;
                  const time = new Date(log.timestamp).toLocaleTimeString('zh-CN', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -8, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className={`group flex items-start gap-2 px-3 py-1 border-l-2 ${cfg.lineClass} hover:bg-muted transition-colors`}
                    >
                      <span className="shrink-0 w-8 text-right text-[10px] text-muted-foreground/50 select-none tabular-nums pt-px">
                        {i + 1}
                      </span>

                      <span className="shrink-0 text-[10px] text-muted-foreground/70 tabular-nums pt-px">
                        {time}
                      </span>

                      <Badge
                        variant={cfg.badgeVariant}
                        className={`shrink-0 h-4 px-1 text-[9px] leading-none font-medium border ${cfg.badgeClass}`}
                      >
                        <LevelIcon className="size-2.5 mr-0.5" />
                        {log.level.toUpperCase()}
                      </Badge>

                      {log.epoch != null && (
                        <span className="shrink-0 text-[10px] text-foreground/80 font-medium tabular-nums pt-px">
                          E{log.epoch}
                          {log.step != null && `:S${log.step}`}
                        </span>
                      )}

                      <span className="flex-1 min-w-0 text-foreground/90 break-all whitespace-pre-wrap">
                        {log.message}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-black px-3 py-1.5">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block size-1.5 bg-success animate-pulse" />
              实时接收中
            </span>
            <span>|</span>
            <span>
              显示 {visibleLogs.length}/{logs.length} 条
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                shouldAutoScroll.current = true;
                if (containerRef.current) {
                  containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
              }}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              回到底部
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(TrainingLogStream);
