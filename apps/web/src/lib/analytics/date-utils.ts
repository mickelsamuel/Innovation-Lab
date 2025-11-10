import { format, subDays, subMonths, subYears } from 'date-fns';

export type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

export const getDateRangeFromTimeRange = (timeRange: TimeRange) => {
  const endDate = new Date();
  let startDate: Date;

  switch (timeRange) {
    case 'week':
      startDate = subDays(endDate, 7);
      break;
    case 'month':
      startDate = subMonths(endDate, 1);
      break;
    case 'quarter':
      startDate = subMonths(endDate, 3);
      break;
    case 'year':
      startDate = subYears(endDate, 1);
      break;
    case 'all':
    default:
      startDate = subYears(endDate, 10); // Arbitrary far back date
      break;
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
};

export const formatDateForDisplay = (date: string | Date, formatStr: string = 'MMM dd, yyyy') => {
  return format(new Date(date), formatStr);
};

export const getTimeRangeLabel = (timeRange: TimeRange) => {
  const labels: Record<TimeRange, string> = {
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    quarter: 'Last 3 Months',
    year: 'Last Year',
    all: 'All Time',
  };
  return labels[timeRange];
};
