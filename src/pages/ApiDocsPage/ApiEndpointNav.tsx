import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { IApiEndpoint, IApiGroup } from '@/types/api';

interface ApiEndpointNavProps {
  groups: IApiGroup[];
  endpoints: IApiEndpoint[];
  selectedEndpointId: string | null;
  onSelectEndpoint: (endpoint: IApiEndpoint) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-success/15 text-success border-success/30',
  POST: 'bg-primary/15 text-primary border-primary/30',
  PUT: 'bg-warning/15 text-warning border-warning/30',
  DELETE: 'bg-destructive/15 text-destructive border-destructive/30',
  PATCH: 'bg-accent/15 text-accent border-accent/30',
};

export default function ApiEndpointNav({
  groups,
  endpoints,
  selectedEndpointId,
  onSelectEndpoint,
}: ApiEndpointNavProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.name)),
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

  const filteredEndpoints = useMemo(() => {
    if (!searchKeyword.trim()) return endpoints;
    const kw = searchKeyword.toLowerCase();
    return endpoints.filter(
      (ep) =>
        ep.path.toLowerCase().includes(kw) ||
        ep.summary.toLowerCase().includes(kw) ||
        ep.description.toLowerCase().includes(kw) ||
        ep.group.toLowerCase().includes(kw),
    );
  }, [endpoints, searchKeyword]);

  const groupedEndpoints = useMemo(() => {
    const map = new Map<string, IApiEndpoint[]>();
    for (const ep of filteredEndpoints) {
      const list = map.get(ep.group) || [];
      list.push(ep);
      map.set(ep.group, list);
    }
    return map;
  }, [filteredEndpoints]);

  const totalCount = endpoints.length;
  const filteredCount = filteredEndpoints.length;

  return (
    <div className="flex flex-col h-full">
      {/* 搜索框 */}
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索 API 端点..."
            className="h-8 bg-muted/50 pl-9 pr-3 text-xs focus-visible:ring-1"
          />
        </div>
        {searchKeyword && (
          <p className="mt-1.5 text-[11px] text-muted-foreground px-1">
            找到 {filteredCount} 个端点
            {filteredCount !== totalCount && `（共 ${totalCount} 个）`}
          </p>
        )}
      </div>

      {/* 端点列表 */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {groups.map((group) => {
            const groupEndpoints = groupedEndpoints.get(group.name);
            const isExpanded = expandedGroups.has(group.name);

            // 搜索模式下，没有匹配端点的分组不显示
            if (searchKeyword && (!groupEndpoints || groupEndpoints.length === 0)) {
              return null;
            }

            const hasEndpoints = groupEndpoints && groupEndpoints.length > 0;

            return (
              <div key={group.name}>
                {/* 分组标题 */}
                <Button
                  variant="ghost"
                  className="w-full justify-between h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleGroup(group.name)}
                >
                  <span className="flex items-center gap-1.5">
                    {isExpanded ? (
                      <ChevronDown className="size-3" />
                    ) : (
                      <ChevronRight className="size-3" />
                    )}
                    {group.label}
                  </span>
                  {hasEndpoints && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {groupEndpoints.length}
                    </Badge>
                  )}
                </Button>

                {/* 端点列表 */}
                <AnimatePresence initial={false}>
                  {isExpanded && hasEndpoints && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 pb-1">
                        {groupEndpoints.map((ep) => {
                          const isSelected = selectedEndpointId === ep.id;
                          const methodClass =
                            METHOD_COLORS[ep.method] || 'bg-muted text-muted-foreground border-border';

                          return (
                            <Button
                              key={ep.id}
                              variant={isSelected ? 'secondary' : 'ghost'}
                              className={`w-full justify-start h-auto py-2 px-2 text-left ${
                                isSelected ? 'bg-secondary' : ''
                              }`}
                              onClick={() => onSelectEndpoint(ep)}
                            >
                              <div className="flex items-start gap-2 w-full min-w-0">
                                <Badge
                                  variant="outline"
                                  className={`shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0 h-4 ${methodClass}`}
                                >
                                  {ep.method}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs font-medium truncate ${
                                      isSelected ? 'text-foreground' : 'text-foreground/80'
                                    }`}
                                  >
                                    {ep.summary}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                                    {ep.path}
                                  </p>
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 搜索模式下无匹配端点 */}
                {searchKeyword && !hasEndpoints && (
                  <div className="px-2 py-1">
                    <p className="text-[11px] text-muted-foreground italic">无匹配端点</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* 搜索无结果 */}
          {searchKeyword && filteredEndpoints.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Search className="size-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">未找到匹配的端点</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                尝试其他关键词
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
