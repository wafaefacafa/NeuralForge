// EXPORTS: MOCK_RESOURCE_ALERTS

import type { IResourceAlert } from '@/types/resources';

export const MOCK_RESOURCE_ALERTS: IResourceAlert[] = [
  {
    id: '1',
    time: '2026-06-25 14:32:10',
    resourceType: 'GPU',
    level: 'critical',
    description: 'GPU 集群 A 利用率超过 95%，训练任务排队中',
    status: 'active',
  },
  {
    id: '2',
    time: '2026-06-25 13:15:42',
    resourceType: 'Memory',
    level: 'warning',
    description: '内存使用率达到 82%，接近配额上限',
    status: 'active',
  },
  {
    id: '3',
    time: '2026-06-25 11:08:05',
    resourceType: 'Storage',
    level: 'warning',
    description: '存储空间已使用 78%，建议清理过期数据集',
    status: 'acknowledged',
  },
  {
    id: '4',
    time: '2026-06-24 22:45:33',
    resourceType: 'CPU',
    level: 'critical',
    description: '推理服务 CPU 持续 100%，触发自动扩容',
    status: 'resolved',
  },
  {
    id: '5',
    time: '2026-06-24 16:20:18',
    resourceType: 'GPU',
    level: 'warning',
    description: 'GPU 显存碎片率过高，建议重启训练节点',
    status: 'resolved',
  },
];
