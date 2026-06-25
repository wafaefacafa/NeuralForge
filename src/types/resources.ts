// EXPORTS: IResourceMetrics, IResourceAlert, IResourceQuota, ICostBreakdown, IResourceTimeSeries

export interface IResourceMetrics {
  cpu: IResourceTimeSeries[];
  gpu: IResourceTimeSeries[];
  memory: IResourceTimeSeries[];
  storage: IResourceTimeSeries[];
}

export interface IResourceTimeSeries {
  timestamp: string;
  value: number;
}

export interface IResourceAlert {
  id: string;
  time: string;
  resourceType: 'CPU' | 'GPU' | 'Memory' | 'Storage';
  level: 'warning' | 'critical';
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface IResourceQuota {
  resourceType: 'CPU' | 'GPU' | 'Memory' | 'Storage';
  used: number;
  total: number;
  unit: string;
}

export interface ICostBreakdown {
  category: string;
  amount: number;
  color: string;
}
