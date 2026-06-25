// EXPORTS: MOCK_PROJECTS, PROJECT_FRAMEWORKS, PROJECT_STATUS_MAP, GPU_OPTIONS, MEMORY_OPTIONS

import type { IProject, IProjectFramework, IProjectStatus } from '@/types/projects';

export const PROJECT_FRAMEWORKS: { value: IProjectFramework; label: string; icon: string }[] = [
  { value: 'PyTorch', label: 'PyTorch', icon: '🔥' },
  { value: 'TensorFlow', label: 'TensorFlow', icon: '🧠' },
  { value: 'JAX', label: 'JAX', icon: '⚡' },
];

export const PROJECT_STATUS_MAP: Record<IProjectStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  active: { label: '活跃', variant: 'default' },
  training: { label: '训练中', variant: 'secondary' },
  deployed: { label: '已部署', variant: 'outline' },
  archived: { label: '已归档', variant: 'destructive' },
};

export const GPU_OPTIONS = [
  { value: 'A100', label: 'NVIDIA A100 80GB', vram: '80GB', cores: 6912 },
  { value: 'V100', label: 'NVIDIA V100 32GB', vram: '32GB', cores: 5120 },
  { value: 'T4', label: 'NVIDIA T4 16GB', vram: '16GB', cores: 2560 },
] as const;

export const MEMORY_OPTIONS = [
  { value: 32, label: '32 GB' },
  { value: 64, label: '64 GB' },
  { value: 128, label: '128 GB' },
  { value: 256, label: '256 GB' },
] as const;

export const MOCK_PROJECTS: IProject[] = [
  {
    id: '1',
    name: '图像分类 ResNet-50',
    description: '基于 ResNet-50 的工业缺陷检测模型，用于生产线质量管控',
    framework: 'PyTorch',
    status: 'deployed',
    hardware: { gpuType: 'A100', gpuCount: 4, memoryGB: 128 },
    modelCount: 12,
    datasetCount: 3,
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-06-24T14:30:00Z',
    tags: ['CV', '生产', '分类'],
  },
  {
    id: '2',
    name: 'NLP 情感分析 BERT',
    description: '基于 BERT-base 的中文评论情感分析模型，支持多分类',
    framework: 'PyTorch',
    status: 'training',
    hardware: { gpuType: 'V100', gpuCount: 2, memoryGB: 64 },
    modelCount: 5,
    datasetCount: 2,
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-06-25T09:15:00Z',
    tags: ['NLP', 'BERT', '情感分析'],
  },
  {
    id: '3',
    name: '目标检测 YOLOv8',
    description: '基于 YOLOv8 的实时目标检测，用于安防监控场景',
    framework: 'PyTorch',
    status: 'active',
    hardware: { gpuType: 'A100', gpuCount: 8, memoryGB: 256 },
    modelCount: 3,
    datasetCount: 4,
    createdAt: '2026-05-10T16:00:00Z',
    updatedAt: '2026-06-23T11:00:00Z',
    tags: ['CV', '检测', '安防'],
  },
  {
    id: '4',
    name: '推荐系统 Wide&Deep',
    description: '基于 Wide & Deep 的电商商品推荐模型',
    framework: 'TensorFlow',
    status: 'deployed',
    hardware: { gpuType: 'T4', gpuCount: 4, memoryGB: 64 },
    modelCount: 8,
    datasetCount: 2,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-06-20T18:00:00Z',
    tags: ['推荐', '电商', '排序'],
  },
  {
    id: '5',
    name: '语音识别 Whisper',
    description: '基于 OpenAI Whisper 的中文语音转文字模型微调',
    framework: 'JAX',
    status: 'active',
    hardware: { gpuType: 'V100', gpuCount: 4, memoryGB: 128 },
    modelCount: 2,
    datasetCount: 1,
    createdAt: '2026-06-01T14:00:00Z',
    updatedAt: '2026-06-24T08:00:00Z',
    tags: ['语音', 'ASR', '微调'],
  },
];
