// Gaming-themed color palette for charts
export const chartColors = {
  primary: '#8b5cf6', // Purple
  secondary: '#06b6d4', // Cyan
  accent: '#f59e0b', // Amber
  success: '#10b981', // Emerald
  danger: '#ef4444', // Red
  warning: '#f59e0b', // Amber
  info: '#3b82f6', // Blue
  dark: '#1e293b', // Slate
  light: '#f1f5f9', // Light slate
};

export const multiSeriesColors = [
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export const chartDefaults = {
  margin: { top: 5, right: 30, left: 20, bottom: 5 },
  grid: {
    stroke: '#334155',
    strokeDasharray: '3 3',
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#1e293b',
      border: '1px solid #475569',
      borderRadius: '8px',
      color: '#f1f5f9',
    },
    itemStyle: { color: '#f1f5f9' },
  },
  axisStyle: {
    stroke: '#64748b',
  },
  labelStyle: {
    fill: '#94a3b8',
    fontSize: 12,
  },
};

// Chart configuration presets
export const lineChartConfig = {
  ...chartDefaults,
  strokeWidth: 2,
  activeDot: { r: 6 },
  dot: { r: 4 },
};

export const barChartConfig = {
  ...chartDefaults,
  barSize: 40,
  radius: [8, 8, 0, 0] as [number, number, number, number],
};

export const areaChartConfig = {
  ...chartDefaults,
  strokeWidth: 2,
  fillOpacity: 0.6,
};

export const pieChartConfig = {
  innerRadius: 60,
  outerRadius: 100,
  paddingAngle: 2,
  labelStyle: {
    fill: '#f1f5f9',
    fontSize: 14,
    fontWeight: 'bold',
  },
};
