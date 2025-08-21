import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
  loading?: boolean;
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  className = '',
  loading = false 
}: MetricCardProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) {
      return <TrendingUp className="w-4 h-4" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="w-4 h-4" />;
    } else {
      return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.isPositive === undefined) {
      // Auto-determine based on value
      return trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-600';
    }
    
    return trend.isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 truncate">
          {title}
        </h3>
        {icon && (
          <div className="flex-shrink-0 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {trend && (
            <div className={`flex items-center text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">
                {Math.abs(trend.value)}%
                {trend.label && (
                  <span className="ml-1 text-gray-500">
                    {trend.label}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}