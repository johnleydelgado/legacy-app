'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import * as React from "react";

interface MetricCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
    isLoading?: boolean;
    percentageChange?: number;
    trend?: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    description,
    icon,
    isLoading = false,
    percentageChange,
    trend = 'up'
}) => {
    const formatPercentage = (percentage: number) => {
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${percentage.toFixed(1)}%`;
    };

    const getPercentageColor = (percentage: number) => {
        return percentage >= 0 ? 'text-green-500' : 'text-red-500';
    };

    const getTrendIcon = (percentage: number) => {
        return percentage >= 0 ? 
            <TrendingUp className="h-3 w-3" /> : 
            <TrendingDown className="h-3 w-3" />;
    };

    return (
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="text-white">
                            {icon}
                        </div>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ) : (
                    <>
                        <div className="text-3xl font-bold text-gray-900 mb-2 leading-none">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                        <div className="text-sm text-gray-600">
                            {title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {description}
                        </div>
                        
                        {/* Percentage Change */}
                        {percentageChange !== undefined && (
                            <div className={`flex items-center space-x-1 text-xs font-medium mt-2 ${getPercentageColor(percentageChange)}`}>
                                {getTrendIcon(percentageChange)}
                                <span>{formatPercentage(percentageChange)}</span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default MetricCard;
