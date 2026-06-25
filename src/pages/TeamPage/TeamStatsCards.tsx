import { memo } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Activity, Rocket } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { ITeamStats } from '@/types/team';

interface TeamStatsCardsProps {
  stats: ITeamStats;
}

const STAT_ITEMS: {
  key: keyof ITeamStats;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { key: 'totalMembers', label: '成员总数', icon: Users, color: 'text-primary' },
  { key: 'activeMembers', label: '活跃成员', icon: UserCheck, color: 'text-success' },
  { key: 'monthlyTrainingJobs', label: '本月训练任务', icon: Activity, color: 'text-accent' },
  { key: 'monthlyDeployments', label: '本月部署次数', icon: Rocket, color: 'text-chart-3' },
];

function TeamStatsCards({ stats }: TeamStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_ITEMS.map((item, i) => {
        const Icon = item.icon;
        const value = stats[item.key];

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/20 transition-colors duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                    <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                      {value}
                    </span>
                  </div>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                    <Icon className={`size-5 ${item.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

export default memo(TeamStatsCards);
