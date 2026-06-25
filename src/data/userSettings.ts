// EXPORTS: MOCK_USER_SETTINGS, MOCK_USER_PROFILE, MOCK_API_KEYS, MOCK_NOTIFICATION_SETTINGS, MOCK_SECURITY_SETTINGS

import type { IUserSettings, IUserProfile, IApiKey, INotificationSettings, ISecuritySettings } from '@/types/settings';

export const MOCK_USER_PROFILE: IUserProfile = {
  name: 'James Bond',
  email: 'james.bond@neuralforge.io',
  company: '豆包账号',
  position: '高级 AI 工程师',
};

export const MOCK_API_KEYS: IApiKey[] = [
  {
    id: 'key_1',
    name: '生产环境密钥',
    prefix: 'nf_prod_',
    createdAt: '2026-03-15T10:30:00Z',
    lastUsedAt: '2026-06-25T08:12:00Z',
    status: 'active',
  },
  {
    id: 'key_2',
    name: '开发测试密钥',
    prefix: 'nf_dev_',
    createdAt: '2026-05-20T14:00:00Z',
    lastUsedAt: '2026-06-24T18:45:00Z',
    status: 'active',
  },
  {
    id: 'key_3',
    name: '旧版密钥（已弃用）',
    prefix: 'nf_old_',
    createdAt: '2025-11-01T09:00:00Z',
    lastUsedAt: '2026-02-10T12:00:00Z',
    status: 'disabled',
  },
];

export const MOCK_NOTIFICATION_SETTINGS: INotificationSettings = {
  trainingComplete: true,
  deployStatus: true,
  resourceAlert: true,
  teamInvite: false,
};

export const MOCK_SECURITY_SETTINGS: ISecuritySettings = {
  twoFactorEnabled: false,
};

export const MOCK_USER_SETTINGS: IUserSettings = {
  profile: MOCK_USER_PROFILE,
  apiKeys: MOCK_API_KEYS,
  notifications: MOCK_NOTIFICATION_SETTINGS,
  security: MOCK_SECURITY_SETTINGS,
};
