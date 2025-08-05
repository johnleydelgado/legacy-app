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
        className="bg-white border border-gray-200 animate-pulse"
        style={{
          borderRadius: '14px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          padding: '24px'
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border border-gray-200 transition-all hover:shadow-md"
      style={{
        borderRadius: '14px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        padding: '24px'
      }}
    >
      <div className="flex items-center gap-4 mb-4">
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
        {value}
      </div>
      <div 
        className="text-sm font-medium mb-2"
        style={{ color: '#6C757D' }}
      >
        {title}
      </div>
      <div className="flex items-center">
        {description && (
          <span 
            className="text-xs"
            style={{ color: '#6C757D' }}
          >
            {description}
          </span>
        )}
        {typeof change === "number" && (
          <span
            className="text-xs font-medium ml-2"
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
