import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Download, RefreshCw, Info, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { MOCK_MODEL_EVAL_RESULTS } from '@/data/modelEval';
import type { IModelEvalResult } from '@/types/models';

import EvalMetricsCards from './EvalMetricsCards';
import ConfusionMatrixChart from './ConfusionMatrixChart';
import PrCurveChart from './PrCurveChart';
import ClassificationReportTable from './ClassificationReportTable';

export default function ModelEvalPage() {
  const { versionId } = useParams<{ versionId: string }>();
  const navigate = useNavigate();

  const [selectedVersionId, setSelectedVersionId] = useState(versionId ?? MOCK_MODEL_EVAL_RESULTS[0]?.versionId ?? '');
  const [refreshing, setRefreshing] = useState(false);

  const evalResult: IModelEvalResult | undefined = useMemo(
    () => MOCK_MODEL_EVAL_RESULTS.find((r) => r.versionId === selectedVersionId),
    [selectedVersionId],
  );

  const handleVersionChange = useCallback(
    (value: string) => {
      setSelectedVersionId(value);
      navigate(`/models/eval/${value}`, { replace: true });
    },
    [navigate],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success('评估数据已刷新');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleExport = useCallback(() => {
    toast.success('评估报告已导出为 PDF');
  }, []);

  if (!evalResult) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Info className="size-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-bold text-muted-foreground">未找到评估结果</p>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1 mb-6">
          请确认模型版本 ID 是否正确
        </p>
        <button
          onClick={() => navigate('/models')}
          className="flex items-center gap-2 px-6 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回模型列表
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header: dual-column editorial */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="p-8 border-r border-black">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/models')}
              className="flex items-center justify-center size-9 border border-black hover:bg-black hover:text-background transition-colors shrink-0"
              aria-label="返回模型列表"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="min-w-0">
              <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="heading-bold text-4xl leading-[0.9] tracking-tighter truncate"
              >
                模型评估
              </motion.h1>
              <p className="text-sm font-medium text-muted-foreground mt-1 truncate">
                {evalResult.modelName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Select value={selectedVersionId} onValueChange={handleVersionChange}>
              <SelectTrigger className="w-[220px] h-10 border-black bg-background text-sm font-bold">
                <SelectValue placeholder="选择版本" />
              </SelectTrigger>
              <SelectContent className="border-black">
                {MOCK_MODEL_EVAL_RESULTS.map((r) => (
                  <SelectItem key={r.versionId} value={r.versionId}>
                    {r.modelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors disabled:opacity-50"
              aria-label="刷新评估数据"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-black text-sm font-bold hover:bg-black hover:text-background transition-colors"
            >
              <Download className="size-4" />
              导出报告
            </button>
          </div>
        </div>

        <div className="p-8 bg-card hidden md:flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground max-w-xs">
              模型评估提供混淆矩阵、PR 曲线和分类报告等可视化分析工具，帮助您全面评估模型性能并发现改进方向。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {evalResult.accuracy >= 0.9 && (
                <span className="border border-black px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-success">
                  ✅ 准确率优秀
                </span>
              )}
              {evalResult.accuracy < 0.9 && evalResult.accuracy >= 0.8 && (
                <span className="border border-black px-3 py-1 text-[10px] uppercase font-bold tracking-widest">
                  ⚡ 准确率良好
                </span>
              )}
              {evalResult.accuracy < 0.8 && (
                <span className="border border-black px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-destructive">
                  ⚠️ 需提升
                </span>
              )}
              {evalResult.aucRoc >= 0.95 && (
                <span className="border border-black px-3 py-1 text-[10px] uppercase font-bold tracking-widest">
                  🏆 AUC 极高
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="size-8 border border-black" />
            <div className="size-6 border border-black rotate-45" />
          </div>
        </div>
      </div>

      {/* 评估指标摘要卡片 */}
      <EvalMetricsCards
        accuracy={evalResult.accuracy}
        precision={evalResult.precision}
        recall={evalResult.recall}
        f1Score={evalResult.f1Score}
        aucRoc={evalResult.aucRoc}
      />

      {/* 混淆矩阵 + PR 曲线 并排 */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* 混淆矩阵 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="border-r border-black"
        >
          <div className="p-8">
            <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
              <h2 className="heading-bold text-xl">混淆矩阵</h2>
              <ArrowUpRight className="size-4" />
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-6">
              对角线为正确分类，颜色越深数值越大
            </p>
            <ConfusionMatrixChart data={evalResult.confusionMatrix} />
          </div>
        </motion.div>

        {/* PR 曲线 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="p-8">
            <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
              <h2 className="heading-bold text-xl">Precision-Recall 曲线</h2>
              <ArrowUpRight className="size-4" />
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-6">
              AUC-PR 值越高模型性能越好
            </p>
            <PrCurveChart data={evalResult.prCurve} aucRoc={evalResult.aucRoc} />
          </div>
        </motion.div>
      </div>

      {/* 分类报告表格 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="border-b border-black"
      >
        <div className="p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">分类报告</h2>
            <ArrowUpRight className="size-4" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-6">
            各类别 Precision / Recall / F1-Score 详细指标
          </p>
          <ClassificationReportTable data={evalResult.classificationReport} />
        </div>
      </motion.div>

      {/* 模型性能分析洞察 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="border-b border-black"
      >
        <div className="p-8">
          <div className="flex items-center gap-2 border-b border-black pb-4 mb-6">
            <h2 className="heading-bold text-xl">性能分析洞察</h2>
            <Info className="size-4" />
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-6">
            基于评估结果自动生成的分析建议
          </p>

          {/* 洞察文本 - 深色反转区块 */}
          <div className="p-8 bg-black text-white min-h-[160px] flex flex-col justify-between">
            <p className="text-sm font-medium leading-relaxed text-white/90">
              {evalResult.insight}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {evalResult.accuracy >= 0.9 && (
                <span className="border border-background/30 px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-success">
                  ✅ 准确率优秀 (&ge;90%)
                </span>
              )}
              {evalResult.accuracy < 0.9 && evalResult.accuracy >= 0.8 && (
                <span className="border border-background/30 px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-background/70">
                  ⚡ 准确率良好 (80-90%)
                </span>
              )}
              {evalResult.accuracy < 0.8 && (
                <span className="border border-background/30 px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-destructive">
                  ⚠️ 准确率需提升 (&lt;80%)
                </span>
              )}
              {evalResult.f1Score >= 0.9 && (
                <span className="border border-background/30 px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-success">
                  ✅ F1-Score 优秀 (&ge;0.90)
                </span>
              )}
              {evalResult.aucRoc >= 0.95 && (
                <span className="border border-background/30 px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-background/70">
                  🏆 AUC-ROC 极高 (&ge;0.95)
                </span>
              )}
              {evalResult.recall < evalResult.precision && (
                <span className="border border-background/30 px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-warning">
                  📉 召回率偏低，建议增加样本
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
