import { useState, useMemo, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  SlidersHorizontal,
  MoreHorizontal,
  Play,
  Rocket,
  Settings2,
  Trash2,
  FolderOpen,
  Cpu,
  Clock,
  Layers,
  Database,
  Tag,
  ArrowUpRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

import { MOCK_PROJECTS, PROJECT_FRAMEWORKS, PROJECT_STATUS_MAP } from '@/data/projects';
import type { IProject, IProjectFramework, IProjectStatus } from '@/types/projects';

type ViewMode = 'card' | 'list';

const FRAMEWORK_ICON_MAP: Record<IProjectFramework, string> = {
  PyTorch: '🔥',
  TensorFlow: '🧠',
  JAX: '⚡',
};

const STATUS_VARIANT_MAP: Record<IProjectStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  training: 'secondary',
  deployed: 'outline',
  archived: 'destructive',
};

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState<IProjectFramework | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IProjectStatus | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<IProject | null>(null);

  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter((p) => {
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchName = p.name.toLowerCase().includes(kw);
        const matchDesc = p.description.toLowerCase().includes(kw);
        const matchTag = p.tags.some((t) => t.toLowerCase().includes(kw));
        if (!matchName && !matchDesc && !matchTag) return false;
      }
      if (frameworkFilter !== 'all' && p.framework !== frameworkFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [searchKeyword, frameworkFilter, statusFilter]);

  const handleClearFilters = useCallback(() => {
    setSearchKeyword('');
    setFrameworkFilter('all');
    setStatusFilter('all');
  }, []);

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();
    logger.info('Projects search:', searchKeyword);
  }, [searchKeyword]);

  const handleCreateProject = useCallback(() => {
    navigate('/projects/new');
  }, [navigate]);

  const handleTrain = useCallback(
    (project: IProject) => {
      navigate(`/training/config/${project.id}`);
    },
    [navigate],
  );

  const handleDeploy = useCallback(
    (project: IProject) => {
      toast.info(`跳转到 ${project.name} 的部署配置`);
      logger.info('Deploy project:', project.id);
    },
    [],
  );

  const handleSettings = useCallback((project: IProject) => {
    toast.info(`打开 ${project.name} 的设置`);
    logger.info('Project settings:', project.id);
  }, []);

  const handleDelete = useCallback((project: IProject) => {
    setDeleteTarget(project);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    toast.success(`项目「${deleteTarget.name}」已删除`);
    logger.info('Project deleted:', deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffH = Math.floor(diffMs / (1000 * 60 * 60));
      const diffD = Math.floor(diffH / 24);
      if (diffH < 1) return '刚刚';
      if (diffH < 24) return `${diffH} 小时前`;
      if (diffD < 7) return `${diffD} 天前`;
      return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return iso;
    }
  };

  const hasActiveFilters = frameworkFilter !== 'all' || statusFilter !== 'all' || searchKeyword.trim() !== '';

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
            项目
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            管理您的 AI 模型训练项目
            {filteredProjects.length !== MOCK_PROJECTS.length && (
              <span className="ml-2 font-bold">
                （筛选 {filteredProjects.length}/{MOCK_PROJECTS.length}）
              </span>
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
            >
              <Plus className="size-4" />
              创建项目
            </button>
            <div className="flex items-center border border-black">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center justify-center size-9 border-r border-black transition-colors ${
                  viewMode === 'card' ? 'bg-black text-background' : 'hover:bg-black hover:text-background'
                }`}
                aria-label="卡片视图"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center size-9 transition-colors ${
                  viewMode === 'list' ? 'bg-black text-background' : 'hover:bg-black hover:text-background'
                }`}
                aria-label="列表视图"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            项目是 AI 训练任务的基本组织单元。每个项目包含模型、数据集和训练配置，支持 PyTorch、TensorFlow、JAX 三大框架。
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
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索项目名称、描述或标签..."
              className="bg-background pl-9 pr-3 h-9 text-sm border-black"
            />
          </form>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground shrink-0" />

            <Select
              value={frameworkFilter}
              onValueChange={(v) => setFrameworkFilter(v as IProjectFramework | 'all')}
            >
              <SelectTrigger className="h-9 w-[130px] bg-background text-sm border-black">
                <SelectValue placeholder="框架" />
              </SelectTrigger>
              <SelectContent className="border-black">
                <SelectItem value="all">全部框架</SelectItem>
                {PROJECT_FRAMEWORKS.map((fw) => (
                  <SelectItem key={fw.value} value={fw.value}>
                    <span className="flex items-center gap-1.5">
                      <span>{fw.icon}</span>
                      {fw.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as IProjectStatus | 'all')}
            >
              <SelectTrigger className="h-9 w-[120px] bg-background text-sm border-black">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent className="border-black">
                <SelectItem value="all">全部状态</SelectItem>
                {(Object.entries(PROJECT_STATUS_MAP) as [IProjectStatus, typeof PROJECT_STATUS_MAP[IProjectStatus]][]).map(
                  ([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs font-bold hover:bg-black hover:text-background transition-colors"
                onClick={handleClearFilters}
              >
                清除
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8"
        >
          <div className="flex flex-col items-center justify-center py-20 text-center border border-black">
            <div className="flex size-16 items-center justify-center border border-black mb-4">
              <FolderOpen className="size-8 text-muted-foreground" />
            </div>
            <h3 className="heading-bold text-xl mb-1">
              {hasActiveFilters ? '没有匹配的项目' : '暂无项目'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {hasActiveFilters
                ? '尝试调整搜索关键词或筛选条件'
                : '创建您的第一个 AI 模型训练项目'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
              >
                清除所有筛选
              </button>
            ) : (
              <button
                onClick={handleCreateProject}
                className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
              >
                <Plus className="size-4" />
                创建项目
              </button>
            )}
          </div>
        </motion.div>
      ) : viewMode === 'card' ? (
        /* 卡片视图 */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="border-r border-b border-black"
              >
                <div className="group p-6 hover:bg-black hover:text-background transition-colors cursor-pointer">
                  {/* 卡片头部：名称 + 操作菜单 */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="heading-bold text-lg truncate group-hover:text-background">
                        {project.name}
                      </h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/20"
                          aria-label="项目操作"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 border-black">
                        <DropdownMenuItem onClick={() => handleTrain(project)} className="cursor-pointer">
                          <Play className="mr-2 size-4" />
                          训练
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeploy(project)} className="cursor-pointer">
                          <Rocket className="mr-2 size-4" />
                          部署
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSettings(project)} className="cursor-pointer">
                          <Settings2 className="mr-2 size-4" />
                          设置
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(project)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* 描述 */}
                  <p className="text-xs font-medium text-muted-foreground group-hover:text-background/60 line-clamp-2 mb-4 min-h-[2.5em]">
                    {project.description || '暂无描述'}
                  </p>

                  {/* 标签 */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest border border-black px-2 py-0.5 group-hover:border-background group-hover:text-background"
                        >
                          <Tag className="size-2.5" />
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-2 py-0.5 group-hover:border-background group-hover:text-background">
                          +{project.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 框架 + 状态 */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 h-5 border-black group-hover:border-background group-hover:text-background"
                    >
                      {FRAMEWORK_ICON_MAP[project.framework]} {project.framework}
                    </Badge>
                    <Badge
                      variant={STATUS_VARIANT_MAP[project.status]}
                      className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 h-5"
                    >
                      {PROJECT_STATUS_MAP[project.status].label}
                    </Badge>
                  </div>

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60 pt-3 border-t border-black group-hover:border-background/30">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Layers className="size-3" />
                        {project.modelCount} 模型
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="size-3" />
                        {project.datasetCount} 数据集
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatTime(project.updatedAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* 列表视图 */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="border-b border-black">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-black">
                    <TableHead className="whitespace-nowrap min-w-[200px] text-[10px] uppercase font-bold tracking-widest">
                      项目名称
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">
                      框架
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">
                      状态
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">
                      模型
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">
                      数据集
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">
                      GPU
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">
                      更新时间
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right text-[10px] uppercase font-bold tracking-widest">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="group border-black hover:bg-black hover:text-background transition-colors">
                      <TableCell>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate max-w-[220px] group-hover:text-background">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground group-hover:text-background/60 truncate max-w-[220px] mt-0.5">
                            {project.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 h-5 whitespace-nowrap border-black group-hover:border-background group-hover:text-background"
                        >
                          {FRAMEWORK_ICON_MAP[project.framework]} {project.framework}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_VARIANT_MAP[project.status]}
                          className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 h-5 whitespace-nowrap"
                        >
                          {PROJECT_STATUS_MAP[project.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums text-sm font-bold">{project.modelCount}</TableCell>
                      <TableCell className="tabular-nums text-sm font-bold">{project.datasetCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                          <Cpu className="size-3" />
                          {project.hardware.gpuType} ×{project.hardware.gpuCount}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs tabular-nums">
                        {formatTime(project.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-background/20"
                              aria-label="项目操作"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 border-black">
                            <DropdownMenuItem onClick={() => handleTrain(project)} className="cursor-pointer">
                              <Play className="mr-2 size-4" />
                              训练
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeploy(project)} className="cursor-pointer">
                              <Rocket className="mr-2 size-4" />
                              部署
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSettings(project)} className="cursor-pointer">
                              <Settings2 className="mr-2 size-4" />
                              设置
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(project)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 size-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </motion.div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="border-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 heading-bold text-xl">
              <Trash2 className="size-5 text-destructive" />
              删除项目
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除项目「{deleteTarget?.name}」吗？此操作不可撤销，项目下的所有模型、数据集和训练记录将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black hover:bg-black hover:text-background transition-colors">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
