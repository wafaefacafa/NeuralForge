// EXPORTS: MOCK_TEAM_MEMBERS, MOCK_TEAM_STATS

import type { ITeamMember } from '@/types/team';

export const MOCK_TEAM_STATS = [
  { key: 'totalMembers', label: '成员总数', value: 12, unit: '人' },
  { key: 'activeMembers', label: '活跃成员', value: 9, unit: '人', change: 12 },
  { key: 'monthlyTrainingJobs', label: '本月训练任务', value: 47, unit: '次', change: 8 },
  { key: 'monthlyDeployments', label: '本月部署次数', value: 23, unit: '次', change: 15 },
] as const;

export const MOCK_TEAM_MEMBERS: ITeamMember[] = [
  {
    id: '1',
    name: 'James Bond',
    email: 'james.bond@neuralforge.io',
    role: 'admin',
    status: 'active',
    joinedAt: '2025-03-15',
    lastActiveAt: '2026-06-25',
    permissions: { projectAccess: true, datasetAccess: true, deployAccess: true },
  },
  {
    id: '2',
    name: '张明',
    email: 'zhang.ming@neuralforge.io',
    role: 'developer',
    status: 'active',
    joinedAt: '2025-06-01',
    lastActiveAt: '2026-06-24',
    permissions: { projectAccess: true, datasetAccess: true, deployAccess: false },
  },
  {
    id: '3',
    name: 'Sarah Chen',
    email: 'sarah.chen@neuralforge.io',
    role: 'developer',
    status: 'active',
    joinedAt: '2025-08-20',
    lastActiveAt: '2026-06-25',
    permissions: { projectAccess: true, datasetAccess: true, deployAccess: true },
  },
  {
    id: '4',
    name: '李伟',
    email: 'li.wei@neuralforge.io',
    role: 'viewer',
    status: 'active',
    joinedAt: '2026-01-10',
    lastActiveAt: '2026-06-23',
    permissions: { projectAccess: true, datasetAccess: false, deployAccess: false },
  },
  {
    id: '5',
    name: 'Alex Kim',
    email: 'alex.kim@neuralforge.io',
    role: 'developer',
    status: 'inactive',
    joinedAt: '2025-04-12',
    lastActiveAt: '2026-05-30',
    permissions: { projectAccess: true, datasetAccess: true, deployAccess: false },
  },
];
