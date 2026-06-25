import { useState, useCallback, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Shield, Clock, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import type { IApiKey } from '@/types/settings';

interface ApiKeysSectionProps {
  apiKeys: IApiKey[];
  onUpdateKeys: (keys: IApiKey[]) => void;
}

export default function ApiKeysSection({ apiKeys, onUpdateKeys }: ApiKeysSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IApiKey | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const handleCreateKey = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = newKeyName.trim();
      if (!trimmed) {
        toast.error('请输入密钥名称');
        return;
      }

      setSubmitting(true);
      try {
        await new Promise((r) => setTimeout(r, 600));

        const prefix = 'nf_';
        const randomPart = Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join('');
        const fullKey = `${prefix}${randomPart}`;

        const newKey: IApiKey = {
          id: `key_${Date.now()}`,
          name: trimmed,
          prefix: `${prefix}${randomPart.slice(0, 8)}`,
          createdAt: new Date().toISOString(),
          lastUsedAt: '-',
          status: 'active',
        };

        onUpdateKeys([newKey, ...apiKeys]);
        setGeneratedKey(fullKey);
        setNewKeyName('');
        toast.success('API 密钥已生成');

        logger.info('API key created:', trimmed);
      } catch (err) {
        logger.error('Create API key failed:', String(err));
        toast.error('生成失败，请重试');
      } finally {
        setSubmitting(false);
      }
    },
    [newKeyName, apiKeys, onUpdateKeys],
  );

  const handleCopyKey = useCallback(async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      setKeyCopied(true);
      toast.success('密钥已复制到剪贴板');
      setTimeout(() => setKeyCopied(false), 3000);
    } catch {
      toast.error('复制失败，请手动复制');
    }
  }, [generatedKey]);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
    setNewKeyName('');
    setGeneratedKey(null);
    setKeyCopied(false);
  }, []);

  const toggleKeyVisibility = useCallback((keyId: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  }, []);

  const handleToggleStatus = useCallback(
    (key: IApiKey) => {
      const updated = apiKeys.map((k) =>
        k.id === key.id
          ? { ...k, status: k.status === 'active' ? ('disabled' as const) : ('active' as const) }
          : k,
      );
      onUpdateKeys(updated);
      toast.success(
        key.status === 'active' ? `密钥「${key.name}」已禁用` : `密钥「${key.name}」已启用`,
      );
      logger.info(`API key ${key.status === 'active' ? 'disabled' : 'enabled'}:`, key.name);
    },
    [apiKeys, onUpdateKeys],
  );

  const handleDeleteKey = useCallback(() => {
    if (!deleteTarget) return;
    const updated = apiKeys.filter((k) => k.id !== deleteTarget.id);
    onUpdateKeys(updated);
    toast.success(`密钥「${deleteTarget.name}」已删除`);
    logger.info('API key deleted:', deleteTarget.name);
    setDeleteTarget(null);
  }, [deleteTarget, apiKeys, onUpdateKeys]);

  const formatTime = (iso: string) => {
    if (iso === '-') return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-black bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="size-5 text-foreground" />
                API 密钥管理
              </CardTitle>
              <CardDescription>
                管理您的 API 访问密钥，用于 SDK 调用和自动化集成
              </CardDescription>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  生成新密钥
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Key className="size-5 text-foreground" />
                    生成新 API 密钥
                  </DialogTitle>
                  <DialogDescription>
                    为您的应用创建一个新的 API 访问密钥。密钥仅在创建时显示一次，请妥善保管。
                  </DialogDescription>
                </DialogHeader>

                {!generatedKey ? (
                  <form onSubmit={handleCreateKey} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="key-name" className="text-sm font-medium">
                        密钥名称 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="key-name"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="例如：生产环境 API Key"
                        maxLength={50}
                        className="bg-muted"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        用于识别密钥用途，建议使用有意义的名称
                      </p>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseCreate}
                      >
                        取消
                      </Button>
                      <Button type="submit" disabled={submitting || !newKeyName.trim()}>
                        {submitting ? '生成中...' : '生成密钥'}
                      </Button>
                    </DialogFooter>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-success/30 bg-success/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="size-4 text-success" />
                        <span className="text-sm font-semibold text-success">
                          密钥已生成
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        请立即复制并安全保存此密钥。关闭此对话框后将无法再次查看完整密钥。
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            readOnly
                            value={generatedKey}
                            className="bg-muted pr-20 font-mono text-xs"
                          />
                          <TooltipProvider>
                            <Tooltip open={keyCopied}>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="!absolute right-1 top-1/2 z-20 h-7 -translate-y-1/2 gap-1 px-2 text-xs"
                                  onClick={handleCopyKey}
                                >
                                  {keyCopied ? (
                                    <>
                                      <Check className="size-3 text-success" />
                                      已复制
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="size-3" />
                                      复制
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {keyCopied ? '已复制！' : '点击复制'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 border border-warning/20 bg-warning/10 p-3">
                      <Shield className="size-4 text-warning shrink-0 mt-0.5" />
                      <div className="text-xs text-warning/90">
                        <p className="font-medium mb-0.5">安全提醒</p>
                        <p>请勿将 API 密钥分享给他人或提交到版本控制系统。如密钥泄露，请立即禁用或删除。</p>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={handleCloseCreate} className="w-full">
                        我已安全保存，关闭
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Key className="size-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">暂无 API 密钥</p>
              <p className="text-xs text-muted-foreground/60 mt-1 mb-4">
                生成一个 API 密钥以开始使用 SDK 和 API
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-3.5" />
                生成新密钥
              </Button>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">密钥名称</TableHead>
                    <TableHead className="whitespace-nowrap">密钥前缀</TableHead>
                    <TableHead className="whitespace-nowrap">创建时间</TableHead>
                    <TableHead className="whitespace-nowrap">最后使用</TableHead>
                    <TableHead className="whitespace-nowrap">状态</TableHead>
                    <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Key className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[160px]">{key.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                          {visibleKeys.has(key.id) ? key.prefix : `${key.prefix}${'•'.repeat(16)}`}
                        </code>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3" />
                          {formatTime(key.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {key.lastUsedAt === '-' ? (
                          <span className="text-muted-foreground/60">从未使用</span>
                        ) : (
                          formatTime(key.lastUsedAt)
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={key.status === 'active' ? 'default' : 'secondary'}
                          className={
                            key.status === 'active'
                              ? 'bg-success/15 text-success border-success/30'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {key.status === 'active' ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  onClick={() => toggleKeyVisibility(key.id)}
                                  aria-label={visibleKeys.has(key.id) ? '隐藏密钥' : '显示密钥'}
                                >
                                  {visibleKeys.has(key.id) ? (
                                    <EyeOff className="size-3.5" />
                                  ) : (
                                    <Eye className="size-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {visibleKeys.has(key.id) ? '隐藏密钥前缀' : '显示密钥前缀'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  onClick={() => handleToggleStatus(key)}
                                  aria-label={
                                    key.status === 'active' ? '禁用密钥' : '启用密钥'
                                  }
                                >
                                  {key.status === 'active' ? (
                                    <X className="size-3.5 text-warning" />
                                  ) : (
                                    <Check className="size-3.5 text-success" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {key.status === 'active' ? '禁用密钥' : '启用密钥'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  onClick={() => setDeleteTarget(key)}
                                  aria-label="删除密钥"
                                >
                                  <Trash2 className="size-3.5 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">删除密钥</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" />
              删除 API 密钥
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除密钥「{deleteTarget?.name}」吗？此操作不可撤销，使用该密钥的所有应用将立即失去访问权限。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKey}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
