import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import {
  Play,
  Square,
  Maximize2,
  FileText,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Server,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { IDeployInstance } from '@/types/deploy';
import { MOCK_DEPLOY_INSTANCES } from '@/data/deployInstances';

interface DeployInstancesTableProps {
  instances?: IDeployInstance[];
  onInstancesChange?: (instances: IDeployInstance[]) => void;
}

const STATUS_CONFIG: Record<
  IDeployInstance['status'],
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; dot: string }
> = {
  running: { label: '运行中', variant: 'default', dot: 'bg-success' },
  stopped: { label: '已停止', variant: 'secondary', dot: 'bg-muted-foreground' },
  deploying: { label: '部署中', variant: 'outline', dot: 'bg-warning animate-pulse' },
  failed: { label: '异常', variant: 'destructive', dot: 'bg-destructive' },
  scaling: { label: '扩缩容中', variant: 'outline', dot: 'bg-foreground animate-pulse' },
};

const MOCK_LOGS = [
  '[2026-06-25 14:32:01] [INFO] Health check passed - status: 200',
  '[2026-06-25 14:31:58] [INFO] Request latency p99: 45ms',
  '[2026-06-25 14:31:45] [INFO] GPU memory usage: 68% (10.9GB / 16GB)',
  '[2026-06-25 14:31:30] [INFO] Batch inference completed: 128 samples in 0.8s',
  '[2026-06-25 14:31:15] [INFO] Model loaded successfully: v2.3.1',
  '[2026-06-25 14:31:00] [INFO] Container started: neuralforge-infer-a7f3',
  '[2026-06-25 14:30:45] [INFO] Pulling image: neuralforge/inference:v2.3.1',
  '[2026-06-25 14:30:30] [INFO] Orchestrator assigned node: gpu-node-04',
  '[2026-06-25 14:30:15] [INFO] Deployment initiated by James Bond',
  '[2026-06-25 14:30:00] [INFO] Starting deployment pipeline...',
];

const MOCK_ROLLBACK_VERSIONS = [
  { id: 'v1', label: 'v2.3.0 (2026-06-24)', accuracy: '93.8%' },
  { id: 'v2', label: 'v2.2.1 (2026-06-22)', accuracy: '92.5%' },
  { id: 'v3', label: 'v2.1.0 (2026-06-18)', accuracy: '91.2%' },
];

export default function DeployInstancesTable({
  instances: externalInstances,
  onInstancesChange,
}: DeployInstancesTableProps) {
  const [internalInstances, setInternalInstances] = useState<IDeployInstance[]>(MOCK_DEPLOY_INSTANCES);
  const instances = externalInstances ?? internalInstances;
  const setInstances = onInstancesChange ?? setInternalInstances;

  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [logDrawerOpen, setLogDrawerOpen] = useState(false);
  const [logInstanceId, setLogInstanceId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [rollbackTargetId, setRollbackTargetId] = useState<string | null>(null);
  const [rollbackVersion, setRollbackVersion] = useState('');

  const filteredInstances = useMemo(() => {
    return instances.filter((inst) => {
      const matchKeyword =
        !searchKeyword.trim() ||
        inst.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        inst.modelName.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchStatus = statusFilter === 'all' || inst.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [instances, searchKeyword, statusFilter]);

  const handleStart = useCallback(
    (id: string) => {
      setInstances(
        instances.map((inst) =>
          inst.id === id ? { ...inst, status: 'running' as const, uptime: '刚刚' } : inst,
        ),
      );
      toast.success('实例已启动');
      logger.info('Instance started:', id);
    },
    [instances, setInstances],
  );

  const handleStop = useCallback(
    (id: string) => {
      setInstances(
        instances.map((inst) =>
          inst.id === id ? { ...inst, status: 'stopped' as const } : inst,
        ),
      );
      toast.success('实例已停止');
      logger.info('Instance stopped:', id);
    },
    [instances, setInstances],
  );

  const handleViewLogs = useCallback((id: string) => {
    setLogInstanceId(id);
    setLogs([...MOCK_LOGS]);
    setLogDrawerOpen(true);
  }, []);

  const handleCopyEndpoint = useCallback(
    async (endpoint: string) => {
      try {
        await navigator.clipboard.writeText(endpoint);
        toast.success('端点已复制到剪贴板');
      } catch {
        toast.error('复制失败');
      }
    },
    [],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTargetId) return;
    setInstances(instances.filter((inst) => inst.id !== deleteTargetId));
    toast.success('实例已删除');
    logger.info('Instance deleted:', deleteTargetId);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  }, [deleteTargetId, instances, setInstances]);

  const handleRollbackConfirm = useCallback(() => {
    if (!rollbackTargetId || !rollbackVersion) {
      toast.error('请选择回滚版本');
      return;
    }
    toast.success(`已回滚至 ${rollbackVersion}`);
    logger.info('Rollback:', rollbackTargetId, 'to', rollbackVersion);
    setRollbackDialogOpen(false);
    setRollbackTargetId(null);
    setRollbackVersion('');
  }, [rollbackTargetId, rollbackVersion]);

  const logInstance = instances.find((i) => i.id === logInstanceId);

  return (
    <>
      {/* 搜索筛选栏 */}
      <Card className="border-black bg-card">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索实例名称、模型名称..."
              className="h-9 bg-muted pl-3 pr-3 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[140px] bg-muted text-sm">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="running">运行中</SelectItem>
              <SelectItem value="stopped">已停止</SelectItem>
              <SelectItem value="deploying">部署中</SelectItem>
              <SelectItem value="failed">异常</SelectItem>
              <SelectItem value="scaling">扩缩容中</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            共 {filteredInstances.length} 个实例
          </span>
        </CardContent>
      </Card>

      {/* 实例列表表格 */}
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">部署实例列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-black hover:bg-transparent">
                  <TableHead className="whitespace-nowrap min-w-[160px]">实例名称</TableHead>
                  <TableHead className="whitespace-nowrap">模型版本</TableHead>
                  <TableHead className="whitespace-nowrap">状态</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[200px]">端点</TableHead>
                  <TableHead className="whitespace-nowrap">规格</TableHead>
                  <TableHead className="whitespace-nowrap">运行时长</TableHead>
                  <TableHead className="whitespace-nowrap">QPS</TableHead>
                  <TableHead className="whitespace-nowrap">延迟</TableHead>
                  <TableHead className="whitespace-nowrap">资源</TableHead>
                  <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Server className="size-8 opacity-40" />
                        <span className="text-sm">暂无部署实例</span>
                        <span className="text-xs">创建部署任务后将在此处显示</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstances.map((inst, idx) => {
                    const statusCfg = STATUS_CONFIG[inst.status];
                    return (
                      <motion.tr
                        key={inst.id}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.04 }}
                        className="border-black"
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="truncate max-w-[150px] text-sm">{inst.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {inst.modelName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-mono">
                            {inst.modelVersionName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-block size-2 ${statusCfg.dot}`}
                            />
                            <Badge variant={statusCfg.variant} className="text-xs">
                              {statusCfg.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="truncate max-w-[160px] text-xs font-mono text-muted-foreground">
                              {inst.endpoint}
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 shrink-0"
                                    onClick={() => handleCopyEndpoint(inst.endpoint)}
                                    aria-label="复制端点"
                                  >
                                    <Copy className="size-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  复制端点
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 shrink-0"
                                    onClick={() => window.open(`https://${inst.endpoint}`, '_blank')}
                                    aria-label="打开端点"
                                  >
                                    <ExternalLink className="size-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  打开端点
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {inst.spec}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                          {inst.uptime}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            {inst.qps}
                          </span>
                          <span className="text-xs text-muted-foreground ml-0.5">/s</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              inst.latency > 100
                                ? 'text-warning'
                                : inst.latency > 200
                                  ? 'text-destructive'
                                  : 'text-success'
                            }`}
                          >
                            {inst.latency}
                          </span>
                          <span className="text-xs text-muted-foreground ml-0.5">ms</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-10 bg-muted overflow-hidden">
                                      <div
                                        className="h-full bg-foreground transition-all duration-500"
                                        style={{ width: `${inst.cpuUsage}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] tabular-nums text-muted-foreground">
                                      {inst.cpuUsage}%
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  CPU: {inst.cpuUsage}%
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    <div className="h-1.5 w-10 bg-muted overflow-hidden">
                                      <div
                                        className="h-full bg-foreground transition-all duration-500"
                                        style={{ width: `${inst.gpuUsage}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] tabular-nums text-muted-foreground">
                                      {inst.gpuUsage}%
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  GPU: {inst.gpuUsage}%
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            {inst.status === 'stopped' || inst.status === 'failed' ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      onClick={() => handleStart(inst.id)}
                                      aria-label="启动"
                                    >
                                      <Play className="size-3.5 text-success" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    启动
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : null}
                            {inst.status === 'running' ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      onClick={() => handleStop(inst.id)}
                                      aria-label="停止"
                                    >
                                      <Square className="size-3.5 text-warning" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    停止
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : null}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8" aria-label="更多操作">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs"
                                  onClick={() => handleViewLogs(inst.id)}
                                >
                                  <FileText className="mr-2 size-3.5" />
                                  查看日志
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs"
                                  onClick={() => toast.info('扩容功能')}
                                >
                                  <Maximize2 className="mr-2 size-3.5" />
                                  扩容
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs"
                                  onClick={() => {
                                    setRollbackTargetId(inst.id);
                                    setRollbackVersion('');
                                    setRollbackDialogOpen(true);
                                  }}
                                >
                                  <RotateCcw className="mr-2 size-3.5" />
                                  版本回滚
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setDeleteTargetId(inst.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 size-3.5" />
                                  删除实例
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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

      {/* 日志查看抽屉 */}
      <Dialog open={logDrawerOpen} onOpenChange={setLogDrawerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-foreground" />
              实例日志
            </DialogTitle>
            <DialogDescription className="text-xs">
              {logInstance?.name} — {logInstance?.modelVersionName}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-[300px] max-h-[50vh] border border-black bg-card p-4">
            <pre className="font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap break-all">
              {logs.length === 0 ? (
                <span className="text-muted-foreground">暂无日志...</span>
              ) : (
                logs.map((line, i) => (
                  <div
                    key={i}
                    className={`py-0.5 ${
                      line.includes('[ERROR]')
                        ? 'text-destructive'
                        : line.includes('[WARN]')
                          ? 'text-warning'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {line}
                  </div>
                ))
              )}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除实例？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后实例将立即停止运行，端点将不可用。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 版本回滚对话框 */}
      <AlertDialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>版本回滚</AlertDialogTitle>
            <AlertDialogDescription>
              选择要回滚到的目标版本。回滚后当前实例将替换为所选版本的模型。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={rollbackVersion} onValueChange={setRollbackVersion}>
              <SelectTrigger className="w-full bg-muted">
                <SelectValue placeholder="选择回滚版本" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_ROLLBACK_VERSIONS.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{v.label}</span>
                      <Badge variant="outline" className="text-xs">
                        Acc: {v.accuracy}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollbackConfirm} disabled={!rollbackVersion}>
              确认回滚
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
