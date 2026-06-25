// EXPORTS: ITrainingConfig, ITrainingJob, ITrainingLog, ITrainingMetrics, IHyperParams, INetworkTemplate, ITrainingDatasetSplit, ITrainingEpochMetrics

export interface IHyperParams {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: 'adam' | 'sgd' | 'adamw';
  weightDecay: number;
  learningRateScheduler: 'cosine' | 'step' | 'plateau' | 'none';
  earlyStoppingPatience: number;
  dataAugmentation: boolean;
}

export interface INetworkTemplate {
  id: string;
  name: string;
  description: string;
  framework: 'pytorch' | 'tensorflow' | 'jax';
  paramsCount: string;
  icon: string;
}

export interface ITrainingDatasetSplit {
  datasetId: string;
  datasetName: string;
  trainRatio: number;
  valRatio: number;
  testRatio: number;
}

export interface ITrainingConfig {
  projectId: string;
  projectName: string;
  hyperParams: IHyperParams;
  networkTemplate: INetworkTemplate;
  datasetSplit: ITrainingDatasetSplit;
  gpuType: string;
  gpuCount: number;
  createdAt: string;
}

export interface ITrainingEpochMetrics {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAccuracy: number;
  valAccuracy: number;
  learningRate: number;
  gpuUtilization: number;
  gpuMemoryUsed: number;
  gpuMemoryTotal: number;
  step: number;
  totalSteps: number;
  elapsedTime: number;
  estimatedRemaining: number;
}

export interface ITrainingMetrics {
  jobId: string;
  config: ITrainingConfig;
  currentEpoch: number;
  totalEpochs: number;
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'failed';
  epochMetrics: ITrainingEpochMetrics[];
  bestValLoss: number;
  bestValAccuracy: number;
  startedAt: string;
  updatedAt: string;
}

export interface ITrainingLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  epoch?: number;
  step?: number;
}

export interface ITrainingJob {
  id: string;
  projectId: string;
  projectName: string;
  modelName: string;
  framework: 'pytorch' | 'tensorflow' | 'jax';
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'failed' | 'queued';
  currentEpoch: number;
  totalEpochs: number;
  gpuType: string;
  gpuCount: number;
  bestAccuracy: number;
  bestLoss: number;
  startedAt: string;
  updatedAt: string;
  duration: number;
}
