// EXPORTS: IDeployConfig, IDeployInstance, IDeployEnvironment, IInstanceSpec, IAutoScaleConfig, ITrafficAllocation

export interface IDeployEnvironment {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface IInstanceSpec {
  id: string;
  type: 'CPU' | 'GPU';
  name: string;
  vCPU: number;
  memory: string;
  gpuModel?: string;
  gpuCount?: number;
  pricePerHour: number;
}

export interface IAutoScaleConfig {
  enabled: boolean;
  minInstances: number;
  maxInstances: number;
  cpuThreshold: number;
  scaleDownDelay: number;
}

export interface ITrafficAllocation {
  versionId: string;
  versionName: string;
  percentage: number;
}

export interface IDeployConfig {
  projectId: string;
  modelVersionId: string;
  environment: string;
  instanceSpecId: string;
  instanceCount: number;
  autoScale: IAutoScaleConfig;
  trafficAllocations: ITrafficAllocation[];
  description: string;
}

export interface IDeployInstance {
  id: string;
  name: string;
  modelVersionId: string;
  modelVersionName: string;
  modelName: string;
  status: 'running' | 'stopped' | 'deploying' | 'failed' | 'scaling';
  endpoint: string;
  spec: string;
  environment: string;
  uptime: string;
  qps: number;
  latency: number;
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  requestHistory: number[];
  createdAt: string;
  updatedAt: string;
}
