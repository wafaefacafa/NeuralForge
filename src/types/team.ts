// EXPORTS: ITeamMember, ITeamStats, ITeamInviteForm

export interface ITeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastActiveAt: string;
  permissions: {
    projectAccess: boolean;
    datasetAccess: boolean;
    deployAccess: boolean;
  };
}

export interface ITeamStats {
  totalMembers: number;
  activeMembers: number;
  monthlyTrainingJobs: number;
  monthlyDeployments: number;
}

export interface ITeamInviteForm {
  email: string;
  role: 'admin' | 'developer' | 'viewer';
}
