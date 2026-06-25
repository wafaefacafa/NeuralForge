import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Code2, Copy, Check, Play, ChevronRight, ChevronDown, ExternalLink, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { MOCK_API_GROUPS, MOCK_API_ENDPOINTS } from '@/data/apiDocs';
import type { IApiEndpoint } from '@/types/api';

// ─── 子组件 ──────────────────────────────────────────

function EndpointNavItem({
  endpoint,
  isActive,
  onClick,
}: {
  endpoint: IApiEndpoint;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 transition-colors group ${
        isActive
          ? 'bg-black text-background'
          : 'hover:bg-black hover:text-background'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`shrink-0 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 border ${
            isActive ? 'border-background' : 'border-black group-hover:border-background'
          }`}
        >
          {endpoint.method}
        </span>
        <span className="text-xs font-mono font-bold truncate">
          {endpoint.path}
        </span>
      </div>
      <p className="mt-1 text-[10px] uppercase font-bold tracking-widest opacity-60 line-clamp-1 pl-0.5">
        {endpoint.summary}
      </p>
    </button>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  }, [code]);

  return (
    <div className="border border-black overflow-hidden group">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-black bg-card">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          {language ?? 'json'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 hover:bg-black hover:text-background transition-colors"
          onClick={handleCopy}
          aria-label="复制代码"
        >
          {copied ? (
            <Check className="size-3 text-success" />
          ) : (
            <Copy className="size-3" />
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre bg-background">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ApiTestDialog({
  open,
  onOpenChange,
  endpoint,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: IApiEndpoint | null;
}) {
  const [requestBody, setRequestBody] = useState('');
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = useCallback(async () => {
    if (!endpoint) return;
    setSending(true);
    setResponseBody(null);
    setResponseStatus(null);

    try {
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));
      const mockResponse = endpoint.responses[0];
      setResponseStatus(mockResponse?.status ?? 200);
      setResponseBody(mockResponse?.body ?? '{}');
      toast.success(`请求成功 (${mockResponse?.status ?? 200})`);
      logger.info('API test completed:', endpoint.path);
    } catch (err) {
      logger.error('API test failed:', String(err));
      toast.error('请求失败');
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: 'Internal Server Error' }, null, 2));
    } finally {
      setSending(false);
    }
  }, [endpoint]);

  const handleClose = useCallback(() => {
    setRequestBody('');
    setResponseBody(null);
    setResponseStatus(null);
    onOpenChange(false);
  }, [onOpenChange]);

  if (!endpoint) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] flex flex-col border-black">
        <DialogHeader>
          <DialogTitle className="heading-bold text-lg flex items-center gap-2">
            <Play className="size-4" />
            API 调用测试
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-1.5 py-0.5">
              {endpoint.method}
            </span>
            <code className="text-xs font-mono font-bold">{endpoint.path}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {endpoint.requestParams.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                请求参数
              </Label>
              <div className="space-y-2">
                {endpoint.requestParams.map((param) => (
                  <div key={param.name} className="flex items-center gap-2">
                    <Input
                      placeholder={param.name}
                      className="h-8 text-xs border-black"
                    />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground shrink-0 w-16 text-right">
                      {param.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.requestBody && (
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                请求体 (JSON)
              </Label>
              <Textarea
                value={requestBody || endpoint.requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={6}
                className="font-mono text-xs border-black resize-none"
                placeholder="输入 JSON 请求体..."
              />
            </div>
          )}

          {responseBody && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                  响应
                </Label>
                <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-1.5 py-0.5">
                  {responseStatus}
                </span>
              </div>
              <CodeBlock code={responseBody} language="json" />
            </motion.div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-black hover:bg-black hover:text-background transition-colors"
          >
            关闭
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending}
            className="bg-black text-background hover:bg-black/80 transition-colors gap-1.5"
          >
            <Play className="size-3.5" />
            {sending ? '发送中...' : '发送请求'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 主组件 ──────────────────────────────────────────

export default function ApiDocsPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(
    MOCK_API_ENDPOINTS[0]?.id ?? '',
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(MOCK_API_GROUPS.map((g) => g.name)),
  );
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testTarget, setTestTarget] = useState<IApiEndpoint | null>(null);

  const filteredEndpoints = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return MOCK_API_ENDPOINTS;
    return MOCK_API_ENDPOINTS.filter(
      (ep) =>
        ep.path.toLowerCase().includes(kw) ||
        ep.summary.toLowerCase().includes(kw) ||
        ep.description.toLowerCase().includes(kw) ||
        ep.group.toLowerCase().includes(kw),
    );
  }, [searchKeyword]);

  const groupedEndpoints = useMemo(() => {
    const map = new Map<string, IApiEndpoint[]>();
    for (const ep of filteredEndpoints) {
      const list = map.get(ep.group) ?? [];
      list.push(ep);
      map.set(ep.group, list);
    }
    return map;
  }, [filteredEndpoints]);

  const selectedEndpoint = useMemo(
    () => MOCK_API_ENDPOINTS.find((ep) => ep.id === selectedEndpointId) ?? null,
    [selectedEndpointId],
  );

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  }, []);

  const handleSelectEndpoint = useCallback((id: string) => {
    setSelectedEndpointId(id);
  }, []);

  const handleOpenTest = useCallback((endpoint: IApiEndpoint) => {
    setTestTarget(endpoint);
    setTestDialogOpen(true);
  }, []);

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
            API 文档
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            NeuralForge REST API 完整参考文档
          </p>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            推理 API · 模型管理 API · 数据集 API · 部署 API — 完整的端点列表、请求响应示例与 SDK 代码片段。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* 主内容: 左右分栏 */}
      <div className="flex border-b border-black" style={{ minHeight: 'calc(100vh - 13rem)' }}>
        {/* ── 左侧：端点导航 ── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-72 shrink-0 border-r border-black flex flex-col bg-card"
        >
          {/* 搜索框 */}
          <div className="p-4 border-b border-black">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索 API 端点..."
                className="h-9 bg-background pl-9 pr-3 text-sm border-black focus-visible:ring-1 focus-visible:ring-black"
              />
            </div>
          </div>

          {/* 端点列表 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-0.5">
              {MOCK_API_GROUPS.map((group) => {
                const endpoints = groupedEndpoints.get(group.name) ?? [];
                const isExpanded = expandedGroups.has(group.name);

                return (
                  <Collapsible
                    key={group.name}
                    open={isExpanded}
                    onOpenChange={() => toggleGroup(group.name)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-3 py-2 text-xs uppercase font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="size-3.5 shrink-0" />
                      ) : (
                        <ChevronRight className="size-3.5 shrink-0" />
                      )}
                      <span>{group.label}</span>
                      <span className="ml-auto text-[10px] border border-black px-1.5 py-0.5">
                        {endpoints.length}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-0.5 pb-1">
                      {endpoints.map((ep) => (
                        <EndpointNavItem
                          key={ep.id}
                          endpoint={ep}
                          isActive={selectedEndpointId === ep.id}
                          onClick={() => handleSelectEndpoint(ep.id)}
                        />
                      ))}
                      {endpoints.length === 0 && (
                        <p className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                          无匹配端点
                        </p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        </motion.aside>

        {/* ── 右侧：端点详情 ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 overflow-y-auto"
        >
          {selectedEndpoint ? (
            <div className="p-8 space-y-8 max-w-4xl">
              {/* 端点标题 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase font-bold tracking-widest border border-black px-2 py-1 bg-black text-background">
                    {selectedEndpoint.method}
                  </span>
                  <h1 className="heading-bold text-2xl font-mono">
                    {selectedEndpoint.path}
                  </h1>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{selectedEndpoint.summary}</p>
                {selectedEndpoint.description && (
                  <p className="text-xs text-muted-foreground">{selectedEndpoint.description}</p>
                )}
              </div>

              <div className="border-t border-black" />

              {/* 请求参数 */}
              {selectedEndpoint.requestParams.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 border-b border-black pb-4 mb-4">
                    <h2 className="heading-bold text-xl">请求参数</h2>
                    <ArrowUpRight className="size-4" />
                  </div>
                  <div className="w-full overflow-x-auto border border-black">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-black">
                          <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">参数名</TableHead>
                          <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">类型</TableHead>
                          <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">必填</TableHead>
                          <TableHead className="whitespace-nowrap text-xs uppercase font-bold tracking-widest">描述</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEndpoint.requestParams.map((param) => (
                          <TableRow key={param.name} className="border-black">
                            <TableCell>
                              <code className="text-xs font-mono font-bold">{param.name}</code>
                            </TableCell>
                            <TableCell>
                              <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-1.5 py-0.5">
                                {param.type}
                              </span>
                            </TableCell>
                            <TableCell>
                              {param.required ? (
                                <span className="text-[10px] uppercase font-bold tracking-widest text-destructive">
                                  必填
                                </span>
                              ) : (
                                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                  可选
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {param.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* 请求体示例 */}
              {selectedEndpoint.requestBody && (
                <div>
                  <div className="flex items-center gap-2 border-b border-black pb-4 mb-4">
                    <h2 className="heading-bold text-xl">请求体示例</h2>
                    <ArrowUpRight className="size-4" />
                  </div>
                  <CodeBlock code={selectedEndpoint.requestBody} language="json" />
                </div>
              )}

              {/* 响应示例 */}
              {selectedEndpoint.responses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 border-b border-black pb-4 mb-4">
                    <h2 className="heading-bold text-xl">响应示例</h2>
                    <ArrowUpRight className="size-4" />
                  </div>
                  <div className="space-y-4">
                    {selectedEndpoint.responses.map((resp, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-1.5 py-0.5">
                            {resp.status}
                          </span>
                          <span className="text-xs text-muted-foreground">{resp.description}</span>
                        </div>
                        <CodeBlock code={resp.body} language="json" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SDK 代码示例 */}
              {selectedEndpoint.sdkExamples.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 border-b border-black pb-4 mb-4">
                    <h2 className="heading-bold text-xl">SDK 代码示例</h2>
                    <ArrowUpRight className="size-4" />
                  </div>
                  <div className="space-y-4">
                    {selectedEndpoint.sdkExamples.map((example, idx) => (
                      <div key={idx} className="space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-1.5 py-0.5">
                          {example.language}
                        </span>
                        <CodeBlock code={example.code} language={example.language} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 底部操作栏 */}
              <div className="flex items-center gap-3 pt-2 border-t border-black pt-6">
                <button
                  type="button"
                  onClick={() => handleOpenTest(selectedEndpoint)}
                  className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
                >
                  <Play className="size-4" />
                  Try it - 在线测试
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('API 文档链接已复制')}
                  className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
                >
                  <ExternalLink className="size-4" />
                  复制链接
                </button>
              </div>
            </div>
          ) : (
            /* 空状态 */
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="flex size-16 items-center justify-center border border-black mb-4">
                <Code2 className="size-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold">选择一个 API 端点</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">
                从左侧导航中选择端点以查看详细信息
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* 测试对话框 */}
      <ApiTestDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        endpoint={testTarget}
      />
    </div>
  );
}
