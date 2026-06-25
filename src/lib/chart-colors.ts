// EXPORTS: CHART_COLORS, CHART_COLORS_HEX, CHART_COLOR_MAP

/**
 * NeuralForge 图表颜色常量
 * 新闻印刷风格 - 纯灰度配色方案
 */

/** 图表系列色板（hex 值，供 ECharts option.color 直接使用） */
export const CHART_COLORS = [
  '#000000', // chart-1: 纯黑
  '#444444', // chart-2: 深灰
  '#888888', // chart-3: 中灰
  '#BBBBBB', // chart-4: 浅灰
  '#DDDDDD', // chart-5: 极浅灰
] as const;

/** 图表颜色 hex 值映射（按语义 key 访问） */
export const CHART_COLORS_HEX = {
  primary: '#000000',
  secondary: '#444444',
  tertiary: '#888888',
  quaternary: '#BBBBBB',
  quinary: '#DDDDDD',
  red: '#DC2626',
  orange: '#D97706',
  green: '#059669',
  gray: '#64748B',
  darkGray: '#334155',
} as const;

/** 语义化颜色映射（供图表中按状态/类型着色） */
export const CHART_COLOR_MAP = {
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#000000',
  running: '#059669',
  stopped: '#64748B',
  failed: '#DC2626',
  pending: '#D97706',
  deployed: '#000000',
  training: '#444444',
  queued: '#888888',
  cpu: '#000000',
  gpu: '#444444',
  memory: '#888888',
  storage: '#BBBBBB',
  network: '#DDDDDD',
} as const;
