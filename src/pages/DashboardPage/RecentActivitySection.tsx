import { memo } from 'react';
import {
  FolderOpen,
  CheckCircle2,
  Rocket,
  Upload,
  UserPlus,
  ArrowUpRight,
} from 'lucide-react';
import type { IActivityItem } from '@/types/dashboard';

interface RecentActivitySectionProps {
  activities: IActivityItem[];
}

const ACTIVITY_ICON_MAP = {
  create_project: FolderOpen,
  training_complete: CheckCircle2,
  model_deploy: Rocket,
  dataset_upload: Upload,
  member_join: UserPlus,
} as const;

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

export default memo(function RecentActivitySection({ activities }: RecentActivitySectionProps) {
  return (
    <div>
      <div className="heading-bold text-xl border-b border-black p-4 flex items-center gap-2">
        <ArrowUpRight className="size-4" />
        最近活动
      </div>

      <div className="divide-y divide-black">
        {activities.map((item) => {
          const Icon = ACTIVITY_ICON_MAP[item.type] ?? FolderOpen;

          return (
            <div
              key={item.id}
              className="group flex items-start gap-4 p-4 hover:bg-black hover:text-background transition-colors"
            >
              <div className="flex size-8 shrink-0 items-center justify-center border border-black group-hover:border-background">
                <Icon className="size-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold truncate group-hover:text-background">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/60 tabular-nums">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground group-hover:text-background/60 line-clamp-2">
                  {item.description}
                </p>
                {item.projectName && (
                  <span className="inline-block mt-1.5 text-[10px] uppercase font-bold tracking-widest border border-black px-2 py-0.5 group-hover:border-background group-hover:text-background">
                    {item.projectName}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
