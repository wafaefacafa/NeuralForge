// EXPORTS: IUserSettings, IApiKey, IUserProfile, INotificationSettings, ISecuritySettings

export interface IUserSettings {
  profile: IUserProfile;
  apiKeys: IApiKey[];
  notifications: INotificationSettings;
  security: ISecuritySettings;
}

export interface IUserProfile {
  name: string;
  email: string;
  company: string;
  position: string;
  avatar?: string;
}

export interface IApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string;
  status: 'active' | 'disabled';
}

export interface INotificationSettings {
  trainingComplete: boolean;
  deployStatus: boolean;
  resourceAlert: boolean;
  teamInvite: boolean;
}

export interface ISecuritySettings {
  twoFactorEnabled: boolean;
}
