import { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, ArrowUpRight } from 'lucide-react';

import KpiCardsSection from './KpiCardsSection';
import TrainingTrendChart from './TrainingTrendChart';
import ResourceUsageSection from './ResourceUsageSection';
import RecentActivitySection from './RecentActivitySection';

import { MOCK_KPI_CARDS, MOCK_TRAINING_TREND, MOCK_RESOURCE_USAGE, MOCK_RECENT_ACTIVITIES } from '@/data/dashboard';

const QUICK_ACTIONS = [
  { id: 'new-project', title: '新建项目', desc: '创建新的 AI 训练项目', icon: Plus, route: '/projects/new' },
  { id: 'start-training', title: '开始训练', desc: '配置并启动训练任务', icon: Play, route: '/projects' },
  { id: 'upload-dataset', title: '上传数据集', desc: '上传并管理训练数据', icon: ArrowUpRight, route: '/datasets' },
  { id: 'deploy-model', title: '部署模型', desc: '将模型部署到生产环境', icon: ArrowUpRight, route: '/models' },
];

export default memo(function DashboardPage() {
  const navigate = useNavigate();

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
            控制台
          </motion.h1>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            欢迎回来，James Bond — 以下是您的平台概览
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/projects/new')}
              className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
            >
              <Plus className="size-4" />
              新建项目
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
            >
              <Play className="size-4" />
              开始训练
            </button>
          </div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            NeuralForge MLOps Platform — 从数据准备、模型训练、版本管理到部署上线的全流程解决方案。权威、克制、报刊阅读感。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* KPI 指标卡片行 */}
      <KpiCardsSection cards={MOCK_KPI_CARDS} />

      {/* 主网格: 8+4 非等分栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* 左栏 col-span-8: 训练趋势图 */}
        <div className="lg:col-span-8 border-r border-black p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">训练任务趋势</h2>
            <ArrowUpRight className="size-4" />
          </div>
          <TrainingTrendChart data={MOCK_TRAINING_TREND} />
        </div>

        {/* 右栏 col-span-4: 资源使用率 */}
        <div className="lg:col-span-4 bg-card p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">资源使用率</h2>
            <ArrowUpRight className="size-4" />
          </div>
          <ResourceUsageSection data={MOCK_RESOURCE_USAGE} />
        </div>
      </div>

      {/* 最近活动时间线 */}
      <div className="p-8 border-b border-black">
        <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
          <h2 className="heading-bold text-xl">最近活动</h2>
          <ArrowUpRight className="size-4" />
        </div>
        <RecentActivitySection activities={MOCK_RECENT_ACTIVITIES} />
      </div>

      {/* 快速操作入口: 4 列网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-black">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(action.route)}
            className="flex items-center gap-3 p-6 border-r border-black hover:bg-black hover:text-background transition-colors group text-left last:border-r-0"
          >
            <action.icon className="size-5 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-bold">{action.title}</div>
              <div className="text-xs text-muted-foreground group-hover:text-background/60">
                {action.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
