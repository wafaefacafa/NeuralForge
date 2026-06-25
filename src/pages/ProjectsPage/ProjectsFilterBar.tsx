import { useState, useCallback, type FormEvent } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { PROJECT_FRAMEWORKS, PROJECT_STATUS_MAP } from '@/data/projects';
import type { IProjectFramework, IProjectStatus } from '@/types/projects';

export interface ProjectsFilterBarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  frameworkFilter: IProjectFramework | 'all';
  onFrameworkFilterChange: (fw: IProjectFramework | 'all') => void;
  statusFilter: IProjectStatus | 'all';
  onStatusFilterChange: (status: IProjectStatus | 'all') => void;
  activeFilterCount: number;
}

export default function ProjectsFilterBar({
  viewMode,
  onViewModeChange,
  searchKeyword,
  onSearchChange,
  frameworkFilter,
  onFrameworkFilterChange,
  statusFilter,
  onStatusFilterChange,
  activeFilterCount,
}: ProjectsFilterBarProps) {
  const navigate = useNavigate();
  const [localKeyword, setLocalKeyword] = useState(searchKeyword);

  const handleSearch = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      onSearchChange(localKeyword.trim());
    },
    [localKeyword, onSearchChange],
  );

  const handleClearFilters = useCallback(() => {
    onFrameworkFilterChange('all');
    onStatusFilterChange('all');
    onSearchChange('');
    setLocalKeyword('');
  }, [onFrameworkFilterChange, onStatusFilterChange, onSearchChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* 左侧：搜索 + 筛选 */}
      <div className="flex flex-1 items-center gap-2 flex-wrap">
        {/* 搜索框 — 方角黑线 */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            placeholder="搜索项目名称..."
            className="h-9 bg-background pl-9 pr-3 text-sm border-black focus-visible:ring-1 focus-visible:ring-black"
          />
          {localKeyword && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="!absolute right-1 top-1/2 z-20 h-7 w-7 -translate-y-1/2 hover:bg-black hover:text-background transition-colors"
              onClick={() => {
                setLocalKeyword('');
                onSearchChange('');
              }}
              aria-label="清除搜索"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </form>

        {/* 框架筛选 — 方角黑线 Select */}
        <Select
          value={frameworkFilter}
          onValueChange={(v) => onFrameworkFilterChange(v as IProjectFramework | 'all')}
        >
          <SelectTrigger className="h-9 w-[130px] border-black bg-background text-sm">
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

        {/* 状态筛选 — 方角黑线 Select */}
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange(v as IProjectStatus | 'all')}
        >
          <SelectTrigger className="h-9 w-[120px] border-black bg-background text-sm">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent className="border-black">
            <SelectItem value="all">全部状态</SelectItem>
            {(Object.entries(PROJECT_STATUS_MAP) as [IProjectStatus, { label: string; variant: string }][]).map(
              ([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        {/* 更多筛选 — 方角黑线按钮 + 黑白反转 hover */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-black bg-background hover:bg-black hover:text-background transition-colors">
              <SlidersHorizontal className="size-3.5" />
              更多筛选
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 px-1 text-[10px] bg-black text-background">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 border-black">
            <DropdownMenuLabel>排序方式</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              最近更新
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>创建时间</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>项目名称</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>模型数量</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>其他</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem>仅显示我的项目</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 清除筛选 — 黑白反转 hover */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs font-bold text-muted-foreground hover:bg-black hover:text-background transition-colors"
            onClick={handleClearFilters}
          >
            清除筛选
          </Button>
        )}
      </div>

      {/* 右侧：视图切换 + 创建按钮 */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 视图切换 — 方角黑线 ToggleGroup */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && onViewModeChange(v as 'grid' | 'list')}
          className="border border-black p-0.5"
        >
          <ToggleGroupItem
            value="grid"
            aria-label="卡片视图"
            className="h-8 w-8 data-[state=on]:bg-black data-[state=on]:text-background"
          >
            <LayoutGrid className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="列表视图"
            className="h-8 w-8 data-[state=on]:bg-black data-[state=on]:text-background"
          >
            <List className="size-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* 创建项目 — 纯黑按钮 */}
        <Button
          size="sm"
          className="h-9 gap-1.5 bg-black text-background hover:bg-black/80 transition-colors border border-black text-sm font-bold"
          onClick={() => navigate('/projects/new')}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">创建项目</span>
        </Button>
      </div>
    </div>
  );
}
