import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger, scopedStorage } from '@lark-apaas/client-toolkit-lite';
import {
  User,
  Key,
  Bell,
  Shield,
  ArrowUpRight,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { MOCK_USER_SETTINGS } from '@/data/userSettings';
import type { IUserSettings, IApiKey, INotificationSettings } from '@/types/settings';

// ============================================================
// 持久化
// ============================================================
const STORAGE_KEY = '__neuralforge_userSettings';

function loadSettings(): IUserSettings {
  try {
    const stored = scopedStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as IUserSettings;
    }
  } catch {
    logger.warn('Failed to load user settings, using defaults');
  }
  return MOCK_USER_SETTINGS;
}

function persistSettings(settings: IUserSettings) {
  try {
    scopedStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    logger.error('Failed to save settings:', String(err));
  }
}

// ============================================================
// Tab 配置
// ============================================================
const TABS = [
  { key: 'profile', label: '个人信息', icon: User },
  { key: 'api-keys', label: 'API 密钥', icon: Key },
  { key: 'notifications', label: '通知设置', icon: Bell },
  { key: 'security', label: '安全设置', icon: Shield },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ============================================================
// 子组件: 个人信息
// ============================================================
function ProfilePanel({
  profile,
  onSave,
}: {
  profile: IUserSettings['profile'];
  onSave: (p: IUserSettings['profile']) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [company, setCompany] = useState(profile.company);
  const [position, setPosition] = useState(profile.position);
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !email.trim()) {
        toast.error('姓名和邮箱不能为空');
        return;
      }
      setSaving(true);
      await new Promise((r) => setTimeout(r, 600));
      onSave({ name: name.trim(), email: email.trim(), company: company.trim(), position: position.trim() });
      toast.success('个人信息已保存');
      setSaving(false);
    },
    [name, email, company, position, onSave],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* 头像区 */}
      <div className="flex items-center gap-4 pb-6 border-b border-black">
        <Avatar className="size-16">
          <AvatarImage src="" alt={name} />
          <AvatarFallback className="bg-black text-background heading-bold text-lg">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
          <button
            type="button"
            className="mt-1 text-[10px] uppercase font-bold tracking-widest hover:underline transition-colors"
            onClick={() => toast.info('头像上传功能（演示模式）')}
          >
            更换头像
          </button>
        </div>
      </div>

      {/* 表单字段 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">姓名</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-black"
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">邮箱</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border-black"
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">公司</Label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-background border-black"
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">职位</Label>
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="bg-background border-black"
            disabled={saving}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-black">
        <Button
          type="submit"
          disabled={saving}
          className="bg-black text-background hover:bg-black/80 transition-colors text-sm font-bold px-8 h-11"
        >
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
}

// ============================================================
// 子组件: API 密钥
// ============================================================
function ApiKeysPanel({
  apiKeys,
  onUpdateKeys,
}: {
  apiKeys: IApiKey[];
  onUpdateKeys: (keys: IApiKey[]) => void;
}) {
  const [keys, setKeys] = useState(apiKeys);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const toggleReveal = useCallback((id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreate = useCallback(() => {
    if (!newKeyName.trim()) {
      toast.error('请输入密钥名称');
      return;
    }
    const newKey: IApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      prefix: 'nf_',
      fullKey: `nf_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      status: 'active' as const,
    };
    const updated = [...keys, newKey];
    setKeys(updated);
    onUpdateKeys(updated);
    setNewKeyValue(newKey.fullKey);
    setNewKeyName('');
    toast.success('API 密钥已生成');
    logger.info('API key created:', newKey.id);
  }, [newKeyName, keys, onUpdateKeys]);

  const handleToggleStatus = useCallback(
    (id: string) => {
      const updated = keys.map((k) =>
        k.id === id ? { ...k, status: k.status === 'active' ? ('revoked' as const) : ('active' as const) } : k,
      );
      setKeys(updated);
      onUpdateKeys(updated);
      const target = updated.find((k) => k.id === id);
      toast.success(`密钥已${target?.status === 'active' ? '启用' : '禁用'}`);
    },
    [keys, onUpdateKeys],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = keys.filter((k) => k.id !== id);
      setKeys(updated);
      onUpdateKeys(updated);
      setDeleteTarget(null);
      toast.success('密钥已删除');
    },
    [keys, onUpdateKeys],
  );

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('已复制到剪贴板'));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          管理您的 API 访问密钥，请妥善保管
        </p>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
        >
          <Plus className="size-4" />
          生成新密钥
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="border border-black p-12 text-center">
          <Key className="size-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-bold">暂无 API 密钥</p>
          <p className="text-xs text-muted-foreground mt-1">点击上方按钮生成您的第一个密钥</p>
        </div>
      ) : (
        <div className="border border-black">
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left p-4 text-xs uppercase font-bold tracking-widest text-muted-foreground whitespace-nowrap">名称</th>
                  <th className="text-left p-4 text-xs uppercase font-bold tracking-widest text-muted-foreground whitespace-nowrap">密钥</th>
                  <th className="text-left p-4 text-xs uppercase font-bold tracking-widest text-muted-foreground whitespace-nowrap">创建时间</th>
                  <th className="text-left p-4 text-xs uppercase font-bold tracking-widest text-muted-foreground whitespace-nowrap">最后使用</th>
                  <th className="text-left p-4 text-xs uppercase font-bold tracking-widest text-muted-foreground whitespace-nowrap">状态</th>
                  <th className="text-right p-4 text-xs uppercase font-bold tracking-widest text-muted-foreground whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-b border-black last:border-b-0 hover:bg-black/5 transition-colors">
                    <td className="p-4 text-sm font-bold whitespace-nowrap">{key.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono tabular-nums">
                          {revealedKeys.has(key.id) ? key.fullKey : `${key.prefix}${'•'.repeat(24)}`}
                        </code>
                        <button
                          onClick={() => toggleReveal(key.id)}
                          className="shrink-0 p-1 hover:bg-black hover:text-background transition-colors"
                          aria-label={revealedKeys.has(key.id) ? '隐藏' : '显示'}
                        >
                          {revealedKeys.has(key.id) ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(key.fullKey)}
                          className="shrink-0 p-1 hover:bg-black hover:text-background transition-colors"
                          aria-label="复制"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(key.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="p-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString('zh-CN') : '—'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge
                        variant={key.status === 'active' ? 'default' : 'secondary'}
                        className="text-[10px] uppercase font-bold tracking-widest"
                      >
                        {key.status === 'active' ? (
                          <CheckCircle2 className="size-3 mr-1 inline" />
                        ) : (
                          <XCircle className="size-3 mr-1 inline" />
                        )}
                        {key.status === 'active' ? '活跃' : '已撤销'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(key.id)}
                          className="p-1.5 text-xs font-bold hover:bg-black hover:text-background transition-colors"
                          title={key.status === 'active' ? '禁用' : '启用'}
                        >
                          <RefreshCw className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(key.id)}
                          className="p-1.5 text-xs font-bold hover:bg-black hover:text-background transition-colors text-destructive"
                          title="删除"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 创建密钥对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="border-black sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="heading-bold text-lg">生成新 API 密钥</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              为密钥命名以便识别，生成后请立即复制保存
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">密钥名称</Label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="例如：生产环境密钥"
                className="bg-background border-black"
              />
            </div>
            {newKeyValue && (
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">生成的密钥</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-black/5 p-2 break-all border border-black">{newKeyValue}</code>
                  <button
                    onClick={() => handleCopy(newKeyValue)}
                    className="shrink-0 p-2 border border-black hover:bg-black hover:text-background transition-colors"
                  >
                    <Copy className="size-4" />
                  </button>
                </div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-destructive">
                  此密钥仅显示一次，请立即复制保存
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewKeyName('');
                setNewKeyValue('');
              }}
              className="border-black text-sm font-bold"
            >
              关闭
            </Button>
            {!newKeyValue && (
              <Button
                onClick={handleCreate}
                className="bg-black text-background hover:bg-black/80 transition-colors text-sm font-bold"
              >
                生成密钥
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="border-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="heading-bold text-lg">确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              删除后该密钥将立即失效，所有使用该密钥的 API 请求将被拒绝。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black text-sm font-bold">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-black text-background hover:bg-black/80 transition-colors text-sm font-bold"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// 子组件: 通知设置
// ============================================================
function NotificationsPanel({
  settings,
  onSave,
}: {
  settings: INotificationSettings;
  onSave: (s: INotificationSettings) => void;
}) {
  const [notifs, setNotifs] = useState(settings);

  const toggle = useCallback(
    (key: keyof INotificationSettings) => {
      setNotifs((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        onSave(next);
        return next;
      });
    },
    [onSave],
  );

  const items: { key: keyof INotificationSettings; label: string; desc: string }[] = [
    { key: 'trainingComplete', label: '训练完成通知', desc: '训练任务完成时发送通知' },
    { key: 'deployStatus', label: '部署状态通知', desc: '模型部署状态变更时发送通知' },
    { key: 'resourceAlert', label: '资源告警通知', desc: 'GPU/CPU/内存超过阈值时发送告警' },
    { key: 'teamInvite', label: '团队邀请通知', desc: '收到团队邀请时发送通知' },
  ];

  return (
    <div className="space-y-0 border border-black">
      {items.map((item, i) => (
        <div
          key={item.key}
          className={`flex items-center justify-between p-5 ${i < items.length - 1 ? 'border-b border-black' : ''}`}
        >
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-bold">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
          <Switch
            checked={notifs[item.key]}
            onCheckedChange={() => toggle(item.key)}
            className="data-[state=checked]:bg-black shrink-0"
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 子组件: 安全设置
// ============================================================
function SecurityPanel({
  twoFactorEnabled,
  onTwoFactorChange,
}: {
  twoFactorEnabled: boolean;
  onTwoFactorChange: (enabled: boolean) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('请填写所有密码字段');
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
      setSaving(true);
      await new Promise((r) => setTimeout(r, 800));
      toast.success('密码已修改');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaving(false);
    },
    [currentPassword, newPassword, confirmPassword],
  );

  return (
    <div className="space-y-8">
      {/* 修改密码 */}
      <div>
        <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
          <h3 className="heading-bold text-lg">修改密码</h3>
          <ArrowUpRight className="size-4" />
        </div>
        <form onSubmit={handleChangePassword} noValidate className="space-y-5 max-w-md">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">当前密码</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-background border-black"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">新密码</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-background border-black"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">确认新密码</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-background border-black"
              disabled={saving}
            />
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="bg-black text-background hover:bg-black/80 transition-colors text-sm font-bold px-8 h-11"
          >
            {saving ? '修改中...' : '修改密码'}
          </Button>
        </form>
      </div>

      <Separator className="bg-black" />

      {/* 双因素认证 */}
      <div>
        <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
          <h3 className="heading-bold text-lg">双因素认证</h3>
          <ArrowUpRight className="size-4" />
        </div>
        <div className="flex items-center justify-between max-w-md p-5 border border-black">
          <div>
            <p className="text-sm font-bold">启用双因素认证</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              通过身份验证器应用增加账户安全性
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={onTwoFactorChange}
            className="data-[state=checked]:bg-black shrink-0"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function SettingsPage() {
  const [settings, setSettings] = useState<IUserSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const handleProfileSave = useCallback((profile: IUserSettings['profile']) => {
    setSettings((prev) => ({ ...prev, profile }));
    logger.info('Profile updated');
  }, []);

  const handleApiKeysUpdate = useCallback((keys: IApiKey[]) => {
    setSettings((prev) => ({ ...prev, apiKeys: keys }));
  }, []);

  const handleNotificationsSave = useCallback((notifications: INotificationSettings) => {
    setSettings((prev) => ({ ...prev, notifications }));
  }, []);

  const handleTwoFactorChange = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, twoFactorEnabled: enabled },
    }));
  }, []);

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
            个人设置
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            管理您的账户信息、API 密钥、通知偏好和安全设置
          </p>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            您的设置会自动保存到本地存储。API 密钥请妥善保管，生成后仅显示一次。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* Tab 导航 - 方角黑线风格 */}
      <div className="border-b border-black">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors border-r border-black shrink-0 ${
                  isActive
                    ? 'bg-black text-background'
                    : 'hover:bg-black hover:text-background'
                }`}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 内容 */}
      <div className="p-8">
        {activeTab === 'profile' && (
          <ProfilePanel profile={settings.profile} onSave={handleProfileSave} />
        )}
        {activeTab === 'api-keys' && (
          <ApiKeysPanel apiKeys={settings.apiKeys} onUpdateKeys={handleApiKeysUpdate} />
        )}
        {activeTab === 'notifications' && (
          <NotificationsPanel settings={settings.notifications} onSave={handleNotificationsSave} />
        )}
        {activeTab === 'security' && (
          <SecurityPanel
            twoFactorEnabled={settings.security.twoFactorEnabled}
            onTwoFactorChange={handleTwoFactorChange}
          />
        )}
      </div>
    </div>
  );
}
