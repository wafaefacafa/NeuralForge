import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { IClassificationReport } from '@/types/models';

interface ClassificationReportTableProps {
  data: IClassificationReport[];
}

type SortKey = keyof IClassificationReport;
type SortDir = 'asc' | 'desc';

function getScoreBadge(score: number) {
  if (score >= 0.9) return { variant: 'default' as const, label: '优秀' };
  if (score >= 0.75) return { variant: 'secondary' as const, label: '良好' };
  if (score >= 0.6) return { variant: 'outline' as const, label: '一般' };
  return { variant: 'destructive' as const, label: '较差' };
}

function ClassificationReportTable({ data }: ClassificationReportTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('f1Score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 inline size-3 text-muted-foreground/50" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 inline size-3 text-foreground" />
    ) : (
      <ArrowDown className="ml-1 inline size-3 text-foreground" />
    );
  };

  const headClass = 'whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors';
  const columns: { key: SortKey; label: string }[] = [
    { key: 'label', label: '类别' },
    { key: 'precision', label: 'Precision' },
    { key: 'recall', label: 'Recall' },
    { key: 'f1Score', label: 'F1-Score' },
    { key: 'support', label: 'Support' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-black bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">分类报告</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-black">
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={headClass}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <SortIcon column={col.key} />
                    </TableHead>
                  ))}
                  <TableHead className="whitespace-nowrap text-right">评级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => {
                  const badge = getScoreBadge(row.f1Score);
                  return (
                    <TableRow
                      key={row.label}
                      className="border-black hover:bg-muted transition-colors"
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {row.label}
                      </TableCell>
                      <TableCell className="tabular-nums whitespace-nowrap">
                        {row.precision.toFixed(4)}
                      </TableCell>
                      <TableCell className="tabular-nums whitespace-nowrap">
                        {row.recall.toFixed(4)}
                      </TableCell>
                      <TableCell className="tabular-nums whitespace-nowrap font-semibold">
                        {row.f1Score.toFixed(4)}
                      </TableCell>
                      <TableCell className="tabular-nums whitespace-nowrap">
                        {row.support}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={badge.variant} className="text-[11px]">
                          {badge.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default memo(ClassificationReportTable);
