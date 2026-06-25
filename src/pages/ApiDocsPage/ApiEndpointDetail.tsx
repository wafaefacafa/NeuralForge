import { useState, useCallback, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import {
  Copy,
  Check,
  Play,
  ChevronRight,
  Key,
  Lock,
  Globe,
  ArrowRight,
  Terminal,
  FileJson,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { IApiEndpoint } from '@/types/api';

interface ApiEndpointDetailProps {
  endpoint: IApiEndpoint | null;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-success/15 text-success border-success/30',
  POST: 'bg-primary/15 text-primary border-primary/30',
  PUT: 'bg-warning/15 text-warning border-warning/30',
  DELETE: 'bg-destructive/15 text-destructive border-destructive/30',
  PATCH: 'bg-accent/15 text-accent border-accent/30',
};

const METHOD_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  GET: 'default',
  POST: 'secondary',
  PUT: 'outline',
  DELETE: 'destructive',
  PATCH: 'outline',
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Copy failed:', String(err));
      toast.error('复制失败');
    }
  }, [code]);

  return (
    <div className="relative rounded-lg border border-border/40 bg-[rgb(15_18_28)] overflow-hidden">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-[rgb(20_24_36)]">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleCopy}
          aria-label="复制代码"
        >
          {copied ? (
            <Check className="size-3.5 text-success" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground" />
          )}
        </Button>
      </div>
      {/* 代码内容 */}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed font-mono text-foreground/85">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function JsonBlock({ json }: { json: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Copy failed:', String(err));
      toast.error('复制失败');
    }
  }, [json]);

  // 简单 JSON 语法高亮
  const highlighted = json.replace(
    /("(?:[^"\\]|\\.)*")\s*:/g,
    '<span class="text-accent">$1</span>:',
  ).replace(
    /:\s*("(?:[^"\\]|\\.)*")/g,
    ': <span class="text-success">$1</span>',
  ).replace(
    /:\s*(\d+\.?\d*)/g,
    ': <span class="text-warning">$1</span>',
  ).replace(
    /:\s*(true|false|null)/g,
    ': <span class="text-primary">$1</span>',
  );

  return (
    <div className="relative rounded-lg border border-border/40 bg-[rgb(15_18_28)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-[rgb(20_24_36)]">
        <div className="flex items-center gap-2">
          <FileJson className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            JSON
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleCopy}
          aria-label="复制 JSON"
        >
          {copied ? (
            <Check className="size-3.5 text-success" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed font-mono text-foreground/85">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

function TryItDialog({ endpoint }: { endpoint: IApiEndpoint }) {
  const [open, setOpen] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState(endpoint.requestBody || '');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setResponse(null);

      try {
        await new Promise((r) => setTimeout(r, 1200));

        // 模拟响应
        const mockResponse = endpoint.responses[0]?.body || '{"status": "ok", "message": "success"}';
        setResponse(mockResponse);
        toast.success('请求成功');
        logger.info('API test call:', endpoint.method, endpoint.path);
      } catch (err) {
        logger.error('API test failed:', String(err));
        toast.error('请求失败');
      } finally {
        setLoading(false);
      }
    },
    [endpoint],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Play className="size-3.5" />
          Try it
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Badge
              variant={METHOD_BADGE_VARIANTS[endpoint.method] || 'outline'}
              className="font-mono text-[11px] px-1.5 py-0"
            >
              {endpoint.method}
            </Badge>
            <span className="font-mono text-sm">{endpoint.path}</span>
          </DialogTitle>
          <DialogDescription>填写参数并发送测试请求</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4">
          {/* 路径参数 */}
          {endpoint.requestParams.filter((p) => p.required).length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">路径参数</Label>
              {endpoint.requestParams
                .filter((p) => p.required)
                .map((param) => (
                  <div key={param.name} className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      {param.name}
                      <span className="text-destructive ml-0.5">*</span>
                      <span className="ml-2 text-[10px] text-muted-foreground/60">
                        {param.type}
                      </span>
                    </Label>
                    <Input
                      value={paramValues[param.name] || ''}
                      onChange={(e) =>
                        setParamValues((prev) => ({
                          ...prev,
                          [param.name]: e.target.value,
                        }))
                      }
                      placeholder={param.description}
                      className="h-9 bg-muted/50 font-mono text-sm"
                    />
                  </div>
                ))}
            </div>
          )}

          {/* 请求体 */}
          {endpoint.requestBody && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">请求体 (JSON)</Label>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={8}
                className="bg-muted/50 font-mono text-sm resize-none"
              />
            </div>
          )}

          {/* 响应 */}
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <Label className="text-sm font-semibold text-success">响应</Label>
              <div className="rounded-lg border border-success/20 bg-[rgb(15_28_18)] p-4 overflow-x-auto">
                <pre className="text-[13px] leading-relaxed font-mono text-success/90">
                  {response}
                </pre>
              </div>
            </motion.div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setResponse(null);
              }}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="mr-2 inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  发送中...
                </>
              ) : (
                <>
                  <Terminal className="size-3.5 mr-1.5" />
                  发送请求
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ApiEndpointDetail({ endpoint }: ApiEndpointDetailProps) {
  if (!endpoint) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
        <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <ArrowRight className="size-7 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1.5">选择 API 端点</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          从左侧列表中选择一个 API 端点，查看详细的请求/响应文档和 SDK 代码示例
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={endpoint.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* 端点标题 */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge
                  variant={METHOD_BADGE_VARIANTS[endpoint.method] || 'outline'}
                  className="font-mono text-xs px-2 py-0.5"
                >
                  {endpoint.method}
                </Badge>
                <span className="font-mono text-base font-semibold text-foreground break-all">
                  {endpoint.path}
                </span>
              </div>
              <CardDescription className="text-sm">{endpoint.summary}</CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <TryItDialog endpoint={endpoint} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {endpoint.description}
          </p>

          {/* 认证要求 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3" />
            <span>需要认证：</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
              Bearer Token
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 请求参数 */}
      {endpoint.requestParams.length > 0 && (
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="size-4 text-primary" />
              请求参数
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="whitespace-nowrap text-xs font-semibold w-[140px]">
                      参数名
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs font-semibold w-[100px]">
                      类型
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs font-semibold w-[80px]">
                      必填
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs font-semibold">
                      描述
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoint.requestParams.map((param) => (
                    <TableRow key={param.name} className="border-border/20">
                      <TableCell className="font-mono text-sm font-medium text-foreground py-3">
                        {param.name}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0">
                          {param.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        {param.required ? (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0 font-semibold"
                          >
                            必填
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">可选</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">
                        {param.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 请求体示例 */}
      {endpoint.requestBody && (
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileJson className="size-4 text-accent" />
              请求体示例
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JsonBlock json={endpoint.requestBody} />
          </CardContent>
        </Card>
      )}

      {/* 响应示例 */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="size-4 text-success" />
            响应示例
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {endpoint.responses.map((resp, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={resp.status < 400 ? 'default' : 'destructive'}
                  className="font-mono text-[11px] px-1.5 py-0"
                >
                  {resp.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{resp.description}</span>
              </div>
              <JsonBlock json={resp.body} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SDK 代码示例 */}
      {endpoint.sdkExamples.length > 0 && (
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="size-4 text-warning" />
              SDK 代码示例
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={endpoint.sdkExamples[0].language} className="w-full">
              <TabsList className="mb-3 bg-muted/50">
                {endpoint.sdkExamples.map((ex) => (
                  <TabsTrigger
                    key={ex.language}
                    value={ex.language}
                    className="text-xs font-medium data-[state=active]:bg-background"
                  >
                    {ex.language === 'python'
                      ? 'Python'
                      : ex.language === 'javascript'
                        ? 'JavaScript'
                        : 'cURL'}
                  </TabsTrigger>
                ))}
              </TabsList>
              {endpoint.sdkExamples.map((ex) => (
                <TabsContent key={ex.language} value={ex.language}>
                  <CodeBlock code={ex.code} language={ex.language} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
