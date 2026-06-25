import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { ArrowLeft, Play, RotateCcw, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { MOCK_PROJECTS, GPU_OPTIONS } from '@/data/projects';
import { NETWORK_TEMPLATES, OPTIMIZER_OPTIONS, LR_SCHEDULER_OPTIONS } from '@/data/trainingOptions';
import type { IHyperParams, INetworkTemplate, ITrainingDatasetSplit } from '@/types/training';

const DEFAULT_HYPER_PARAMS: IHyperParams = {
  learningRate: 0.001,
  batchSize: 32,
  epochs: 50,
  optimizer: 'adam',
  weightDecay: 0.0001,
  learningRateScheduler: 'cosine',
  earlyStoppingPatience: 10,
  dataAugmentation: true,
};

const MOCK_DATASETS = [
  { id: 'ds1', name: 'ImageNet-subset', sampleCount: 50000, category: 'image' },
  { id: 'ds2', name: 'COCO-2017', sampleCount: 118000, category: 'image' },
  { id: 'ds3', name: 'WikiText-103', sampleCount: 103000, category: 'text' },
];

export default function TrainingConfigPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const project = useMemo(
    () => MOCK_PROJECTS.find((p) => p.id === projectId),
    [projectId],
  );

  const [hyperParams, setHyperParams] = useState<IHyperParams>(DEFAULT_HYPER_PARAMS);
  const [selectedTemplate, setSelectedTemplate] = useState<INetworkTemplate | null>(null);
  const [datasetSplit, setDatasetSplit] = useState<ITrainingDatasetSplit>({
    datasetId: '',
    datasetName: '',
    trainRatio: 80,
    valRatio: 15,
    testRatio: 5,
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateHyperParam = useCallback(
    <K extends keyof IHyperParams>(key: K, value: IHyperParams[K]) => {
      setHyperParams((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleDatasetChange = useCallback(
    (datasetId: string) => {
      const ds = MOCK_DATASETS.find((d) => d.id === datasetId);
      setDatasetSplit((prev) => ({
        ...prev,
        datasetId,
        datasetName: ds?.name ?? '',
      }));
    },
    [],
  );

  const handleTrainRatioChange = useCallback(
    (value: number[]) => {
      const train = value[0];
      const remaining = 100 - train;
      const val = Math.round(remaining * 0.75);
      const test = remaining - val;
      setDatasetSplit((prev) => ({ ...prev, trainRatio: train, valRatio: val, testRatio: test }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setHyperParams(DEFAULT_HYPER_PARAMS);
    setSelectedTemplate(null);
    setDatasetSplit({ datasetId: '', datasetName: '', trainRatio: 80, valRatio: 15, testRatio: 5 });
    setAdvancedOpen(false);
    toast.info('配置已重置');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedTemplate) {
      toast.error('请选择网络结构');
      return;
    }
    if (!datasetSplit.datasetId) {
      toast.error('请选择训练数据集');
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      toast.success('训练任务已创建！');
      logger.info('Training job created', {
        projectId,
        hyperParams,
        template: selectedTemplate.name,
        dataset: datasetSplit.datasetName,
      });
      navigate(`/training/monitor/job_${Date.now()}`);
    } catch (err) {
      logger.error('Create training job failed:', String(err));
      toast.error('创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }, [selectedTemplate, datasetSplit, hyperParams, projectId, navigate]);

  const gpuInfo = GPU_OPTIONS.find(
    (g) => g.value === (project?.hardware.gpuType ?? 'A100'),
  );
  const estimatedHours = Math.ceil(
    (hyperParams.epochs * (MOCK_DATASETS.find((d) => d.id === datasetSplit.datasetId)?.sampleCount ?? 50000)) /
      (hyperParams.batchSize * 3600),
  );
  const gpuPrice = gpuInfo ? (gpuInfo.value === 'A100' ? 3.06 : gpuInfo.value === 'V100' ? 2.48 : 0.95) : 3.06;
  const estimatedCost = (estimatedHours * gpuPrice * (project?.hardware.gpuCount ?? 1)).toFixed(2);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="heading-bold text-xl mb-2">项目未找到</h2>
        <p className="text-sm text-muted-foreground mb-6">
          项目 ID: {projectId} 不存在或已被删除
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回项目列表
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
              onClick={() => navigate('/projects')}
              className="flex items-center justify-center size-9 border border-black hover:bg-black hover:text-background transition-colors"
              aria-label="返回项目列表"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="heading-bold text-6xl leading-[0.9] tracking-tighter"
              >
                训练配置
              </motion.h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                项目：{project.name}
                <span className="ml-2 text-[10px] uppercase font-bold tracking-widest border border-black px-2 py-0.5">
                  {project.framework}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
            >
              <RotateCcw className="size-4" />
              重置
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold bg-black text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              <Play className="size-4" />
              {submitting ? '创建中...' : '开始训练'}
            </button>
          </div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            配置训练超参数、选择网络结构并划分数据集。右侧面板实时预览配置摘要与费用估算。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* 主体：左右分栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* 左栏：配置表单 (col-span-8) */}
        <div className="lg:col-span-8 border-r border-black">
          {/* 超参数配置 */}
          <div className="p-8 border-b border-black">
            <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
              <h2 className="heading-bold text-xl">超参数配置</h2>
              <ArrowUpRight className="size-4" />
            </div>

            <div className="space-y-6">
              {/* 学习率 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lr" className="text-xs uppercase font-bold tracking-widest">
                    学习率 (Learning Rate)
                  </Label>
                  <span className="text-xs font-mono tabular-nums font-bold">
                    {hyperParams.learningRate}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="lr"
                    type="range"
                    min={0.00001}
                    max={0.1}
                    step={0.0001}
                    value={hyperParams.learningRate}
                    onChange={(e) => updateHyperParam('learningRate', parseFloat(e.target.value))}
                    className="flex-1 h-2 appearance-none bg-black/10 border border-black accent-black"
                  />
                  <Input
                    type="number"
                    value={hyperParams.learningRate}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v > 0) updateHyperParam('learningRate', v);
                    }}
                    className="w-24 h-9 text-xs font-mono border-black bg-background"
                    step={0.0001}
                    min={0.00001}
                  />
                </div>
              </div>

              {/* Batch Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="batch" className="text-xs uppercase font-bold tracking-widest">
                    Batch Size
                  </Label>
                  <span className="text-xs font-mono tabular-nums font-bold">
                    {hyperParams.batchSize}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="batch"
                    type="range"
                    min={1}
                    max={256}
                    step={1}
                    value={hyperParams.batchSize}
                    onChange={(e) => updateHyperParam('batchSize', parseInt(e.target.value, 10))}
                    className="flex-1 h-2 appearance-none bg-black/10 border border-black accent-black"
                  />
                  <Input
                    type="number"
                    value={hyperParams.batchSize}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v > 0) updateHyperParam('batchSize', v);
                    }}
                    className="w-20 h-9 text-xs font-mono border-black bg-background"
                    min={1}
                  />
                </div>
              </div>

              {/* Epochs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="epochs" className="text-xs uppercase font-bold tracking-widest">
                    Epochs
                  </Label>
                  <span className="text-xs font-mono tabular-nums font-bold">
                    {hyperParams.epochs}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="epochs"
                    type="range"
                    min={1}
                    max={500}
                    step={1}
                    value={hyperParams.epochs}
                    onChange={(e) => updateHyperParam('epochs', parseInt(e.target.value, 10))}
                    className="flex-1 h-2 appearance-none bg-black/10 border border-black accent-black"
                  />
                  <Input
                    type="number"
                    value={hyperParams.epochs}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v > 0) updateHyperParam('epochs', v);
                    }}
                    className="w-20 h-9 text-xs font-mono border-black bg-background"
                    min={1}
                  />
                </div>
              </div>

              {/* 优化器 + 权重衰减 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-widest">优化器 (Optimizer)</Label>
                  <Select
                    value={hyperParams.optimizer}
                    onValueChange={(v) => updateHyperParam('optimizer', v as IHyperParams['optimizer'])}
                  >
                    <SelectTrigger className="border-black bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-black">
                      {OPTIMIZER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold">{opt.label}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{opt.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wd" className="text-xs uppercase font-bold tracking-widest">
                    权重衰减 (Weight Decay)
                  </Label>
                  <Input
                    id="wd"
                    type="number"
                    value={hyperParams.weightDecay}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0) updateHyperParam('weightDecay', v);
                    }}
                    className="border-black bg-background font-mono text-xs"
                    step={0.0001}
                    min={0}
                  />
                </div>
              </div>

              {/* 高级配置折叠 */}
              <div className="border-t border-black pt-4">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="flex items-center justify-between w-full text-xs uppercase font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>高级配置</span>
                  {advancedOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {advancedOpen && (
                  <div className="mt-4 space-y-4">
                    {/* 学习率调度器 */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold tracking-widest">学习率调度器 (LR Scheduler)</Label>
                      <Select
                        value={hyperParams.learningRateScheduler}
                        onValueChange={(v) =>
                          updateHyperParam('learningRateScheduler', v as IHyperParams['learningRateScheduler'])
                        }
                      >
                        <SelectTrigger className="border-black bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-black">
                          {LR_SCHEDULER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold">{opt.label}</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{opt.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 早停策略 */}
                    <div className="space-y-2">
                      <Label htmlFor="early-stop" className="text-xs uppercase font-bold tracking-widest">
                        早停耐心值 (Early Stopping Patience)
                      </Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="early-stop"
                          type="range"
                          min={1}
                          max={50}
                          step={1}
                          value={hyperParams.earlyStoppingPatience}
                          onChange={(e) => updateHyperParam('earlyStoppingPatience', parseInt(e.target.value, 10))}
                          className="flex-1 h-2 appearance-none bg-black/10 border border-black accent-black"
                        />
                        <span className="w-10 text-right text-xs font-mono tabular-nums font-bold">
                          {hyperParams.earlyStoppingPatience}
                        </span>
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        验证集指标连续 {hyperParams.earlyStoppingPatience} 个 epoch 未提升时停止训练
                      </p>
                    </div>

                    {/* 数据增强 */}
                    <div className="flex items-center justify-between border border-black p-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">数据增强 (Data Augmentation)</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                          随机翻转、旋转、裁剪等增强训练数据
                        </p>
                      </div>
                      <Switch
                        checked={hyperParams.dataAugmentation}
                        onCheckedChange={(v) => updateHyperParam('dataAugmentation', v)}
                        className="data-[state=checked]:bg-black"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 网络结构选择 */}
          <div className="p-8 border-b border-black">
            <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
              <h2 className="heading-bold text-xl">网络结构</h2>
              <ArrowUpRight className="size-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NETWORK_TEMPLATES.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template)}
                    className={`relative flex flex-col gap-2 border p-4 text-left transition-colors ${
                      isSelected
                        ? 'border-black bg-black text-background'
                        : 'border-black hover:bg-black hover:text-background'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute right-3 top-3 flex size-5 items-center justify-center bg-background">
                        <svg
                          className="size-3 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5">
                      <div className={`flex size-9 items-center justify-center text-lg ${isSelected ? 'bg-background/20' : 'bg-black/10'}`}>
                        {template.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{template.name}</p>
                        <p className={`text-[10px] uppercase font-bold tracking-widest ${isSelected ? 'text-background/60' : 'text-muted-foreground'}`}>
                          {template.paramsCount} 参数
                        </p>
                      </div>
                    </div>

                    <p className={`text-xs ${isSelected ? 'text-background/70' : 'text-muted-foreground'} line-clamp-2`}>
                      {template.description}
                    </p>

                    <span className={`inline-block w-fit text-[10px] uppercase font-bold tracking-widest border px-2 py-0.5 ${isSelected ? 'border-background text-background' : 'border-black'}`}>
                      {template.framework}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => toast.info('自定义网络结构功能即将开放')}
                className="flex flex-col items-center justify-center gap-2 border border-dashed border-black p-4 text-center hover:bg-black hover:text-background transition-colors"
              >
                <div className="flex size-9 items-center justify-center bg-black/10 text-xl">
                  🛠️
                </div>
                <p className="text-sm font-bold">自定义结构</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">即将开放</p>
              </button>
            </div>
          </div>

          {/* 数据集划分 */}
          <div className="p-8">
            <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
              <h2 className="heading-bold text-xl">数据集划分</h2>
              <ArrowUpRight className="size-4" />
            </div>

            <div className="space-y-6">
              {/* 数据集选择 */}
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-widest">
                  训练数据集 <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={datasetSplit.datasetId}
                  onValueChange={handleDatasetChange}
                >
                  <SelectTrigger className="border-black bg-background">
                    <SelectValue placeholder="选择数据集" />
                  </SelectTrigger>
                  <SelectContent className="border-black">
                    {MOCK_DATASETS.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{ds.name}</span>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                            {ds.sampleCount.toLocaleString()} 样本
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 比例滑块 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase font-bold tracking-widest">训练集比例</Label>
                  <span className="text-xs font-mono tabular-nums font-bold">
                    {datasetSplit.trainRatio}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={datasetSplit.trainRatio}
                  onChange={(e) => handleTrainRatioChange([parseInt(e.target.value, 10)])}
                  className="w-full h-2 appearance-none bg-black/10 border border-black accent-black"
                />
              </div>

              {/* 比例可视化 */}
              <div className="space-y-2">
                <div className="flex h-6 w-full overflow-hidden border border-black">
                  <div
                    className="flex items-center justify-center bg-black text-background text-[10px] uppercase font-bold tracking-widest transition-all"
                    style={{ width: `${datasetSplit.trainRatio}%` }}
                  >
                    训练 {datasetSplit.trainRatio}%
                  </div>
                  <div
                    className="flex items-center justify-center bg-[#888] text-white text-[10px] uppercase font-bold tracking-widest transition-all"
                    style={{ width: `${datasetSplit.valRatio}%` }}
                  >
                    验证 {datasetSplit.valRatio}%
                  </div>
                  <div
                    className="flex items-center justify-center bg-[#ccc] text-black text-[10px] uppercase font-bold tracking-widest transition-all"
                    style={{ width: `${datasetSplit.testRatio}%` }}
                  >
                    测试 {datasetSplit.testRatio}%
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 bg-black" />
                    训练集
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 bg-[#888]" />
                    验证集
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 bg-[#ccc]" />
                    测试集
                  </div>
                </div>
              </div>

              {/* 样本数估算 */}
              {datasetSplit.datasetId && (
                <div className="border border-black p-3">
                  <p className="text-xs font-medium">
                    预计样本分配：
                    <span className="ml-1 font-bold tabular-nums">
                      {Math.round(
                        (MOCK_DATASETS.find((d) => d.id === datasetSplit.datasetId)?.sampleCount ?? 0) *
                          (datasetSplit.trainRatio / 100),
                      ).toLocaleString()}
                    </span>
                    {' '}训练 /
                    <span className="ml-1 font-bold tabular-nums">
                      {Math.round(
                        (MOCK_DATASETS.find((d) => d.id === datasetSplit.datasetId)?.sampleCount ?? 0) *
                          (datasetSplit.valRatio / 100),
                      ).toLocaleString()}
                    </span>
                    {' '}验证 /
                    <span className="ml-1 font-bold tabular-nums">
                      {Math.round(
                        (MOCK_DATASETS.find((d) => d.id === datasetSplit.datasetId)?.sampleCount ?? 0) *
                          (datasetSplit.testRatio / 100),
                      ).toLocaleString()}
                    </span>
                    {' '}测试
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右栏：配置预览 (col-span-4) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-4 bg-card"
        >
          {/* 预览标题 */}
          <div className="p-8 border-b border-black">
            <div className="flex items-center gap-2 border-b border-black pb-4">
              <h2 className="heading-bold text-xl">配置预览</h2>
              <ArrowUpRight className="size-4" />
            </div>
          </div>

          {/* 项目信息 */}
          <div className="p-8 border-b border-black">
            <h3 className="heading-bold text-sm mb-4">项目信息</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">项目名称</span>
                <span className="text-xs font-bold truncate max-w-[160px]">{project.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">框架</span>
                <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-2 py-0.5">{project.framework}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">GPU</span>
                <span className="text-xs font-bold">{project.hardware.gpuType} × {project.hardware.gpuCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">内存</span>
                <span className="text-xs font-bold">{project.hardware.memoryGB} GB</span>
              </div>
            </div>
          </div>

          {/* 超参数摘要 */}
          <div className="p-8 border-b border-black">
            <h3 className="heading-bold text-sm mb-4">超参数摘要</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">学习率</span>
                <span className="text-xs font-mono font-bold">{hyperParams.learningRate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Batch Size</span>
                <span className="text-xs font-mono font-bold">{hyperParams.batchSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Epochs</span>
                <span className="text-xs font-mono font-bold">{hyperParams.epochs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">优化器</span>
                <span className="text-xs font-bold">{OPTIMIZER_OPTIONS.find((o) => o.value === hyperParams.optimizer)?.label ?? hyperParams.optimizer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">权重衰减</span>
                <span className="text-xs font-mono font-bold">{hyperParams.weightDecay}</span>
              </div>
              <div className="border-t border-black pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">LR 调度器</span>
                  <span className="text-xs font-bold">{LR_SCHEDULER_OPTIONS.find((o) => o.value === hyperParams.learningRateScheduler)?.label ?? '-'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">早停耐心</span>
                <span className="text-xs font-mono font-bold">{hyperParams.earlyStoppingPatience}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">数据增强</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest border px-2 py-0.5 ${hyperParams.dataAugmentation ? 'bg-black text-background border-black' : 'border-black'}`}>
                  {hyperParams.dataAugmentation ? '开启' : '关闭'}
                </span>
              </div>
            </div>
          </div>

          {/* 网络结构摘要 */}
          <div className="p-8 border-b border-black">
            <h3 className="heading-bold text-sm mb-4">网络结构</h3>
            {selectedTemplate ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center bg-black/10 text-base">
                    {selectedTemplate.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{selectedTemplate.name}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                      {selectedTemplate.paramsCount} 参数
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="text-2xl mb-2 opacity-40">🧠</div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">尚未选择网络结构</p>
              </div>
            )}
          </div>

          {/* 数据集摘要 */}
          <div className="p-8 border-b border-black">
            <h3 className="heading-bold text-sm mb-4">数据集</h3>
            {datasetSplit.datasetId ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">数据集</span>
                  <span className="text-xs font-bold">{datasetSplit.datasetName}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                    <span className="text-muted-foreground">训练集</span>
                    <span className="font-mono tabular-nums">{datasetSplit.trainRatio}%</span>
                  </div>
                  <div className="w-full h-2 border border-black overflow-hidden bg-black/10">
                    <div className="h-full bg-black transition-all duration-1000" style={{ width: `${datasetSplit.trainRatio}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                    <span className="text-muted-foreground">验证集</span>
                    <span className="font-mono tabular-nums">{datasetSplit.valRatio}%</span>
                  </div>
                  <div className="w-full h-2 border border-black overflow-hidden bg-black/10">
                    <div className="h-full bg-[#888] transition-all duration-1000" style={{ width: `${datasetSplit.valRatio}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                    <span className="text-muted-foreground">测试集</span>
                    <span className="font-mono tabular-nums">{datasetSplit.testRatio}%</span>
                  </div>
                  <div className="w-full h-2 border border-black overflow-hidden bg-black/10">
                    <div className="h-full bg-[#ccc] transition-all duration-1000" style={{ width: `${datasetSplit.testRatio}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="text-2xl mb-2 opacity-40">📊</div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">尚未选择数据集</p>
              </div>
            )}
          </div>

          {/* 费用估算 - 深色反转区块 */}
          <div className="p-8 bg-black text-background min-h-[200px] flex flex-col justify-between">
            <div>
              <h3 className="heading-bold text-xl mb-4">费用估算</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-background/60">GPU 规格</span>
                  <span className="text-xs font-bold">{gpuInfo?.label ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-background/60">GPU 数量</span>
                  <span className="text-xs font-bold">{project.hardware.gpuCount} 卡</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-background/60">预计时长</span>
                  <span className="text-xs font-bold">~{estimatedHours} 小时</span>
                </div>
                <div className="border-t border-background/20 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-background/60">GPU 单价</span>
                    <span className="text-xs font-mono font-bold">${gpuPrice}/小时/卡</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between border border-background/20 p-4">
                <span className="text-xs font-bold">预估总费用</span>
                <span className="heading-bold text-4xl tabular-nums">${estimatedCost}</span>
              </div>
              <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-background/40">
                * 费用为预估值，实际费用以训练完成后结算为准
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
