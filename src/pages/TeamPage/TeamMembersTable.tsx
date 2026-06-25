import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Search, UserPlus, MoreHorizontal, Shield, Edit, Trash2, Mail, Clock, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { ITeamMember } from '@/types/team';

interface TeamMembersTableProps {
  members: ITeamMember[];
  onMembersChange?: (members: ITeamMember[]) => void;
}

const ROLE_CONFIG: Record<ITeamMember['role'], { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  admin: { label: '管理员', variant: 'default' },
  developer: { label: '开发者', variant: 'secondary' },
  viewer: { label: '观察者', variant: 'outline' },
};

const STATUS_CONFIG: Record<ITeamMember['status'], { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  active: { label: '活跃', icon: CheckCircle2, className: 'text-success' },
  inactive: { label: '未激活', icon: MinusCircle, className: 'text-muted-foreground' },
  pending: { label: '待接受', icon: Clock, className: 'text-warning' },
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function TeamMembersTable({ members, onMembersChange }: TeamMembersTableProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ITeamMember | null>(null);
  const [editRole, setEditRole] = useState<ITeamMember['role']>('developer');
  const [editPermissions, setEditPermissions] = useState({
    projectAccess: true,
    datasetAccess: true,
    deployAccess: false,
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ITeamMember['role']>('developer');

  // 筛选
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

  // 打开编辑对话框
  const handleOpenEdit = useCallback((member: ITeamMember) => {
    setSelectedMember(member);
    setEditRole(member.role);
    setEditPermissions({ ...member.permissions });
    setEditDialogOpen(true);
  }, []);

  // 保存编辑
  const handleSaveEdit = useCallback(() => {
    if (!selectedMember) return;
    const updated = members.map((m) =>
      m.id === selectedMember.id
        ? { ...m, role: editRole, permissions: { ...editPermissions } }
        : m,
    );
    onMembersChange?.(updated);
    toast.success(`已更新 ${selectedMember.name} 的角色权限`);
    setEditDialogOpen(false);
    setSelectedMember(null);
  }, [selectedMember, members, editRole, editPermissions, onMembersChange]);

  // 打开删除确认
  const handleOpenDelete = useCallback((member: ITeamMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  }, []);

  // 确认删除
  const handleConfirmDelete = useCallback(() => {
    if (!selectedMember) return;
    const updated = members.filter((m) => m.id !== selectedMember.id);
    onMembersChange?.(updated);
    toast.success(`已移除成员 ${selectedMember.name}`);
    setDeleteDialogOpen(false);
    setSelectedMember(null);
  }, [selectedMember, members, onMembersChange]);

  // 邀请成员
  const handleInvite = useCallback(() => {
    const email = inviteEmail.trim();
    if (!email) {
      toast.error('请输入邮箱地址');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('请输入有效的邮箱地址');
      return;
    }
    const exists = members.some((m) => m.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      toast.error('该邮箱已是团队成员');
      return;
    }
    const newMember: ITeamMember = {
      id: String(Date.now()),
      name: email.split('@')[0],
      email,
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      permissions: {
        projectAccess: inviteRole !== 'viewer',
        datasetAccess: inviteRole !== 'viewer',
        deployAccess: inviteRole === 'admin',
      },
    };
    onMembersChange?.([...members, newMember]);
    toast.success(`已向 ${email} 发送邀请`);
    setInviteDialogOpen(false);
    setInviteEmail('');
    setInviteRole('developer');
  }, [inviteEmail, inviteRole, members, onMembersChange]);

  return (
    <>
      {/* 操作栏 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* 搜索 */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索成员姓名或邮箱..."
              className="bg-muted/50 pl-9"
            />
          </div>

          {/* 角色筛选 */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-[120px] bg-muted/50 text-sm">
              <SelectValue placeholder="角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部角色</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
              <SelectItem value="developer">开发者</SelectItem>
              <SelectItem value="viewer">观察者</SelectItem>
            </SelectContent>
          </Select>

          {/* 状态筛选 */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[120px] bg-muted/50 text-sm">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="active">活跃</SelectItem>
              <SelectItem value="inactive">未激活</SelectItem>
              <SelectItem value="pending">待接受</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 邀请按钮 */}
        <Button
          onClick={() => setInviteDialogOpen(true)}
          className="shrink-0 gap-1.5"
        >
          <UserPlus className="size-4" />
          邀请成员
        </Button>
      </div>

      {/* 成员表格 */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            团队成员
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredMembers.length} 人)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="whitespace-nowrap pl-5">成员</TableHead>
                  <TableHead className="whitespace-nowrap">角色</TableHead>
                  <TableHead className="whitespace-nowrap">状态</TableHead>
                  <TableHead className="whitespace-nowrap">权限</TableHead>
                  <TableHead className="whitespace-nowrap">加入时间</TableHead>
                  <TableHead className="whitespace-nowrap">最近活跃</TableHead>
                  <TableHead className="whitespace-nowrap pr-5 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="size-8 opacity-30" />
                        <span className="text-sm">没有找到匹配的成员</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member, i) => {
                    const roleCfg = ROLE_CONFIG[member.role];
                    const statusCfg = STATUS_CONFIG[member.status];
                    const StatusIcon = statusCfg.icon;

                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                        className="border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        {/* 成员信息 */}
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="size-9 shrink-0">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium truncate">
                                  {member.name}
                                </span>
                                {member.role === 'admin' && (
                                  <Shield className="size-3 shrink-0 text-primary" />
                                )}
                              </div>
                              <span className="block text-xs text-muted-foreground truncate">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* 角色 */}
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={roleCfg.variant} className="text-xs font-medium">
                            {roleCfg.label}
                          </Badge>
                        </TableCell>

                        {/* 状态 */}
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className={`size-3.5 ${statusCfg.className}`} />
                            <span className="text-xs text-muted-foreground">
                              {statusCfg.label}
                            </span>
                          </div>
                        </TableCell>

                        {/* 权限 */}
                        <TableCell className="whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {member.permissions.projectAccess && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                项目
                              </Badge>
                            )}
                            {member.permissions.datasetAccess && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                数据集
                              </Badge>
                            )}
                            {member.permissions.deployAccess && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                部署
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* 加入时间 */}
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(member.joinedAt)}
                        </TableCell>

                        {/* 最近活跃 */}
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(member.lastActiveAt)}
                        </TableCell>

                        {/* 操作 */}
                        <TableCell className="whitespace-nowrap pr-5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(member)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 size-3.5" />
                                编辑权限
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  toast.info(`已向 ${member.email} 发送邮件`);
                                }}
                                className="cursor-pointer"
                              >
                                <Mail className="mr-2 size-3.5" />
                                发送邮件
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(member)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-3.5" />
                                移除成员
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 编辑权限对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑成员权限</DialogTitle>
            <DialogDescription>
              {selectedMember?.name} · {selectedMember?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* 角色选择 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">角色</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as ITeamMember['role'])}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员 - 全部权限</SelectItem>
                  <SelectItem value="developer">开发者 - 项目与数据集权限</SelectItem>
                  <SelectItem value="viewer">观察者 - 仅查看权限</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 细粒度权限 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">细粒度权限</Label>
              <div className="space-y-2.5 rounded-lg border border-border/40 p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={editPermissions.projectAccess}
                    onCheckedChange={(v) =>
                      setEditPermissions((prev) => ({ ...prev, projectAccess: !!v }))
                    }
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">项目访问</span>
                    <p className="text-xs text-muted-foreground">查看、创建和管理项目</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={editPermissions.datasetAccess}
                    onCheckedChange={(v) =>
                      setEditPermissions((prev) => ({ ...prev, datasetAccess: !!v }))
                    }
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">数据集访问</span>
                    <p className="text-xs text-muted-foreground">上传、查看和管理数据集</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={editPermissions.deployAccess}
                    onCheckedChange={(v) =>
                      setEditPermissions((prev) => ({ ...prev, deployAccess: !!v }))
                    }
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">部署权限</span>
                    <p className="text-xs text-muted-foreground">部署模型和管理实例</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>移除成员</DialogTitle>
            <DialogDescription>
              确定要移除成员 <span className="font-medium text-foreground">{selectedMember?.name}</span> 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 邀请成员对话框 */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>邀请团队成员</DialogTitle>
            <DialogDescription>
              输入邮箱地址并选择角色，系统将发送邀请邮件
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-sm font-medium">
                邮箱地址 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">角色</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as ITeamMember['role'])}
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="developer">开发者</SelectItem>
                  <SelectItem value="viewer">观察者</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleInvite}>
              <Mail className="mr-1.5 size-3.5" />
              发送邀请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 需要 Users 图标用于空状态
import { Users } from 'lucide-react';
