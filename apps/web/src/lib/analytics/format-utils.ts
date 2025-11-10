export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}%`;
};

export const formatCurrency = (num: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDuration = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}d ${remainingHours}h`;
};

export const getTrendIndicator = (
  value: number
): {
  icon: string;
  color: string;
  label: string;
} => {
  if (value > 0) {
    return {
      icon: '↑',
      color: 'text-green-500',
      label: 'increase',
    };
  }
  if (value < 0) {
    return {
      icon: '↓',
      color: 'text-red-500',
      label: 'decrease',
    };
  }
  return {
    icon: '→',
    color: 'text-gray-500',
    label: 'no change',
  };
};
