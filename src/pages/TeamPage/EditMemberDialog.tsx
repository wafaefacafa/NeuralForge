import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Shield, User, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import type { ITeamMember } from '@/types/team';

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: ITeamMember | null;
  onSave: (member: ITeamMember) => void;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: '管理员', description: '完整权限：管理成员、项目、部署' },
  { value: 'developer', label: '开发者', description: '开发权限：创建项目、训练模型、管理数据集' },
  { value: 'viewer', label: '观察者', description: '只读权限：查看项目、模型、资源' },
] as const;

const ROLE_COLOR_MAP: Record<string, string> = {
  admin: 'text-destructive border-destructive/40',
  developer: 'text-primary border-primary/40',
  viewer: 'text-muted-foreground border-muted-foreground/40',
};

const ROLE_BG_MAP: Record<string, string> = {
  admin: 'bg-destructive/10',
  developer: 'bg-primary/10',
  viewer: 'bg-muted',
};

export default function EditMemberDialog({
  open,
  onOpenChange,
  member,
  onSave,
}: EditMemberDialogProps) {
  const [role, setRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
  const [projectAccess, setProjectAccess] = useState(true);
  const [datasetAccess, setDatasetAccess] = useState(true);
  const [deployAccess, setDeployAccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // 当 member 变化时同步表单状态
  useEffect(() => {
    if (member) {
      setRole(member.role);
      setProjectAccess(member.permissions.projectAccess);
      setDatasetAccess(member.permissions.datasetAccess);
      setDeployAccess(member.permissions.deployAccess);
    }
  }, [member]);

  const handleSave = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!member) return;

      setSaving(true);
      try {
        await new Promise((r) => setTimeout(r, 600));

        const updated: ITeamMember = {
          ...member,
          role,
          permissions: {
            projectAccess,
            datasetAccess,
            deployAccess,
          },
        };

        onSave(updated);
        toast.success(`已更新 ${member.name} 的权限`);
        logger.info('Member updated:', { id: member.id, role, permissions: updated.permissions });
        onOpenChange(false);
      } catch (err) {
        logger.error('Update member failed:', String(err));
        toast.error('更新失败，请重试');
      } finally {
        setSaving(false);
      }
    },
    [member, role, projectAccess, datasetAccess, deployAccess, onSave, onOpenChange],
  );

  if (!member) return null;

  const initials = member.name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            编辑成员权限
          </DialogTitle>
          <DialogDescription>
            修改 {member.name} 的角色和访问权限
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
          {/* 成员信息 */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 text-xs ${ROLE_COLOR_MAP[member.role] ?? ''}`}
            >
              {ROLE_OPTIONS.find((r) => r.value === member.role)?.label ?? member.role}
            </Badge>
          </div>

          <Separator />

          {/* 角色选择 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <User className="size-4 text-muted-foreground" />
              角色
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-[11px] text-muted-foreground">{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 角色说明 */}
            <div
              className={`rounded-lg border p-3 text-xs ${ROLE_COLOR_MAP[role] ?? ''} ${ROLE_BG_MAP[role] ?? ''}`}
            >
              {ROLE_OPTIONS.find((r) => r.value === role)?.description}
            </div>
          </div>

          <Separator />

          {/* 细粒度权限 */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Eye className="size-4 text-muted-foreground" />
              访问权限
            </Label>

            {/* 项目访问 */}
            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">项目访问</p>
                <p className="text-xs text-muted-foreground">查看和操作项目</p>
              </div>
              <Switch
                checked={projectAccess}
                onCheckedChange={setProjectAccess}
                disabled={role === 'admin'}
              />
            </div>

            {/* 数据集访问 */}
            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">数据集访问</p>
                <p className="text-xs text-muted-foreground">查看和管理数据集</p>
              </div>
              <Switch
                checked={datasetAccess}
                onCheckedChange={setDatasetAccess}
                disabled={role === 'admin'}
              />
            </div>

            {/* 部署权限 */}
            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">部署权限</p>
                <p className="text-xs text-muted-foreground">部署模型到生产环境</p>
              </div>
              <Switch
                checked={deployAccess}
                onCheckedChange={setDeployAccess}
                disabled={role === 'admin'}
              />
            </div>

            {role === 'admin' && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2.5">
                <EyeOff className="size-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  管理员拥有所有权限，无需单独配置
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : '保存更改'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
