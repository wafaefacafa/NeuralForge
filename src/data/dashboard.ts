// EXPORTS: MOCK_KPI_CARDS, MOCK_TRAINING_TREND, MOCK_RESOURCE_USAGE, MOCK_RECENT_ACTIVITIES

import type { IKpiCard, ITrainingTrendPoint, IResourceUsage, IActivityItem } from '@/types/dashboard';

export const MOCK_KPI_CARDS: IKpiCard[] = [
  {
    id: '1',
    title: '活跃项目',
    value: 24,
    unit: '个',
    change: 12.5,
    changeLabel: '较上月',
    icon: 'project',
  },
  {
    id: '2',
    title: '训练任务',
    value: 8,
    unit: '个运行中',
    change: -3.2,
    changeLabel: '较上月',
    icon: 'training',
  },
  {
    id: '3',
    title: '已部署模型',
    value: 15,
    unit: '个',
    change: 25.0,
    changeLabel: '较上月',
    icon: 'deploy',
  },
  {
    id: '4',
    title: 'GPU 利用率',
    value: 72,
    unit: '%',
    change: 5.8,
    changeLabel: '较上周',
    icon: 'gpu',
  },
];

export const MOCK_TRAINING_TREND: ITrainingTrendPoint[] = [
  { date: '06-19', submitted: 12, completed: 10 },
  { date: '06-20', submitted: 15, completed: 13 },
  { date: '06-21', submitted: 9, completed: 8 },
  { date: '06-22', submitted: 18, completed: 16 },
  { date: '06-23', submitted: 14, completed: 12 },
  { date: '06-24', submitted: 20, completed: 18 },
  { date: '06-25', submitted: 16, completed: 14 },
];

export const MOCK_RESOURCE_USAGE: IResourceUsage[] = [
  { type: 'cpu', label: 'CPU', used: 45, total: 64, unit: 'vCPU', threshold: 80 },
  { type: 'gpu', label: 'GPU', used: 72, total: 16, unit: '卡', threshold: 85 },
  { type: 'memory', label: '内存', used: 58, total: 256, unit: 'GB', threshold: 80 },
  { type: 'storage', label: '存储', used: 42, total: 2000, unit: 'GB', threshold: 75 },
];

export const MOCK_RECENT_ACTIVITIES: IActivityItem[] = [
  {
    id: '1',
    type: 'training_complete',
    title: '训练任务完成',
    description: 'ResNet-50 图像分类训练完成，Accuracy 达 94.2%',
    timestamp: '2026-06-25T14:32:00Z',
    projectName: '图像分类 v2',
  },
  {
    id: '2',
    type: 'model_deploy',
    title: '模型部署成功',
    description: 'BERT-NER v3.1 已部署至生产环境，QPS 1200',
    timestamp: '2026-06-25T13:15:00Z',
    projectName: 'NER 实体识别',
  },
  {
    id: '3',
    type: 'create_project',
    title: '创建新项目',
    description: '创建项目「语音识别引擎」，框架 PyTorch',
    timestamp: '2026-06-25T11:48:00Z',
    projectName: '语音识别引擎',
  },
  {
    id: '4',
    type: 'dataset_upload',
    title: '数据集上传',
    description: '上传数据集 ImageNet-subset v3，样本数 50,000',
    timestamp: '2026-06-25T10:20:00Z',
    projectName: '图像分类 v2',
  },
  {
    id: '5',
    type: 'training_complete',
    title: '训练任务完成',
    description: 'GPT-2 微调完成，Perplexity 降至 12.3',
    timestamp: '2026-06-24T18:55:00Z',
    projectName: '文本生成',
  },
  {
    id: '6',
    type: 'member_join',
    title: '成员加入团队',
    description: '张明 (zhangming@example.com) 加入团队，角色：开发者',
    timestamp: '2026-06-24T16:30:00Z',
  },
  {
    id: '7',
    type: 'model_deploy',
    title: '模型部署更新',
    description: 'YOLOv8 目标检测模型更新至 v5.2，mAP 提升 2.1%',
    timestamp: '2026-06-24T14:10:00Z',
    projectName: '目标检测',
  },
  {
    id: '8',
    type: 'create_project',
    title: '创建新项目',
    description: '创建项目「推荐系统召回模型」，框架 TensorFlow',
    timestamp: '2026-06-24T09:22:00Z',
    projectName: '推荐系统召回',
  },
  {
    id: '9',
    type: 'dataset_upload',
    title: '数据集版本更新',
    description: 'COCO-subset 数据集更新至 v5，新增 8,000 标注样本',
    timestamp: '2026-06-23T17:45:00Z',
    projectName: '目标检测',
  },
  {
    id: '10',
    type: 'training_complete',
    title: '训练任务完成',
    description: 'EfficientNet-B3 训练完成，F1-Score 达 0.91',
    timestamp: '2026-06-23T15:08:00Z',
    projectName: '图像分类 v2',
  },
];
