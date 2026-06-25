// EXPORTS: MOCK_RESOURCE_METRICS, MOCK_RESOURCE_QUOTAS, MOCK_RESOURCE_ALERTS, MOCK_COST_BREAKDOWN, MOCK_COST_SUMMARY

import type { IResourceMetrics, IResourceQuota, IResourceAlert, ICostBreakdown } from '@/types/resources';

/** 资源使用率时间序列 mock（最近 24 小时，每小时一个点） */
export const MOCK_RESOURCE_METRICS: IResourceMetrics = {
  cpu: [
    { timestamp: '00:00', value: 32 }, { timestamp: '01:00', value: 28 }, { timestamp: '02:00', value: 25 },
    { timestamp: '03:00', value: 22 }, { timestamp: '04:00', value: 20 }, { timestamp: '05:00', value: 18 },
    { timestamp: '06:00', value: 24 }, { timestamp: '07:00', value: 35 }, { timestamp: '08:00', value: 48 },
    { timestamp: '09:00', value: 62 }, { timestamp: '10:00', value: 71 }, { timestamp: '11:00', value: 78 },
    { timestamp: '12:00', value: 74 }, { timestamp: '13:00', value: 69 }, { timestamp: '14:00', value: 82 },
    { timestamp: '15:00', value: 85 }, { timestamp: '16:00', value: 79 }, { timestamp: '17:00', value: 72 },
    { timestamp: '18:00', value: 65 }, { timestamp: '19:00', value: 58 }, { timestamp: '20:00', value: 52 },
    { timestamp: '21:00', value: 45 }, { timestamp: '22:00', value: 38 }, { timestamp: '23:00', value: 34 },
  ],
  gpu: [
    { timestamp: '00:00', value: 45 }, { timestamp: '01:00', value: 42 }, { timestamp: '02:00', value: 38 },
    { timestamp: '03:00', value: 35 }, { timestamp: '04:00', value: 30 }, { timestamp: '05:00', value: 28 },
    { timestamp: '06:00', value: 36 }, { timestamp: '07:00', value: 52 }, { timestamp: '08:00', value: 68 },
    { timestamp: '09:00', value: 82 }, { timestamp: '10:00', value: 91 }, { timestamp: '11:00', value: 88 },
    { timestamp: '12:00', value: 85 }, { timestamp: '13:00', value: 79 }, { timestamp: '14:00', value: 93 },
    { timestamp: '15:00', value: 96 }, { timestamp: '16:00', value: 90 }, { timestamp: '17:00', value: 84 },
    { timestamp: '18:00', value: 76 }, { timestamp: '19:00', value: 68 }, { timestamp: '20:00', value: 60 },
    { timestamp: '21:00', value: 55 }, { timestamp: '22:00', value: 48 }, { timestamp: '23:00', value: 44 },
  ],
  memory: [
    { timestamp: '00:00', value: 55 }, { timestamp: '01:00', value: 52 }, { timestamp: '02:00', value: 50 },
    { timestamp: '03:00', value: 48 }, { timestamp: '04:00', value: 46 }, { timestamp: '05:00', value: 44 },
    { timestamp: '06:00', value: 50 }, { timestamp: '07:00', value: 58 }, { timestamp: '08:00', value: 65 },
    { timestamp: '09:00', value: 72 }, { timestamp: '10:00', value: 76 }, { timestamp: '11:00', value: 74 },
    { timestamp: '12:00', value: 71 }, { timestamp: '13:00', value: 68 }, { timestamp: '14:00', value: 78 },
    { timestamp: '15:00', value: 82 }, { timestamp: '16:00', value: 79 }, { timestamp: '17:00', value: 75 },
    { timestamp: '18:00', value: 70 }, { timestamp: '19:00', value: 64 }, { timestamp: '20:00', value: 60 },
    { timestamp: '21:00', value: 57 }, { timestamp: '22:00', value: 54 }, { timestamp: '23:00', value: 52 },
  ],
  storage: [
    { timestamp: '00:00', value: 38 }, { timestamp: '01:00', value: 38 }, { timestamp: '02:00', value: 39 },
    { timestamp: '03:00', value: 39 }, { timestamp: '04:00', value: 40 }, { timestamp: '05:00', value: 40 },
    { timestamp: '06:00', value: 41 }, { timestamp: '07:00', value: 42 }, { timestamp: '08:00', value: 43 },
    { timestamp: '09:00', value: 44 }, { timestamp: '10:00', value: 45 }, { timestamp: '11:00', value: 46 },
    { timestamp: '12:00', value: 47 }, { timestamp: '13:00', value: 48 }, { timestamp: '14:00', value: 49 },
    { timestamp: '15:00', value: 50 }, { timestamp: '16:00', value: 51 }, { timestamp: '17:00', value: 52 },
    { timestamp: '18:00', value: 53 }, { timestamp: '19:00', value: 53 }, { timestamp: '20:00', value: 54 },
    { timestamp: '21:00', value: 54 }, { timestamp: '22:00', value: 55 }, { timestamp: '23:00', value: 55 },
  ],
};

/** 资源配额概览 */
export const MOCK_RESOURCE_QUOTAS: IResourceQuota[] = [
  { resourceType: 'CPU', used: 68, total: 100, unit: 'vCPU' },
  { resourceType: 'GPU', used: 14, total: 20, unit: '卡' },
  { resourceType: 'Memory', used: 420, total: 512, unit: 'GB' },
  { resourceType: 'Storage', used: 2.8, total: 5, unit: 'TB' },
];

/** 资源告警列表 */
export const MOCK_RESOURCE_ALERTS: IResourceAlert[] = [
  {
    id: '1',
    time: '2026-06-25 14:32:00',
    resourceType: 'GPU',
    level: 'warning',
    description: 'GPU 集群 A 利用率超过 85%，当前 96%',
    status: 'active',
  },
  {
    id: '2',
    time: '2026-06-25 13:15:00',
    resourceType: 'Memory',
    level: 'critical',
    description: '内存使用率超过 90% 阈值，当前 92%',
    status: 'active',
  },
  {
    id: '3',
    time: '2026-06-25 10:08:00',
    resourceType: 'CPU',
    level: 'warning',
    description: 'CPU 使用率持续高于 80%，当前 85%',
    status: 'acknowledged',
  },
  {
    id: '4',
    time: '2026-06-24 22:45:00',
    resourceType: 'Storage',
    level: 'warning',
    description: '存储使用率超过 70%，建议扩容',
    status: 'resolved',
  },
  {
    id: '5',
    time: '2026-06-24 16:20:00',
    resourceType: 'GPU',
    level: 'critical',
    description: 'GPU 节点 gpu-node-03 温度异常，已自动降频',
    status: 'resolved',
  },
];

/** 本月费用构成 */
export const MOCK_COST_BREAKDOWN: ICostBreakdown[] = [
  { category: '计算', amount: 12450, color: '#4F46E5' },
  { category: '存储', amount: 3200, color: '#06B6D4' },
  { category: '网络', amount: 1850, color: '#A855F7' },
  { category: '其他', amount: 950, color: '#22C55E' },
];

/** 费用汇总 */
export const MOCK_COST_SUMMARY = {
  totalThisMonth: 18450,
  totalLastMonth: 16200,
  changePercent: 13.9,
  currency: 'CNY',
};
