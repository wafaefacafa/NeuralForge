import { useState, useCallback, type FormEvent } from 'react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { User, Mail, Building2, Briefcase, Camera, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { IUserProfile } from '@/types/settings';

interface ProfileSectionProps {
  profile: IUserProfile;
  onSave: (profile: IUserProfile) => void;
}

export default function ProfileSection({ profile, onSave }: ProfileSectionProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [company, setCompany] = useState(profile.company);
  const [position, setPosition] = useState(profile.position);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar || '');
  const [saving, setSaving] = useState(false);

  const hasChanges =
    name !== profile.name ||
    email !== profile.email ||
    company !== profile.company ||
    position !== profile.position ||
    avatarUrl !== (profile.avatar || '');

  const handleAvatarUpload = useCallback(() => {
    toast.info('头像上传功能将在后续版本开放');
    logger.info('Avatar upload clicked');
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        toast.error('请输入姓名');
        return;
      }
      if (!email.trim()) {
        toast.error('请输入邮箱');
        return;
      }

      setSaving(true);
      try {
        await new Promise((r) => setTimeout(r, 600));
        const updated: IUserProfile = {
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          position: position.trim(),
          avatar: avatarUrl.trim() || undefined,
        };
        onSave(updated);
        toast.success('个人信息已保存');
        logger.info('Profile saved:', updated);
      } catch (err) {
        logger.error('Save profile failed:', String(err));
        toast.error('保存失败，请重试');
      } finally {
        setSaving(false);
      }
    },
    [name, email, company, position, avatarUrl, onSave],
  );

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <Card className="border-black bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="size-5 text-foreground" />
          个人信息
        </CardTitle>
        <CardDescription>管理您的个人资料和账户信息</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 头像区域 */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar className="size-20 ring-2 ring-black">
                <AvatarImage src={avatarUrl || undefined} alt={name} />
                <AvatarFallback className="bg-card text-foreground text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="!absolute -bottom-1 -right-1 z-20 size-7 rounded-none"
                onClick={handleAvatarUpload}
                aria-label="更换头像"
              >
                <Camera className="size-3.5" />
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{name || '未设置姓名'}</p>
              <p className="text-xs text-muted-foreground">
                支持 JPG、PNG 格式，建议尺寸 256×256px
              </p>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-foreground"
                onClick={handleAvatarUpload}
              >
                上传新头像
              </Button>
            </div>
          </div>

          <Separator className="bg-black" />

          {/* 基本信息表单 */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* 姓名 */}
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-sm font-medium">
                姓名 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入您的姓名"
                  maxLength={30}
                  className="bg-muted pl-9"
                />
              </div>
            </div>

            {/* 邮箱 */}
            <div className="space-y-2">
              <Label htmlFor="profile-email" className="text-sm font-medium">
                邮箱 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入您的邮箱"
                  maxLength={50}
                  className="bg-muted pl-9"
                />
              </div>
            </div>

            {/* 公司 */}
            <div className="space-y-2">
              <Label htmlFor="profile-company" className="text-sm font-medium">
                公司
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profile-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="请输入公司名称"
                  maxLength={50}
                  className="bg-muted pl-9"
                />
              </div>
            </div>

            {/* 职位 */}
            <div className="space-y-2">
              <Label htmlFor="profile-position" className="text-sm font-medium">
                职位
              </Label>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profile-position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="请输入您的职位"
                  maxLength={30}
                  className="bg-muted pl-9"
                />
              </div>
            </div>
          </div>

          {/* 头像 URL 输入 */}
          <div className="space-y-2">
            <Label htmlFor="profile-avatar-url" className="text-sm font-medium">
              头像链接
            </Label>
            <Input
              id="profile-avatar-url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              maxLength={200}
              className="bg-muted"
            />
            <p className="text-[11px] text-muted-foreground">
              输入头像图片的 URL 地址，留空则使用默认头像
            </p>
          </div>

          {/* 保存按钮 */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setName(profile.name);
                setEmail(profile.email);
                setCompany(profile.company);
                setPosition(profile.position);
                setAvatarUrl(profile.avatar || '');
              }}
              disabled={!hasChanges}
            >
              重置
            </Button>
            <Button type="submit" disabled={saving || !hasChanges}>
              {saving ? (
                <>
                  <span className="mr-2 inline-block size-3.5 animate-spin rounded-none border-2 border-current border-t-transparent" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  保存修改
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
