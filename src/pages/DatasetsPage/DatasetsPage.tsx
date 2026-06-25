import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import {
  Search,
  Plus,
  Upload,
  Eye,
  History,
  MoreHorizontal,
  Database,
  FileText,
  Table2,
  FileJson,
  ArrowUpDown,
  Filter,
  Download,
  Trash2,
  HardDrive,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ArrowUpRight,
} from 'lucide-react';

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { MOCK_DATASETS, MOCK_DATASET_SAMPLES } from '@/data/datasets';
import type { IDataset, IDatasetSample } from '@/types/datasets';

// ─── 常量 ────────────────────────────────────────────
const FORMAT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  csv: Table2,
  json: FileJson,
  parquet: FileText,
  image: FileText,
};

const FORMAT_LABEL_MAP: Record<string, string> = {
  csv: 'CSV',
  json: 'JSON',
  parquet: 'Parquet',
  image: '图片',
};

const CATEGORY_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'image', label: '图像' },
  { value: 'text', label: '文本' },
  { value: 'tabular', label: '表格' },
  { value: 'audio', label: '音频' },
];

const FORMAT_OPTIONS = [
  { value: 'all', label: '全部格式' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'parquet', label: 'Parquet' },
  { value: 'image', label: '图片' },
];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  ready: { label: '就绪', icon: CheckCircle2 },
  processing: { label: '处理中', icon: Loader2 },
  error: { label: '异常', icon: AlertTriangle },
};

type SortField = 'name' | 'sampleCount' | 'size' | 'updatedAt';
type SortDir = 'asc' | 'desc';

// ─── 组件 ────────────────────────────────────────────
export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<IDataset[]>(MOCK_DATASETS);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: 'tabular' as IDataset['category'],
    format: 'csv' as IDataset['format'],
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDataset, setPreviewDataset] = useState<IDataset | null>(null);
  const [previewSamples, setPreviewSamples] = useState<IDatasetSample[]>([]);

  const [versionOpen, setVersionOpen] = useState(false);
  const [versionDataset, setVersionDataset] = useState<IDataset | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<IDataset | null>(null);

  // ─── 筛选 & 排序 ────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...datasets];

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(kw) ||
          d.description.toLowerCase().includes(kw),
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((d) => d.category === categoryFilter);
    }

    if (formatFilter !== 'all') {
      result = result.filter((d) => d.format === formatFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'sampleCount':
          cmp = a.sampleCount - b.sampleCount;
          break;
        case 'size':
          cmp = a.size.localeCompare(b.size);
          break;
        case 'updatedAt':
          cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [datasets, searchKeyword, categoryFilter, formatFilter, sortField, sortDir]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('desc');
      }
    },
    [sortField],
  );

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 inline size-3 text-muted-foreground/40" />;
    return sortDir === 'asc' ? (
      <span className="ml-1 text-xs font-bold">↑</span>
    ) : (
      <span className="ml-1 text-xs font-bold">↓</span>
    );
  };

  // ─── 上传 ───────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (!uploadForm.name.trim()) {
      toast.error('请输入数据集名称');
      return;
    }
    if (!uploadFile) {
      toast.error('请选择要上传的文件');
      return;
    }

    setUploading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));

      const newDataset: IDataset = {
        id: `ds_${Date.now()}`,
        name: uploadForm.name.trim(),
        description: uploadForm.description.trim(),
        sampleCount: Math.floor(Math.random() * 50000) + 1000,
        size: `${(Math.random() * 5 + 0.5).toFixed(1)} GB`,
        version: 'v1.0',
        status: 'ready',
        format: uploadForm.format,
        category: uploadForm.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versions: [
          {
            id: `ver_${Date.now()}`,
            version: 'v1.0',
            sampleCount: Math.floor(Math.random() * 50000) + 1000,
            size: `${(Math.random() * 5 + 0.5).toFixed(1)} GB`,
            createdAt: new Date().toISOString(),
            changelog: '初始版本',
          },
        ],
      };

      setDatasets((prev) => [newDataset, ...prev]);
      toast.success(`数据集「${uploadForm.name}」上传成功`);
      logger.info('Dataset uploaded:', uploadForm.name);

      setUploadOpen(false);
      setUploadForm({ name: '', description: '', category: 'tabular', format: 'csv' });
      setUploadFile(null);
    } catch (err) {
      logger.error('Upload dataset failed:', String(err));
      toast.error('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  }, [uploadForm, uploadFile]);

  // ─── 预览 ───────────────────────────────────────────
  const handlePreview = useCallback((dataset: IDataset) => {
    setPreviewDataset(dataset);
    const samples = MOCK_DATASET_SAMPLES.filter((s) => s.datasetId === dataset.id);
    setPreviewSamples(samples.length > 0 ? samples : MOCK_DATASET_SAMPLES.slice(0, 8));
    setPreviewOpen(true);
  }, []);

  // ─── 版本历史 ───────────────────────────────────────
  const handleVersionHistory = useCallback((dataset: IDataset) => {
    setVersionDataset(dataset);
    setVersionOpen(true);
  }, []);

  // ─── 删除 ───────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    setDatasets((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    toast.success(`数据集「${deleteTarget.name}」已删除`);
    logger.info('Dataset deleted:', deleteTarget.name);
    setDeleteTarget(null);
  }, [deleteTarget]);

  // ─── 格式化时间 ─────────────────────────────────────
  const formatTime = (iso: string) => {
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

  // ─── 渲染 ───────────────────────────────────────────
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
            数据集
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            管理训练数据集，支持上传、预览和版本管理
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors">
                  <Upload className="size-4" />
                  上传数据集
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px] border-black">
                <DialogHeader>
                  <DialogTitle className="heading-bold text-xl flex items-center gap-2">
                    <Upload className="size-5" />
                    上传数据集
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    上传新的数据集文件，支持 CSV、JSON、Parquet 和图片格式
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="ds-name" className="text-xs uppercase font-bold tracking-widest">
                      数据集名称 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ds-name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="例如：ImageNet-subset v3"
                      maxLength={50}
                      className="bg-background border-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ds-desc" className="text-xs uppercase font-bold tracking-widest">
                      描述
                    </Label>
                    <Textarea
                      id="ds-desc"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="简要描述数据集内容和用途..."
                      rows={2}
                      maxLength={200}
                      className="bg-background border-black resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold tracking-widest">数据类别</Label>
                      <Select
                        value={uploadForm.category}
                        onValueChange={(v) =>
                          setUploadForm((f) => ({ ...f, category: v as IDataset['category'] }))
                        }
                      >
                        <SelectTrigger className="bg-background border-black">
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

                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold tracking-widest">文件格式</Label>
                      <Select
                        value={uploadForm.format}
                        onValueChange={(v) =>
                          setUploadForm((f) => ({ ...f, format: v as IDataset['format'] }))
                        }
                      >
                        <SelectTrigger className="bg-background border-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-black">
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="parquet">Parquet</SelectItem>
                          <SelectItem value="image">图片</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest">
                      选择文件 <span className="text-destructive">*</span>
                    </Label>
                    <label
                      htmlFor="ds-file-upload"
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-black/30 bg-card px-6 py-10 text-center transition-colors hover:border-black"
                    >
                      {uploadFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex size-12 items-center justify-center bg-black">
                            <FileText className="size-6 text-background" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{uploadFile.name}</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">
                              {(uploadFile.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setUploadFile(null);
                            }}
                          >
                            <X className="size-3 mr-1" />
                            移除文件
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex size-12 items-center justify-center border border-black">
                            <Upload className="size-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">
                              拖拽文件到此处或点击选择
                            </p>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">
                              支持 CSV、JSON、Parquet、图片格式，最大 10GB
                            </p>
                          </div>
                        </>
                      )}
                      <input
                        id="ds-file-upload"
                        type="file"
                        className="hidden"
                        accept=".csv,.json,.parquet,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setUploadFile(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-black hover:bg-black hover:text-background transition-colors"
                    onClick={() => {
                      setUploadOpen(false);
                      setUploadForm({ name: '', description: '', category: 'tabular', format: 'csv' });
                      setUploadFile(null);
                    }}
                    disabled={uploading}
                  >
                    取消
                  </Button>
                  <Button
                    className="bg-black text-background hover:bg-black/80 transition-colors"
                    onClick={handleUpload}
                    disabled={uploading || !uploadForm.name.trim() || !uploadFile}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="size-4 mr-1.5 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 mr-1.5" />
                        开始上传
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            数据集是模型训练的基石。上传、管理、预览您的训练数据，支持 CSV、JSON、Parquet 和图片格式，提供完整的版本历史追溯。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* 搜索 & 筛选栏 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="border-b border-black p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索数据集名称..."
              className="bg-background pl-9 border-black"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="size-4 text-muted-foreground shrink-0" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-[120px] bg-background border-black text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-black">
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="h-9 w-[120px] bg-background border-black text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-black">
                {FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchKeyword || categoryFilter !== 'all' || formatFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs hover:bg-black hover:text-background transition-colors"
                onClick={() => {
                  setSearchKeyword('');
                  setCategoryFilter('all');
                  setFormatFilter('all');
                }}
              >
                <X className="size-3 mr-1" />
                清除筛选
              </Button>
            )}
          </div>

          <div className="ml-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 border border-black px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest">
              <Database className="size-3" />
              {filtered.length} 个数据集
            </span>
          </div>
        </div>
      </motion.div>

      {/* 数据集列表表格 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="border-b border-black p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">数据集列表</h2>
            <ArrowUpRight className="size-4" />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Database className="size-14 text-muted-foreground/25 mb-4" />
              <p className="text-sm font-bold text-muted-foreground">暂无数据集</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1 mb-4">
                {searchKeyword || categoryFilter !== 'all' || formatFilter !== 'all'
                  ? '没有符合筛选条件的数据集，请调整筛选条件'
                  : '点击「上传数据集」按钮添加第一个数据集'}
              </p>
              {!searchKeyword && categoryFilter === 'all' && formatFilter === 'all' && (
                <button
                  className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
                  onClick={() => setUploadOpen(true)}
                >
                  <Plus className="size-4" />
                  上传数据集
                </button>
              )}
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-black">
                    <TableHead
                      className="whitespace-nowrap cursor-pointer select-none text-xs uppercase font-bold tracking-widest"
                      onClick={() => handleSort('name')}
                    >
                      数据集名称{sortIndicator('name')}
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">类别</TableHead>
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">格式</TableHead>
                    <TableHead
                      className="whitespace-nowrap cursor-pointer select-none text-xs uppercase font-bold tracking-widest"
                      onClick={() => handleSort('sampleCount')}
                    >
                      样本数{sortIndicator('sampleCount')}
                    </TableHead>
                    <TableHead
                      className="whitespace-nowrap cursor-pointer select-none text-xs uppercase font-bold tracking-widest"
                      onClick={() => handleSort('size')}
                    >
                      大小{sortIndicator('size')}
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">版本</TableHead>
                    <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">状态</TableHead>
                    <TableHead
                      className="whitespace-nowrap cursor-pointer select-none text-xs uppercase font-bold tracking-widest"
                      onClick={() => handleSort('updatedAt')}
                    >
                      更新时间{sortIndicator('updatedAt')}
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right text-xs uppercase font-bold tracking-widest">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((dataset) => {
                    const FormatIcon = FORMAT_ICON_MAP[dataset.format] ?? FileText;
                    const statusCfg = STATUS_CONFIG[dataset.status] ?? STATUS_CONFIG.ready;
                    const StatusIcon = statusCfg.icon;

                    return (
                      <TableRow key={dataset.id} className="border-black hover:bg-black hover:text-background transition-colors group">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex size-8 shrink-0 items-center justify-center bg-black group-hover:bg-background">
                              <Database className="size-4 text-background group-hover:text-black" />
                            </div>
                            <div className="min-w-0">
                              <span className="block truncate max-w-[200px] text-sm font-bold">
                                {dataset.name}
                              </span>
                              <span className="block truncate max-w-[200px] text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60 mt-0.5">
                                {dataset.description}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="inline-block border border-black px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest group-hover:border-background">
                            {dataset.category === 'image'
                              ? '图像'
                              : dataset.category === 'text'
                                ? '文本'
                                : dataset.category === 'tabular'
                                  ? '表格'
                                  : '音频'}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <FormatIcon className="size-3.5" />
                            <span className="text-sm font-medium">{FORMAT_LABEL_MAP[dataset.format] ?? dataset.format}</span>
                          </div>
                        </TableCell>

                        <TableCell className="tabular-nums text-sm font-bold">
                          {dataset.sampleCount.toLocaleString()}
                        </TableCell>

                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1.5">
                            <HardDrive className="size-3" />
                            {dataset.size}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Layers className="size-3" />
                            <span className="text-sm font-bold">{dataset.version}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest ${
                              dataset.status === 'ready'
                                ? 'border-black text-black'
                                : dataset.status === 'processing'
                                  ? 'border-warning text-warning'
                                  : 'border-destructive text-destructive'
                            }`}
                          >
                            <StatusIcon
                              className={`size-3 ${dataset.status === 'processing' ? 'animate-spin' : ''}`}
                            />
                            {statusCfg.label}
                          </span>
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3" />
                            {formatTime(dataset.updatedAt)}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-background hover:text-black group-hover:text-background group-hover:hover:text-black transition-colors"
                              onClick={() => handlePreview(dataset)}
                              aria-label="预览数据"
                            >
                              <Eye className="size-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-background hover:text-black group-hover:text-background group-hover:hover:text-black transition-colors"
                              onClick={() => handleVersionHistory(dataset)}
                              aria-label="版本历史"
                            >
                              <History className="size-3.5" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 hover:bg-background hover:text-black group-hover:text-background group-hover:hover:text-black transition-colors"
                                  aria-label="更多操作"
                                >
                                  <MoreHorizontal className="size-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 border-black">
                                <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest">数据集操作</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs font-bold"
                                  onClick={() => handlePreview(dataset)}
                                >
                                  <Eye className="size-3.5 mr-2" />
                                  预览数据
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs font-bold"
                                  onClick={() => handleVersionHistory(dataset)}
                                >
                                  <History className="size-3.5 mr-2" />
                                  版本历史
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs font-bold"
                                  onClick={() => toast.info('数据标注功能即将开放')}
                                >
                                  <Download className="size-3.5 mr-2" />
                                  下载
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs font-bold text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(dataset)}
                                >
                                  <Trash2 className="size-3.5 mr-2" />
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

      {/* ─── 数据预览抽屉 ─────────────────────────────── */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[640px] overflow-y-auto border-l border-black">
          <SheetHeader>
            <SheetTitle className="heading-bold text-xl flex items-center gap-2">
              <Eye className="size-5" />
              数据预览
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {previewDataset?.name ?? ''} — 前 {previewSamples.length} 条样本
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {previewDataset && (
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-black p-3">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">样本总数</p>
                  <p className="heading-bold text-2xl tabular-nums mt-0.5">
                    {previewDataset.sampleCount.toLocaleString()}
                  </p>
                </div>
                <div className="border border-black p-3">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">数据大小</p>
                  <p className="heading-bold text-2xl mt-0.5">{previewDataset.size}</p>
                </div>
                <div className="border border-black p-3">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">格式</p>
                  <p className="heading-bold text-2xl mt-0.5">
                    {FORMAT_LABEL_MAP[previewDataset.format] ?? previewDataset.format}
                  </p>
                </div>
                <div className="border border-black p-3">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">版本</p>
                  <p className="heading-bold text-2xl mt-0.5">{previewDataset.version}</p>
                </div>
              </div>
            )}

            {previewSamples.length > 0 && (
              <div className="border border-black overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-black">
                        <TableHead className="whitespace-nowrap w-[60px] text-[10px] uppercase font-bold tracking-widest">#</TableHead>
                        {Object.keys(previewSamples[0].fields).map((key) => (
                          <TableHead key={key} className="whitespace-nowrap text-[10px] uppercase font-bold tracking-widest">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewSamples.map((sample, i) => (
                        <TableRow key={sample.id} className="border-black">
                          <TableCell className="text-xs text-muted-foreground tabular-nums">
                            {i + 1}
                          </TableCell>
                          {Object.values(sample.fields).map((val, j) => (
                            <TableCell key={j} className="text-xs max-w-[180px]">
                              <span className="block truncate">
                                {typeof val === 'number' ? val.toLocaleString() : String(val)}
                              </span>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {previewSamples.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="size-12 text-muted-foreground/25 mb-3" />
                <p className="text-sm font-bold text-muted-foreground">暂无预览数据</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── 版本历史抽屉 ─────────────────────────────── */}
      <Sheet open={versionOpen} onOpenChange={setVersionOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[520px] overflow-y-auto border-l border-black">
          <SheetHeader>
            <SheetTitle className="heading-bold text-xl flex items-center gap-2">
              <History className="size-5" />
              版本历史
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {versionDataset?.name ?? ''} — 共 {versionDataset?.versions.length ?? 0} 个版本
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {versionDataset?.versions.length ? (
              versionDataset.versions.map((ver, idx) => (
                <div
                  key={ver.id}
                  className="relative border border-black p-4"
                >
                  {idx < versionDataset.versions.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-0 w-px bg-black" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="relative z-10 flex size-8 shrink-0 items-center justify-center border border-black bg-background">
                      <div className="size-2.5 bg-black" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold">
                          {ver.version}
                        </span>
                        {idx === 0 && (
                          <span className="inline-block bg-black text-background px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest">
                            当前
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{ver.changelog}</p>
                      <div className="flex items-center gap-4 mt-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Layers className="size-3" />
                          {ver.sampleCount.toLocaleString()} 样本
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="size-3" />
                          {ver.size}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatTime(ver.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <History className="size-12 text-muted-foreground/25 mb-3" />
                <p className="text-sm font-bold text-muted-foreground">暂无版本历史</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── 删除确认对话框 ─────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="border-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="heading-bold text-xl flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" />
              删除数据集
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              确定要删除数据集「{deleteTarget?.name}」吗？此操作不可撤销，所有关联的版本和样本数据将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-black hover:bg-black hover:text-background transition-colors">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-black text-background hover:bg-black/80 transition-colors"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
