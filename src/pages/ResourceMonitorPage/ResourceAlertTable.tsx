import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle, AlertCircle, CheckCircle2, Eye, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

import type { IResourceAlert } from '@/types/resources';

interface ResourceAlertTableProps {
  alerts: IResourceAlert[];
}

const LEVEL_CONFIG: Record<IResourceAlert['level'], { label: string; variant: 'destructive' | 'default'; icon: typeof AlertTriangle }> = {
  warning: { label: '警告', variant: 'default', icon: AlertTriangle },
  critical: { label: '严重', variant: 'destructive', icon: AlertCircle },
};

const STATUS_CONFIG: Record<IResourceAlert['status'], { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: '活跃', variant: 'default' },
  acknowledged: { label: '已确认', variant: 'secondary' },
  resolved: { label: '已解决', variant: 'outline' },
};

const RESOURCE_LABELS: Record<IResourceAlert['resourceType'], string> = {
  CPU: 'CPU',
  GPU: 'GPU',
  Memory: '内存',
  Storage: '存储',
};

function ResourceAlertTable({ alerts }: ResourceAlertTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [localAlerts, setLocalAlerts] = useState(alerts);

  const filtered = localAlerts.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (levelFilter !== 'all' && a.level !== levelFilter) return false;
    return true;
  });

  const handleAcknowledge = useCallback((id: string) => {
    setLocalAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' as const } : a)),
    );
    toast.success('告警已确认');
  }, []);

  const handleResolve = useCallback((id: string) => {
    setLocalAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a)),
    );
    toast.success('告警已标记为已解决');
  }, []);

  const formatTime = useCallback((time: string) => {
    const d = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return `${diffMin} 分钟前`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} 小时前`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} 天前`;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-black bg-card">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="size-5 text-warning" />
              资源告警
              {filtered.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {filtered.length}
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue placeholder="告警级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  <SelectItem value="critical">严重</SelectItem>
                  <SelectItem value="warning">警告</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="acknowledged">已确认</SelectItem>
                  <SelectItem value="resolved">已解决</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="whitespace-nowrap w-[160px]">告警时间</TableHead>
                  <TableHead className="whitespace-nowrap">资源类型</TableHead>
                  <TableHead className="whitespace-nowrap">级别</TableHead>
                  <TableHead className="whitespace-nowrap">描述</TableHead>
                  <TableHead className="whitespace-nowrap">状态</TableHead>
                  <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="size-8 text-success" />
                        <span className="text-sm">暂无告警记录</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((alert) => {
                    const LevelIcon = LEVEL_CONFIG[alert.level].icon;
                    const levelCfg = LEVEL_CONFIG[alert.level];
                    const statusCfg = STATUS_CONFIG[alert.status];

                    return (
                      <TableRow key={alert.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTime(alert.time)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="text-xs font-normal">
                            {RESOURCE_LABELS[alert.resourceType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant={levelCfg.variant}
                            className="flex w-fit items-center gap-1 text-xs"
                          >
                            <LevelIcon className="size-3" />
                            {levelCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="block max-w-[280px] truncate text-sm">
                            {alert.description}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={statusCfg.variant} className="text-xs">
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            {alert.status === 'active' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleAcknowledge(alert.id)}
                                >
                                  <Eye className="size-3 mr-1" />
                                  确认
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleResolve(alert.id)}
                                >
                                  <CheckCircle2 className="size-3 mr-1" />
                                  解决
                                </Button>
                              </>
                            )}
                            {alert.status === 'acknowledged' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleResolve(alert.id)}
                              >
                                <CheckCircle2 className="size-3 mr-1" />
                                解决
                              </Button>
                            )}
                            {alert.status === 'resolved' && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CheckCircle2 className="size-3 text-success" />
                                已处理
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default memo(ResourceAlertTable);
