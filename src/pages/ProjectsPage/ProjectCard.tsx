import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Play, Rocket, Settings, Trash2, Clock, Layers, Database } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { IProject } from '@/types/projects';
import { PROJECT_STATUS_MAP } from '@/data/projects';

interface ProjectCardProps {
  project: IProject;
}

const FRAMEWORK_ICONS: Record<string, string> = {
  PyTorch: '🔥',
  TensorFlow: '🧠',
  JAX: '⚡',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return '刚刚';
  if (diffH < 24) return `${diffH} 小时前`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} 天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export default memo(function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const status = PROJECT_STATUS_MAP[project.status];

  const handleTrain = () => {
    navigate(`/training/config/${project.id}`);
  };

  const handleDeploy = () => {
    toast.info('请从模型版本页选择版本进行部署');
    navigate('/models');
  };

  const handleDelete = () => {
    toast.success(`项目「${project.name}」已删除（模拟）`);
  };

  return (
    <div className="group border border-black hover:bg-black hover:text-background transition-colors">
      {/* 头部：名称 + 操作菜单 */}
      <div className="flex items-start justify-between gap-2 p-5 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="heading-bold text-lg truncate group-hover:text-background">
            {project.name}
          </h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="!absolute right-3 top-3 z-20 h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background hover:text-black"
              aria-label="项目操作"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 border-black">
            <DropdownMenuItem onClick={handleTrain} className="cursor-pointer">
              <Play className="mr-2 size-3.5" />
              开始训练
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeploy} className="cursor-pointer">
              <Rocket className="mr-2 size-3.5" />
              部署模型
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('项目设置')} className="cursor-pointer">
              <Settings className="mr-2 size-3.5" />
              项目设置
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="mr-2 size-3.5" />
              删除项目
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 描述 */}
      <p className="px-5 pb-4 text-xs font-medium text-muted-foreground group-hover:text-background/60 line-clamp-2 leading-relaxed">
        {project.description}
      </p>

      {/* 标签 */}
      <div className="flex flex-wrap items-center gap-1.5 px-5 pb-4">
        <span className="inline-flex items-center gap-1 border border-black px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest group-hover:border-background group-hover:text-background">
          <span>{FRAMEWORK_ICONS[project.framework] || '📦'}</span>
          {project.framework}
        </span>
        <span className="inline-flex items-center border border-black px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest group-hover:border-background group-hover:text-background">
          {status.label}
        </span>
        {project.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center border border-black px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest group-hover:border-background group-hover:text-background"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 底部信息行 */}
      <div className="flex items-center justify-between px-5 pb-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Layers className="size-3" />
            {project.modelCount} 模型
          </span>
          <span className="inline-flex items-center gap-1">
            <Database className="size-3" />
            {project.datasetCount} 数据集
          </span>
        </div>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Clock className="size-3" />
          {formatDate(project.updatedAt)}
        </span>
      </div>

      {/* 硬件配置信息 */}
      <div className="px-5 pb-5 pt-3 border-t border-black group-hover:border-background">
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60">
          <span className="border border-black px-1.5 py-0.5 group-hover:border-background group-hover:text-background">
            {project.hardware.gpuType}
          </span>
          <span>×{project.hardware.gpuCount}</span>
          <span className="text-black group-hover:text-background/40">|</span>
          <span>{project.hardware.memoryGB}GB</span>
        </div>
      </div>
    </div>
  );
});
