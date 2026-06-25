import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check, Cpu, Layers, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { INetworkTemplate } from '@/types/training';

interface NetworkTemplateSelectorProps {
  templates: INetworkTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const FRAMEWORK_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  pytorch: Cpu,
  tensorflow: Layers,
  jax: Zap,
};

function NetworkTemplateSelector({ templates, selectedId, onSelect }: NetworkTemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {templates.map((template, i) => {
        const isSelected = template.id === selectedId;
        const Icon = FRAMEWORK_ICON_MAP[template.framework] || Cpu;

        return (
          <motion.button
            key={template.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            onClick={() => onSelect(template.id)}
            className={cn(
              'relative flex flex-col items-start gap-3 border p-4 text-left transition-all duration-200',
              isSelected
                ? 'border-black bg-card'
                : 'border-black bg-card hover:bg-black hover:text-background',
            )}
          >
            {/* 选中标记 */}
            {isSelected && (
              <div className="absolute right-3 top-3 flex size-5 items-center justify-center bg-black">
                <Check className="size-3 text-background" />
              </div>
            )}

            {/* 图标 */}
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center transition-colors',
                isSelected ? 'bg-black text-background' : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
            </div>

            {/* 信息 */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-semibold', isSelected ? 'text-foreground' : 'text-foreground')}>
                  {template.name}
                </span>
                <span className="bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                  {template.framework}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
              <p className="text-[11px] text-muted-foreground/70">
                参数量: <span className="font-mono text-foreground/80">{template.paramsCount}</span>
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export default memo(NetworkTemplateSelector);
