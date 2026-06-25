import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import {
  ArrowLeft,
  Rocket,
  Server,
  Cpu,
  HardDrive,
  Layers,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  Shield,
  Zap,
  SlidersHorizontal,
  Plus,
  Minus,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

import { MOCK_MODEL_VERSIONS } from '@/data/modelVersions';
import { MOCK_DEPLOY_ENVIRONMENTS, MOCK_INSTANCE_SPECS } from '@/data/deployOptions';
import type { IDeployConfig, IDeployEnvironment, IInstanceSpec } from '@/types/deploy';

// ============================================================
// 环境图标映射
// ============================================================
const ENV_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  production: Shield,
  staging: SlidersHorizontal,
  testing: Zap,
};

const ENV_DESC_MAP: Record<string, string> = {
  production: '生产环境 — 面向终端用户，高可用保障',
  staging: '预发布环境 — 上线前最终验证',
  testing: '测试环境 — 开发调试与功能测试',
};

// ============================================================
// 费用计算
// ============================================================
function calcMonthlyCost(spec: IInstanceSpec | undefined, count: number): number {
  if (!spec) return 0;
  return spec.pricePerHour * 24 * 30 * count;
}

// ============================================================
// 主组件
// ============================================================
export default function DeployConfigPage() {
  const { versionId } = useParams<{ versionId: string }>();
  const navigate = useNavigate();

  const version = MOCK_MODEL_VERSIONS.find((v) => v.id === versionId);

  const [environment, setEnvironment] = useState<string>(MOCK_DEPLOY_ENVIRONMENTS[0]?.id ?? '');
  const [instanceSpecId, setInstanceSpecId] = useState<string>(MOCK_INSTANCE_SPECS[0]?.id ?? '');
  const [instanceCount, setInstanceCount] = useState(1);
  const [autoScaleEnabled, setAutoScaleEnabled] = useState(false);
  const [minInstances, setMinInstances] = useState(1);
  const [maxInstances, setMaxInstances] = useState(4);
  const [cpuThreshold, setCpuThreshold] = useState(70);
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

  const monthlyCost = useMemo(
    () => calcMonthlyCost(selectedSpec, instanceCount),
    [selectedSpec, instanceCount],
  );

  const handleDeploy = useCallback(async () => {
    if (!environment) {
      toast.error('请选择部署环境');
      return;
    }
    if (!instanceSpecId) {
      toast.error('请选择实例规格');
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success('部署任务已创建，正在启动实例...');
      logger.info('Deploy config submitted:', { environment, instanceSpecId, instanceCount, autoScaleEnabled });
      navigate('/deploy/instances');
    } catch (err) {
      logger.error('Deploy failed:', String(err));
      toast.error('部署失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }, [environment, instanceSpecId, instanceCount, autoScaleEnabled, navigate]);

  if (!version) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Rocket className="size-16 text-muted-foreground/30 mb-4" />
        <h2 className="heading-bold text-xl">模型版本不存在</h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">请从模型版本管理页选择有效版本</p>
        <button
          onClick={() => navigate('/models')}
          className="mt-6 flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回模型列表
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header: dual-column editorial */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="p-8 border-r border-black">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/models')}
              className="flex items-center justify-center size-9 border border-black hover:bg-black hover:text-background transition-colors"
              aria-label="返回模型列表"
            >
              <ArrowLeft className="size-4" />
            </button>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="heading-bold text-6xl leading-[0.9] tracking-tighter"
          >
            部署配置
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            {version.modelName} · {version.version}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDeploy}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-black text-background text-sm font-bold hover:bg-foreground/90 transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket className="size-4" />
              {submitting ? '部署中...' : '开始部署'}
            </button>
          </div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
              配置模型部署环境、实例规格和自动扩缩容策略。右侧面板实时预览配置摘要和预估费用。
            </p>
            {/* 版本摘要 */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="border border-black p-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">版本号</p>
                <p className="mt-0.5 text-sm font-bold font-mono tabular-nums">{version.version}</p>
              </div>
              <div className="border border-black p-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">框架</p>
                <p className="mt-0.5 text-sm font-bold">{version.framework}</p>
              </div>
              <div className="border border-black p-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Accuracy</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-success">
                  {(version.accuracy * 100).toFixed(1)}%
                </p>
              </div>
              <div className="border border-black p-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">模型大小</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums">{version.sizeMB} MB</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* 主内容区：左右分栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* 左栏 col-span-8: 配置表单 */}
        <div className="lg:col-span-8 border-r border-black">
          {/* 部署环境选择 */}
          <div className="p-8 border-b border-black">
            <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
              <h2 className="heading-bold text-xl">部署环境</h2>
              <ArrowUpRight className="size-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MOCK_DEPLOY_ENVIRONMENTS.map((env) => {
                const EnvIcon = ENV_ICON_MAP[env.id] ?? Server;
                const isSelected = environment === env.id;

                return (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setEnvironment(env.id)}
                    className={`flex flex-col items-start gap-3 p-5 border text-left transition-colors ${
                      isSelected
                        ? 'border-black bg-black text-background'
                        : 'border-black hover:bg-black hover:text-background'
                    }`}
                  >
                    <EnvIcon className={`size-6 ${isSelected ? 'text-background' : ''}`} />
                    <div>
                      <span className="text-sm font-bold">{env.name}</span>
                      <p className={`mt-1 text-xs font-medium leading-relaxed ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>
                        {ENV_DESC_MAP[env.id] ?? env.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="size-4 text-background ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 实例规格配置 */}
          <div className="p-8 border-b border-black">
            <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
              <h2 className="heading-bold text-xl">实例规格</h2>
              <ArrowUpRight className="size-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {MOCK_INSTANCE_SPECS.map((spec) => {
                const isSelected = instanceSpecId === spec.id;

                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setInstanceSpecId(spec.id)}
                    className={`flex flex-col gap-3 p-5 border text-left transition-colors ${
                      isSelected
                        ? 'border-black bg-black text-background'
                        : 'border-black hover:bg-black hover:text-background'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{spec.name}</span>
                      {isSelected && <CheckCircle2 className="size-4 text-background" />}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>
                        <Cpu className="size-3.5" />
                        {spec.vCPU} vCPU
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>
                        <HardDrive className="size-3.5" />
                        {spec.memoryGB} GB
                      </div>
                      {spec.gpuType && (
                        <div className={`flex items-center gap-1.5 text-xs font-medium col-span-2 ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>
                          <Layers className="size-3.5" />
                          {spec.gpuType} × {spec.gpuCount}
                        </div>
                      )}
                    </div>
                    <div className={`text-xs font-bold tabular-nums ${isSelected ? 'text-background' : ''}`}>
                      ¥{spec.pricePerHour.toFixed(2)}/小时
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 实例数量 */}
            <div className="space-y-3">
              <Label className="text-xs uppercase font-bold tracking-widest">实例数量</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInstanceCount((v) => Math.max(1, v - 1))}
                  className="flex items-center justify-center size-9 border border-black hover:bg-black hover:text-background transition-colors"
                  disabled={instanceCount <= 1}
                >
                  <Minus className="size-4" />
                </button>
                <span className="heading-bold text-2xl tabular-nums w-12 text-center">{instanceCount}</span>
                <button
                  type="button"
                  onClick={() => setInstanceCount((v) => Math.min(10, v + 1))}
                  className="flex items-center justify-center size-9 border border-black hover:bg-black hover:text-background transition-colors"
                  disabled={instanceCount >= 10}
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 自动扩缩容 */}
          <div className="p-8 border-b border-black">
            <div className="flex items-center justify-between border-b border-black pb-4 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="heading-bold text-xl">自动扩缩容</h2>
                <ArrowUpRight className="size-4" />
              </div>
              <Switch
                checked={autoScaleEnabled}
                onCheckedChange={setAutoScaleEnabled}
                className="data-[state=checked]:bg-black"
              />
            </div>

            {autoScaleEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-6 overflow-hidden"
              >
                {/* 最小/最大实例数 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase font-bold tracking-widest">最小实例数</Label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMinInstances((v) => Math.max(1, v - 1))}
                        className="flex items-center justify-center size-9 border border-black hover:bg-black hover:text-background transition-colors"
                        disabled={minInstances <= 1}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="heading-bold text-2xl tabular-nums w-12 text-center">{minInstances}</span>
                      <button
                        type="button"
                        onClick={() => setMinInstances((v) => Math.min(maxInstances - 1, v + 1))}
                        className="flex items-center justify-center size-9 border border-black hover:bg-black hover:text-background transition-colors"
                        disabled={minInstances >= maxInstances - 1}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase font-bold tracking-widest">最大实例数</Label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMaxInstances((v) => Math.max(minInstances + 1, v - 1))}
                        className="flex items-center justify-center size-9 border border-black hover:bg-black hover:text-background transition-colors"
                        disabled={maxInstances <= minInstances + 1}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="heading-bold text-2xl tabular-nums w-12 text-center">{maxInstances}</span>
                      <button
                        type="button"
                        onClick={() => setMaxInstances((v) => Math.min(20, v + 1))}
                        className="flex items-center justify-center size-9 border border-black hover:bg-black hover:text-background transition-colors"
                        disabled={maxInstances >= 20}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* CPU 利用率触发阈值 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase font-bold tracking-widest">CPU 利用率触发阈值</Label>
                    <span className="heading-bold text-lg tabular-nums">{cpuThreshold}%</span>
                  </div>
                  <Slider
                    value={[cpuThreshold]}
                    onValueChange={([v]) => setCpuThreshold(v)}
                    min={30}
                    max={90}
                    step={5}
                    className="[&_[data-slot=slider-track]]:bg-black/10 [&_[data-slot=slider-range]]:bg-black [&_[data-slot=slider-thumb]]:border-black [&_[data-slot=slider-thumb]]:bg-background"
                  />
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <span>30%</span>
                    <span>90%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* 描述 */}
          <div className="p-8">
            <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
              <h2 className="heading-bold text-xl">部署描述</h2>
              <ArrowUpRight className="size-4" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-widest">备注说明</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入部署说明（可选）..."
                rows={4}
                className="w-full border border-black bg-background p-3 text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-black resize-none"
              />
            </div>
          </div>
        </div>

        {/* 右栏 col-span-4: 配置预览 + 费用预估 */}
        <div className="lg:col-span-4 bg-card">
          <div className="p-8 sticky top-0">
            <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
              <h2 className="heading-bold text-xl">配置摘要</h2>
              <ArrowUpRight className="size-4" />
            </div>

            {/* 环境 */}
            <div className="flex items-center justify-between py-3 border-b border-black">
              <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">部署环境</span>
              <span className="text-sm font-bold">{selectedEnv?.name ?? '—'}</span>
            </div>

            {/* 实例规格 */}
            <div className="flex items-center justify-between py-3 border-b border-black">
              <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">实例规格</span>
              <span className="text-sm font-bold">{selectedSpec?.name ?? '—'}</span>
            </div>

            {/* 实例数量 */}
            <div className="flex items-center justify-between py-3 border-b border-black">
              <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">实例数量</span>
              <span className="text-sm font-bold tabular-nums">{instanceCount}</span>
            </div>

            {/* 扩缩容 */}
            <div className="flex items-center justify-between py-3 border-b border-black">
              <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">自动扩缩容</span>
              <span className={`text-sm font-bold ${autoScaleEnabled ? '' : 'text-muted-foreground'}`}>
                {autoScaleEnabled ? `${minInstances}–${maxInstances} 实例` : '关闭'}
              </span>
            </div>

            {autoScaleEnabled && (
              <div className="flex items-center justify-between py-3 border-b border-black">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">CPU 阈值</span>
                <span className="text-sm font-bold tabular-nums">{cpuThreshold}%</span>
              </div>
            )}

            {/* 规格详情 */}
            {selectedSpec && (
              <div className="flex items-center justify-between py-3 border-b border-black">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">单价</span>
                <span className="text-sm font-bold tabular-nums">¥{selectedSpec.pricePerHour.toFixed(2)}/h</span>
              </div>
            )}

            {/* 费用预估 - 深色反转区块 */}
            <div className="mt-6 p-8 bg-black text-background">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="size-5 text-background" />
                <h3 className="heading-bold text-lg">预估月费用</h3>
              </div>

              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="heading-bold text-4xl tabular-nums">
                  ¥{monthlyCost.toFixed(0)}
                </span>
                <span className="text-sm font-medium text-background/60">/月</span>
              </div>

              <div className="space-y-2 text-xs font-medium text-background/60">
                <div className="flex items-center justify-between">
                  <span>实例数</span>
                  <span className="tabular-nums">{instanceCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>单价</span>
                  <span className="tabular-nums">¥{selectedSpec?.pricePerHour.toFixed(2) ?? '—'}/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>计费周期</span>
                  <span>24h × 30d</span>
                </div>
                <div className="border-t border-background/20 pt-2 flex items-center justify-between">
                  <span className="font-bold text-background/80">合计</span>
                  <span className="font-bold tabular-nums text-background">
                    ¥{monthlyCost.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-[10px] font-medium text-background/40 leading-relaxed">
                <Info className="size-3 shrink-0 mt-0.5" />
                <span>实际费用可能因使用时长和扩缩容策略有所浮动。以上为基于当前配置的估算值。</span>
              </div>
            </div>

            {/* 底部部署按钮 */}
            <button
              onClick={handleDeploy}
              disabled={submitting}
              className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-background text-sm font-bold hover:bg-foreground/90 transition-colors border border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket className="size-4" />
              {submitting ? '部署中...' : '确认部署'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
