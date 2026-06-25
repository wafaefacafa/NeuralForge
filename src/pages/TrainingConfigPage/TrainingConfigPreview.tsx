import { memo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Layers, Database, Zap, Clock, BarChart3 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ITrainingConfig } from '@/types/training';

interface TrainingConfigPreviewProps {
  config: ITrainingConfig;
}

function TrainingConfigPreview({ config }: TrainingConfigPreviewProps) {
  const { hyperParams, networkTemplate, datasetSplit, gpuType, gpuCount, projectName } = config;

  const estimatedTimePerEpoch = hyperParams.batchSize >= 64 ? '~3.2 min' : '~5.8 min';
  const totalEstimatedTime =
    hyperParams.batchSize >= 64
      ? `~${Math.round((hyperParams.epochs * 3.2) / 60)} 小时`
      : `~${Math.round((hyperParams.epochs * 5.8) / 60)} 小时`;

  const optimizerLabels: Record<string, string> = {
    adam: 'Adam',
    sgd: 'SGD',
    adamw: 'AdamW',
  };

  const schedulerLabels: Record<string, string> = {
    cosine: 'Cosine Annealing',
    step: 'Step Decay',
    plateau: 'Reduce on Plateau',
    none: '无',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {/* 项目信息 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="size-4 text-foreground" />
            配置摘要
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">项目</span>
            <span className="text-sm font-medium text-foreground">{projectName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">框架</span>
            <Badge variant="secondary" className="text-xs">
              {networkTemplate.framework.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">网络结构</span>
            <span className="text-sm font-medium text-foreground">{networkTemplate.name}</span>
          </div>
        </CardContent>
      </Card>

      {/* 超参数 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="size-4 text-foreground" />
            超参数
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <ConfigRow label="学习率" value={hyperParams.learningRate.toExponential(1)} />
          <ConfigRow label="Batch Size" value={String(hyperParams.batchSize)} />
          <ConfigRow label="Epochs" value={String(hyperParams.epochs)} />
          <ConfigRow
            label="优化器"
            value={optimizerLabels[hyperParams.optimizer] || hyperParams.optimizer}
          />
          <ConfigRow label="权重衰减" value={hyperParams.weightDecay.toExponential(1)} />
          <ConfigRow
            label="学习率调度"
            value={schedulerLabels[hyperParams.learningRateScheduler] || hyperParams.learningRateScheduler}
          />
          <ConfigRow
            label="早停耐心"
            value={hyperParams.earlyStoppingPatience > 0 ? `${hyperParams.earlyStoppingPatience} epochs` : '关闭'}
          />
          <ConfigRow
            label="数据增强"
            value={hyperParams.dataAugmentation ? '开启' : '关闭'}
          />
        </CardContent>
      </Card>

      {/* 数据集划分 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="size-4 text-foreground" />
            数据集划分
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">数据集</span>
            <span className="text-sm font-medium text-foreground">{datasetSplit.datasetName}</span>
          </div>
          <Separator className="bg-black" />
          {/* 比例可视化条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">训练集</span>
              <span className="font-semibold tabular-nums text-foreground">{datasetSplit.trainRatio}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden bg-muted">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${datasetSplit.trainRatio}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">验证集</span>
              <span className="font-semibold tabular-nums text-foreground">{datasetSplit.valRatio}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden bg-muted">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${datasetSplit.valRatio}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">测试集</span>
              <span className="font-semibold tabular-nums text-foreground">{datasetSplit.testRatio}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden bg-muted">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${datasetSplit.testRatio}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 硬件资源 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Cpu className="size-4 text-foreground" />
            硬件资源
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <ConfigRow label="GPU 型号" value={gpuType} />
          <ConfigRow label="GPU 数量" value={`${gpuCount} 卡`} />
          <ConfigRow
            label="网络参数量"
            value={networkTemplate.paramsCount}
          />
        </CardContent>
      </Card>

      {/* 预估信息 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="size-4 text-warning" />
            预估信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <ConfigRow label="每 Epoch 耗时" value={estimatedTimePerEpoch} />
          <ConfigRow label="总预估时长" value={totalEstimatedTime} />
          <ConfigRow
            label="预估费用"
            value={`$${((hyperParams.epochs * (gpuCount * 3.2)) / 60).toFixed(1)}/h`}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** 配置行：label + value 两端对齐 */
function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export default memo(TrainingConfigPreview);
