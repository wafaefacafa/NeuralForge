// EXPORTS: IKpiCard, ITrainingTrend, IResourceUsage, IActivityItem, IDashboardData

export interface IKpiCard {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number; // 环比变化百分比，正数上升负数下降
  changeLabel: string;
  icon: 'project' | 'training' | 'deploy' | 'gpu';
}

export interface ITrainingTrendPoint {
  date: string;
  submitted: number;
  completed: number;
}

export interface IResourceUsage {
  type: 'cpu' | 'gpu' | 'memory' | 'storage';
  label: string;
  used: number; // 已用百分比 0-100
  total: number; // 总量
  unit: string;
  threshold: number; // 告警阈值百分比
}

export interface IActivityItem {
  id: string;
  type: 'create_project' | 'training_complete' | 'model_deploy' | 'dataset_upload' | 'member_join';
  title: string;
  description: string;
  timestamp: string;
  projectName?: string;
}

export interface IDashboardData {
  kpiCards: IKpiCard[];
  trainingTrend: ITrainingTrendPoint[];
  resourceUsage: IResourceUsage[];
  recentActivities: IActivityItem[];
}
