// EXPORTS: MOCK_DEPLOY_ENVIRONMENTS, MOCK_INSTANCE_SPECS, MOCK_AUTO_SCALE_PRESETS

import type { IDeployEnvironment, IInstanceSpec, IAutoScaleConfig } from '@/types/deploy';

export const MOCK_DEPLOY_ENVIRONMENTS: IDeployEnvironment[] = [
  {
    id: 'production',
    name: '生产环境',
    description: '高可用集群，自动扩缩容，多区域部署，SLA 99.9%',
    icon: 'production',
  },
  {
    id: 'staging',
    name: '预发布环境',
    description: '与生产环境配置一致，用于上线前最终验证',
    icon: 'staging',
  },
  {
    id: 'testing',
    name: '测试环境',
    description: '开发测试用途，资源按需分配，成本优化',
    icon: 'testing',
  },
];

export const MOCK_INSTANCE_SPECS: IInstanceSpec[] = [
  {
    id: 'gpu-a100-1',
    type: 'GPU',
    name: 'NVIDIA A100 (1x)',
    vCPU: 12,
    memory: '85 GB',
    gpuModel: 'A100 80GB',
    gpuCount: 1,
    pricePerHour: 3.06,
  },
  {
    id: 'gpu-a100-2',
    type: 'GPU',
    name: 'NVIDIA A100 (2x)',
    vCPU: 24,
    memory: '170 GB',
    gpuModel: 'A100 80GB',
    gpuCount: 2,
    pricePerHour: 6.12,
  },
  {
    id: 'gpu-v100-1',
    type: 'GPU',
    name: 'NVIDIA V100 (1x)',
    vCPU: 8,
    memory: '61 GB',
    gpuModel: 'V100 32GB',
    gpuCount: 1,
    pricePerHour: 2.48,
  },
  {
    id: 'gpu-t4-1',
    type: 'GPU',
    name: 'NVIDIA T4 (1x)',
    vCPU: 4,
    memory: '30 GB',
    gpuModel: 'T4 16GB',
    gpuCount: 1,
    pricePerHour: 0.95,
  },
  {
    id: 'cpu-high-1',
    type: 'CPU',
    name: '高性能计算型',
    vCPU: 16,
    memory: '64 GB',
    pricePerHour: 0.72,
  },
  {
    id: 'cpu-std-1',
    type: 'CPU',
    name: '标准计算型',
    vCPU: 8,
    memory: '32 GB',
    pricePerHour: 0.36,
  },
];

export const MOCK_AUTO_SCALE_PRESETS: Record<string, IAutoScaleConfig> = {
  conservative: {
    enabled: true,
    minInstances: 1,
    maxInstances: 3,
    cpuThreshold: 80,
    scaleDownDelay: 300,
  },
  balanced: {
    enabled: true,
    minInstances: 2,
    maxInstances: 8,
    cpuThreshold: 70,
    scaleDownDelay: 180,
  },
  aggressive: {
    enabled: true,
    minInstances: 2,
    maxInstances: 20,
    cpuThreshold: 60,
    scaleDownDelay: 60,
  },
};
