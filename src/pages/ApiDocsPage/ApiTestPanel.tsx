import { useState, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { X, Send, Copy, Check, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { IApiEndpoint, IApiRequestParam } from '@/types/api';

interface ApiTestPanelProps {
  endpoint: IApiEndpoint;
  open: boolean;
  onClose: () => void;
}

interface ParamInput {
  key: string;
  value: string;
}

export default function ApiTestPanel({ endpoint, open, onClose }: ApiTestPanelProps) {
  const [pathParams, setPathParams] = useState<ParamInput[]>(() =>
    endpoint.requestParams
      .filter((p) => p.name.startsWith(':'))
      .map((p) => ({ key: p.name.replace(':', ''), value: '' })),
  );

  const [queryParams, setQueryParams] = useState<ParamInput[]>(() =>
    endpoint.requestParams
      .filter((p) => !p.name.startsWith(':'))
      .map((p) => ({ key: p.name, value: '' })),
  );

  const [requestBody, setRequestBody] = useState(
    endpoint.requestBody || '{\n  \n}',
  );

  const [response, setResponse] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const buildUrl = useCallback(() => {
    let url = endpoint.path;
    pathParams.forEach((p) => {
      url = url.replace(`:${p.key}`, p.value || `:${p.key}`);
    });

    const activeQuery = queryParams.filter((p) => p.value.trim());
    if (activeQuery.length > 0) {
      const qs = activeQuery
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');
      url += `?${qs}`;
    }

    return url;
  }, [endpoint.path, pathParams, queryParams]);

  const handleSend = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setResponse(null);
      setResponseStatus(null);
      setShowResponse(false);

      const url = buildUrl();
      logger.info('API Test request:', endpoint.method, url);

      try {
        await new Promise((r) => setTimeout(r, 1200));

        // 模拟响应数据
        const mockResponses: Record<string, { status: number; body: string }> = {
          'GET /api/v1/models': {
            status: 200,
            body: JSON.stringify(
              {
                data: [
                  {
                    id: 'mdl_001',
                    name: 'ResNet-50 v3',
                    version: 'v3.2.1',
                    status: 'ready',
                    accuracy: 0.942,
                    f1Score: 0.918,
                    createdAt: '2026-06-20T10:30:00Z',
                  },
                  {
                    id: 'mdl_002',
                    name: 'BERT-NER',
                    version: 'v2.1.0',
                    status: 'deployed',
                    accuracy: 0.956,
                    f1Score: 0.931,
                    createdAt: '2026-06-18T08:15:00Z',
                  },
                ],
                total: 2,
                page: 1,
                pageSize: 20,
              },
              null,
              2,
            ),
          },
          'POST /api/v1/models': {
            status: 201,
            body: JSON.stringify(
              {
                id: 'mdl_new',
                name: 'new-model',
                version: 'v1.0.0',
                status: 'training',
                createdAt: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
          'GET /api/v1/deployments': {
            status: 200,
            body: JSON.stringify(
              {
                data: [
                  {
                    id: 'dep_001',
                    modelId: 'mdl_001',
                    status: 'running',
                    endpoint: 'https://api.neuralforge.io/v1/inference/mdl_001',
                    qps: 1250,
                    uptime: '72h 15m',
                  },
                ],
                total: 1,
              },
              null,
              2,
            ),
          },
          'POST /api/v1/inference': {
            status: 200,
            body: JSON.stringify(
              {
                id: 'inf_001',
                model: 'ResNet-50 v3',
                predictions: [
                  { class: 'defect', confidence: 0.923 },
                  { class: 'normal', confidence: 0.067 },
                  { class: 'scratch', confidence: 0.010 },
                ],
                latency: 45,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        };

        const key = `${endpoint.method} ${endpoint.path}`;
        const mock = mockResponses[key] || {
          status: 200,
          body: JSON.stringify(
            {
              success: true,
              message: '请求成功',
              data: { id: 'sample_id', timestamp: new Date().toISOString() },
            },
            null,
            2,
          ),
        };

        setResponse(mock.body);
        setResponseStatus(mock.status);
        setShowResponse(true);

        if (mock.status >= 200 && mock.status < 300) {
          toast.success(`${mock.status} OK — 请求成功`);
        } else if (mock.status >= 400 && mock.status < 500) {
          toast.error(`${mock.status} — 客户端错误`);
        } else if (mock.status >= 500) {
          toast.error(`${mock.status} — 服务器错误`);
        }
      } catch (err) {
        logger.error('API Test failed:', String(err));
        toast.error('请求失败，请检查网络连接');
        setResponseStatus(0);
        setResponse(JSON.stringify({ error: 'Network Error' }, null, 2));
        setShowResponse(true);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, buildUrl],
  );

  const handleCopyResponse = useCallback(async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  }, [response]);

  const handleUpdatePathParam = useCallback(
    (key: string, value: string) => {
      setPathParams((prev) =>
        prev.map((p) => (p.key === key ? { ...p, value } : p)),
      );
    },
    [],
  );

  const handleUpdateQueryParam = useCallback(
    (key: string, value: string) => {
      setQueryParams((prev) =>
        prev.map((p) => (p.key === key ? { ...p, value } : p)),
      );
    },
    [],
  );

  const methodColors: Record<string, string> = {
    GET: 'bg-success/15 text-success border-success/30',
    POST: 'bg-primary/15 text-primary border-primary/30',
    PUT: 'bg-warning/15 text-warning border-warning/30',
    DELETE: 'bg-destructive/15 text-destructive border-destructive/30',
    PATCH: 'bg-accent/15 text-accent border-accent/30',
  };

  const responseStatusColor =
    responseStatus && responseStatus >= 200 && responseStatus < 300
      ? 'text-success'
      : responseStatus && responseStatus >= 400
        ? 'text-destructive'
        : 'text-muted-foreground';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 面板 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-border/40 bg-card shadow-2xl"
          >
            {/* 面板头部 */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <Badge
                  variant="outline"
                  className={`shrink-0 px-2 py-0.5 text-[11px] font-mono font-semibold ${
                    methodColors[endpoint.method] || 'bg-muted text-muted-foreground'
                  }`}
                >
                  {endpoint.method}
                </Badge>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold truncate">API 调用测试</h2>
                  <p className="text-xs text-muted-foreground truncate font-mono">
                    {endpoint.path}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={onClose}
                aria-label="关闭"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* 面板内容 */}
            <ScrollArea className="flex-1">
              <form onSubmit={handleSend} className="space-y-5 p-5">
                {/* 请求 URL 预览 */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    请求 URL
                  </Label>
                  <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
                    <code className="break-all text-sm font-mono text-foreground/80">
                      {buildUrl()}
                    </code>
                  </div>
                </div>

                {/* 路径参数 */}
                {pathParams.length > 0 && (
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex w-full items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronRight className="size-3.5 transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                      路径参数 ({pathParams.length})
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 space-y-3">
                      {pathParams.map((param) => (
                        <div key={param.key} className="space-y-1.5">
                          <Label className="text-xs font-mono text-foreground/70">
                            :{param.key}
                          </Label>
                          <Input
                            value={param.value}
                            onChange={(e) =>
                              handleUpdatePathParam(param.key, e.target.value)
                            }
                            placeholder={`输入 ${param.key} 的值...`}
                            className="h-9 bg-muted/50 text-sm"
                          />
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* 查询参数 */}
                {queryParams.length > 0 && (
                  <Collapsible defaultOpen={queryParams.length <= 3}>
                    <CollapsibleTrigger className="flex w-full items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronRight className="size-3.5 transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                      查询参数 ({queryParams.length})
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 space-y-3">
                      {queryParams.map((param) => (
                        <div key={param.key} className="space-y-1.5">
                          <Label className="text-xs font-mono text-foreground/70">
                            {param.key}
                          </Label>
                          <Input
                            value={param.value}
                            onChange={(e) =>
                              handleUpdateQueryParam(param.key, e.target.value)
                            }
                            placeholder={`输入 ${param.key} 的值...`}
                            className="h-9 bg-muted/50 text-sm"
                          />
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* 请求体 */}
                {['POST', 'PUT', 'PATCH'].includes(endpoint.method) && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      请求体 (JSON)
                    </Label>
                    <Textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      rows={8}
                      className="bg-muted/50 font-mono text-sm resize-none"
                      spellCheck={false}
                    />
                  </div>
                )}

                <Separator className="bg-border/40" />

                {/* 发送按钮 */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      发送请求
                    </>
                  )}
                </Button>

                {/* 响应区域 */}
                <AnimatePresence>
                  {showResponse && response !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <Separator className="bg-border/40" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            响应
                          </span>
                          {responseStatus !== null && (
                            <Badge
                              variant="outline"
                              className={`px-2 py-0 text-[11px] font-mono font-semibold ${
                                responseStatus >= 200 && responseStatus < 300
                                  ? 'border-success/30 text-success bg-success/10'
                                  : responseStatus >= 400
                                    ? 'border-destructive/30 text-destructive bg-destructive/10'
                                    : 'border-muted-foreground/30 text-muted-foreground'
                              }`}
                            >
                              {responseStatus}
                              {responseStatus >= 200 && responseStatus < 300
                                ? ' OK'
                                : responseStatus >= 400
                                  ? ' Error'
                                  : ''}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 text-xs"
                          onClick={handleCopyResponse}
                        >
                          {copied ? (
                            <>
                              <Check className="size-3 text-success" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              复制
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="relative rounded-lg border border-border/40 bg-muted/30">
                        <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-foreground/80 max-h-80 overflow-y-auto">
                          <code>{response}</code>
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
