import { useState, useCallback, type FormEvent } from 'react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Mail, UserCog, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSuccess?: (email: string, role: string) => void;
}

const ROLE_OPTIONS = [
  { value: 'developer', label: '开发者', desc: '可创建项目、训练模型、管理数据集' },
  { value: 'viewer', label: '观察者', desc: '只读访问，查看项目和数据' },
  { value: 'admin', label: '管理员', desc: '完整权限，管理团队和资源' },
] as const;

export default function InviteMemberDialog({
  open,
  onOpenChange,
  onInviteSuccess,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        toast.error('请输入邮箱地址');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        toast.error('请输入有效的邮箱地址');
        return;
      }

      setSubmitting(true);
      try {
        await new Promise((r) => setTimeout(r, 800));
        toast.success(`邀请已发送至 ${trimmedEmail}`);
        logger.info('Member invited:', { email: trimmedEmail, role });
        onInviteSuccess?.(trimmedEmail, role);
        setEmail('');
        setRole('developer');
        onOpenChange(false);
      } catch (err) {
        logger.error('Invite member failed:', String(err));
        toast.error('邀请发送失败，请重试');
      } finally {
        setSubmitting(false);
      }
    },
    [email, role, onInviteSuccess, onOpenChange],
  );

  const handleClose = useCallback(() => {
    if (!submitting) {
      setEmail('');
      setRole('developer');
      onOpenChange(false);
    }
  }, [submitting, onOpenChange]);

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UserCog className="size-5 text-primary" />
            邀请团队成员
          </DialogTitle>
          <DialogDescription>
            发送邀请邮件，成员接受后即可加入团队协作
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 邮箱输入 */}
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-sm font-medium">
              邮箱地址 <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="bg-muted/50 pl-9"
                autoComplete="email"
                disabled={submitting}
              />
            </div>
          </div>

          {/* 角色选择 */}
          <div className="space-y-2">
            <Label htmlFor="invite-role" className="text-sm font-medium">
              角色权限 <span className="text-destructive">*</span>
            </Label>
            <Select value={role} onValueChange={setRole} disabled={submitting}>
              <SelectTrigger id="invite-role" className="bg-muted/50">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {opt.desc}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 角色说明卡片 */}
          {selectedRole && (
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex size-6 items-center justify-center rounded bg-primary/10">
                  <UserCog className="size-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium">{selectedRole.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedRole.desc}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting || !email.trim()}>
              {submitting ? (
                <>
                  <span className="mr-2 inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  发送邀请
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
