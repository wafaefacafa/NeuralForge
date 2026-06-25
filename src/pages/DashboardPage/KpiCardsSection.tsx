import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, FolderOpen, Cpu, Server, Activity, ArrowUpRight } from 'lucide-react';

import type { IKpiCard } from '@/types/dashboard';

interface KpiCardsSectionProps {
  cards: IKpiCard[];
}

const ICON_MAP: Record<IKpiCard['icon'], React.ComponentType<{ className?: string }>> = {
  project: FolderOpen,
  training: Activity,
  deploy: Server,
  gpu: Cpu,
};

function KpiCardsSection({ cards }: KpiCardsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 border-b border-black">
      {cards.map((card, i) => {
        const Icon = ICON_MAP[card.icon];
        const isPositive = card.change >= 0;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 border-r border-black last:border-r-0"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="heading-bold text-xl">{card.title}</span>
                <ArrowUpRight className="size-4" />
              </div>
              <Icon className="size-5 text-muted-foreground" />
            </div>

            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="heading-bold text-4xl tabular-nums">
                {card.value}
              </span>
              <span className="text-sm font-medium text-muted-foreground">{card.unit}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="size-3.5 text-success" />
              ) : (
                <TrendingDown className="size-3.5 text-destructive" />
              )}
              <span
                className={`text-xs uppercase font-bold tabular-nums ${
                  isPositive ? 'text-success' : 'text-destructive'
                }`}
              >
                {isPositive ? '+' : ''}
                {card.change}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                {card.changeLabel}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default memo(KpiCardsSection);
