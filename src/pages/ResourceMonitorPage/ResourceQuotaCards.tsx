import { memo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, CircuitBoard, HardDrive, Database } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { IResourceQuota } from '@/types/resources';

interface ResourceQuotaCardsProps {
  quotas: IResourceQuota[];
}

const ICON_MAP: Record<IResourceQuota['resourceType'], React.ComponentType<{ className?: string }>> = {
  CPU: Cpu,
  GPU: CircuitBoard,
  Memory: HardDrive,
  Storage: Database,
};

const COLOR_MAP: Record<IResourceQuota['resourceType'], { bar: string; bg: string; icon: string }> = {
  CPU: { bar: 'bg-chart-1', bg: 'bg-chart-1/15', icon: 'text-chart-1' },
  GPU: { bar: 'bg-chart-2', bg: 'bg-chart-2/15', icon: 'text-chart-2' },
  Memory: { bar: 'bg-chart-3', bg: 'bg-chart-3/15', icon: 'text-chart-3' },
  Storage: { bar: 'bg-chart-4', bg: 'bg-chart-4/15', icon: 'text-chart-4' },
};

function ResourceQuotaCards({ quotas }: ResourceQuotaCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {quotas.map((quota, i) => {
        const Icon = ICON_MAP[quota.resourceType];
        const colors = COLOR_MAP[quota.resourceType];
        const pct = quota.total > 0 ? Math.round((quota.used / quota.total) * 100) : 0;
        const isWarning = pct >= 80;
        const isCritical = pct >= 95;

        return (
          <motion.div
            key={quota.resourceType}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card
              className={`border-black bg-card transition-colors duration-300 ${
                isCritical ? 'ring-1 ring-destructive/50' : isWarning ? 'ring-1 ring-warning/40' : ''
              }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* 顶部：图标 + 标题 + 百分比 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex size-9 shrink-0 items-center justify-center border border-black ${colors.bg}`}>
                      <Icon className={`size-4.5 ${colors.icon}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{quota.resourceType}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {quota.used} / {quota.total} {quota.unit}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-lg font-bold tabular-nums ${
                      isCritical ? 'text-destructive' : isWarning ? 'text-warning' : 'text-foreground'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                {/* 进度条 */}
                <div className="space-y-1.5">
                  <Progress
                    value={pct}
                    className={`h-2 ${colors.bg}`}
                    indicatorClassName={`${colors.bar} ${isCritical ? '!bg-destructive' : isWarning ? '!bg-warning' : ''}`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      已用 {quota.used} {quota.unit}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      剩余 {quota.total - quota.used} {quota.unit}
                    </span>
                  </div>
                </div>

                {/* 告警标签 */}
                {isCritical && (
                  <div className="flex items-center gap-1.5 border border-destructive/30 bg-destructive/10 px-2.5 py-1.5">
                    <span className="size-1.5 shrink-0 bg-destructive" />
                    <span className="text-[11px] font-medium text-destructive">资源即将耗尽</span>
                  </div>
                )}
                {isWarning && !isCritical && (
                  <div className="flex items-center gap-1.5 border border-warning/30 bg-warning/10 px-2.5 py-1.5">
                    <span className="size-1.5 shrink-0 bg-warning" />
                    <span className="text-[11px] font-medium text-warning">使用率偏高</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

export default memo(ResourceQuotaCards);
