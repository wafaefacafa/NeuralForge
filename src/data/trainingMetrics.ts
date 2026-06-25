// EXPORTS: MOCK_TRAINING_METRICS, MOCK_TRAINING_LOGS, generateRealtimeMetrics

import type { ITrainingMetrics, ITrainingLog, ITrainingEpochMetrics } from '@/types/training';

// ---------------------------------------------------------------------------
// 初始 epoch 指标（已完成的前 15 个 epoch）
// ---------------------------------------------------------------------------
const INITIAL_EPOCH_METRICS: ITrainingEpochMetrics[] = [
  { epoch: 1, trainLoss: 2.3026, valLoss: 2.2851, trainAccuracy: 0.112, valAccuracy: 0.125, learningRate: 0.001, gpuUtilization: 92, gpuMemoryUsed: 18.4, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 48, estimatedRemaining: 912 },
  { epoch: 2, trainLoss: 1.8452, valLoss: 1.9203, trainAccuracy: 0.284, valAccuracy: 0.261, learningRate: 0.001, gpuUtilization: 94, gpuMemoryUsed: 18.6, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 96, estimatedRemaining: 864 },
  { epoch: 3, trainLoss: 1.5021, valLoss: 1.6134, trainAccuracy: 0.418, valAccuracy: 0.382, learningRate: 0.001, gpuUtilization: 93, gpuMemoryUsed: 18.5, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 144, estimatedRemaining: 816 },
  { epoch: 4, trainLoss: 1.2340, valLoss: 1.3891, trainAccuracy: 0.521, valAccuracy: 0.476, learningRate: 0.001, gpuUtilization: 95, gpuMemoryUsed: 18.7, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 192, estimatedRemaining: 768 },
  { epoch: 5, trainLoss: 1.0187, valLoss: 1.2105, trainAccuracy: 0.604, valAccuracy: 0.548, learningRate: 0.001, gpuUtilization: 91, gpuMemoryUsed: 18.3, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 240, estimatedRemaining: 720 },
  { epoch: 6, trainLoss: 0.8512, valLoss: 1.0723, trainAccuracy: 0.668, valAccuracy: 0.602, learningRate: 0.001, gpuUtilization: 94, gpuMemoryUsed: 18.5, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 288, estimatedRemaining: 672 },
  { epoch: 7, trainLoss: 0.7205, valLoss: 0.9634, trainAccuracy: 0.719, valAccuracy: 0.645, learningRate: 0.001, gpuUtilization: 93, gpuMemoryUsed: 18.4, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 336, estimatedRemaining: 624 },
  { epoch: 8, trainLoss: 0.6158, valLoss: 0.8751, trainAccuracy: 0.759, valAccuracy: 0.680, learningRate: 0.001, gpuUtilization: 92, gpuMemoryUsed: 18.6, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 384, estimatedRemaining: 576 },
  { epoch: 9, trainLoss: 0.5312, valLoss: 0.8023, trainAccuracy: 0.792, valAccuracy: 0.709, learningRate: 0.001, gpuUtilization: 95, gpuMemoryUsed: 18.7, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 432, estimatedRemaining: 528 },
  { epoch: 10, trainLoss: 0.4623, valLoss: 0.7412, trainAccuracy: 0.819, valAccuracy: 0.733, learningRate: 0.0005, gpuUtilization: 94, gpuMemoryUsed: 18.5, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 480, estimatedRemaining: 480 },
  { epoch: 11, trainLoss: 0.4051, valLoss: 0.6905, trainAccuracy: 0.841, valAccuracy: 0.752, learningRate: 0.0005, gpuUtilization: 93, gpuMemoryUsed: 18.4, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 528, estimatedRemaining: 432 },
  { epoch: 12, trainLoss: 0.3578, valLoss: 0.6481, trainAccuracy: 0.859, valAccuracy: 0.768, learningRate: 0.0005, gpuUtilization: 92, gpuMemoryUsed: 18.3, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 576, estimatedRemaining: 384 },
  { epoch: 13, trainLoss: 0.3184, valLoss: 0.6127, trainAccuracy: 0.874, valAccuracy: 0.781, learningRate: 0.0005, gpuUtilization: 94, gpuMemoryUsed: 18.5, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 624, estimatedRemaining: 336 },
  { epoch: 14, trainLoss: 0.2856, valLoss: 0.5832, trainAccuracy: 0.887, valAccuracy: 0.792, learningRate: 0.00025, gpuUtilization: 93, gpuMemoryUsed: 18.4, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 672, estimatedRemaining: 288 },
  { epoch: 15, trainLoss: 0.2581, valLoss: 0.5589, trainAccuracy: 0.898, valAccuracy: 0.801, learningRate: 0.00025, gpuUtilization: 95, gpuMemoryUsed: 18.6, gpuMemoryTotal: 24, step: 50, totalSteps: 50, elapsedTime: 720, estimatedRemaining: 240 },
];

// ---------------------------------------------------------------------------
// 初始训练指标快照
// ---------------------------------------------------------------------------
export const MOCK_TRAINING_METRICS: ITrainingMetrics = {
  jobId: 'train-job-20240625-001',
  currentEpoch: 15,
  totalEpochs: 20,
  status: 'running',
  epochMetrics: [...INITIAL_EPOCH_METRICS],
  bestValLoss: 0.5589,
  bestValAccuracy: 0.801,
  startedAt: '2026-06-25T08:00:00Z',
  updatedAt: '2026-06-25T08:12:00Z',
  config: {
    projectId: 'proj-001',
    projectName: '图像分类 ResNet-50',
    hyperParams: {
      learningRate: 0.001,
      batchSize: 64,
      epochs: 20,
      optimizer: 'adam',
      weightDecay: 0.0001,
      learningRateScheduler: 'cosine',
      earlyStoppingPatience: 5,
      dataAugmentation: true,
    },
    networkTemplate: {
      id: 'resnet50',
      name: 'ResNet-50',
      description: '50层残差网络，适用于图像分类任务',
      framework: 'pytorch',
      paramsCount: '25.6M',
      icon: '🧠',
    },
    datasetSplit: {
      datasetId: 'ds-001',
      datasetName: 'ImageNet-subset',
      trainRatio: 80,
      valRatio: 10,
      testRatio: 10,
    },
    gpuType: 'NVIDIA A100',
    gpuCount: 1,
    createdAt: '2026-06-25T07:55:00Z',
  },
};

// ---------------------------------------------------------------------------
// 初始训练日志
// ---------------------------------------------------------------------------
export const MOCK_TRAINING_LOGS: ITrainingLog[] = [
  { id: 'log-1', timestamp: '2026-06-25T08:00:01Z', level: 'info', message: '训练任务已启动，Job ID: train-job-20240625-001' },
  { id: 'log-2', timestamp: '2026-06-25T08:00:02Z', level: 'info', message: '加载数据集: ImageNet-subset (80/10/10 split)' },
  { id: 'log-3', timestamp: '2026-06-25T08:00:03Z', level: 'info', message: '初始化模型: ResNet-50 (25.6M params)' },
  { id: 'log-4', timestamp: '2026-06-25T08:00:04Z', level: 'info', message: '优化器: Adam (lr=0.001, weight_decay=0.0001)' },
  { id: 'log-5', timestamp: '2026-06-25T08:00:05Z', level: 'info', message: '学习率调度器: CosineAnnealingLR' },
  { id: 'log-6', timestamp: '2026-06-25T08:00:06Z', level: 'info', message: 'GPU 设备: NVIDIA A100 (24GB), 已分配 18.4GB' },
  { id: 'log-7', timestamp: '2026-06-25T08:00:07Z', level: 'info', message: '数据增强: 已启用 (RandomCrop, RandomHorizontalFlip, ColorJitter)' },
  { id: 'log-8', timestamp: '2026-06-25T08:00:08Z', level: 'info', message: '开始训练...' },
  { id: 'log-9', timestamp: '2026-06-25T08:00:56Z', level: 'info', message: 'Epoch 1/20 完成 | Train Loss: 2.3026 | Val Loss: 2.2851 | Val Acc: 12.5%', epoch: 1 },
  { id: 'log-10', timestamp: '2026-06-25T08:01:44Z', level: 'info', message: 'Epoch 2/20 完成 | Train Loss: 1.8452 | Val Loss: 1.9203 | Val Acc: 26.1%', epoch: 2 },
  { id: 'log-11', timestamp: '2026-06-25T08:02:32Z', level: 'info', message: 'Epoch 3/20 完成 | Train Loss: 1.5021 | Val Loss: 1.6134 | Val Acc: 38.2%', epoch: 3 },
  { id: 'log-12', timestamp: '2026-06-25T08:03:20Z', level: 'info', message: 'Epoch 4/20 完成 | Train Loss: 1.2340 | Val Loss: 1.3891 | Val Acc: 47.6%', epoch: 4 },
  { id: 'log-13', timestamp: '2026-06-25T08:04:08Z', level: 'info', message: 'Epoch 5/20 完成 | Train Loss: 1.0187 | Val Loss: 1.2105 | Val Acc: 54.8%', epoch: 5 },
  { id: 'log-14', timestamp: '2026-06-25T08:04:56Z', level: 'info', message: 'Epoch 6/20 完成 | Train Loss: 0.8512 | Val Loss: 1.0723 | Val Acc: 60.2%', epoch: 6 },
  { id: 'log-15', timestamp: '2026-06-25T08:05:44Z', level: 'info', message: 'Epoch 7/20 完成 | Train Loss: 0.7205 | Val Loss: 0.9634 | Val Acc: 64.5%', epoch: 7 },
  { id: 'log-16', timestamp: '2026-06-25T08:06:32Z', level: 'info', message: 'Epoch 8/20 完成 | Train Loss: 0.6158 | Val Loss: 0.8751 | Val Acc: 68.0%', epoch: 8 },
  { id: 'log-17', timestamp: '2026-06-25T08:07:20Z', level: 'info', message: 'Epoch 9/20 完成 | Train Loss: 0.5312 | Val Loss: 0.8023 | Val Acc: 70.9%', epoch: 9 },
  { id: 'log-18', timestamp: '2026-06-25T08:08:08Z', level: 'info', message: 'Epoch 10/20 完成 | Train Loss: 0.4623 | Val Loss: 0.7412 | Val Acc: 73.3% | LR 调整为 0.0005', epoch: 10 },
  { id: 'log-19', timestamp: '2026-06-25T08:08:56Z', level: 'info', message: 'Epoch 11/20 完成 | Train Loss: 0.4051 | Val Loss: 0.6905 | Val Acc: 75.2%', epoch: 11 },
  { id: 'log-20', timestamp: '2026-06-25T08:09:44Z', level: 'info', message: 'Epoch 12/20 完成 | Train Loss: 0.3578 | Val Loss: 0.6481 | Val Acc: 76.8%', epoch: 12 },
  { id: 'log-21', timestamp: '2026-06-25T08:10:32Z', level: 'info', message: 'Epoch 13/20 完成 | Train Loss: 0.3184 | Val Loss: 0.6127 | Val Acc: 78.1%', epoch: 13 },
  { id: 'log-22', timestamp: '2026-06-25T08:11:20Z', level: 'info', message: 'Epoch 14/20 完成 | Train Loss: 0.2856 | Val Loss: 0.5832 | Val Acc: 79.2% | LR 调整为 0.00025', epoch: 14 },
  { id: 'log-23', timestamp: '2026-06-25T08:12:08Z', level: 'info', message: 'Epoch 15/20 完成 | Train Loss: 0.2581 | Val Loss: 0.5589 | Val Acc: 80.1%', epoch: 15 },
  { id: 'log-24', timestamp: '2026-06-25T08:12:09Z', level: 'warn', message: 'GPU 温度: 72°C，接近阈值 (75°C)', epoch: 15 },
  { id: 'log-25', timestamp: '2026-06-25T08:12:10Z', level: 'debug', message: 'Gradient norm: 0.0423, Weight norm: 12.851', epoch: 15, step: 45 },
];

// ---------------------------------------------------------------------------
// 实时指标生成器（供 setInterval 调用，模拟训练进行中）
// ---------------------------------------------------------------------------

let _simEpoch = 15;
let _simStep = 0;
const STEPS_PER_EPOCH = 50;

/**
 * 生成下一个训练 epoch 的模拟指标。
 * 每次调用推进 1 个 step；每 STEPS_PER_EPOCH 步完成一个 epoch。
 *
 * @returns 新的 epoch 指标（仅当 epoch 完成时返回），否则返回 null
 */
export function generateRealtimeMetrics(): ITrainingEpochMetrics | null {
  _simStep += 1;

  if (_simStep < STEPS_PER_EPOCH) {
    return null; // epoch 未完成
  }

  _simStep = 0;
  _simEpoch += 1;

  if (_simEpoch > 20) {
    return null; // 训练已完成
  }

  // 模拟 loss 继续下降、accuracy 继续上升（带随机噪声）
  const prev = INITIAL_EPOCH_METRICS[INITIAL_EPOCH_METRICS.length - 1];
  const progress = (_simEpoch - 15) / 5; // 0 → 1
  const noise = () => (Math.random() - 0.5) * 0.015;

  const trainLoss = Math.max(0.05, prev.trainLoss * (1 - 0.12 * progress) + noise());
  const valLoss = Math.max(0.1, prev.valLoss * (1 - 0.10 * progress) + noise());
  const trainAccuracy = Math.min(0.99, prev.trainAccuracy + 0.015 * progress + noise());
  const valAccuracy = Math.min(0.95, prev.valAccuracy + 0.012 * progress + noise());
  const gpuUtil = 88 + Math.floor(Math.random() * 10);
  const gpuMem = 18.2 + Math.random() * 0.8;
  const elapsed = 720 + (_simEpoch - 15) * 48;
  const remaining = Math.max(0, 960 - elapsed);

  return {
    epoch: _simEpoch,
    trainLoss: Math.round(trainLoss * 10000) / 10000,
    valLoss: Math.round(valLoss * 10000) / 10000,
    trainAccuracy: Math.round(trainAccuracy * 1000) / 1000,
    valAccuracy: Math.round(valAccuracy * 1000) / 1000,
    learningRate: _simEpoch >= 18 ? 0.0001 : 0.00025,
    gpuUtilization: gpuUtil,
    gpuMemoryUsed: Math.round(gpuMem * 10) / 10,
    gpuMemoryTotal: 24,
    step: STEPS_PER_EPOCH,
    totalSteps: STEPS_PER_EPOCH,
    elapsedTime: elapsed,
    estimatedRemaining: remaining,
  };
}

/**
 * 生成一条模拟训练日志。
 *
 * @param epoch 当前 epoch 编号
 * @param trainLoss 训练 loss
 * @param valLoss 验证 loss
 * @param valAccuracy 验证准确率
 * @returns 新的日志条目
 */
export function generateRealtimeLog(
  epoch: number,
  trainLoss: number,
  valLoss: number,
  valAccuracy: number,
): ITrainingLog {
  const now = new Date();
  const ts = now.toISOString().replace(/\.\d{3}Z$/, 'Z');

  const messages: string[] = [
    `Epoch ${epoch}/20 完成 | Train Loss: ${trainLoss.toFixed(4)} | Val Loss: ${valLoss.toFixed(4)} | Val Acc: ${(valAccuracy * 100).toFixed(1)}%`,
  ];

  if (epoch === 18) {
    messages.push('LR 调整为 0.0001');
  }

  if (epoch === 20) {
    messages.push('训练完成！Best Val Loss: 0.4231, Best Val Accuracy: 0.942');
  }

  return {
    id: `log-rt-${epoch}-${Date.now()}`,
    timestamp: ts,
    level: epoch === 20 ? 'info' : 'info',
    message: messages.join(' | '),
    epoch,
  };
}

/**
 * 重置模拟状态（用于重新开始训练模拟）
 */
export function resetRealtimeSimulation(): void {
  _simEpoch = 15;
  _simStep = 0;
}
