import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Play, Rocket, ArrowRight } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: typeof Plus;
  route: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-project',
    title: '新建项目',
    description: '创建新的 AI 训练项目',
    icon: Plus,
    route: '/projects/new',
  },
  {
    id: 'upload-dataset',
    title: '上传数据集',
    description: '上传并管理训练数据',
    icon: Upload,
    route: '/datasets',
  },
  {
    id: 'start-training',
    title: '开始训练',
    description: '配置并启动训练任务',
    icon: Play,
    route: '/projects',
  },
  {
    id: 'deploy-model',
    title: '部署模型',
    description: '将模型部署到生产环境',
    icon: Rocket,
    route: '/models',
  },
];

export default function QuickActionsSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-black">
        {QUICK_ACTIONS.map((action, i) => (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.route)}
            className={`group flex items-center gap-4 p-6 text-left transition-colors hover:bg-black hover:text-background ${
              i < QUICK_ACTIONS.length - 1 ? 'border-r border-black' : ''
            }`}
          >
            <div className="flex size-11 shrink-0 items-center justify-center border border-black group-hover:border-background transition-colors">
              <action.icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="heading-bold text-sm truncate">
                  {action.title}
                </h3>
                <ArrowRight className="size-4 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-0.5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-background/70 line-clamp-1 transition-colors">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
