import { useState, useEffect, useMemo } from 'react';
import { Eye, Loader2, Table2 } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit-lite';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import type { IDataset, IDatasetSample } from '@/types/datasets';
import { MOCK_DATASET_SAMPLES } from '@/data/datasets';

interface DatasetPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataset: IDataset | null;
}

export default function DatasetPreviewDrawer({
  open,
  onOpenChange,
  dataset,
}: DatasetPreviewDrawerProps) {
  const [samples, setSamples] = useState<IDatasetSample[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !dataset) return;

    setLoading(true);
    const timer = setTimeout(() => {
      const data = MOCK_DATASET_SAMPLES[dataset.id] ?? [];
      setSamples(data);
      setLoading(false);
      logger.info(`DatasetPreviewDrawer: loaded ${data.length} samples for ${dataset.id}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [open, dataset]);

  const columns = useMemo(() => {
    if (samples.length === 0) return [];
    return Object.keys(samples[0].fields);
  }, [samples]);

  const formatLabel = (key: string): string => {
    const labelMap: Record<string, string> = {
      image_id: '图像 ID',
      class: '类别',
      width: '宽度',
      height: '高度',
      category: '类别',
      bbox_count: '标注框数',
      area: '区域面积',
      question: '问题',
      answer: '答案',
      context: '上下文',
      speaker_id: '说话人 ID',
      duration_sec: '时长(秒)',
      transcript: '转录文本',
      sample_rate: '采样率',
      label: '标签',
    };
    return labelMap[key] ?? key;
  };

  const formatValue = (key: string, value: string | number): string => {
    if (key === 'duration_sec') return `${value}s`;
    if (key === 'sample_rate') return `${value} Hz`;
    if (key === 'area') return `${Number(value).toLocaleString()} px²`;
    return String(value);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-black shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-foreground" />
            <SheetTitle className="text-lg">数据预览</SheetTitle>
          </div>
          {dataset && (
            <SheetDescription className="flex flex-wrap items-center gap-2 pt-1">
              <span className="font-medium text-foreground">{dataset.name}</span>
              <Badge variant="secondary" className="text-xs">
                {dataset.format.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dataset.version}
              </Badge>
              <span className="text-xs text-muted-foreground">
                共 {dataset.sampleCount.toLocaleString()} 条样本
              </span>
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="space-y-3 px-6 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : samples.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-16">
              <Table2 className="size-10 opacity-30" />
              <p className="text-sm">暂无样本数据</p>
              <p className="text-xs">该数据集尚未上传样本或样本正在处理中</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="px-6 py-4">
                <div className="border border-black overflow-hidden">
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead className="whitespace-nowrap w-12 text-xs font-semibold text-muted-foreground">
                            #
                          </TableHead>
                          {columns.map((col) => (
                            <TableHead
                              key={col}
                              className="whitespace-nowrap text-xs font-semibold text-muted-foreground"
                            >
                              {formatLabel(col)}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {samples.map((sample, idx) => (
                          <TableRow key={sample.id} className="hover:bg-muted transition-colors">
                            <TableCell className="text-xs text-muted-foreground tabular-nums w-12">
                              {idx + 1}
                            </TableCell>
                            {columns.map((col) => (
                              <TableCell
                                key={col}
                                className="whitespace-nowrap text-sm max-w-[240px]"
                              >
                                <span className="block truncate max-w-[220px]">
                                  {formatValue(col, sample.fields[col])}
                                </span>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span>
                    显示 {samples.length} / {dataset?.sampleCount.toLocaleString() ?? 0} 条样本
                  </span>
                  <span className="flex items-center gap-1">
                    <Loader2 className="size-3" />
                    仅预览前 {samples.length} 条
                  </span>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
