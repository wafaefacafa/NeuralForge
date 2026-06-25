import { useState, useMemo } from 'react';
import { Search, Eye, Database, ChevronUp, ChevronDown, MoreHorizontal, Upload, Tag, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { MOCK_DATASETS } from '@/data/datasets';
import type { IDataset, IDatasetSample } from '@/types/datasets';

const STATUS_MAP: Record<IDataset['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  ready: { label: '就绪', variant: 'default' },
  processing: { label: '处理中', variant: 'secondary' },
  error: { label: '异常', variant: 'destructive' },
};

const FORMAT_MAP: Record<IDataset['format'], string> = {
  csv: 'CSV',
  json: 'JSON',
  parquet: 'Parquet',
  image: 'Image',
};

const CATEGORY_MAP: Record<IDataset['category'], string> = {
  image: '图像',
  text: '文本',
  tabular: '表格',
  audio: '音频',
};

function generateMockSamples(dataset: IDataset): IDatasetSample[] {
  const samples: IDatasetSample[] = [];
  const count = Math.min(dataset.sampleCount, 20);

  if (dataset.category === 'image') {
    for (let i = 0; i < count; i++) {
      samples.push({
        id: `${dataset.id}-s-${i}`,
        datasetId: dataset.id,
        fields: {
          id: `${i + 1}`,
          file_name: `image_${String(i + 1).padStart(4, '0')}.jpg`,
          width: `${Math.floor(Math.random() * 800 + 200)}`,
          height: `${Math.floor(Math.random() * 600 + 200)}`,
          label: ['cat', 'dog', 'car', 'person', 'bird'][i % 5],
          format: 'JPEG',
        },
      });
    }
  } else if (dataset.category === 'text') {
    for (let i = 0; i < count; i++) {
      samples.push({
        id: `${dataset.id}-s-${i}`,
        datasetId: dataset.id,
        fields: {
          id: `${i + 1}`,
          text: `这是第 ${i + 1} 条文本样本数据，用于自然语言处理任务训练。`,
          label: ['positive', 'negative', 'neutral'][i % 3],
          length: `${Math.floor(Math.random() * 200 + 20)}`,
          source: ['web', 'book', 'social'][i % 3],
        },
      });
    }
  } else {
    for (let i = 0; i < count; i++) {
      samples.push({
        id: `${dataset.id}-s-${i}`,
        datasetId: dataset.id,
        fields: {
          id: `${i + 1}`,
          feature_1: `${(Math.random() * 100).toFixed(2)}`,
          feature_2: `${(Math.random() * 50).toFixed(2)}`,
          feature_3: `${(Math.random() * 200).toFixed(2)}`,
          label: ['A', 'B', 'C'][i % 3],
          category: ['train', 'val', 'test'][i % 3],
        },
      });
    }
  }
  return samples;
}

function UploadDialog({ onUpload }: { onUpload: (name: string, desc: string, category: IDataset['category'], format: IDataset['format']) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IDataset['category']>('tabular');
  const [format, setFormat] = useState<IDataset['format']>('csv');
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('请输入数据集名称');
      return;
    }
    onUpload(name.trim(), description.trim(), category, format);
    toast.success(`数据集「${name}」上传成功`);
    setName('');
    setDescription('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors">
          <Upload className="size-4" />
          上传数据集
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] border-black">
        <DialogHeader>
          <DialogTitle className="heading-bold text-xl">上传数据集</DialogTitle>
          <DialogDescription className="text-xs font-medium text-muted-foreground">
            填写数据集基本信息，上传数据文件
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ds-name" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              数据集名称
            </Label>
            <Input
              id="ds-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：ImageNet-subset"
              className="border-black"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ds-desc" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              描述
            </Label>
            <Textarea
              id="ds-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="数据集描述信息..."
              rows={2}
              className="border-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">数据分类</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as IDataset['category'])}>
                <SelectTrigger className="border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-black">
                  <SelectItem value="image">图像</SelectItem>
                  <SelectItem value="text">文本</SelectItem>
                  <SelectItem value="tabular">表格</SelectItem>
                  <SelectItem value="audio">音频</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">文件格式</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as IDataset['format'])}>
                <SelectTrigger className="border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-black">
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="parquet">Parquet</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border border-black p-8 text-center">
            <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">拖拽文件到此处，或点击选择文件</p>
            <button
              type="button"
              className="mt-3 px-4 py-1.5 border border-black text-xs font-bold hover:bg-black hover:text-background transition-colors"
            >
              选择文件
            </button>
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            className="px-4 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
            onClick={() => setOpen(false)}
          >
            取消
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-black text-background text-sm font-bold hover:bg-black/80 transition-colors"
            onClick={handleSubmit}
          >
            确认上传
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewSheet({ dataset }: { dataset: IDataset }) {
  const samples = useMemo(() => generateMockSamples(dataset), [dataset]);
  const fields = samples.length > 0 ? Object.keys(samples[0].fields) : [];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-black text-xs font-bold hover:bg-black hover:text-background transition-colors">
          <Eye className="size-3.5" />
          预览
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[720px] overflow-y-auto border-l border-black">
        <SheetHeader>
          <SheetTitle className="heading-bold text-xl flex items-center gap-2">
            <Database className="size-5" />
            {dataset.name}
          </SheetTitle>
          <SheetDescription className="text-xs font-medium text-muted-foreground">
            数据预览 · 共 {dataset.sampleCount.toLocaleString()} 条样本 · 显示前 {samples.length} 条
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <div className="w-full overflow-x-auto border border-black">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black">
                  {fields.map((field) => (
                    <TableHead key={field} className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest border-r border-black last:border-r-0">
                      {field}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((sample) => (
                  <TableRow key={sample.id} className="border-b border-black">
                    {fields.map((field) => (
                      <TableCell key={field} className="whitespace-nowrap text-xs border-r border-black last:border-r-0">
                        <span className="block truncate max-w-[160px]">{sample.fields[field]}</span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function VersionSheet({ dataset }: { dataset: IDataset }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="text-xs font-bold hover:underline transition-colors">
          v{dataset.version}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[480px] overflow-y-auto border-l border-black">
        <SheetHeader>
          <SheetTitle className="heading-bold text-xl">版本历史</SheetTitle>
          <SheetDescription className="text-xs font-medium text-muted-foreground">
            {dataset.name} · 共 {dataset.versions.length} 个版本
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {dataset.versions.map((v) => (
            <div
              key={v.id}
              className={`border p-4 ${v.version === dataset.version ? 'border-black bg-black text-background' : 'border-black'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">v{v.version}</span>
                {v.version === dataset.version && (
                  <span className="text-[10px] uppercase font-bold tracking-widest border border-background px-2 py-0.5">
                    当前
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <span>{v.sampleCount.toLocaleString()} 样本</span>
                <span>{v.size}</span>
                <span>{v.createdAt}</span>
              </div>
              {v.changelog && (
                <p className="mt-2 text-xs font-medium text-muted-foreground">{v.changelog}</p>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

type SortField = 'name' | 'sampleCount' | 'size' | 'updatedAt';
type SortDir = 'asc' | 'desc';

export default function DatasetsTable() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [datasets, setDatasets] = useState<IDataset[]>(MOCK_DATASETS);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleUpload = (name: string, desc: string, category: IDataset['category'], format: IDataset['format']) => {
    const newDataset: IDataset = {
      id: String(Date.now()),
      name,
      description: desc,
      sampleCount: 0,
      size: '0 B',
      version: '1.0',
      status: 'processing',
      format,
      category,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      versions: [
        {
          id: `${Date.now()}-v1`,
          version: '1.0',
          sampleCount: 0,
          size: '0 B',
          createdAt: new Date().toISOString().split('T')[0],
          changelog: '初始版本',
        },
      ],
    };
    setDatasets((prev) => [newDataset, ...prev]);
  };

  const filtered = useMemo(() => {
    let result = [...datasets];

    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(kw) ||
          d.description.toLowerCase().includes(kw),
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((d) => d.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === 'sampleCount') {
        cmp = a.sampleCount - b.sampleCount;
      } else if (sortField === 'size') {
        cmp = a.size.localeCompare(b.size);
      } else if (sortField === 'updatedAt') {
        cmp = a.updatedAt.localeCompare(b.updatedAt);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [datasets, search, categoryFilter, statusFilter, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="ml-1 inline size-3.5" />
    ) : (
      <ChevronDown className="ml-1 inline size-3.5" />
    );
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 border-b border-black p-4">
        <h2 className="heading-bold text-xl">数据集列表</h2>
        <ArrowUpRight className="size-4" />
      </div>

      {/* 搜索与筛选栏 */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-black">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索数据集..."
            className="h-9 bg-background pl-9 text-sm border-black"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[110px] border-black">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent className="border-black">
            <SelectItem value="all">全部分类</SelectItem>
            <SelectItem value="image">图像</SelectItem>
            <SelectItem value="text">文本</SelectItem>
            <SelectItem value="tabular">表格</SelectItem>
            <SelectItem value="audio">音频</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[110px] border-black">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent className="border-black">
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="ready">就绪</SelectItem>
            <SelectItem value="processing">处理中</SelectItem>
            <SelectItem value="error">异常</SelectItem>
          </SelectContent>
        </Select>

        <UploadDialog onUpload={handleUpload} />
      </div>

      {/* 表格 */}
      <div className="w-full overflow-x-auto border-b border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black">
              <TableHead
                className="whitespace-nowrap cursor-pointer select-none text-[10px] uppercase font-bold tracking-widest border-r border-black"
                onClick={() => handleSort('name')}
              >
                数据集名称 <SortIcon field="name" />
              </TableHead>
              <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest border-r border-black">分类</TableHead>
              <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest border-r border-black">格式</TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer select-none text-[10px] uppercase font-bold tracking-widest border-r border-black"
                onClick={() => handleSort('sampleCount')}
              >
                样本数 <SortIcon field="sampleCount" />
              </TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer select-none text-[10px] uppercase font-bold tracking-widest border-r border-black"
                onClick={() => handleSort('size')}
              >
                大小 <SortIcon field="size" />
              </TableHead>
              <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest border-r border-black">版本</TableHead>
              <TableHead className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest border-r border-black">状态</TableHead>
              <TableHead
                className="whitespace-nowrap cursor-pointer select-none text-[10px] uppercase font-bold tracking-widest border-r border-black"
                onClick={() => handleSort('updatedAt')}
              >
                更新时间 <SortIcon field="updatedAt" />
              </TableHead>
              <TableHead className="whitespace-nowrap text-right text-[10px] uppercase font-bold tracking-widest">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center border-b border-black">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Database className="size-8 opacity-40" />
                    <p className="text-sm font-medium">暂无匹配的数据集</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest">尝试调整搜索条件或筛选器</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((dataset) => {
                const statusInfo = STATUS_MAP[dataset.status];
                return (
                  <TableRow key={dataset.id} className="group border-b border-black hover:bg-black hover:text-background transition-colors">
                    <TableCell className="font-medium border-r border-black">
                      <div className="flex items-center gap-2 min-w-0">
                        <Database className="size-4 shrink-0" />
                        <div className="min-w-0">
                          <span className="block truncate max-w-[200px] text-sm font-bold">{dataset.name}</span>
                          <span className="block truncate max-w-[200px] text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60">
                            {dataset.description}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-black">
                      <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-2 py-0.5 group-hover:border-background">
                        {CATEGORY_MAP[dataset.category]}
                      </span>
                    </TableCell>
                    <TableCell className="border-r border-black">
                      <span className="text-xs font-bold">
                        {FORMAT_MAP[dataset.format]}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums border-r border-black text-sm font-bold">
                      {dataset.sampleCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="border-r border-black text-xs font-medium text-muted-foreground group-hover:text-background/60">
                      {dataset.size}
                    </TableCell>
                    <TableCell className="border-r border-black">
                      <VersionSheet dataset={dataset} />
                    </TableCell>
                    <TableCell className="border-r border-black">
                      <Badge variant={statusInfo.variant} className="text-[10px] uppercase font-bold tracking-widest">
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap border-r border-black text-xs font-medium text-muted-foreground group-hover:text-background/60 tabular-nums">
                      {dataset.updatedAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <PreviewSheet dataset={dataset} />
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-black text-xs font-bold hover:bg-black hover:text-background transition-colors group-hover:border-background group-hover:text-background"
                          onClick={() => toast.info(`数据标注: ${dataset.name}`)}
                        >
                          <Tag className="size-3.5" />
                          标注
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex size-8 items-center justify-center border border-black hover:bg-black hover:text-background transition-colors group-hover:border-background group-hover:text-background"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-black">
                            <DropdownMenuItem
                              className="cursor-pointer text-xs font-bold"
                              onClick={() => toast.info(`下载: ${dataset.name}`)}
                            >
                              下载
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-xs font-bold"
                              onClick={() => toast.info(`导出: ${dataset.name}`)}
                            >
                              导出
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-xs font-bold text-destructive focus:text-destructive"
                              onClick={() => {
                                setDatasets((prev) => prev.filter((d) => d.id !== dataset.id));
                                toast.success(`已删除: ${dataset.name}`);
                              }}
                            >
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
