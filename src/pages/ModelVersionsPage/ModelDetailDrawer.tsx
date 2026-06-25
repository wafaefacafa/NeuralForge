import { memo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Cpu,
  HardDrive,
  Layers,
  Zap,
  Clock,
  Hash,
  BrainCircuit,
} from 'lucide-react';
import type { IModelVersion } from '@/types/models';

interface ModelDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: IModelVersion | null;
}

function ModelDetailDrawer({ open, onOpenChange, version }: ModelDetailDrawerProps) {
  if (!version) return null;

  const statusLabel = (() => {
    switch (version.status) {
      case 'ready':
        return '就绪';
      case 'deployed':
        return '已部署';
      case 'training':
        return '训练中';
      case 'failed':
        return '失败';
      default:
        return version.status;
    }
  })();

  const statusBg = (() => {
    switch (version.status) {
      case 'ready':
        return 'bg-black text-background';
      case 'deployed':
        return 'bg-black text-background';
      case 'training':
        return 'border border-black text-foreground bg-transparent';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'border border-black text-foreground bg-transparent';
    }
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 border-l border-black bg-background">
        {/* Header: 黑线分隔 */}
        <div className="border-b border-black">
          <SheetHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center bg-black">
                <BrainCircuit className="size-5 text-background" />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="heading-bold text-lg truncate">
                  {version.modelName}
                </SheetTitle>
                <SheetDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">
                  版本 {version.version}
                </SheetDescription>
              </div>
              <Badge className={`shrink-0 text-[10px] uppercase font-bold tracking-widest ${statusBg}`}>
                {statusLabel}
              </Badge>
            </div>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-black">
            {/* 基本信息 */}
            <div className="px-6 py-5">
              <h4 className="heading-bold text-sm mb-4 flex items-center gap-2">
                基本信息
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <path d="M8 4L4 8M4 4H8V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
                </svg>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={Layers} label="框架" value={version.framework} />
                <InfoItem icon={Hash} label="版本号" value={version.version} />
                <InfoItem icon={Clock} label="创建时间" value={formatDate(version.createdAt)} />
                <InfoItem icon={HardDrive} label="模型大小" value={`${version.sizeMB} MB`} />
              </div>
            </div>

            {/* 模型指标 */}
            <div className="px-6 py-5">
              <h4 className="heading-bold text-sm mb-4 flex items-center gap-2">
                模型指标
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <path d="M8 4L4 8M4 4H8V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
                </svg>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Accuracy" value={version.accuracy} unit="%" />
                <MetricCard label="F1 Score" value={version.f1Score} unit="" />
                <MetricCard label="Precision" value={version.precision} unit="" />
                <MetricCard label="Recall" value={version.recall} unit="" />
              </div>
            </div>

            {/* 超参数 */}
            <div className="px-6 py-5">
              <h4 className="heading-bold text-sm mb-4 flex items-center gap-2">
                超参数
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <path d="M8 4L4 8M4 4H8V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
                </svg>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={Zap} label="学习率" value={String(version.hyperparams.learningRate)} />
                <InfoItem icon={Layers} label="Batch Size" value={String(version.hyperparams.batchSize)} />
                <InfoItem icon={Hash} label="Epochs" value={String(version.hyperparams.epochs)} />
                <InfoItem icon={BrainCircuit} label="优化器" value={version.hyperparams.optimizer} />
              </div>
            </div>

            {/* 训练环境 */}
            <div className="px-6 py-5">
              <h4 className="heading-bold text-sm mb-4 flex items-center gap-2">
                训练环境
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <path d="M8 4L4 8M4 4H8V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
                </svg>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={Cpu} label="GPU 型号" value={version.trainingEnv.gpuType} />
                <InfoItem icon={Layers} label="GPU 数量" value={`${version.trainingEnv.gpuCount} 卡`} />
                <InfoItem icon={HardDrive} label="内存" value={`${version.trainingEnv.memoryGB} GB`} />
              </div>
            </div>

            {/* 模型结构图 */}
            <div className="px-6 py-5">
              <h4 className="heading-bold text-sm mb-4 flex items-center gap-2">
                模型结构
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <path d="M8 4L4 8M4 4H8V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
                </svg>
              </h4>
              <div className="border border-black p-4 space-y-2">
                {[
                  { label: 'Input', dim: '224×224×3' },
                  { label: 'Conv2D', dim: '112×112×64' },
                  { label: 'MaxPool', dim: '56×56×64' },
                  { label: 'ResBlock ×3', dim: '56×56×256' },
                  { label: 'ResBlock ×4', dim: '28×28×512' },
                  { label: 'ResBlock ×6', dim: '14×14×1024' },
                  { label: 'ResBlock ×3', dim: '7×7×2048' },
                  { label: 'AvgPool', dim: '1×1×2048' },
                  { label: 'FC', dim: '1000' },
                ].map((layer, i) => (
                  <div key={layer.label} className="flex items-center gap-3 group">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground w-6 shrink-0 tabular-nums text-right">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 flex items-center justify-between border border-black px-3 py-2 group-hover:bg-black group-hover:text-background transition-colors">
                      <span className="text-xs font-bold">{layer.label}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60 tabular-nums">
                        {layer.dim}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 所属项目 */}
            <div className="px-6 py-5">
              <h4 className="heading-bold text-sm mb-4 flex items-center gap-2">
                所属项目
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <path d="M8 4L4 8M4 4H8V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
                </svg>
              </h4>
              <div className="border border-black p-4 hover:bg-black hover:text-background transition-colors group">
                <div className="text-sm font-bold group-hover:text-background">{version.projectName}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60 mt-1">
                  ID: {version.projectId}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

/* ---------- 子组件 ---------- */

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 border border-black px-3 py-2.5 hover:bg-black hover:text-background transition-colors group">
      <Icon className="size-4 shrink-0 text-muted-foreground group-hover:text-background/60" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60 leading-tight">
          {label}
        </div>
        <div className="text-sm font-bold truncate group-hover:text-background">{value}</div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="border border-black px-3 py-2.5 hover:bg-black hover:text-background transition-colors group">
      <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60 leading-tight">
        {label}
      </div>
      <div className="heading-bold text-2xl tabular-nums group-hover:text-background mt-1">
        {value.toFixed(3)}
        {unit && (
          <span className="text-sm font-normal ml-0.5 group-hover:text-background/60">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- 工具函数 ---------- */

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default memo(ModelDetailDrawer);
