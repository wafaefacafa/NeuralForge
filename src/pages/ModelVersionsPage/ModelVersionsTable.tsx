import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Download, Trash2, Rocket, BarChart3, GitCompare, ArrowUpDown, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IModelVersion } from '@/types/models';

interface ModelVersionsTableProps {
  versions: IModelVersion[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

type SortField = 'version' | 'accuracy' | 'f1Score' | 'sizeMB' | 'createdAt';
type SortDir = 'asc' | 'desc';

const STATUS_CONFIG: Record<IModelVersion['status'], { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  ready: { label: '就绪', variant: 'outline' },
  training: { label: '训练中', variant: 'secondary' },
  failed: { label: '失败', variant: 'destructive' },
  deployed: { label: '已部署', variant: 'default' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatSize(mb: number): string {
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  return `${mb} MB`;
}

export default function ModelVersionsTable({
  versions,
  selectedIds,
  onSelectionChange,
}: ModelVersionsTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFramework, setFilterFramework] = useState<string>('all');

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('desc');
      }
    },
    [sortField],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        onSelectionChange(filtered.map((v) => v.id));
      } else {
        onSelectionChange([]);
      }
    },
    [onSelectionChange],
  );

  const handleSelectOne = useCallback(
    (id: string, checked: boolean) => {
      if (checked) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      }
    },
    [selectedIds, onSelectionChange],
  );

  const handleCompare = useCallback(() => {
    if (selectedIds.length !== 2) {
      toast.error('请选择恰好 2 个版本进行对比');
      return;
    }
    toast.info(`对比版本: ${selectedIds.join(', ')}`);
  }, [selectedIds]);

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
    toast.success(`开始下载 ${version.modelName} ${version.version}`);
  }, []);

  const handleDelete = useCallback((version: IModelVersion) => {
    toast.error(`已删除版本 ${version.version}`);
  }, []);

  const filtered = useMemo(() => {
    return versions.filter((v) => {
      if (filterStatus !== 'all' && v.status !== filterStatus) return false;
      if (filterFramework !== 'all' && v.framework !== filterFramework) return false;
      return true;
    });
  }, [versions, filterStatus, filterFramework]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'version':
          cmp = a.version.localeCompare(b.version);
          break;
        case 'accuracy':
          cmp = a.accuracy - b.accuracy;
          break;
        case 'f1Score':
          cmp = a.f1Score - b.f1Score;
          break;
        case 'sizeMB':
          cmp = a.sizeMB - b.sizeMB;
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filtered.length;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 inline size-3 text-muted-foreground" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 inline size-3" />
    ) : (
      <ArrowDown className="ml-1 inline size-3" />
    );
  };

  const SortableHead = ({ field, label }: { field: SortField; label: string }) => (
    <TableHead className="whitespace-nowrap cursor-pointer select-none text-xs uppercase font-bold tracking-widest" onClick={() => handleSort(field)}>
      {label}
      <SortIcon field={field} />
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-[140px] text-xs font-bold border-black">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent className="border-black">
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="ready">就绪</SelectItem>
            <SelectItem value="training">训练中</SelectItem>
            <SelectItem value="deployed">已部署</SelectItem>
            <SelectItem value="failed">失败</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterFramework} onValueChange={setFilterFramework}>
          <SelectTrigger className="h-9 w-[140px] text-xs font-bold border-black">
            <SelectValue placeholder="框架筛选" />
          </SelectTrigger>
          <SelectContent className="border-black">
            <SelectItem value="all">全部框架</SelectItem>
            <SelectItem value="PyTorch">PyTorch</SelectItem>
            <SelectItem value="TensorFlow">TensorFlow</SelectItem>
            <SelectItem value="JAX">JAX</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {selectedIds.length === 2 && (
          <button
            type="button"
            onClick={handleCompare}
            className="flex items-center gap-1.5 h-9 px-4 border border-black text-xs font-bold hover:bg-black hover:text-background transition-colors"
          >
            <GitCompare className="size-3.5" />
            对比版本
          </button>
        )}

        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          {filtered.length} 个版本
        </span>
      </div>

      {/* 表格 */}
      <div className="w-full overflow-x-auto border border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black">
              <TableHead className="w-10 whitespace-nowrap">
                <Checkbox
                  checked={allSelected}
                  data-state={someSelected ? 'indeterminate' : undefined}
                  onCheckedChange={handleSelectAll}
                  aria-label="全选"
                  className="border-black data-[state=checked]:bg-black data-[state=checked]:text-background"
                />
              </TableHead>
              <SortableHead field="version" label="版本" />
              <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">模型名称</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">项目</TableHead>
              <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">框架</TableHead>
              <SortableHead field="accuracy" label="Accuracy" />
              <SortableHead field="f1Score" label="F1-Score" />
              <SortableHead field="sizeMB" label="大小" />
              <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">状态</TableHead>
              <SortableHead field="createdAt" label="创建时间" />
              <TableHead className="w-12 whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-32 text-center text-muted-foreground text-sm font-medium">
                  暂无匹配的模型版本
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((v) => {
                const isSelected = selectedIds.includes(v.id);
                const statusCfg = STATUS_CONFIG[v.status];

                return (
                  <TableRow
                    key={v.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className={`border-b border-black transition-colors ${
                      isSelected ? 'bg-black text-background' : 'hover:bg-black hover:text-background'
                    }`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectOne(v.id, !!checked)}
                        aria-label={`选择 ${v.version}`}
                        className={`border-black data-[state=checked]:bg-black data-[state=checked]:text-background ${
                          isSelected ? 'border-background' : ''
                        }`}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-sm font-bold">
                      {v.version}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="block truncate max-w-[180px] font-bold">{v.modelName}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="block truncate max-w-[120px] text-xs font-medium text-muted-foreground">{v.projectName}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-block border border-black px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest">
                        {v.framework}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      <span className="text-sm font-bold text-success">{(v.accuracy * 100).toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      <span className="text-sm font-bold">{(v.f1Score * 100).toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs font-medium text-muted-foreground tabular-nums">
                      {formatSize(v.sizeMB)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={statusCfg.variant}>
                        {v.status === 'deployed' && <Check className="mr-1 size-3" />}
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs font-medium text-muted-foreground tabular-nums">
                      {formatDate(v.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-black hover:text-background transition-colors"
                            aria-label="操作"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-black">
                          <DropdownMenuItem onClick={() => handleDeploy(v)} className="cursor-pointer">
                            <Rocket className="mr-2 size-4" />
                            部署
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEvaluate(v)} className="cursor-pointer">
                            <BarChart3 className="mr-2 size-4" />
                            评估
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(v)} className="cursor-pointer">
                            <Download className="mr-2 size-4" />
                            下载
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(v)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
