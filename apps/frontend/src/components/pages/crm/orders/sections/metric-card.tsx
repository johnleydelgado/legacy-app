'use client';

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  loading?: boolean;
}

export function MetricCard({
  icon,
  title,
  value,
  description,
  change,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div 
        className="bg-white border-0 shadow-sm animate-pulse rounded-2xl"
        style={{
          padding: '24px'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl"
      style={{
        padding: '24px'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#67A3F0' }}
        >
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      <div 
        className="font-bold leading-none mb-2"
        style={{ 
          fontSize: '30px',
          color: '#000000'
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div 
        className="text-sm text-gray-600 mb-1"
      >
        {title}
      </div>
      <div className="flex items-center text-xs text-gray-500">
        {description && (
          <span>
            {description}
          </span>
        )}
        {typeof change === "number" && (
          <span
            className="font-medium ml-2"
            style={{
              color: change >= 0 ? '#22c55e' : '#ef4444'
            }}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
    </div>
  );
}
