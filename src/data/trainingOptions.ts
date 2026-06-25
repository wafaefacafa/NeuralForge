// EXPORTS: NETWORK_TEMPLATES, OPTIMIZER_OPTIONS, LR_SCHEDULER_OPTIONS, EARLY_STOPPING_OPTIONS, DATA_AUGMENTATION_OPTIONS, GPU_TYPE_OPTIONS, GPU_COUNT_OPTIONS, MEMORY_OPTIONS, DEFAULT_HYPERPARAMS

import type { INetworkTemplate, IHyperParams } from '@/types/training';

export const NETWORK_TEMPLATES: INetworkTemplate[] = [
  {
    id: 'resnet50',
    name: 'ResNet-50',
    description: '经典残差网络，50层深度，适合图像分类任务',
    framework: 'pytorch',
    paramsCount: '25.6M',
    icon: '🧠',
  },
  {
    id: 'vgg16',
    name: 'VGG-16',
    description: '16层卷积网络，结构简洁，适合迁移学习',
    framework: 'pytorch',
    paramsCount: '138M',
    icon: '🔍',
  },
  {
    id: 'efficientnet',
    name: 'EfficientNet-B0',
    description: '高效网络架构，平衡精度与计算效率',
    framework: 'tensorflow',
    paramsCount: '5.3M',
    icon: '⚡',
  },
  {
    id: 'vit_base',
    name: 'ViT-Base',
    description: 'Vision Transformer，基于自注意力的图像模型',
    framework: 'pytorch',
    paramsCount: '86M',
    icon: '👁️',
  },
  {
    id: 'custom',
    name: '自定义网络',
    description: '上传或编写自定义网络结构',
    framework: 'pytorch',
    paramsCount: '-',
    icon: '🛠️',
  },
];

export const OPTIMIZER_OPTIONS = [
  { value: 'adam', label: 'Adam', description: '自适应矩估计，默认推荐' },
  { value: 'sgd', label: 'SGD', description: '随机梯度下降，带动量' },
  { value: 'adamw', label: 'AdamW', description: 'Adam + 解耦权重衰减' },
] as const;

export const LR_SCHEDULER_OPTIONS = [
  { value: 'cosine', label: 'Cosine Annealing', description: '余弦退火调度' },
  { value: 'step', label: 'Step Decay', description: '阶梯式衰减' },
  { value: 'plateau', label: 'Reduce on Plateau', description: '平台期衰减' },
  { value: 'none', label: '固定学习率', description: '不调整学习率' },
] as const;

export const EARLY_STOPPING_OPTIONS = [
  { value: 0, label: '不使用' },
  { value: 5, label: '5 epochs' },
  { value: 10, label: '10 epochs' },
  { value: 15, label: '15 epochs' },
  { value: 20, label: '20 epochs' },
] as const;

export const DATA_AUGMENTATION_OPTIONS = [
  { value: 'none', label: '不使用增强' },
  { value: 'basic', label: '基础增强（翻转、旋转、裁剪）' },
  { value: 'advanced', label: '高级增强（MixUp、CutMix、RandAugment）' },
] as const;

export const GPU_TYPE_OPTIONS = [
  { value: 'A100', label: 'NVIDIA A100 80GB', description: '顶级训练GPU，适合大模型' },
  { value: 'V100', label: 'NVIDIA V100 32GB', description: '高性能训练GPU' },
  { value: 'T4', label: 'NVIDIA T4 16GB', description: '推理与小规模训练' },
] as const;

export const GPU_COUNT_OPTIONS = [1, 2, 4, 8] as const;

export const MEMORY_OPTIONS = [
  { value: 32, label: '32 GB' },
  { value: 64, label: '64 GB' },
  { value: 128, label: '128 GB' },
  { value: 256, label: '256 GB' },
] as const;

export const DEFAULT_HYPERPARAMS: IHyperParams = {
  learningRate: 0.001,
  batchSize: 32,
  epochs: 50,
  optimizer: 'adam',
  weightDecay: 0.0001,
  learningRateScheduler: 'cosine',
  earlyStoppingPatience: 10,
  dataAugmentation: true,
};
