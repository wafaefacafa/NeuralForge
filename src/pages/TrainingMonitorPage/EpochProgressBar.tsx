import { memo } from 'react';
import { Clock, Zap, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface EpochProgressBarProps {
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  elapsedTime: number; // 秒
  estimatedRemaining: number; // 秒
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'failed';
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const STATUS_CONFIG: Record<EpochProgressBarProps['status'], { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  running: { label: '运行中', variant: 'default' },
  paused: { label: '已暂停', variant: 'secondary' },
  stopped: { label: '已停止', variant: 'outline' },
  completed: { label: '已完成', variant: 'secondary' },
  failed: { label: '失败', variant: 'destructive' },
};

function EpochProgressBar({
  currentEpoch,
  totalEpochs,
  currentStep,
  totalSteps,
  elapsedTime,
  estimatedRemaining,
  status,
}: EpochProgressBarProps) {
  const epochPercent = totalEpochs > 0 ? Math.round((currentEpoch / totalEpochs) * 100) : 0;
  const stepPercent = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;
  const statusCfg = STATUS_CONFIG[status];

  return (
    <Card className="border-black bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="size-4 text-foreground" />
            训练进度
          </CardTitle>
          <Badge variant={statusCfg.variant} className="text-xs">
            {statusCfg.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Epoch 进度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Epoch 进度</span>
            <span className="font-semibold tabular-nums text-foreground">
              {currentEpoch} / {totalEpochs}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({epochPercent}%)
              </span>
            </span>
          </div>
          <Progress value={epochPercent} className="h-2.5" />
        </div>

        {/* Step 进度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">当前 Epoch Step</span>
            <span className="font-semibold tabular-nums text-foreground">
              {currentStep.toLocaleString()} / {totalSteps.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({stepPercent}%)
              </span>
            </span>
          </div>
          <Progress value={stepPercent} className="h-2" />
        </div>

        {/* 时间统计 */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2 bg-muted px-3 py-2.5">
            <Timer className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-tight">已用时间</p>
              <p className="text-sm font-semibold tabular-nums text-foreground truncate">
                {formatDuration(elapsedTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted px-3 py-2.5">
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-tight">预计剩余</p>
              <p className="text-sm font-semibold tabular-nums text-foreground truncate">
                {status === 'running' ? formatDuration(estimatedRemaining) : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Epoch 刻度指示器 */}
        <div className="flex items-center gap-1 pt-1">
          {Array.from({ length: totalEpochs }, (_, i) => {
            const epochNum = i + 1;
            const isCompleted = epochNum < currentEpoch;
            const isCurrent = epochNum === currentEpoch;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
                title={`Epoch ${epochNum}`}
              >
                <div
                  className={`h-1.5 w-full transition-colors duration-300 ${
                    isCompleted
                      ? 'bg-foreground'
                      : isCurrent
                        ? 'bg-foreground animate-pulse'
                        : 'bg-muted'
                  }`}
                />
                <span
                  className={`text-[10px] tabular-nums leading-none ${
                    isCurrent
                      ? 'font-semibold text-foreground'
                      : isCompleted
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50'
                  }`}
                >
                  {epochNum}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(EpochProgressBar);
