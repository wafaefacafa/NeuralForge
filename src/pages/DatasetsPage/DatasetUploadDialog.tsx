import { useState, useCallback, type FormEvent, type DragEvent } from 'react';
import { Upload, X, FileText, FileJson, FileImage, FileSpreadsheet, Database } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { IDatasetUploadForm } from '@/types/datasets';

interface DatasetUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (form: IDatasetUploadForm) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'image', label: '图像', icon: FileImage },
  { value: 'text', label: '文本', icon: FileText },
  { value: 'tabular', label: '表格', icon: FileSpreadsheet },
  { value: 'audio', label: '音频', icon: FileJson },
] as const;

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'parquet', label: 'Parquet' },
  { value: 'image', label: '图像文件夹' },
] as const;

const INITIAL_FORM: IDatasetUploadForm = {
  name: '',
  description: '',
  category: 'tabular',
  format: 'csv',
};

export default function DatasetUploadDialog({
  open,
  onOpenChange,
  onUpload,
}: DatasetUploadDialogProps) {
  const [form, setForm] = useState<IDatasetUploadForm>(INITIAL_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setFile(null);
    setDragOver(false);
    setSubmitting(false);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetForm();
      onOpenChange(next);
    },
    [onOpenChange, resetForm],
  );

  const handleFileDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!form.name.trim()) {
        toast.error('请输入数据集名称');
        return;
      }
      if (!file) {
        toast.error('请选择要上传的文件');
        return;
      }

      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 1200));

      onUpload({ ...form, file });
      toast.success(`数据集「${form.name}」上传成功`);
      resetForm();
      onOpenChange(false);
    },
    [form, file, onUpload, resetForm, onOpenChange],
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5 text-foreground" />
            上传数据集
          </DialogTitle>
          <DialogDescription>
            上传数据集文件到 NeuralForge 平台，支持 CSV、JSON、Parquet 和图像文件夹格式。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 数据集名称 */}
          <div className="space-y-2">
            <Label htmlFor="ds-name">数据集名称 *</Label>
            <Input
              id="ds-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例如：ImageNet-subset v3"
              maxLength={60}
            />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="ds-desc">描述</Label>
            <Textarea
              id="ds-desc"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="简要描述数据集的内容和用途"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* 类别 + 格式 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>数据类别</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, category: v as IDatasetUploadForm['category'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          {opt.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>文件格式</Label>
              <Select
                value={form.format}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, format: v as IDatasetUploadForm['format'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 文件拖拽上传区 */}
          <div className="space-y-2">
            <Label>上传文件 *</Label>
            {!file ? (
              <div
                className={`relative flex flex-col items-center justify-center border-2 border-dashed p-8 transition-colors ${
                  dragOver
                    ? 'border-black bg-card'
                    : 'border-black hover:bg-muted'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
              >
                <Database className="mb-3 size-10 text-muted-foreground" />
                <p className="text-sm font-medium">
                  拖拽文件到此处，或
                  <label className="mx-1 cursor-pointer text-foreground hover:underline">
                    点击选择
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".csv,.json,.parquet,.zip,.tar.gz"
                    />
                  </label>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  支持 CSV、JSON、Parquet、图像文件夹（.zip / .tar.gz），最大 10GB
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-black bg-muted px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center bg-card border border-black">
                    <FileText className="size-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-7 w-7"
                  onClick={handleRemoveFile}
                  aria-label="移除文件"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {/* 文件信息提示 */}
          {file && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {formatFileSize(file.size)}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {file.type || '未知类型'}
              </Badge>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting || !form.name.trim() || !file}>
              {submitting ? '上传中...' : '开始上传'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
