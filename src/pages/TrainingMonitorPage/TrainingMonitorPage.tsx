import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  Zap,
  Cpu,
  Activity,
  BarChart3,
  Terminal,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

import TrainingCurveChart from './TrainingCurveChart';
import GpuUtilizationGauge from './GpuUtilizationGauge';
import TrainingLogStream from './TrainingLogStream';
import EpochProgressBar from './EpochProgressBar';

import { MOCK_TRAINING_METRICS } from '@/data/trainingMetrics';
import { MOCK_TRAINING_LOGS } from '@/data/trainingLogs';
import type { ITrainingMetrics, ITrainingEpochMetrics, ITrainingLog } from '@/types/training';

function generateRealtimeMetrics(prev: ITrainingEpochMetrics): ITrainingEpochMetrics {
  const stepIncrement = Math.floor(Math.random() * 15) + 5;
  const newStep = Math.min(prev.step + stepIncrement, prev.totalSteps);

  const trainLossDelta = (Math.random() - 0.55) * 0.04;
  const valLossDelta = (Math.random() - 0.52) * 0.05;
  const newTrainLoss = Math.max(0.01, +(prev.trainLoss + trainLossDelta).toFixed(4));
  const newValLoss = Math.max(0.01, +(prev.valLoss + valLossDelta).toFixed(4));

  const trainAccDelta = (Math.random() - 0.45) * 0.008;
  const valAccDelta = (Math.random() - 0.48) * 0.01;
  const newTrainAcc = Math.min(0.999, +(prev.trainAccuracy + trainAccDelta).toFixed(4));
  const newValAcc = Math.min(0.999, +(prev.valAccuracy + valAccDelta).toFixed(4));

  const gpuDelta = (Math.random() - 0.5) * 6;
  const newGpuUtil = Math.min(100, Math.max(40, +(prev.gpuUtilization + gpuDelta).toFixed(1)));

  const lrDelta = (Math.random() - 0.5) * 0.00002;
  const newLr = Math.max(0.00001, +(prev.learningRate + lrDelta).toFixed(6));

  return {
    ...prev,
    step: newStep,
    trainLoss: newTrainLoss,
    valLoss: newValLoss,
    trainAccuracy: newTrainAcc,
    valAccuracy: newValAcc,
    gpuUtilization: newGpuUtil,
    learningRate: newLr,
    elapsedTime: prev.elapsedTime + 3,
    estimatedRemaining: Math.max(0, prev.estimatedRemaining - 3),
  };
}

function generateRealtimeLog(epoch: number, step: number, trainLoss: number, valLoss: number): ITrainingLog {
  const messages = [
    `Epoch ${epoch} Step ${step}: loss=${trainLoss.toFixed(4)}, val_loss=${valLoss.toFixed(4)}`,
    `Learning rate adjusted to ${(0.001 * Math.pow(0.97, epoch)).toFixed(6)}`,
    `Checkpoint saved: model_epoch_${epoch}_step_${step}.pt`,
    `Gradient norm: ${(Math.random() * 2 + 0.5).toFixed(3)}`,
    `Data loader prefetching batch ${step + 1}...`,
    `Validation metrics computed in ${(Math.random() * 3 + 1).toFixed(1)}s`,
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  return {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    level: Math.random() > 0.95 ? 'warn' : 'info',
    message: msg,
    epoch,
    step,
  };
}

export default function TrainingMonitorPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<ITrainingMetrics>(() => {
    const found = MOCK_TRAINING_METRICS.find((m) => m.jobId === jobId) ?? MOCK_TRAINING_METRICS[0];
    return { ...found, status: 'running' };
  });

  const [logs, setLogs] = useState<ITrainingLog[]>(() => {
    return MOCK_TRAINING_LOGS.filter((l) => l.id.startsWith('log_')).slice(0, 15);
  });

  const [status, setStatus] = useState<'running' | 'paused' | 'stopped'>('running');
  const [stopDialogOpen, setStopDialogOpen] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== 'running') return;

    intervalRef.current = setInterval(() => {
      setMetrics((prev) => {
        const currentMetrics = prev.epochMetrics[prev.epochMetrics.length - 1];
        if (!currentMetrics) return prev;

        const updated = generateRealtimeMetrics(currentMetrics);

        if (updated.step >= updated.totalSteps) {
          const nextEpoch = prev.currentEpoch + 1;
          if (nextEpoch > prev.totalEpochs) {
            toast.success('🎉 训练任务已完成！');
            logger.info('Training completed:', prev.jobId);
            return { ...prev, currentEpoch: prev.totalEpochs, status: 'completed' as const };
          }

          const newEpochMetrics: ITrainingEpochMetrics = {
            epoch: nextEpoch,
            trainLoss: +(updated.trainLoss * 0.95).toFixed(4),
            valLoss: +(updated.valLoss * 0.96).toFixed(4),
            trainAccuracy: Math.min(0.999, +(updated.trainAccuracy * 1.01).toFixed(4)),
            valAccuracy: Math.min(0.999, +(updated.valAccuracy * 1.008).toFixed(4)),
            learningRate: updated.learningRate,
            gpuUtilization: updated.gpuUtilization,
            gpuMemoryUsed: updated.gpuMemoryUsed,
            gpuMemoryTotal: updated.gpuMemoryTotal,
            step: 0,
            totalSteps: updated.totalSteps,
            elapsedTime: updated.elapsedTime,
            estimatedRemaining: updated.estimatedRemaining,
          };

          return {
            ...prev,
            currentEpoch: nextEpoch,
            epochMetrics: [...prev.epochMetrics, newEpochMetrics],
            bestValLoss: Math.min(prev.bestValLoss, newEpochMetrics.valLoss),
            bestValAccuracy: Math.max(prev.bestValAccuracy, newEpochMetrics.valAccuracy),
            updatedAt: new Date().toISOString(),
          };
        }

        const updatedMetrics = [...prev.epochMetrics];
        updatedMetrics[updatedMetrics.length - 1] = updated;

        return {
          ...prev,
          epochMetrics: updatedMetrics,
          bestValLoss: Math.min(prev.bestValLoss, updated.valLoss),
          bestValAccuracy: Math.max(prev.bestValAccuracy, updated.valAccuracy),
          updatedAt: new Date().toISOString(),
        };
      });
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  useEffect(() => {
    if (status !== 'running') return;

    logIntervalRef.current = setInterval(() => {
      setLogs((prev) => {
        const currentMetrics = metrics.epochMetrics[metrics.epochMetrics.length - 1];
        if (!currentMetrics) return prev;

        const newLog = generateRealtimeLog(
          metrics.currentEpoch,
          currentMetrics.step,
          currentMetrics.trainLoss,
          currentMetrics.valLoss,
        );
        return [...prev.slice(-200), newLog];
      });
    }, 5000);

    return () => {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, [status, metrics.currentEpoch, metrics.epochMetrics]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handlePause = useCallback(() => {
    setStatus('paused');
    toast.info('训练已暂停');
    logger.info('Training paused:', jobId);
  }, [jobId]);

  const handleResume = useCallback(() => {
    setStatus('running');
    toast.success('训练已恢复');
    logger.info('Training resumed:', jobId);
  }, [jobId]);

  const handleStop = useCallback(() => {
    setStopDialogOpen(true);
  }, []);

  const confirmStop = useCallback(() => {
    setStatus('stopped');
    setStopDialogOpen(false);
    toast.warning('训练已停止');
    logger.info('Training stopped:', jobId);
  }, [jobId]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const currentEpochMetrics = metrics.epochMetrics[metrics.epochMetrics.length - 1];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const statusBadge = {
    running: { label: '运行中', className: 'bg-black text-background border-black' },
    paused: { label: '已暂停', className: 'bg-warning text-warning-foreground border-warning' },
    stopped: { label: '已停止', className: 'bg-muted text-muted-foreground border-black' },
    completed: { label: '已完成', className: 'bg-success text-success-foreground border-success' },
    failed: { label: '失败', className: 'bg-destructive text-destructive-foreground border-destructive' },
  }[metrics.status] ?? statusBadge.running;

  return (
    <div>
      {/* Header: dual-column editorial */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="p-8 border-r border-black">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBack}
              className="flex size-9 items-center justify-center border border-black hover:bg-black hover:text-background transition-colors shrink-0"
              aria-label="返回"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="min-w-0">
              <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="heading-bold text-4xl leading-[0.9] tracking-tighter truncate"
              >
                {metrics.config.projectName}
              </motion.h1>
              <p className="mt-1 text-xs font-medium text-muted-foreground truncate">
                任务 ID: {metrics.jobId} · {metrics.config.networkTemplate.name} · {metrics.config.hyperParams.optimizer.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge className={`text-xs font-bold ${statusBadge.className}`}>
              {statusBadge.label}
            </Badge>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              Epoch {metrics.currentEpoch}/{metrics.totalEpochs}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {status === 'running' && (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
              >
                <Pause className="size-4" />
                暂停
              </button>
            )}
            {status === 'paused' && (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-6 py-2 bg-black text-background text-sm font-bold hover:bg-black/80 transition-colors"
              >
                <Play className="size-4" />
                恢复
              </button>
            )}
            {(status === 'running' || status === 'paused') && (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-2 border border-destructive text-destructive text-sm font-bold hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <Square className="size-4" />
                停止
              </button>
            )}
            {status === 'stopped' && (
              <button
                disabled
                className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold opacity-40 cursor-not-allowed"
              >
                <RefreshCw className="size-4" />
                已停止
              </button>
            )}
          </div>
        </div>

        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
              实时监控训练过程中的 Loss/Accuracy 曲线、GPU 利用率和训练日志。所有指标每 3 秒自动刷新。
            </p>
            <div className="mt-4 flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              <Clock className="size-3" />
              <span>已运行 {currentEpochMetrics ? formatTime(currentEpochMetrics.elapsedTime) : '-'}</span>
              <span className="mx-1">·</span>
              <span>预计剩余 {currentEpochMetrics ? formatTime(currentEpochMetrics.estimatedRemaining) : '-'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* KPI 指标卡片行: 4 列黑线网格 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 md:grid-cols-4 border-b border-black"
      >
        {[
          {
            label: 'Train Loss',
            value: currentEpochMetrics?.trainLoss.toFixed(4) ?? '-',
            sub: `最佳: ${metrics.bestValLoss.toFixed(4)}`,
            icon: Activity,
          },
          {
            label: 'Val Accuracy',
            value: (currentEpochMetrics?.valAccuracy ?? 0) > 0
              ? `${(currentEpochMetrics!.valAccuracy * 100).toFixed(2)}%`
              : '-',
            sub: `最佳: ${(metrics.bestValAccuracy * 100).toFixed(2)}%`,
            icon: BarChart3,
          },
          {
            label: 'GPU 利用率',
            value: `${currentEpochMetrics?.gpuUtilization.toFixed(1) ?? '-'}%`,
            sub: `${metrics.config.gpuType} ×${metrics.config.gpuCount}`,
            icon: Cpu,
          },
          {
            label: '学习率',
            value: currentEpochMetrics?.learningRate.toExponential(4) ?? '-',
            sub: `调度器: ${metrics.config.hyperParams.learningRateScheduler}`,
            icon: Zap,
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-8 border-r border-black last:border-r-0"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="heading-bold text-xl flex items-center gap-2">
                  {item.label}
                  <ArrowUpRight className="size-4" />
                </span>
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <div className="heading-bold text-4xl tabular-nums font-mono">
                {item.value}
              </div>
              <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                {item.sub}
              </p>
            </div>
          );
        })}
      </motion.div>

      {/* Epoch 进度 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <EpochProgressBar
          currentEpoch={metrics.currentEpoch}
          totalEpochs={metrics.totalEpochs}
          currentStep={currentEpochMetrics?.step ?? 0}
          totalSteps={currentEpochMetrics?.totalSteps ?? 0}
          elapsedTime={currentEpochMetrics?.elapsedTime ?? 0}
          estimatedRemaining={currentEpochMetrics?.estimatedRemaining ?? 0}
          status={status}
        />
      </motion.div>

      {/* 训练曲线 + GPU 仪表盘: 8+4 非等分栏 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12"
      >
        <div className="lg:col-span-8 border-r border-black p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">训练曲线</h2>
            <ArrowUpRight className="size-4" />
          </div>
          <TrainingCurveChart metrics={metrics.epochMetrics} />
        </div>

        <div className="lg:col-span-4 bg-card p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">GPU 资源</h2>
            <ArrowUpRight className="size-4" />
          </div>
          <GpuUtilizationGauge
            gpuUtilization={currentEpochMetrics?.gpuUtilization ?? 0}
            gpuMemoryUsed={currentEpochMetrics?.gpuMemoryUsed ?? 0}
            gpuMemoryTotal={currentEpochMetrics?.gpuMemoryTotal ?? 0}
            gpuType={metrics.config.gpuType}
            gpuCount={metrics.config.gpuCount}
          />
        </div>
      </motion.div>

      {/* 训练日志 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="border-t border-black"
      >
        <div className="p-8">
          <div className="flex items-center justify-between border-b border-black pb-4 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="heading-bold text-xl">训练日志</h2>
              <ArrowUpRight className="size-4" />
            </div>
            <span className="text-xs font-mono font-bold tabular-nums">
              {logs.length} 条
            </span>
          </div>
          <TrainingLogStream logs={logs} />
        </div>
      </motion.div>

      {/* 停止确认对话框 */}
      <AlertDialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <AlertDialogContent className="border border-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="heading-bold text-lg flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              停止训练
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
              确定要停止当前训练任务吗？已训练的模型权重和日志将被保留，但未完成的 Epoch 进度将丢失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStop}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-bold border border-destructive"
            >
              确认停止
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
