// components/pages/crm/quotes/sections/MetricCard.tsx
'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface LightMetricCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    change?: number;
    description?: string;
    loading?: boolean;
}

export const MetricCard: React.FC<LightMetricCardProps> = (
    {
        icon,
        title,
        value,
        change,
        description,
        loading = false
    }) => {
    const isPositive = change ? change >= 0 : null;

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
                {change !== undefined && (
                    <div className="flex items-center">
                        {isPositive ? (
                            <TrendingUp className="w-4 h-4 mr-1" style={{ color: '#22c55e' }} />
                        ) : (
                            <TrendingDown className="w-4 h-4 mr-1" style={{ color: '#ef4444' }} />
                        )}
                        <span 
                            className="text-sm font-medium"
                            style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
                        >
                            {Math.abs(change)}%
                        </span>
                    </div>
                )}
                {description && (
                    <span 
                        className="text-xs ml-2"
                        style={{ color: '#6C757D' }}
                    >
                        {description}
                    </span>
                )}
            </div>
        </div>
    );
};
