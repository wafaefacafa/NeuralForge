import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Cpu,
  HardDrive,
  DollarSign,
  Activity,
  Layers,
  ArrowRightLeft,
  Shield,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

import type { IDeployConfig } from '@/types/deploy';
import { GPU_OPTIONS, MEMORY_OPTIONS } from '@/data/projects';
import { MOCK_DEPLOY_ENVIRONMENTS, MOCK_INSTANCE_SPECS } from '@/data/deployOptions';

interface DeployConfigPreviewProps {
  config: Partial<IDeployConfig>;
}

const ENV_ICON_MAP: Record<string, string> = {
  production: '🚀',
  staging: '🧪',
  testing: '🔬',
};

const ENV_COLOR_MAP: Record<string, string> = {
  production: 'text-success',
  staging: 'text-warning',
  testing: 'text-muted-foreground',
};

function DeployConfigPreview({ config }: DeployConfigPreviewProps) {
  const env = MOCK_DEPLOY_ENVIRONMENTS.find((e) => e.id === config.environment);
  const spec = MOCK_INSTANCE_SPECS.find((s) => s.id === config.instanceSpecId);
  const gpuInfo = GPU_OPTIONS.find((g) => g.value === spec?.gpuModel);
  const memInfo = MEMORY_OPTIONS.find((m) => String(m.value) === spec?.memory);

  const instancePrice = spec?.pricePerHour ?? 0;
  const instanceCount = config.instanceCount ?? 1;
  const hourlyCost = instancePrice * instanceCount;
  const monthlyCost = hourlyCost * 24 * 30;

  const hasConfig = !!(config.environment || config.instanceSpecId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center bg-card border border-black">
          <Layers className="size-4 text-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">配置摘要</h3>
          <p className="text-xs text-muted-foreground">实时预览部署配置</p>
        </div>
      </div>

      {!hasConfig ? (
        <Card className="border-black bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Server className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">请选择部署环境和实例规格</p>
            <p className="text-xs text-muted-foreground/60 mt-1">配置将实时显示在此面板</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 部署环境 */}
          {env && (
            <Card className="border-black bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="size-4 text-foreground" />
                  部署环境
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ENV_ICON_MAP[env.id] ?? '📦'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{env.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{env.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 ml-auto ${ENV_COLOR_MAP[env.id] ?? ''}`}
                  >
                    {env.id === 'production' ? '生产' : env.id === 'staging' ? '预发布' : '测试'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 实例规格 */}
          {spec && (
            <Card className="border-black bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Cpu className="size-4 text-foreground" />
                  实例规格
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{spec.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {spec.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Cpu className="size-3" />
                      vCPU
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{spec.vCPU} 核</p>
                  </div>
                  <div className="bg-muted p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <HardDrive className="size-3" />
                      内存
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{spec.memory}</p>
                  </div>
                  {gpuInfo && (
                    <div className="bg-muted p-3 col-span-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Server className="size-3" />
                        GPU
                      </div>
                      <p className="text-sm font-semibold">
                        {gpuInfo.label}
                        {spec.gpuCount && spec.gpuCount > 1 && ` × ${spec.gpuCount}`}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">实例数量</span>
                  <span className="text-sm font-semibold tabular-nums">{instanceCount} 个</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 自动扩缩容 */}
          {config.autoScale && (
            <Card className="border-black bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="size-4 text-foreground" />
                  自动扩缩容
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">状态</span>
                  <Badge variant={config.autoScale.enabled ? 'default' : 'secondary'} className="text-xs">
                    {config.autoScale.enabled ? '已启用' : '已禁用'}
                  </Badge>
                </div>

                {config.autoScale.enabled && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">实例范围</span>
                        <span className="font-semibold tabular-nums">
                          {config.autoScale.minInstances} - {config.autoScale.maxInstances}
                        </span>
                      </div>
                      <Progress
                        value={
                          ((instanceCount - config.autoScale.minInstances) /
                            (config.autoScale.maxInstances - config.autoScale.minInstances)) *
                          100
                        }
                        className="h-1.5"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">CPU 触发阈值</span>
                      <span className="text-sm font-semibold tabular-nums">
                        {config.autoScale.cpuThreshold}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">缩容冷却时间</span>
                      <span className="text-sm font-semibold tabular-nums">
                        {config.autoScale.scaleDownDelay} 秒
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* 流量分配 */}
          {config.trafficAllocations && config.trafficAllocations.length > 0 && (
            <Card className="border-black bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ArrowRightLeft className="size-4 text-foreground" />
                  流量分配
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {config.trafficAllocations.map((alloc) => (
                  <div key={alloc.versionId} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {alloc.versionName}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {alloc.percentage}%
                      </span>
                    </div>
                    <Progress value={alloc.percentage} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Separator className="bg-black" />

          {/* 费用预估 */}
          <Card className="border-black bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <DollarSign className="size-4 text-foreground" />
                费用预估
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted p-3">
                  <p className="text-[11px] text-muted-foreground mb-0.5">时费</p>
                  <p className="text-lg font-bold tabular-nums text-foreground">
                    ${hourlyCost.toFixed(2)}
                    <span className="text-xs font-normal text-muted-foreground">/h</span>
                  </p>
                </div>
                <div className="bg-muted p-3">
                  <p className="text-[11px] text-muted-foreground mb-0.5">月费（估）</p>
                  <p className="text-lg font-bold tabular-nums text-foreground">
                    ${monthlyCost.toFixed(0)}
                    <span className="text-xs font-normal text-muted-foreground">/月</span>
                  </p>
                </div>
              </div>

              <div className="bg-card border border-black p-3">
                <div className="flex items-start gap-2">
                  <DollarSign className="size-3.5 text-foreground mt-0.5 shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p>
                      费用基于所选实例规格和数量估算，实际费用可能因使用时长和流量产生变化。
                    </p>
                    {spec && (
                      <p className="mt-1 text-foreground/80">
                        {spec.name} × {instanceCount} 实例 = ${instancePrice.toFixed(2)}/h × {instanceCount} = ${hourlyCost.toFixed(2)}/h
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}

export default memo(DeployConfigPreview);
