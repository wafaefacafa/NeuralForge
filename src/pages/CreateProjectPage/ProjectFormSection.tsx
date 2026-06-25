import { useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Info, Cpu, HardDrive, Layers, Tag, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

import { PROJECT_FRAMEWORKS, GPU_OPTIONS, MEMORY_OPTIONS } from '@/data/projects';
import type { IProjectFramework } from '@/types/projects';

interface ProjectFormSectionProps {
  onConfigChange?: (config: ProjectFormConfig) => void;
}

export interface ProjectFormConfig {
  name: string;
  description: string;
  framework: IProjectFramework | '';
  gpuType: string;
  gpuCount: number;
  memoryGB: number;
  tags: string[];
}

const FRAMEWORK_DESCRIPTIONS: Record<IProjectFramework, string> = {
  PyTorch: '动态计算图，灵活易用，研究首选',
  TensorFlow: '生产级部署，TF Serving 生态成熟',
  JAX: '函数式编程，高性能计算，Google 前沿',
};

const GPU_PRICE_MAP: Record<string, number> = {
  A100: 3.06,
  V100: 2.48,
  T4: 0.95,
};

const MEMORY_PRICE_PER_GB = 0.005;

export default function ProjectFormSection({ onConfigChange }: ProjectFormSectionProps) {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState<IProjectFramework | ''>('');
  const [gpuType, setGpuType] = useState('A100');
  const [gpuCount, setGpuCount] = useState(1);
  const [memoryGB, setMemoryGB] = useState(64);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const estimatedHourlyCost =
    (GPU_PRICE_MAP[gpuType] || 0) * gpuCount + memoryGB * MEMORY_PRICE_PER_GB;

  const emitConfig = useCallback(() => {
    onConfigChange?.({
      name,
      description,
      framework,
      gpuType,
      gpuCount,
      memoryGB,
      tags,
    });
  }, [name, description, framework, gpuType, gpuCount, memoryGB, tags, onConfigChange]);

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      toast.info('标签已存在');
      return;
    }
    if (tags.length >= 8) {
      toast.info('最多添加 8 个标签');
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        toast.error('请输入项目名称');
        return;
      }
      if (!framework) {
        toast.error('请选择深度学习框架');
        return;
      }

      setSubmitting(true);
      try {
        await new Promise((r) => setTimeout(r, 800));
        toast.success('项目创建成功！');
        logger.info('Project created:', { name, framework, gpuType, gpuCount, memoryGB });
        navigate('/projects');
      } catch (err) {
        logger.error('Create project failed:', String(err));
        toast.error('创建失败，请重试');
      } finally {
        setSubmitting(false);
      }
    },
    [name, framework, gpuType, gpuCount, memoryGB, navigate],
  );

  const selectedGpu = GPU_OPTIONS.find((g) => g.value === gpuType);

  return (
    <form onSubmit={handleSubmit} className="space-y-8" onChange={emitConfig}>
      {/* 基本信息 */}
      <div className="border border-black">
        <div className="flex items-center gap-2 border-b border-black p-4">
          <Info className="size-4" />
          <h3 className="heading-bold text-lg">基本信息</h3>
        </div>
        <div className="p-5 space-y-5">
          {/* 项目名称 */}
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-xs uppercase font-bold tracking-widest">
              项目名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：图像分类 ResNet-50"
              maxLength={50}
              className="bg-background border-black"
            />
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              {name.length}/50 字符
            </p>
          </div>

          {/* 项目描述 */}
          <div className="space-y-2">
            <Label htmlFor="project-desc" className="text-xs uppercase font-bold tracking-widest">
              项目描述
            </Label>
            <Textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述项目目标和应用场景..."
              rows={3}
              maxLength={200}
              className="bg-background border-black resize-none"
            />
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              {description.length}/200 字符
            </p>
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest">标签</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="输入标签后按回车添加"
                  maxLength={20}
                  className="bg-background pl-9 border-black"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="border-black hover:bg-black hover:text-background transition-colors"
              >
                <Plus className="size-3.5" />
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 border border-black px-2 py-0.5 text-xs font-bold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-black hover:text-background transition-colors p-0.5"
                      aria-label={`移除标签 ${tag}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 框架选择 */}
      <div className="border border-black">
        <div className="flex items-center gap-2 border-b border-black p-4">
          <Layers className="size-4" />
          <h3 className="heading-bold text-lg">
            深度学习框架 <span className="text-destructive">*</span>
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PROJECT_FRAMEWORKS.map((fw) => {
              const isSelected = framework === fw.value;
              return (
                <motion.button
                  key={fw.value}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFramework(fw.value)}
                  className={`relative flex flex-col items-center gap-2 border-2 p-5 text-left transition-colors ${
                    isSelected
                      ? 'border-black bg-black text-background'
                      : 'border-black hover:bg-black hover:text-background'
                  }`}
                >
                  <span className="text-2xl">{fw.icon}</span>
                  <span className="text-sm font-bold">
                    {fw.label}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest text-center leading-relaxed ${
                    isSelected ? 'text-background/60' : 'text-muted-foreground'
                  }`}>
                    {FRAMEWORK_DESCRIPTIONS[fw.value]}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center bg-background text-black text-[10px] font-bold border border-black">
                      ✓
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 硬件资源配置 */}
      <div className="border border-black">
        <div className="flex items-center gap-2 border-b border-black p-4">
          <Cpu className="size-4" />
          <h3 className="heading-bold text-lg">硬件资源配置</h3>
        </div>
        <div className="p-5 space-y-6">
          {/* GPU 类型 */}
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest">GPU 类型</Label>
            <Select value={gpuType} onValueChange={setGpuType}>
              <SelectTrigger className="bg-background border-black">
                <SelectValue placeholder="选择 GPU 类型" />
              </SelectTrigger>
              <SelectContent className="border-black">
                {GPU_OPTIONS.map((gpu) => (
                  <SelectItem key={gpu.value} value={gpu.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{gpu.label}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        ${GPU_PRICE_MAP[gpu.value]}/h
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGpu && (
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                {selectedGpu.vram} 显存 · {selectedGpu.cores} CUDA 核心
              </p>
            )}
          </div>

          {/* GPU 数量 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold tracking-widest">GPU 数量</Label>
              <span className="text-sm font-bold tabular-nums">
                {gpuCount} 卡
              </span>
            </div>
            <Slider
              value={[gpuCount]}
              onValueChange={([v]) => setGpuCount(v)}
              min={1}
              max={8}
              step={1}
              className="w-full [&_[data-slot=slider-track]]:bg-black/10 [&_[data-slot=slider-range]]:bg-black [&_[data-slot=slider-thumb]]:border-black [&_[data-slot=slider-thumb]]:bg-background"
            />
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              <span>1</span>
              <span>2</span>
              <span>4</span>
              <span>8</span>
            </div>
          </div>

          {/* 内存规格 */}
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold tracking-widest">内存规格</Label>
            <Select
              value={String(memoryGB)}
              onValueChange={(v) => setMemoryGB(Number(v))}
            >
              <SelectTrigger className="bg-background border-black">
                <SelectValue placeholder="选择内存规格" />
              </SelectTrigger>
              <SelectContent className="border-black">
                {MEMORY_OPTIONS.map((mem) => (
                  <SelectItem key={mem.value} value={String(mem.value)}>
                    {mem.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 费用预估摘要 */}
      <div className="border border-black">
        <div className="flex items-center gap-2 border-b border-black p-4">
          <HardDrive className="size-4" />
          <h3 className="heading-bold text-lg">费用预估</h3>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                GPU ({gpuType} × {gpuCount})
              </span>
              <span className="font-bold tabular-nums">
                ${(GPU_PRICE_MAP[gpuType] * gpuCount).toFixed(2)}/h
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">内存 ({memoryGB} GB)</span>
              <span className="font-bold tabular-nums">
                ${(memoryGB * MEMORY_PRICE_PER_GB).toFixed(2)}/h
              </span>
            </div>
            <div className="border-t border-black pt-3 flex items-center justify-between">
              <span className="text-sm font-bold">预估合计</span>
              <span className="heading-bold text-2xl tabular-nums">
                ${estimatedHourlyCost.toFixed(2)}
                <span className="text-xs font-normal text-muted-foreground">/小时</span>
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              预估月费用约 ${(estimatedHourlyCost * 730).toFixed(0)}（按 730 小时/月计算），实际费用以账单为准
            </p>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/projects')}
          className="border-black hover:bg-black hover:text-background transition-colors"
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-black text-background hover:bg-black/80 transition-colors border border-black text-sm font-bold px-8 h-11"
        >
          {submitting ? (
            <>
              <span className="mr-2 inline-block size-4 animate-spin border-2 border-background/30 border-t-background" />
              创建中...
            </>
          ) : (
            '创建项目'
          )}
        </Button>
      </div>
    </form>
  );
}
