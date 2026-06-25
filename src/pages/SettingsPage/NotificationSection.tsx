import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Bell, BellOff, Volume2, AlertTriangle, Rocket, UserPlus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import type { INotificationSettings } from '@/types/settings';

interface NotificationSectionProps {
  settings: INotificationSettings;
  onSave: (settings: INotificationSettings) => void;
}

interface NotificationItem {
  key: keyof INotificationSettings;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NOTIFICATION_ITEMS: NotificationItem[] = [
  {
    key: 'trainingComplete',
    label: '训练完成通知',
    description: '当训练任务完成、失败或中断时发送通知',
    icon: Rocket,
    badge: '推荐',
  },
  {
    key: 'deployStatus',
    label: '部署状态通知',
    description: '当模型部署状态变更（成功/失败/回滚）时发送通知',
    icon: Volume2,
  },
  {
    key: 'resourceAlert',
    label: '资源告警通知',
    description: '当 CPU/GPU/内存/存储使用率超过阈值时发送告警',
    icon: AlertTriangle,
    badge: '重要',
  },
  {
    key: 'teamInvite',
    label: '团队邀请通知',
    description: '当有新成员加入团队或收到团队邀请时发送通知',
    icon: UserPlus,
  },
];

export default function NotificationSection({ settings, onSave }: NotificationSectionProps) {
  const [localSettings, setLocalSettings] = useState<INotificationSettings>({ ...settings });
  const [saving, setSaving] = useState(false);

  const hasChanges =
    JSON.stringify(localSettings) !== JSON.stringify(settings);

  const handleToggle = useCallback((key: keyof INotificationSettings) => {
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      onSave(localSettings);
      toast.success('通知设置已保存');
      logger.info('Notification settings saved');
    } catch (err) {
      logger.error('Save notification settings failed:', String(err));
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }, [localSettings, onSave]);

  const handleReset = useCallback(() => {
    setLocalSettings({ ...settings });
    toast.info('已恢复原始设置');
  }, [settings]);

  const enabledCount = Object.values(localSettings).filter(Boolean).length;
  const totalCount = NOTIFICATION_ITEMS.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-black bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center bg-card border border-black">
                <Bell className="size-4.5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">通知设置</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  管理平台通知偏好，已开启 {enabledCount}/{totalCount} 项
                </CardDescription>
              </div>
            </div>
            <Badge variant={enabledCount === totalCount ? 'default' : 'secondary'} className="shrink-0 text-xs">
              {enabledCount === totalCount ? (
                <>
                  <Bell className="mr-1 size-3" />
                  全部开启
                </>
              ) : enabledCount === 0 ? (
                <>
                  <BellOff className="mr-1 size-3" />
                  全部关闭
                </>
              ) : (
                <>
                  <Bell className="mr-1 size-3" />
                  {enabledCount}/{totalCount}
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-1">
          {NOTIFICATION_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isEnabled = localSettings[item.key];

            return (
              <div key={item.key}>
                {index > 0 && <Separator className="my-1" />}
                <div className="flex items-center justify-between gap-4 px-3 py-3.5 transition-colors hover:bg-muted">
                  {/* 左侧：图标 + 文字 */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center border border-black transition-colors ${
                        isEnabled
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`notif-${item.key}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {item.label}
                        </Label>
                        {item.badge && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 leading-none border-black text-foreground"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* 右侧：开关 */}
                  <Switch
                    id={`notif-${item.key}`}
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(item.key)}
                    className="shrink-0"
                  />
                </div>
              </div>
            );
          })}

          {/* 操作按钮 */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-end gap-2 pt-4"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={saving}
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存更改'}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
