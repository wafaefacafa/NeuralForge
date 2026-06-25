import { useState, useCallback, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Info, ChevronDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { IHyperParams, INetworkTemplate, ITrainingDatasetSplit } from '@/types/training';
import { MOCK_DATASETS } from '@/data/datasets';
import { NETWORK_TEMPLATES, OPTIMIZER_OPTIONS, LR_SCHEDULER_OPTIONS } from '@/data/trainingOptions';

interface TrainingConfigFormProps {
  projectId: string;
  projectName: string;
  onSubmit: (config: {
    hyperParams: IHyperParams;
    networkTemplate: INetworkTemplate;
    datasetSplit: ITrainingDatasetSplit;
  }) => void;
}

export default function TrainingConfigForm({ projectId, projectName, onSubmit }: TrainingConfigFormProps) {
  const [hyperParams, setHyperParams] = useState<IHyperParams>({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 50,
    optimizer: 'adam',
    weightDecay: 0.0001,
    learningRateScheduler: 'cosine',
    earlyStoppingPatience: 10,
    dataAugmentation: true,
  });

  const [selectedNetwork, setSelectedNetwork] = useState<INetworkTemplate>(NETWORK_TEMPLATES[0]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(MOCK_DATASETS[0]?.id ?? '');
  const [trainRatio, setTrainRatio] = useState(80);
  const [valRatio, setValRatio] = useState(15);
  const [testRatio, setTestRatio] = useState(5);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const selectedDataset = MOCK_DATASETS.find((d) => d.id === selectedDatasetId);

  const handleRatioChange = useCallback(
    (type: 'train' | 'val' | 'test', value: number[]) => {
      const v = value[0];
      if (type === 'train') {
        const newTrain = v;
        const remaining = 100 - newTrain;
        const newVal = Math.min(valRatio, remaining);
        const newTest = remaining - newVal;
        setTrainRatio(newTrain);
        setValRatio(newVal);
        setTestRatio(newTest);
      } else if (type === 'val') {
        const newVal = v;
        const remaining = 100 - testRatio;
        const clampedVal = Math.min(newVal, remaining);
        setValRatio(clampedVal);
        setTrainRatio(remaining - clampedVal);
      } else {
        const newTest = v;
        const remaining = 100 - trainRatio;
        const clampedTest = Math.min(newTest, remaining);
        setTestRatio(clampedTest);
        setValRatio(remaining - clampedTest);
      }
    },
    [trainRatio, valRatio, testRatio],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      if (!selectedDataset) {
        toast.error('请选择训练数据集');
        return;
      }

      const datasetSplit: ITrainingDatasetSplit = {
        datasetId: selectedDataset.id,
        datasetName: selectedDataset.name,
        trainRatio: trainRatio / 100,
        valRatio: valRatio / 100,
        testRatio: testRatio / 100,
      };

      onSubmit({
        hyperParams,
        networkTemplate: selectedNetwork,
        datasetSplit,
      });

      toast.success('训练配置已提交，正在创建训练任务...');
    },
    [hyperParams, selectedNetwork, selectedDataset, trainRatio, valRatio, testRatio, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 网络结构选择 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">网络结构</CardTitle>
          <CardDescription className="text-xs">选择预置网络模板或自定义网络结构</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {NETWORK_TEMPLATES.map((template) => {
              const isSelected = selectedNetwork.id === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedNetwork(template)}
                  className={`relative flex flex-col items-start gap-2 border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-black bg-foreground text-background'
                      : 'border-black bg-card hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold truncate ${isSelected ? 'text-background' : 'text-foreground'}`}>{template.name}</span>
                      <span className={`block text-[11px] ${isSelected ? 'text-background/60' : 'text-muted-foreground'}`}>{template.paramsCount}</span>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="shrink-0 text-[10px] h-5 px-1.5 bg-background text-foreground border-background">
                        已选
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs line-clamp-2 ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>{template.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 超参数配置 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">超参数配置</CardTitle>
          <CardDescription className="text-xs">调整模型训练的核心超参数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 学习率 */}
            <div className="space-y-2">
              <Label htmlFor="learningRate" className="text-xs font-medium flex items-center gap-1.5">
                学习率 (Learning Rate)
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs">
                      控制每次参数更新的步长。过大可能不收敛，过小训练缓慢。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="learningRate"
                type="number"
                step="0.0001"
                min="0.00001"
                max="1"
                value={hyperParams.learningRate}
                onChange={(e) =>
                  setHyperParams((prev) => ({ ...prev, learningRate: parseFloat(e.target.value) || 0.001 }))
                }
                className="h-9 font-mono text-sm"
              />
            </div>

            {/* Batch Size */}
            <div className="space-y-2">
              <Label htmlFor="batchSize" className="text-xs font-medium flex items-center gap-1.5">
                Batch Size
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs">
                      每次迭代使用的样本数量。受 GPU 显存限制。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="batchSize"
                type="number"
                step="8"
                min="1"
                max="512"
                value={hyperParams.batchSize}
                onChange={(e) =>
                  setHyperParams((prev) => ({ ...prev, batchSize: parseInt(e.target.value, 10) || 32 }))
                }
                className="h-9 font-mono text-sm"
              />
            </div>

            {/* Epochs */}
            <div className="space-y-2">
              <Label htmlFor="epochs" className="text-xs font-medium flex items-center gap-1.5">
                Epochs
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs">
                      完整遍历训练数据集的次数。配合早停策略使用。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="epochs"
                type="number"
                step="10"
                min="1"
                max="500"
                value={hyperParams.epochs}
                onChange={(e) =>
                  setHyperParams((prev) => ({ ...prev, epochs: parseInt(e.target.value, 10) || 50 }))
                }
                className="h-9 font-mono text-sm"
              />
            </div>

            {/* 优化器 */}
            <div className="space-y-2">
              <Label htmlFor="optimizer" className="text-xs font-medium">
                优化器 (Optimizer)
              </Label>
              <Select
                value={hyperParams.optimizer}
                onValueChange={(v) =>
                  setHyperParams((prev) => ({ ...prev, optimizer: v as IHyperParams['optimizer'] }))
                }
              >
                <SelectTrigger id="optimizer" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPTIMIZER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 权重衰减 */}
            <div className="space-y-2">
              <Label htmlFor="weightDecay" className="text-xs font-medium flex items-center gap-1.5">
                权重衰减 (Weight Decay)
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs">
                      L2 正则化系数，防止过拟合。通常设为 1e-4 ~ 1e-2。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="weightDecay"
                type="number"
                step="0.0001"
                min="0"
                max="1"
                value={hyperParams.weightDecay}
                onChange={(e) =>
                  setHyperParams((prev) => ({ ...prev, weightDecay: parseFloat(e.target.value) || 0 }))
                }
                className="h-9 font-mono text-sm"
              />
            </div>

            {/* 学习率调度器 */}
            <div className="space-y-2">
              <Label htmlFor="lrScheduler" className="text-xs font-medium">
                学习率调度器
              </Label>
              <Select
                value={hyperParams.learningRateScheduler}
                onValueChange={(v) =>
                  setHyperParams((prev) => ({
                    ...prev,
                    learningRateScheduler: v as IHyperParams['learningRateScheduler'],
                  }))
                }
              >
                <SelectTrigger id="lrScheduler" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LR_SCHEDULER_OPTIONS.map((sched) => (
                    <SelectItem key={sched.value} value={sched.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{sched.label}</span>
                        <span className="text-[11px] text-muted-foreground">{sched.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据集划分 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">数据集划分</CardTitle>
          <CardDescription className="text-xs">选择训练数据集并配置训练/验证/测试集比例</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 数据集选择 */}
          <div className="space-y-2">
            <Label htmlFor="dataset" className="text-xs font-medium">
              训练数据集
            </Label>
            <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
              <SelectTrigger id="dataset" className="h-9 text-sm">
                <SelectValue placeholder="选择数据集" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_DATASETS.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{ds.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {ds.sampleCount.toLocaleString()} 样本 · {ds.size}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDataset && (
              <p className="text-[11px] text-muted-foreground">
                格式: {selectedDataset.format.toUpperCase()} · 类别: {selectedDataset.category} · 版本: {selectedDataset.version}
              </p>
            )}
          </div>

          {/* 比例滑块 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">训练集</Label>
                <span className="text-xs font-mono tabular-nums text-foreground font-semibold">{trainRatio}%</span>
              </div>
              <Slider
                value={[trainRatio]}
                onValueChange={(v) => handleRatioChange('train', v)}
                min={50}
                max={95}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">验证集</Label>
                <span className="text-xs font-mono tabular-nums text-muted-foreground font-semibold">{valRatio}%</span>
              </div>
              <Slider
                value={[valRatio]}
                onValueChange={(v) => handleRatioChange('val', v)}
                min={0}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">测试集</Label>
                <span className="text-xs font-mono tabular-nums text-muted-foreground">{testRatio}%</span>
              </div>
              <Slider
                value={[testRatio]}
                onValueChange={(v) => handleRatioChange('test', v)}
                min={0}
                max={30}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* 比例可视化条 */}
          <div className="flex h-2 overflow-hidden border border-black">
            <div
              className="bg-foreground transition-all duration-300"
              style={{ width: `${trainRatio}%` }}
            />
            <div
              className="bg-muted transition-all duration-300"
              style={{ width: `${valRatio}%` }}
            />
            <div
              className="bg-muted-foreground/30 transition-all duration-300"
              style={{ width: `${testRatio}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2 bg-foreground" />
              训练集
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 bg-muted border border-black" />
              验证集
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 bg-muted-foreground/30" />
              测试集
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 高级配置 */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <Card className="border-black bg-card">
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">高级配置</CardTitle>
                  <CardDescription className="text-xs">学习率调度器、早停策略、数据增强</CardDescription>
                </div>
                <ChevronDown
                  className={`size-4 text-muted-foreground transition-transform duration-200 ${
                    advancedOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-5 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 早停策略 */}
                <div className="space-y-2">
                  <Label htmlFor="earlyStopping" className="text-xs font-medium flex items-center gap-1.5">
                    早停耐心值 (Early Stopping Patience)
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                          验证集指标连续 N 个 epoch 不提升则提前停止训练。0 表示禁用。
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="earlyStopping"
                    type="number"
                    step="5"
                    min="0"
                    max="100"
                    value={hyperParams.earlyStoppingPatience}
                    onChange={(e) =>
                      setHyperParams((prev) => ({
                        ...prev,
                        earlyStoppingPatience: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="h-9 font-mono text-sm"
                  />
                </div>

                {/* 数据增强 */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    数据增强 (Data Augmentation)
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                          随机翻转、旋转、裁剪等增强训练数据，提升模型泛化能力。
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex items-center gap-3 pt-1">
                    <Switch
                      id="dataAugmentation"
                      checked={hyperParams.dataAugmentation}
                      onCheckedChange={(checked) =>
                        setHyperParams((prev) => ({ ...prev, dataAugmentation: checked }))
                      }
                    />
                    <Label htmlFor="dataAugmentation" className="text-xs text-muted-foreground cursor-pointer">
                      {hyperParams.dataAugmentation ? '已启用 — 随机翻转、旋转、色彩抖动' : '已禁用'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 提交按钮 */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="lg" onClick={() => toast.info('配置已重置')}>
          重置
        </Button>
        <Button type="submit" size="lg" className="gap-2">
          开始训练
        </Button>
      </div>
    </form>
  );
}
