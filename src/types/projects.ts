// EXPORTS: IProject, IProjectFramework, IProjectStatus, IProjectHardwareConfig

export type IProjectFramework = 'PyTorch' | 'TensorFlow' | 'JAX';

export type IProjectStatus = 'active' | 'training' | 'deployed' | 'archived';

export interface IProjectHardwareConfig {
  gpuType: 'A100' | 'V100' | 'T4';
  gpuCount: number;
  memoryGB: number;
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  framework: IProjectFramework;
  status: IProjectStatus;
  hardware: IProjectHardwareConfig;
  modelCount: number;
  datasetCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}
