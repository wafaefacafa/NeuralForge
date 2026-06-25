import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import {
  Search,
  GitCompare,
  Eye,
  Rocket,
  Download,
  Trash2,
  ChevronDown,
  X,
  ArrowUpDown,
  BarChart3,
  Cpu,
  Clock,
  Layers,
  Target,
  BrainCircuit,
  HardDrive,
  CheckCircle2,
  XCircle,
  Play,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Checkbox } from '@/components/ui/checkbox';

import { MOCK_MODEL_VERSIONS } from '@/data/modelVersions';
import type { IModelVersion } from '@/types/models';

// ============================================================
// 状态映射
// ============================================================
const STATUS_CONFIG: Record<
  IModelVersion['status'],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ready: { label: '就绪', icon: CheckCircle2 },
  training: { label: '训练中', icon: Play },
  failed: { label: '失败', icon: XCircle },
  deployed: { label: '已部署', icon: Rocket },
};

// ============================================================
// 版本对比抽屉
// ============================================================
function VersionCompareDrawer({
  open,
  onOpenChange,
  versionA,
  versionB,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versionA: IModelVersion | null;
  versionB: IModelVersion | null;
}) {
  if (!versionA || !versionB) return null;

  const metrics = [
    { label: 'Accuracy', key: 'accuracy' as const, format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { label: 'F1 Score', key: 'f1Score' as const, format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { label: 'Precision', key: 'precision' as const, format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { label: 'Recall', key: 'recall' as const, format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { label: '模型大小', key: 'sizeMB' as const, format: (v: number) => `${v.toFixed(1)} MB` },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[640px] overflow-y-auto border-l border-black">
        <SheetHeader>
          <SheetTitle className="heading-bold text-xl flex items-center gap-2">
            <GitCompare className="size-5" />
            版本对比
          </SheetTitle>
          <SheetDescription className="text-xs font-medium text-muted-foreground">
            对比 {versionA.version} 与 {versionB.version} 的模型指标
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 版本信息卡片 */}
          <div className="grid grid-cols-2 gap-4">
            {[versionA, versionB].map((v, idx) => {
              const StatusIcon = STATUS_CONFIG[v.status].icon;
              return (
                <div
                  key={v.id}
                  className={`border border-black p-4 ${idx === 0 ? 'border-l-[3px]' : 'border-l-[3px] border-l-[#888]'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono">{v.version}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1">
                      <StatusIcon className="size-3" />
                      {STATUS_CONFIG[v.status].label}
                    </span>
                  </div>
                  <p className="text-sm font-bold truncate">{v.modelName}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">{v.projectName}</p>
                </div>
              );
            })}
          </div>

          {/* 指标对比表格 */}
          <div className="border border-black">
            <div className="heading-bold text-sm p-4 border-b border-black flex items-center gap-2">
              <BarChart3 className="size-4" />
              指标对比
            </div>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-black">
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">指标</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">{versionA.version}</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">{versionB.version}</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">差异</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((m) => {
                    const valA = versionA[m.key] as number;
                    const valB = versionB[m.key] as number;
                    const diff = valA - valB;
                    const isBetter = m.key === 'sizeMB' ? diff < 0 : diff > 0;
                    const isEqual = Math.abs(diff) < 0.001;

                    return (
                      <TableRow key={m.key} className="border-black">
                        <TableCell className="text-sm font-bold whitespace-nowrap">{m.label}</TableCell>
                        <TableCell className="text-right text-sm font-mono tabular-nums">{m.format(valA)}</TableCell>
                        <TableCell className="text-right text-sm font-mono tabular-nums">{m.format(valB)}</TableCell>
                        <TableCell className="text-right">
                          {isEqual ? (
                            <span className="text-xs text-muted-foreground">-</span>
                          ) : (
                            <span
                              className={`text-xs font-bold font-mono tabular-nums ${
                                isBetter ? 'text-success' : 'text-destructive'
                              }`}
                            >
                              {isBetter ? '↑' : '↓'} {m.format(Math.abs(diff))}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 超参数对比 */}
          <div className="border border-black">
            <div className="heading-bold text-sm p-4 border-b border-black flex items-center gap-2">
              <Cpu className="size-4" />
              超参数对比
            </div>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-black">
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">参数</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">{versionA.version}</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">{versionB.version}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-black">
                    <TableCell className="text-sm text-muted-foreground">学习率</TableCell>
                    <TableCell className="text-right text-sm font-mono">{versionA.hyperparams.learningRate}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{versionB.hyperparams.learningRate}</TableCell>
                  </TableRow>
                  <TableRow className="border-black">
                    <TableCell className="text-sm text-muted-foreground">Batch Size</TableCell>
                    <TableCell className="text-right text-sm font-mono">{versionA.hyperparams.batchSize}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{versionB.hyperparams.batchSize}</TableCell>
                  </TableRow>
                  <TableRow className="border-black">
                    <TableCell className="text-sm text-muted-foreground">Epochs</TableCell>
                    <TableCell className="text-right text-sm font-mono">{versionA.hyperparams.epochs}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{versionB.hyperparams.epochs}</TableCell>
                  </TableRow>
                  <TableRow className="border-black">
                    <TableCell className="text-sm text-muted-foreground">优化器</TableCell>
                    <TableCell className="text-right text-sm font-mono">{versionA.hyperparams.optimizer}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{versionB.hyperparams.optimizer}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================
// 模型详情抽屉
// ============================================================
function ModelDetailDrawer({
  open,
  onOpenChange,
  version,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: IModelVersion | null;
}) {
  if (!version) return null;

  const StatusIcon = STATUS_CONFIG[version.status].icon;

  const metricBars = [
    { label: 'Accuracy', value: version.accuracy },
    { label: 'F1 Score', value: version.f1Score },
    { label: 'Precision', value: version.precision },
    { label: 'Recall', value: version.recall },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] overflow-y-auto border-l border-black">
        <SheetHeader>
          <SheetTitle className="heading-bold text-xl flex items-center gap-2">
            <Eye className="size-5" />
            模型详情
          </SheetTitle>
          <SheetDescription className="text-xs font-medium text-muted-foreground">
            版本 {version.version} 的完整信息
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 基本信息 */}
          <div className="border border-black">
            <div className="heading-bold text-sm p-4 border-b border-black flex items-center gap-2">
              <Layers className="size-4" />
              基本信息
            </div>
            <div className="divide-y divide-black">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">模型名称</span>
                <span className="text-sm font-bold">{version.modelName}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">所属项目</span>
                <span className="text-sm">{version.projectName}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">框架</span>
                <span className="text-sm font-bold">{version.framework}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">状态</span>
                <span className="text-sm font-bold flex items-center gap-1">
                  <StatusIcon className="size-3.5" />
                  {STATUS_CONFIG[version.status].label}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">模型大小</span>
                <span className="text-sm font-mono tabular-nums">{version.sizeMB.toFixed(1)} MB</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">创建时间</span>
                <span className="text-sm font-mono tabular-nums">
                  {new Date(version.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </div>

          {/* 模型指标 */}
          <div className="border border-black">
            <div className="heading-bold text-sm p-4 border-b border-black flex items-center gap-2">
              <Target className="size-4" />
              模型指标
            </div>
            <div className="p-4 space-y-4">
              {metricBars.map((m) => {
                const pct = Math.round(m.value * 100);
                return (
                  <div key={m.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{m.label}</span>
                      <span className="text-xs font-bold font-mono tabular-nums">{pct}%</span>
                    </div>
                    <div className="w-full h-6 border border-black overflow-hidden bg-black/10">
                      <div
                        className="h-full bg-black transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 超参数 */}
          <div className="border border-black">
            <div className="heading-bold text-sm p-4 border-b border-black flex items-center gap-2">
              <Cpu className="size-4" />
              超参数
            </div>
            <div className="divide-y divide-black">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">学习率</span>
                <span className="text-sm font-mono">{version.hyperparams.learningRate}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Batch Size</span>
                <span className="text-sm font-mono">{version.hyperparams.batchSize}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Epochs</span>
                <span className="text-sm font-mono">{version.hyperparams.epochs}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">优化器</span>
                <span className="text-sm font-mono">{version.hyperparams.optimizer}</span>
              </div>
            </div>
          </div>

          {/* 训练环境 */}
          <div className="border border-black">
            <div className="heading-bold text-sm p-4 border-b border-black flex items-center gap-2">
              <HardDrive className="size-4" />
              训练环境
            </div>
            <div className="divide-y divide-black">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">GPU 型号</span>
                <span className="text-sm font-bold">{version.trainingEnv.gpuType}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">GPU 数量</span>
                <span className="text-sm font-mono">{version.trainingEnv.gpuCount} 卡</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">内存</span>
                <span className="text-sm font-mono">{version.trainingEnv.memoryGB} GB</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================
// 主页面组件
// ============================================================
export default function ModelVersionsPage() {
  const navigate = useNavigate();

  const [versions] = useState<IModelVersion[]>(MOCK_MODEL_VERSIONS);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'accuracy' | 'f1Score' | 'createdAt' | 'sizeMB'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const [detailVersion, setDetailVersion] = useState<IModelVersion | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<IModelVersion | null>(null);

  const filteredVersions = useMemo(() => {
    let result = [...versions];

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (v) =>
          v.modelName.toLowerCase().includes(kw) ||
          v.version.toLowerCase().includes(kw) ||
          v.projectName.toLowerCase().includes(kw),
      );
    }

    if (frameworkFilter !== 'all') {
      result = result.filter((v) => v.framework === frameworkFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((v) => v.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        cmp = (a[sortField] as number) - (b[sortField] as number);
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [versions, searchKeyword, frameworkFilter, statusFilter, sortField, sortOrder]);

  const handleSort = useCallback(
    (field: typeof sortField) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
      } else {
        setSortField(field);
        setSortOrder('desc');
      }
    },
    [sortField],
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) {
          toast.info('最多选择 2 个版本进行对比');
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCompare = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length !== 2) {
      toast.info('请选择 2 个版本进行对比');
      return;
    }
    setCompareOpen(true);
  }, [selectedIds]);

  const selectedVersions = useMemo(() => {
    const ids = Array.from(selectedIds);
    return ids.map((id) => versions.find((v) => v.id === id)).filter(Boolean) as IModelVersion[];
  }, [selectedIds, versions]);

  const handleViewDetail = useCallback((version: IModelVersion) => {
    setDetailVersion(version);
    setDetailOpen(true);
  }, []);

  const handleDeploy = useCallback(
    (version: IModelVersion) => {
      navigate(`/deploy/config/${version.id}`);
    },
    [navigate],
  );

  const handleEvaluate = useCallback(
    (version: IModelVersion) => {
      navigate(`/models/eval/${version.id}`);
    },
    [navigate],
  );

  const handleDownload = useCallback((version: IModelVersion) => {
    toast.success(`开始下载模型 ${version.version}`);
    logger.info('Model download started:', version.id);
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    toast.success(`模型版本 ${deleteTarget.version} 已删除`);
    logger.info('Model version deleted:', deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleClearFilters = useCallback(() => {
    setSearchKeyword('');
    setFrameworkFilter('all');
    setStatusFilter('all');
  }, []);

  const hasActiveFilters = searchKeyword.trim() !== '' || frameworkFilter !== 'all' || statusFilter !== 'all';

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
            模型
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            管理所有模型版本，对比指标，部署上线
            {filteredVersions.length !== versions.length && (
              <span className="ml-2 font-bold">
                （筛选 {filteredVersions.length}/{versions.length}）
              </span>
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {selectedIds.size === 2 && (
              <button
                onClick={handleCompare}
                className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
              >
                <GitCompare className="size-4" />
                对比版本
              </button>
            )}
            {selectedIds.size === 1 && (
              <span className="text-xs font-medium text-muted-foreground">再选 1 个版本进行对比</span>
            )}
            {selectedIds.size > 0 && (
              <button
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1.5 text-xs font-bold hover:underline transition-colors"
              >
                <X className="size-3" />
                取消选择
              </button>
            )}
          </div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            每个模型版本记录完整的指标、超参数和训练环境信息。支持版本对比、评估和部署。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* 搜索与筛选栏 */}
      <div className="border-b border-black p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索模型名称、版本号、项目..."
              className="bg-background pl-9 pr-9 border-black"
            />
            {searchKeyword && (
              <Button
                variant="ghost"
                size="icon"
                className="!absolute right-1 top-1/2 z-20 h-7 w-7 -translate-y-1/2 hover:bg-black hover:text-background transition-colors"
                onClick={() => setSearchKeyword('')}
                aria-label="清除搜索"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
            <SelectTrigger className="w-full sm:w-[150px] border-black bg-background">
              <SelectValue placeholder="框架" />
            </SelectTrigger>
            <SelectContent className="border-black">
              <SelectItem value="all">全部框架</SelectItem>
              <SelectItem value="PyTorch">PyTorch</SelectItem>
              <SelectItem value="TensorFlow">TensorFlow</SelectItem>
              <SelectItem value="JAX">JAX</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] border-black bg-background">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent className="border-black">
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="ready">就绪</SelectItem>
              <SelectItem value="training">训练中</SelectItem>
              <SelectItem value="deployed">已部署</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1 text-xs font-bold hover:bg-black hover:text-background transition-colors"
              onClick={handleClearFilters}
            >
              <X className="size-3.5" />
              清除
            </Button>
          )}
        </div>
      </div>

      {/* 版本列表表格 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="border-b border-black">
          <div className="flex items-center justify-between p-4 border-b border-black">
            <div className="flex items-center gap-2">
              <BrainCircuit className="size-4" />
              <span className="heading-bold text-sm">版本列表</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                {filteredVersions.length} 个版本
              </span>
            </div>
          </div>

          {filteredVersions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BrainCircuit className="size-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-bold text-muted-foreground">未找到匹配的模型版本</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                尝试调整搜索关键词或筛选条件
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
              >
                清除所有筛选
              </button>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-black">
                    <TableHead className="w-10 whitespace-nowrap">
                      <span className="sr-only">对比选择</span>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">版本号</TableHead>
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">模型名称</TableHead>
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">框架</TableHead>
                    <TableHead className="whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs uppercase font-bold tracking-widest hover:text-foreground transition-colors"
                        onClick={() => handleSort('accuracy')}
                      >
                        Accuracy
                        <ArrowUpDown className="size-3" />
                      </button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs uppercase font-bold tracking-widest hover:text-foreground transition-colors"
                        onClick={() => handleSort('f1Score')}
                      >
                        F1 Score
                        <ArrowUpDown className="size-3" />
                      </button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs uppercase font-bold tracking-widest hover:text-foreground transition-colors"
                        onClick={() => handleSort('sizeMB')}
                      >
                        大小
                        <ArrowUpDown className="size-3" />
                      </button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">状态</TableHead>
                    <TableHead className="whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs uppercase font-bold tracking-widest hover:text-foreground transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        创建时间
                        <ArrowUpDown className="size-3" />
                      </button>
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVersions.map((version) => {
                    const StatusIcon = STATUS_CONFIG[version.status].icon;
                    const isSelected = selectedIds.has(version.id);

                    return (
                      <TableRow
                        key={version.id}
                        className={`border-black transition-colors ${isSelected ? 'bg-black/5' : 'hover:bg-black hover:text-background'}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelect(version.id)}
                            className="border-black data-[state=checked]:bg-black data-[state=checked]:text-background"
                            aria-label={`选择 ${version.version} 进行对比`}
                          />
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-bold font-mono">{version.version}</span>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="truncate max-w-[180px] text-sm font-bold">{version.modelName}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground truncate max-w-[180px]">
                              {version.projectName}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-bold">{version.framework}</span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 border border-black overflow-hidden bg-black/10">
                              <div
                                className="h-full bg-black transition-all duration-1000"
                                style={{ width: `${Math.round(version.accuracy * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold font-mono tabular-nums">
                              {(version.accuracy * 100).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 border border-black overflow-hidden bg-black/10">
                              <div
                                className="h-full bg-[#888] transition-all duration-1000"
                                style={{ width: `${Math.round(version.f1Score * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold font-mono tabular-nums">
                              {(version.f1Score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm font-mono tabular-nums text-muted-foreground">
                            {version.sizeMB.toFixed(1)} MB
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-bold flex items-center gap-1">
                            <StatusIcon className="size-3.5" />
                            {STATUS_CONFIG[version.status].label}
                          </span>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="size-3" />
                            {new Date(version.createdAt).toLocaleDateString('zh-CN', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-black hover:text-background transition-colors"
                              onClick={() => handleViewDetail(version)}
                              aria-label="查看详情"
                            >
                              <Eye className="size-3.5" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 hover:bg-black hover:text-background transition-colors"
                                  aria-label="更多操作"
                                >
                                  <ChevronDown className="size-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 border-black">
                                <DropdownMenuItem
                                  onClick={() => handleDeploy(version)}
                                  className="cursor-pointer"
                                >
                                  <Rocket className="mr-2 size-4" />
                                  部署
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEvaluate(version)}
                                  className="cursor-pointer"
                                >
                                  <BarChart3 className="mr-2 size-4" />
                                  评估
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDownload(version)}
                                  className="cursor-pointer"
                                >
                                  <Download className="mr-2 size-4" />
                                  下载
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(version)}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </motion.div>

      {/* 版本对比抽屉 */}
      <VersionCompareDrawer
        open={compareOpen}
        onOpenChange={setCompareOpen}
        versionA={selectedVersions[0] ?? null}
        versionB={selectedVersions[1] ?? null}
      />

      {/* 模型详情抽屉 */}
      <ModelDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        version={detailVersion}
      />

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="border-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="heading-bold text-lg flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" />
              删除模型版本
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
              确定要删除模型版本「{deleteTarget?.version} - {deleteTarget?.modelName}」吗？此操作不可撤销，已部署的实例将不受影响。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black hover:bg-black hover:text-background transition-colors">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
