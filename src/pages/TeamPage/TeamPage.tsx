import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import {
  Users,
  UserPlus,
  Search,
  X,
  ArrowUpRight,
  UserCheck,
  Activity,
  Rocket,
  GitBranch,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { MOCK_TEAM_MEMBERS, MOCK_TEAM_STATS } from '@/data/teamMembers';
import type { ITeamMember, ITeamInviteForm } from '@/types/team';

// ============================================================
// 角色配置
// ============================================================
const ROLE_CONFIG: Record<ITeamMember['role'], { label: string }> = {
  admin: { label: '管理员' },
  developer: { label: '开发者' },
  viewer: { label: '观察者' },
};

const STATUS_CONFIG: Record<ITeamMember['status'], { label: string }> = {
  active: { label: '活跃' },
  inactive: { label: '未活跃' },
  pending: { label: '待接受' },
};

// ============================================================
// 统计卡片图标映射
// ============================================================
const STAT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  totalMembers: Users,
  activeMembers: UserCheck,
  monthlyTrainingJobs: Activity,
  monthlyDeployments: Rocket,
};

// ============================================================
// 邀请成员对话框
// ============================================================
function InviteMemberDialog({
  open,
  onOpenChange,
  onInvite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (form: ITeamInviteForm) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ITeamMember['role']>('developer');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) {
        toast.error('请输入邮箱地址');
        return;
      }
      setSubmitting(true);
      try {
        await onInvite({ email: email.trim(), role });
        setEmail('');
        setRole('developer');
      } finally {
        setSubmitting(false);
      }
    },
    [email, role, onInvite],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-black">
        <DialogHeader>
          <DialogTitle className="heading-bold text-xl flex items-center gap-2">
            <UserPlus className="size-5" />
            邀请成员
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-muted-foreground">
            输入邮箱地址并选择角色，发送团队邀请
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              邮箱地址
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="bg-background border-black"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              角色
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'developer', 'viewer'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-2 text-xs font-bold border border-black transition-colors ${
                    role === r
                      ? 'bg-black text-background'
                      : 'hover:bg-black hover:text-background'
                  }`}
                >
                  {ROLE_CONFIG[r].label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-black hover:bg-black hover:text-background transition-colors"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-black text-background hover:bg-black/80 transition-colors text-sm font-bold"
            >
              {submitting ? '发送中...' : '发送邀请'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 编辑成员对话框
// ============================================================
function EditMemberDialog({
  open,
  onOpenChange,
  member,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: ITeamMember | null;
  onSave: (updated: ITeamMember) => void;
}) {
  const [role, setRole] = useState<ITeamMember['role']>('developer');
  const [projectAccess, setProjectAccess] = useState(true);
  const [datasetAccess, setDatasetAccess] = useState(true);
  const [deployAccess, setDeployAccess] = useState(false);

  // 同步 member 变更
  useState(() => {
    if (member) {
      setRole(member.role);
      setProjectAccess(member.permissions.projectAccess);
      setDatasetAccess(member.permissions.datasetAccess);
      setDeployAccess(member.permissions.deployAccess);
    }
  });

  const handleSave = useCallback(() => {
    if (!member) return;
    onSave({
      ...member,
      role,
      permissions: {
        projectAccess,
        datasetAccess,
        deployAccess,
      },
    });
    toast.success(`${member.name} 的权限已更新`);
    onOpenChange(false);
  }, [member, role, projectAccess, datasetAccess, deployAccess, onSave, onOpenChange]);

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-black">
        <DialogHeader>
          <DialogTitle className="heading-bold text-xl">编辑成员</DialogTitle>
          <DialogDescription className="text-xs font-medium text-muted-foreground">
            {member.name} · {member.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              角色
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'developer', 'viewer'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-2 text-xs font-bold border border-black transition-colors ${
                    role === r
                      ? 'bg-black text-background'
                      : 'hover:bg-black hover:text-background'
                  }`}
                >
                  {ROLE_CONFIG[r].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              权限
            </Label>
            <div className="space-y-2 border border-black p-3">
              {[
                { key: 'projectAccess', label: '项目访问', value: projectAccess, setter: setProjectAccess },
                { key: 'datasetAccess', label: '数据集访问', value: datasetAccess, setter: setDatasetAccess },
                { key: 'deployAccess', label: '部署权限', value: deployAccess, setter: setDeployAccess },
              ].map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center justify-between cursor-pointer py-1"
                >
                  <span className="text-sm font-bold">{perm.label}</span>
                  <button
                    type="button"
                    onClick={() => perm.setter((v: boolean) => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 border border-black transition-colors ${
                      perm.value ? 'bg-black' : 'bg-background'
                    }`}
                  >
                    <span
                      className={`inline-block size-3 border border-black transition-transform m-0.5 ${
                        perm.value
                          ? 'translate-x-[14px] bg-background'
                          : 'translate-x-0 bg-black'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-black hover:bg-black hover:text-background transition-colors"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-black text-background hover:bg-black/80 transition-colors text-sm font-bold"
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function TeamPage() {
  const [members, setMembers] = useState<ITeamMember[]>(MOCK_TEAM_MEMBERS);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ITeamMember | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ITeamMember | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        !searchKeyword.trim() ||
        m.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        m.email.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchRole = roleFilter === 'all' || m.role === roleFilter;
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [members, searchKeyword, roleFilter, statusFilter]);

  const handleInvite = useCallback(
    async (form: ITeamInviteForm) => {
      try {
        await new Promise((r) => setTimeout(r, 800));
        const newMember: ITeamMember = {
          id: `member_${Date.now()}`,
          name: form.email.split('@')[0],
          email: form.email,
          role: form.role,
          status: 'pending',
          joinedAt: new Date().toISOString(),
          lastActiveAt: '-',
          permissions: {
            projectAccess: form.role !== 'viewer',
            datasetAccess: form.role !== 'viewer',
            deployAccess: form.role === 'admin',
          },
        };
        setMembers((prev) => [newMember, ...prev]);
        toast.success(`邀请已发送至 ${form.email}`);
        logger.info('Member invited:', form.email);
        setInviteOpen(false);
      } catch (err) {
        logger.error('Invite member failed:', String(err));
        toast.error('邀请失败，请重试');
      }
    },
    [],
  );

  const handleEditMember = useCallback((member: ITeamMember) => {
    setEditTarget(member);
    setEditOpen(true);
  }, []);

  const handleSaveEdit = useCallback((updated: ITeamMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  const handleRemoveMember = useCallback((member: ITeamMember) => {
    setRemoveTarget(member);
  }, []);

  const confirmRemove = useCallback(() => {
    if (!removeTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
    toast.success(`${removeTarget.name} 已被移出团队`);
    logger.info('Member removed:', removeTarget.email);
    setRemoveTarget(null);
  }, [removeTarget]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div>
      {/* Header: dual-column editorial */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="p-8 border-r border-black">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="heading-bold text-6xl leading-[0.9] tracking-tighter"
          >
            团队
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            管理团队成员、角色和访问权限
            {filteredMembers.length !== members.length && (
              <span className="ml-2 font-bold">
                （筛选 {filteredMembers.length}/{members.length}）
              </span>
            )}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
            >
              <UserPlus className="size-4" />
              邀请成员
            </button>
          </div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            协作是 AI 开发的核心。管理团队角色、控制数据与模型访问权限，确保安全高效的 MLOps 工作流。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* 统计卡片: 4 列网格 */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-b border-black">
        {MOCK_TEAM_STATS.map((stat, i) => {
          const Icon = STAT_ICON_MAP[stat.key] ?? Users;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 border-r border-black last:border-r-0"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="heading-bold text-xl">{stat.label}</span>
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="heading-bold text-4xl tabular-nums">{stat.value}</span>
                <span className="text-sm font-medium text-muted-foreground">{stat.unit}</span>
              </div>
              {stat.change !== undefined && (
                <div className="mt-3 flex items-center gap-1.5">
                  <GitBranch className="size-3.5 text-success" />
                  <span className="text-xs uppercase font-bold text-success tabular-nums">
                    +{stat.change}%
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    环比
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 搜索与筛选栏 */}
      <div className="p-8 border-b border-black">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索成员姓名或邮箱..."
              className="bg-background pl-9 border-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px] h-9 bg-background border-black text-sm">
                <SelectValue placeholder="角色" />
              </SelectTrigger>
              <SelectContent className="border-black">
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="developer">开发者</SelectItem>
                <SelectItem value="viewer">观察者</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-9 bg-background border-black text-sm">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent className="border-black">
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">未活跃</SelectItem>
                <SelectItem value="pending">待接受</SelectItem>
              </SelectContent>
            </Select>

            {(searchKeyword || roleFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="flex items-center gap-1 px-3 py-2 border border-black text-xs font-bold hover:bg-black hover:text-background transition-colors"
              >
                <X className="size-3" />
                清除
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 成员表格 */}
      <div className="p-8">
        <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
          <h2 className="heading-bold text-xl">成员列表</h2>
          <ArrowUpRight className="size-4" />
        </div>

        <div className="border border-black">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-black">
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">成员</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">角色</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">状态</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">加入时间</TableHead>
                  <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">最后活跃</TableHead>
                  <TableHead className="whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow className="border-black">
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="size-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">暂无匹配的成员</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="border-black group hover:bg-black hover:text-background transition-colors">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="size-8 shrink-0">
                            <AvatarFallback className="bg-black text-background text-xs font-bold group-hover:bg-background group-hover:text-black transition-colors">
                              {member.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm font-bold truncate max-w-[140px]">{member.name}</div>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60 truncate max-w-[140px]">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant={member.role === 'admin' ? 'default' : 'outline'}
                          className="text-[10px] uppercase font-bold tracking-widest border-black group-hover:border-background group-hover:text-background"
                        >
                          {ROLE_CONFIG[member.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                            member.status === 'active'
                              ? 'text-success'
                              : member.status === 'pending'
                                ? 'text-warning'
                                : 'text-muted-foreground'
                          } group-hover:text-background/80`}
                        >
                          <span
                            className={`inline-block size-1.5 ${
                              member.status === 'active'
                                ? 'bg-success'
                                : member.status === 'pending'
                                  ? 'bg-warning'
                                  : 'bg-muted-foreground'
                            } group-hover:bg-background`}
                          />
                          {STATUS_CONFIG[member.status].label}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-mono tabular-nums">
                        {formatDate(member.joinedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-mono tabular-nums text-muted-foreground group-hover:text-background/60">
                        {member.lastActiveAt === '-' ? '-' : formatDate(member.lastActiveAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditMember(member)}
                            className="px-2 py-1 text-xs font-bold border border-black hover:bg-background hover:text-black group-hover:border-background group-hover:text-background group-hover:hover:bg-background group-hover:hover:text-black transition-colors"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member)}
                            className="px-2 py-1 text-xs font-bold border border-black text-destructive hover:bg-destructive hover:text-destructive-foreground group-hover:border-background group-hover:text-background transition-colors"
                          >
                            移除
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* 邀请成员对话框 */}
      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
      />

      {/* 编辑成员对话框 */}
      <EditMemberDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={editTarget}
        onSave={handleSaveEdit}
      />

      {/* 移除确认对话框 */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent className="border-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="heading-bold text-xl">确认移除</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
              确定要将 <span className="font-bold text-foreground">{removeTarget?.name}</span> 移出团队吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black hover:bg-black hover:text-background transition-colors">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-black text-background hover:bg-black/80 transition-colors"
            >
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
