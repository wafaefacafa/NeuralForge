// EXPORTS: IModelVersion, IModelEvalResult, IClassificationReport, IConfusionMatrix, IPrPoint, IModelCompareResult

export interface IModelVersion {
  id: string;
  version: string;
  modelName: string;
  projectId: string;
  projectName: string;
  framework: 'PyTorch' | 'TensorFlow' | 'JAX';
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  sizeMB: number;
  status: 'ready' | 'training' | 'failed' | 'deployed';
  createdAt: string;
  updatedAt: string;
  hyperparams: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    optimizer: string;
  };
  trainingEnv: {
    gpuType: string;
    gpuCount: number;
    memoryGB: number;
  };
}

export interface IConfusionMatrix {
  labels: string[];
  matrix: number[][];
}

export interface IPrPoint {
  recall: number;
  precision: number;
}

export interface IClassificationReport {
  label: string;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

export interface IModelEvalResult {
  versionId: string;
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  confusionMatrix: IConfusionMatrix;
  prCurve: IPrPoint[];
  classificationReport: IClassificationReport[];
  insight: string;
}

export interface IModelCompareResult {
  versionA: IModelVersion;
  versionB: IModelVersion;
  metricDiffs: {
    metric: string;
    valueA: number;
    valueB: number;
    diff: number;
  }[];
}
