'use client';

import React from 'react';
import { TimeRange, getTimeRangeLabel } from '@/lib/analytics';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const timeRanges: TimeRange[] = ['week', 'month', 'quarter', 'year', 'all'];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex gap-2 rounded-lg border border-slate-700 bg-slate-800/50 p-1">
      {timeRanges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === range
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {getTimeRangeLabel(range)}
        </button>
      ))}
    </div>
  );
};
