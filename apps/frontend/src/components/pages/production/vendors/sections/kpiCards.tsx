'use client'
import * as React from 'react';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// KPI Card Component
const KpiCard = ({ 
    title, 
    value, 
    icon: Icon, 
    growthRate, 
    isLoading = false 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    growthRate?: number;
    isLoading?: boolean;
  }) => {
    const formatGrowthRate = (rate: number) => {
      const isPositive = rate >= 0;
      return {
        text: `${Math.abs(rate)}%`,
        color: isPositive ? 'text-green-600' : 'text-red-600',
        icon: isPositive ? '↗' : '↘'
      };
    };
  
    return (
      <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900 mb-2 leading-none">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className="text-sm text-gray-600 mb-1">{title}</p>
                {growthRate !== undefined && (
                  <div className="flex items-center text-xs text-gray-500">
                    <span className={`${formatGrowthRate(growthRate).color} font-medium`}>
                      {formatGrowthRate(growthRate).icon} {formatGrowthRate(growthRate).text}
                    </span>
                    <span className="ml-1">from previous period</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  export default KpiCard;
  