import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ProjectFormSection from './ProjectFormSection';
import type { ProjectFormConfig } from './ProjectFormSection';
import ConfigPreviewPanel from './ConfigPreviewPanel';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ProjectFormConfig>({
    name: '',
    description: '',
    framework: '',
    gpuType: 'A100',
    gpuCount: 1,
    memoryGB: 64,
    tags: [],
  });

  const handleConfigChange = useCallback((c: ProjectFormConfig) => {
    setConfig(c);
  }, []);

  return (
    <div>
      {/* Header: dual-column editorial */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="p-8 border-r border-black">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1.5 text-sm font-bold hover:underline transition-colors mb-4"
            >
              <ArrowLeft className="size-4" />
              返回项目列表
            </button>
            <h1 className="heading-bold text-6xl leading-[0.9] tracking-tighter">
              创建新项目
            </h1>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              配置项目基本信息、深度学习框架和硬件资源
            </p>
          </motion.div>
        </div>
        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
            每个项目代表一个独立的 AI 训练工作流。选择框架、配置 GPU 资源，即可开始您的模型训练之旅。
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* 左右分栏：配置表单 + 实时预览 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-black">
        {/* 左侧：配置表单（占 8/12） */}
        <div className="lg:col-span-8 border-r border-black p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">项目配置</h2>
            <ArrowUpRight className="size-4" />
          </div>
          <ProjectFormSection onConfigChange={handleConfigChange} />
        </div>

        {/* 右侧：实时预览面板（占 4/12） */}
        <div className="lg:col-span-4 bg-card p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">配置预览</h2>
            <ArrowUpRight className="size-4" />
          </div>
          <ConfigPreviewPanel
            projectName={config.name}
            description={config.description}
            framework={config.framework || null}
            hardware={{ gpuType: config.gpuType as 'A100' | 'V100' | 'T4', gpuCount: config.gpuCount, memoryGB: config.memoryGB }}
            tags={config.tags}
            estimatedCost={0}
          />
        </div>
      </div>
    </div>
  );
}
