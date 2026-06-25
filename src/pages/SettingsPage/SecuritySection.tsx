import { useState, useCallback, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Shield, Key, Lock, Eye, EyeOff, Smartphone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface SecuritySectionProps {
  twoFactorEnabled: boolean;
  onTwoFactorChange: (enabled: boolean) => void;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecuritySection({ twoFactorEnabled, onTwoFactorChange }: SecuritySectionProps) {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [tfaLoading, setTfaLoading] = useState(false);

  const handlePasswordChange = useCallback(
    (field: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
    },
    [],
  );

  const handleChangePassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const { currentPassword, newPassword, confirmPassword } = passwordForm;

      if (!currentPassword) {
        toast.error('请输入当前密码');
        return;
      }
      if (!newPassword) {
        toast.error('请输入新密码');
        return;
      }
      if (newPassword.length < 8) {
        toast.error('新密码长度至少 8 位');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('两次输入的新密码不一致');
        return;
      }

      setPasswordSubmitting(true);
      try {
        await new Promise((r) => setTimeout(r, 1000));
        toast.success('密码修改成功');
        logger.info('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) {
        logger.error('Change password failed:', String(err));
        toast.error('密码修改失败，请重试');
      } finally {
        setPasswordSubmitting(false);
      }
    },
    [passwordForm],
  );

  const handleToggleTFA = useCallback(
    async (checked: boolean) => {
      setTfaLoading(true);
      try {
        await new Promise((r) => setTimeout(r, 600));
        onTwoFactorChange(checked);
        toast.success(checked ? '双因素认证已启用' : '双因素认证已关闭');
        logger.info('2FA toggled:', checked);
      } catch (err) {
        logger.error('Toggle 2FA failed:', String(err));
        toast.error('操作失败，请重试');
      } finally {
        setTfaLoading(false);
      }
    },
    [onTwoFactorChange],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* 修改密码 */}
      <Card className="border-black bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="size-4 text-foreground" />
            修改密码
          </CardTitle>
          <CardDescription>定期更新密码以保护账户安全</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* 当前密码 */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-medium">
                当前密码
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange('currentPassword')}
                  placeholder="输入当前密码"
                  className="bg-muted pl-9 pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="!absolute right-1 top-1/2 z-20 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? '隐藏密码' : '显示密码'}
                >
                  {showCurrent ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              </div>
            </div>

            {/* 新密码 */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                新密码
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange('newPassword')}
                  placeholder="输入新密码（至少 8 位）"
                  className="bg-muted pl-9 pr-10"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="!absolute right-1 top-1/2 z-20 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? '隐藏密码' : '显示密码'}
                >
                  {showNew ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                至少 8 位字符，建议包含大小写字母、数字和特殊符号
              </p>
            </div>

            {/* 确认新密码 */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                确认新密码
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange('confirmPassword')}
                  placeholder="再次输入新密码"
                  className="bg-muted pl-9 pr-10"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="!absolute right-1 top-1/2 z-20 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? '隐藏密码' : '显示密码'}
                >
                  {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button type="submit" disabled={passwordSubmitting} size="sm">
                {passwordSubmitting ? '保存中...' : '更新密码'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 双因素认证 */}
      <Card className="border-black bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="size-4 text-foreground" />
            双因素认证 (2FA)
          </CardTitle>
          <CardDescription>启用后登录时需要输入手机验证码，提升账户安全性</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-muted p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center bg-card">
                <Shield className="size-5 text-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">双因素认证</span>
                  <Badge
                    variant={twoFactorEnabled ? 'default' : 'secondary'}
                    className="text-[10px] h-5 px-1.5"
                  >
                    {twoFactorEnabled ? '已启用' : '未启用'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {twoFactorEnabled
                    ? '登录时需要输入手机验证码，账户安全级别高'
                    : '建议启用以增强账户安全性'}
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleToggleTFA}
              disabled={tfaLoading}
              aria-label="切换双因素认证"
            />
          </div>
        </CardContent>
      </Card>

      {/* 安全提示 */}
      <Card className="border-black bg-card">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="flex size-8 shrink-0 items-center justify-center bg-card mt-0.5">
            <Shield className="size-4 text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">安全建议</p>
            <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
              <li>• 使用至少 8 位包含大小写字母、数字和特殊字符的强密码</li>
              <li>• 不要在多个平台使用相同的密码</li>
              <li>• 定期更换密码（建议每 90 天）</li>
              <li>• 启用双因素认证以获得额外的安全保护</li>
              <li>• 不要在公共设备上保存登录状态</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
