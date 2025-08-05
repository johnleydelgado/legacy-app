"use client"

import * as React from 'react';

import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardChartData } from "@/hooks/useDashboard";

const Overview = () => {
    const { data: chartData, isLoading, isError, error } = useDashboardChartData();

    // Transform API data to match chart format
    const transformedData = React.useMemo(() => {
        if (!chartData?.data) return [];
        
        return chartData.data.map(item => ({
            month: item.month,
            revenue: item.totalRevenue,
            leads: item.newLeads,
            conversions: item.conversions,
        }));
    }, [chartData]);

    // Calculate trend data
    const trendData = React.useMemo(() => {
        if (!transformedData || transformedData.length < 2) return null;
        
        const current = transformedData[transformedData.length - 1];
        const previous = transformedData[transformedData.length - 2];
        
        if (!current || !previous) return null;
        
        const revenueChange = ((current.revenue - previous.revenue) / previous.revenue) * 100;
        const isPositive = revenueChange >= 0;
        
        return {
            percentage: Math.abs(revenueChange),
            isPositive,
            period: `${previous.month} - ${current.month}`
        };
    }, [transformedData]);

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Month
                            </span>
                            <span className="font-bold text-muted-foreground">
                                {label}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-1">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                    <div 
                                        className="h-2 w-2 rounded-full" 
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-[0.70rem] text-muted-foreground">
                                        {entry.dataKey === 'revenue' ? 'Revenue' : 
                                         entry.dataKey === 'leads' ? 'New Leads' : 'Conversions'}
                                    </span>
                                </div>
                                <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                                    {entry.dataKey === 'revenue' 
                                        ? `$${entry.value.toLocaleString()}` 
                                        : entry.value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Card className="col-span-4 border-0 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold">Overview</CardTitle>
                    <CardDescription>Revenue, leads, and conversions over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-3 bg-muted rounded animate-pulse" />
                                    <div className="h-6 bg-muted rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="h-[300px] bg-muted rounded-lg animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>Revenue, leads, and conversions over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[350px] space-y-2">
                        <div className="text-sm text-destructive">Error loading chart data</div>
                        <div className="text-xs text-muted-foreground">
                            {error?.message || 'Please try again later'}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!transformedData || transformedData.length === 0) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>Revenue, leads, and conversions over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[350px]">
                        <div className="text-sm text-muted-foreground">No data available</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                    Revenue, leads, and conversions over time
                    {trendData && (
                        <div className="flex items-center gap-2 mt-2">
                            {trendData.isPositive ? (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${
                                trendData.isPositive ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                                {trendData.isPositive ? '+' : '-'}{trendData.percentage.toFixed(1)}% from last period
                            </span>
                        </div>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart 
                        data={transformedData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                            dataKey="month" 
                            tickLine={false}
                            axisLine={false}
                            className="text-xs fill-muted-foreground"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            className="text-xs fill-muted-foreground"
                            tickFormatter={(value) => {
                                if (value >= 1000) {
                                    return `$${(value / 1000).toFixed(0)}k`;
                                }
                                return `$${value}`;
                            }}
                        />
                        <Tooltip 
                            content={<CustomTooltip />}
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                        />
                        <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="rect"
                        />
                        <Bar 
                            dataKey="revenue" 
                            name="Total Revenue" 
                            fill="hsl(var(--chart-1))" 
                            radius={[4, 4, 0, 0]}
                            className="fill-primary"
                        />
                        <Bar 
                            dataKey="leads" 
                            name="New Leads" 
                            fill="hsl(var(--chart-2))" 
                            radius={[4, 4, 0, 0]}
                            className="fill-blue-500"
                        />
                        <Bar 
                            dataKey="conversions" 
                            name="Conversions" 
                            fill="hsl(var(--chart-3))" 
                            radius={[4, 4, 0, 0]}
                            className="fill-orange-500"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default Overview;
