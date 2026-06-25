import { useState, useCallback, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Cloud, Cpu, Sliders, Info, Check, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

import { MOCK_DEPLOY_ENVIRONMENTS, MOCK_INSTANCE_SPECS } from '@/data/deployOptions';
import type { IDeployConfig, IAutoScaleConfig, ITrafficAllocation } from '@/types/deploy';

interface DeployConfigFormProps {
  modelVersionId: string;
  modelName?: string;
  projectId?: string;
  existingVersions?: { id: string; name: string }[];
}

export default function DeployConfigForm({
  modelVersionId,
  modelName = 'ResNet-50 v3.2',
  projectId = '1',
  existingVersions = [],
}: DeployConfigFormProps) {
  const navigate = useNavigate();

  const [environment, setEnvironment] = useState(MOCK_DEPLOY_ENVIRONMENTS[0].id);
  const [instanceSpecId, setInstanceSpecId] = useState(MOCK_INSTANCE_SPECS[0].id);
  const [instanceCount, setInstanceCount] = useState(2);

  const [autoScale, setAutoScale] = useState<IAutoScaleConfig>({
    enabled: false,
    minInstances: 1,
    maxInstances: 4,
    cpuThreshold: 70,
    scaleDownDelay: 300,
  });

  const [trafficAllocations, setTrafficAllocations] = useState<ITrafficAllocation[]>(
    existingVersions.length > 0
      ? [
          { versionId: modelVersionId, versionName: modelName, percentage: 80 },
          { versionId: existingVersions[0].id, versionName: existingVersions[0].name, percentage: 20 },
        ]
      : [{ versionId: modelVersionId, versionName: modelName, percentage: 100 }],
  );

  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedSpec = useMemo(
    () => MOCK_INSTANCE_SPECS.find((s) => s.id === instanceSpecId),
    [instanceSpecId],
  );

  const selectedEnv = useMemo(
    () => MOCK_DEPLOY_ENVIRONMENTS.find((e) => e.id === environment),
    [environment],
  );

  const estimatedMonthlyCost = useMemo(() => {
    if (!selectedSpec) return 0;
    const baseCost = selectedSpec.pricePerHour * 24 * 30 * instanceCount;
    return Math.round(baseCost);
  }, [selectedSpec, instanceCount]);

  const handleTrafficChange = useCallback(
    (versionId: string, newPercentage: number) => {
      setTrafficAllocations((prev) => {
        const updated = prev.map((t) =>
          t.versionId === versionId ? { ...t, percentage: newPercentage } : t,
        );
        const total = updated.reduce((sum, t) => sum + t.percentage, 0);
        if (total !== 100 && updated.length > 1) {
          const otherIdx = updated.findIndex((t) => t.versionId !== versionId);
          if (otherIdx >= 0) {
            updated[otherIdx] = {
              ...updated[otherIdx],
              percentage: Math.max(0, updated[otherIdx].percentage + (100 - total)),
            };
          }
        }
        return updated;
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        await new Promise((r) => setTimeout(r, 1200));

        const config: IDeployConfig = {
          projectId,
          modelVersionId,
          environment,
          instanceSpecId,
          instanceCount,
          autoScale,
          trafficAllocations,
          description,
        };

        logger.info('Deploy config submitted:', JSON.stringify(config));
        toast.success('部署配置已提交，正在创建部署任务...');
        navigate('/deploy/instances');
      } catch (err) {
        logger.error('Deploy config submit failed:', String(err));
        toast.error('提交失败，请重试');
      } finally {
        setSubmitting(false);
      }
    },
    [
      projectId,
      modelVersionId,
      environment,
      instanceSpecId,
      instanceCount,
      autoScale,
      trafficAllocations,
      description,
      navigate,
    ],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* 部署环境选择 */}
      <Card className="border-black bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="size-4 text-foreground" />
            部署环境
          </CardTitle>
          <CardDescription>选择模型部署的目标环境</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MOCK_DEPLOY_ENVIRONMENTS.map((env) => {
              const isSelected = environment === env.id;
              return (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => setEnvironment(env.id)}
                  className={`relative flex flex-col items-start gap-2 border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-black bg-card ring-1 ring-black'
                      : 'border-black bg-card hover:bg-muted'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-3 top-3 flex size-5 items-center justify-center bg-foreground">
                      <Check className="size-3 text-background" />
                    </div>
                  )}
                  <span className="text-2xl">{env.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{env.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{env.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 实例规格配置 */}
      <Card className="border-black bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="size-4 text-foreground" />
            实例规格
          </CardTitle>
          <CardDescription>配置部署实例的计算资源规格和数量</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label className="text-sm font-medium">实例类型</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MOCK_INSTANCE_SPECS.map((spec) => {
                const isSelected = instanceSpecId === spec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setInstanceSpecId(spec.id)}
                    className={`flex flex-col gap-2 border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-black bg-card ring-1 ring-black'
                        : 'border-black bg-card hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={spec.type === 'GPU' ? 'default' : 'secondary'} className="text-[10px]">
                        {spec.type}
                      </Badge>
                      {isSelected && <Check className="size-3.5 text-foreground" />}
                    </div>
                    <div className="text-sm font-semibold text-foreground">{spec.name}</div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>{spec.vCPU} vCPU · {spec.memory}</div>
                      {spec.gpuModel && <div>{spec.gpuModel} × {spec.gpuCount}</div>}
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      ¥{spec.pricePerHour}/小时
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">实例数量</Label>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {instanceCount} 个
              </span>
            </div>
            <Slider
              value={[instanceCount]}
              onValueChange={([v]) => setInstanceCount(v)}
              min={1}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>1</span>
              <span>8</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 自动扩缩容 */}
      <Card className="border-black bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sliders className="size-4 text-foreground" />
            自动扩缩容
          </CardTitle>
          <CardDescription>根据负载自动调整实例数量</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">启用自动扩缩容</Label>
              <p className="text-xs text-muted-foreground">
                开启后系统将根据 CPU 使用率自动调整实例数量
              </p>
            </div>
            <Switch
              checked={autoScale.enabled}
              onCheckedChange={(checked) =>
                setAutoScale((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {autoScale.enabled && (
            <div className="space-y-4 border border-black bg-muted p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">最小实例数</Label>
                  <Input
                    type="number"
                    min={1}
                    max={autoScale.maxInstances}
                    value={autoScale.minInstances}
                    onChange={(e) =>
                      setAutoScale((prev) => ({
                        ...prev,
                        minInstances: Math.max(1, Number(e.target.value)),
                      }))
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">最大实例数</Label>
                  <Input
                    type="number"
                    min={autoScale.minInstances}
                    max={20}
                    value={autoScale.maxInstances}
                    onChange={(e) =>
                      setAutoScale((prev) => ({
                        ...prev,
                        maxInstances: Math.min(20, Number(e.target.value)),
                      }))
                    }
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">CPU 触发阈值</Label>
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {autoScale.cpuThreshold}%
                  </span>
                </div>
                <Slider
                  value={[autoScale.cpuThreshold]}
                  onValueChange={([v]) =>
                    setAutoScale((prev) => ({ ...prev, cpuThreshold: v }))
                  }
                  min={30}
                  max={95}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">缩容冷却时间（秒）</Label>
                <Select
                  value={String(autoScale.scaleDownDelay)}
                  onValueChange={(v) =>
                    setAutoScale((prev) => ({ ...prev, scaleDownDelay: Number(v) }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 秒</SelectItem>
                    <SelectItem value="180">180 秒</SelectItem>
                    <SelectItem value="300">300 秒（推荐）</SelectItem>
                    <SelectItem value="600">600 秒</SelectItem>
                    <SelectItem value="900">900 秒</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 流量分配 */}
      {trafficAllocations.length > 1 && (
        <Card className="border-black bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sliders className="size-4 text-foreground" />
              流量分配
            </CardTitle>
            <CardDescription>配置多版本之间的流量分配比例</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trafficAllocations.map((alloc) => (
              <div key={alloc.versionId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {alloc.versionName}
                    </span>
                    {alloc.versionId === modelVersionId && (
                      <Badge variant="outline" className="text-[10px]">
                        当前版本
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {alloc.percentage}%
                  </span>
                </div>
                <Slider
                  value={[alloc.percentage]}
                  onValueChange={([v]) => handleTrafficChange(alloc.versionId, v)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}

            <div className="flex items-center gap-2 bg-muted px-3 py-2">
              <Info className="size-3.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                流量分配总和必须为 100%。建议先在少量流量上验证新版本，确认稳定后逐步切换。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 描述 */}
      <Card className="border-black bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-foreground" />
            部署说明
          </CardTitle>
          <CardDescription>添加此次部署的备注信息（可选）</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：修复了推理延迟问题，新增批量预测支持..."
            className="min-h-[80px] resize-none"
            maxLength={200}
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground text-right">
            {description.length}/200
          </p>
        </CardContent>
      </Card>

      {/* 部署配置摘要 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">部署配置摘要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">模型版本</span>
            <span className="font-medium text-foreground">{modelName}</span>
          </div>
          <Separator className="bg-black" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">部署环境</span>
            <span className="font-medium text-foreground">
              {selectedEnv?.icon} {selectedEnv?.name}
            </span>
          </div>
          <Separator className="bg-black" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">实例规格</span>
            <span className="font-medium text-foreground">
              {selectedSpec?.name} × {instanceCount}
            </span>
          </div>
          <Separator className="bg-black" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">自动扩缩容</span>
            <Badge variant={autoScale.enabled ? 'default' : 'secondary'} className="text-[10px]">
              {autoScale.enabled ? '已启用' : '未启用'}
            </Badge>
          </div>
          {autoScale.enabled && (
            <>
              <Separator className="bg-black" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">实例范围</span>
                <span className="font-medium text-foreground">
                  {autoScale.minInstances} - {autoScale.maxInstances}
                </span>
              </div>
            </>
          )}
          <Separator className="bg-black" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">预估月费用</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-bold text-lg tabular-nums text-foreground">
                    ¥{estimatedMonthlyCost.toLocaleString()}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">基于所选规格 × 实例数 × 24h × 30天估算</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={submitting}
        >
          取消
        </Button>
        <Button type="submit" disabled={submitting} className="gap-2">
          {submitting ? (
            <>
              <span className="size-4 animate-spin border-2 border-current border-t-transparent" />
              部署中...
            </>
          ) : (
            <>
              确认部署
              <ChevronRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
