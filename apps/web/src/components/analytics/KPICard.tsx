'use client';

import React from 'react';
import { formatNumber, formatPercentage, getTrendIndicator } from '@/lib/analytics';

interface KPICardProps {
  title: string;
  value: number | string;
  trend?: number;
  format?: 'number' | 'percentage' | 'currency' | 'none';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  format = 'number',
  icon,
  loading = false,
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'number':
        return formatNumber(val);
      case 'percentage':
        return formatPercentage(val);
      case 'currency':
        return `$${formatNumber(val)}`;
      default:
        return val;
    }
  };

  const trendInfo = trend !== undefined ? getTrendIndicator(trend) : null;

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-slate-700 rounded mb-4"></div>
          <div className="h-8 w-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">
              {formatValue(value)}
            </p>
            {trendInfo && (
              <span className={`flex items-center text-sm font-medium ${trendInfo.color}`}>
                <span className="mr-1">{trendInfo.icon}</span>
                {Math.abs(trend!).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
