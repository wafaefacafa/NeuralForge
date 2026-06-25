import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  HardDrive,
  Layers,
  Tag,
  DollarSign,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

import type { IProjectFramework, IProjectHardwareConfig } from '@/types/projects';

interface ConfigPreviewPanelProps {
  projectName: string;
  description: string;
  framework: IProjectFramework | null;
  hardware: IProjectHardwareConfig;
  tags: string[];
  estimatedCost: number;
}

const FRAMEWORK_META: Record<IProjectFramework, { label: string; icon: string }> = {
  PyTorch: { label: 'PyTorch', icon: '🔥' },
  TensorFlow: { label: 'TensorFlow', icon: '🧠' },
  JAX: { label: 'JAX', icon: '⚡' },
};

const GPU_PRICE_MAP: Record<string, number> = {
  A100: 3.06,
  V100: 2.48,
  T4: 0.95,
};

function ConfigPreviewPanel({
  projectName,
  description,
  framework,
  hardware,
  tags,
  estimatedCost,
}: ConfigPreviewPanelProps) {
  const gpuUnitPrice = GPU_PRICE_MAP[hardware.gpuType] ?? 0;
  const gpuCost = gpuUnitPrice * hardware.gpuCount;
  const memoryCost = (hardware.memoryGB / 32) * 0.15;
  const totalHourly = gpuCost + memoryCost;
  const totalMonthly = totalHourly * 730;

  const displayCost = estimatedCost > 0 ? estimatedCost : totalMonthly;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* 配置摘要列表 */}
      <div className="border border-black">
        <div className="flex items-center gap-2 border-b border-black p-4">
          <Sparkles className="size-4" />
          <h3 className="heading-bold text-xl">配置预览</h3>
          <ArrowUpRight className="size-4" />
        </div>

        <div className="divide-y divide-black">
          {/* 项目名称 */}
          <div className="flex items-start gap-4 p-4">
            <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest text-muted-foreground w-24 pt-0.5">
              项目名称
            </span>
            <span className="text-sm font-bold">
              {projectName || '未命名项目'}
            </span>
          </div>

          {/* 描述 */}
          {description && (
            <div className="flex items-start gap-4 p-4">
              <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest text-muted-foreground w-24 pt-0.5">
                项目描述
              </span>
              <p className="text-sm font-medium text-muted-foreground line-clamp-3">
                {description}
              </p>
            </div>
          )}

          {/* 框架选择 */}
          <div className="flex items-start gap-4 p-4">
            <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest text-muted-foreground w-24 pt-0.5">
              框架
            </span>
            {framework ? (
              <span className="inline-flex items-center gap-1.5 border border-black px-3 py-1 text-xs font-bold">
                {FRAMEWORK_META[framework].icon}{' '}
                {FRAMEWORK_META[framework].label}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground italic">未选择</span>
            )}
          </div>

          {/* 硬件资源配置 */}
          <div className="flex items-start gap-4 p-4">
            <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest text-muted-foreground w-24 pt-0.5">
              硬件资源
            </span>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 border border-black p-3">
                <Cpu className="size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    GPU 型号
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {hardware.gpuType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 border border-black p-3">
                <Layers className="size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    GPU 数量
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {hardware.gpuCount} 卡
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 border border-black p-3">
                <HardDrive className="size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    内存规格
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {hardware.memoryGB} GB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 border border-black p-3">
                <DollarSign className="size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    GPU 单价
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    ${gpuUnitPrice.toFixed(2)}/h
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex items-start gap-4 p-4">
            <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest text-muted-foreground w-24 pt-0.5">
              标签
            </span>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 border border-black px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest"
                  >
                    <Tag className="size-3" />
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground italic">未添加标签</span>
            )}
          </div>
        </div>
      </div>

      {/* 费用预估 - 黑底反转区块 */}
      <div className="bg-black text-background p-8 min-h-[200px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-background/60">
              预估月费用
            </p>
            <div className="flex items-baseline gap-1">
              <span className="heading-bold text-4xl tabular-nums">
                ${displayCost.toFixed(0)}
              </span>
              <span className="text-sm font-medium text-background/60">/月</span>
            </div>
          </div>
          <div className="flex size-12 items-center justify-center border border-background/30">
            <DollarSign className="size-5" />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-background/60">
              GPU ({hardware.gpuType} × {hardware.gpuCount})
            </span>
            <span className="font-bold tabular-nums">
              ${(gpuCost * 730).toFixed(0)}/月
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-background/60">
              内存 ({hardware.memoryGB} GB)
            </span>
            <span className="font-bold tabular-nums">
              ${(memoryCost * 730).toFixed(0)}/月
            </span>
          </div>
          <div className="border-t border-background/20 my-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold">合计（按 730h/月）</span>
            <span className="heading-bold text-lg tabular-nums">
              ${displayCost.toFixed(0)}/月
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ConfigPreviewPanel);
