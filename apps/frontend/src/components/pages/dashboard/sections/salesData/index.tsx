"use client"

import * as React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Target,
  BarChart3,
  Calendar,
  Package,
  Users,
  Download,
  Award,
  Zap,
  Clock,
  TrendingDown as ChartDown,
  Activity,
  Crown
} from "lucide-react";

import { useDashboardSalesPerformance } from "@/hooks/useDashboard";

const SalesData = () => {
    const { data: salesPerformanceData, isLoading, isError, error } = useDashboardSalesPerformance();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCompactNumber = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
    };

    // Chart colors
    const COLORS = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
    ];

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="text-sm font-medium mb-2">{label}</div>
                    <div className="space-y-1">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="h-2 w-2 rounded-full" 
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {entry.name || entry.dataKey}
                                    </span>
                                </div>
                                <span className="font-mono text-sm font-medium">
                                    {entry.dataKey === 'revenue' || entry.dataKey === 'target' || entry.dataKey === 'achieved'
                                        ? formatCurrency(entry.value)
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
            <div className="space-y-6">
                {/* Loading skeleton for metrics */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 bg-muted rounded animate-pulse w-24" />
                                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded animate-pulse w-20 mb-2" />
                                <div className="h-3 bg-muted rounded animate-pulse w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                {/* Loading skeleton for chart */}
                <Card>
                    <CardHeader>
                        <div className="h-6 bg-muted rounded animate-pulse w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] bg-muted rounded animate-pulse" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Error Loading Sales Performance Data</CardTitle>
                    <CardDescription>
                        {error?.message || 'Failed to load sales performance information'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!salesPerformanceData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sales Performance</CardTitle>
                    <CardDescription>No sales performance data available</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{salesPerformanceData.title}</h2>
                    <p className="text-muted-foreground">{salesPerformanceData.description}</p>
                </div>
                <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export Performance Report
                </Button>
            </div>

            {/* Key Performance Metrics */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(salesPerformanceData.metrics.totalRevenue.value)}
                        </div>
                        <div className="flex items-center text-xs">
                            {salesPerformanceData.metrics.totalRevenue.percentage >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={salesPerformanceData.metrics.totalRevenue.percentage >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {salesPerformanceData.metrics.totalRevenue.percentage >= 0 ? '+' : ''}{salesPerformanceData.metrics.totalRevenue.percentage.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground ml-1">{salesPerformanceData.metrics.totalRevenue.label}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {salesPerformanceData.metrics.salesGrowth.percentage >= 0 ? '+' : ''}{salesPerformanceData.metrics.salesGrowth.value.toFixed(1)}%
                        </div>
                        <div className="flex items-center text-xs">
                            {salesPerformanceData.metrics.salesGrowth.percentage >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={salesPerformanceData.metrics.salesGrowth.percentage >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {salesPerformanceData.metrics.salesGrowth.label}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(salesPerformanceData.metrics.averageDealSize.value)}
                        </div>
                        <div className="flex items-center text-xs">
                            <span className="text-muted-foreground">{salesPerformanceData.metrics.averageDealSize.label}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales Cycle</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesPerformanceData.metrics.salesCycleLength.value}</div>
                        <div className="flex items-center text-xs">
                            <span className="text-muted-foreground">{salesPerformanceData.metrics.salesCycleLength.label}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesPerformanceData.metrics.winRate.value}%</div>
                        <div className="flex items-center text-xs">
                            <span className="text-muted-foreground">{salesPerformanceData.metrics.winRate.label}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CAC</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(salesPerformanceData.metrics.customerAcquisitionCost.value)}
                        </div>
                        <div className="flex items-center text-xs">
                            {salesPerformanceData.metrics.customerAcquisitionCost.percentage >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-emerald-500 mr-1" />
                            )}
                            <span className={salesPerformanceData.metrics.customerAcquisitionCost.percentage >= 0 ? 'text-red-600' : 'text-emerald-600'}>
                                {salesPerformanceData.metrics.customerAcquisitionCost.percentage >= 0 ? '+' : ''}{salesPerformanceData.metrics.customerAcquisitionCost.percentage.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground ml-1">{salesPerformanceData.metrics.customerAcquisitionCost.label}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Performance Content */}
            <Tabs defaultValue="revenue" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
                    <TabsTrigger value="team">Team Performance</TabsTrigger>
                    <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
                    <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
                    <TabsTrigger value="forecast">Forecast</TabsTrigger>
                </TabsList>

                <TabsContent value="revenue" className="space-y-4">
                    {/* Revenue by Period Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue by Period</CardTitle>
                            <CardDescription>Monthly revenue vs targets</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart 
                                    data={salesPerformanceData.revenueByPeriod} 
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis 
                                        dataKey="period" 
                                        tickLine={false}
                                        axisLine={false}
                                        className="text-xs fill-muted-foreground"
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        className="text-xs fill-muted-foreground"
                                        tickFormatter={formatCompactNumber}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar 
                                        dataKey="revenue" 
                                        name="Actual Revenue" 
                                        fill="hsl(var(--chart-1))" 
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar 
                                        dataKey="target" 
                                        name="Target" 
                                        fill="hsl(var(--chart-2))" 
                                        radius={[4, 4, 0, 0]}
                                        opacity={0.7}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Product Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Performance</CardTitle>
                            <CardDescription>Top performing products by revenue and growth</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Units Sold</TableHead>
                                            <TableHead>Revenue</TableHead>
                                            <TableHead>Avg Price</TableHead>
                                            <TableHead>Growth Rate</TableHead>
                                            <TableHead>Market Share</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salesPerformanceData.productPerformance.map((product, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{product.productName}</TableCell>
                                                <TableCell>{product.unitsSold.toLocaleString()}</TableCell>
                                                <TableCell>{formatCurrency(product.revenue)}</TableCell>
                                                <TableCell>{formatCurrency(product.averagePrice)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        {product.growthRate >= 0 ? (
                                                            <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                                                        ) : (
                                                            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                                                        )}
                                                        <span className={product.growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                                            {product.growthRate >= 0 ? '+' : ''}{product.growthRate.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{product.marketShare.toFixed(1)}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                    {/* Sales Team Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5" />
                                Top Performers
                            </CardTitle>
                            <CardDescription>Sales team performance and achievements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {salesPerformanceData.topPerformers.map((performer, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-sm font-medium">{performer.salesPersonName.charAt(0)}</span>
                                                    </div>
                                                    <Badge 
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
                                                        variant={index === 0 ? "default" : "secondary"}
                                                    >
                                                        #{performer.rank}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{performer.salesPersonName}</h4>
                                                    <p className="text-sm text-muted-foreground">{performer.totalSales} sales</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">{formatCurrency(performer.revenue)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    AOV: {formatCurrency(performer.averageOrderValue)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Conversion Rate:</span>
                                                <div className="font-medium">{performer.conversionRate}%</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Target Achievement:</span>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={(performer.achievement / performer.target) * 100} className="flex-1 h-2" />
                                                    <span className="text-xs">{((performer.achievement / performer.target) * 100).toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">vs Target:</span>
                                                <div className="font-medium">{formatCurrency(performer.target)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pipeline" className="space-y-4">
                    {/* Sales Pipeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Pipeline</CardTitle>
                            <CardDescription>Current pipeline status and conversion rates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {salesPerformanceData.salesPipeline.map((stage, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium">{stage.stage}</h4>
                                            <Badge variant="outline">{stage.count} deals</Badge>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Total Value:</span>
                                                <div className="font-medium">{formatCurrency(stage.value)}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Avg Deal Size:</span>
                                                <div className="font-medium">{formatCurrency(stage.averageDealSize)}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Conversion Rate:</span>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={stage.conversionRate} className="flex-1 h-2" />
                                                    <span className="text-xs">{stage.conversionRate}%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Avg Time:</span>
                                                <div className="font-medium">{stage.averageTimeInStage} days</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals" className="space-y-4">
                    {/* Sales Goals */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Goals & Targets</CardTitle>
                            <CardDescription>Progress toward sales objectives</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {salesPerformanceData.salesGoals.map((goal, index) => (
                                    <div key={index} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{goal.period} Goal</h4>
                                            <Badge 
                                                variant={goal.status === 'behind' ? 'destructive' : 
                                                        goal.status === 'on-track' ? 'default' : 'secondary'}
                                            >
                                                {goal.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Target:</span>
                                                <span className="font-medium">{formatCurrency(goal.target)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Achieved:</span>
                                                <span className="font-medium">{formatCurrency(goal.achieved)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Progress value={goal.percentage * 100} className="flex-1" />
                                                <span className="text-sm font-medium">{(goal.percentage * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="forecast" className="space-y-4">
                    {/* Sales Forecast */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Forecast</CardTitle>
                            <CardDescription>Projected sales for upcoming months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={salesPerformanceData.salesForecast}>
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
                                        tickFormatter={formatCompactNumber}
                                    />
                                    <Tooltip 
                                        formatter={(value: any, name: string) => [
                                            formatCurrency(value), 
                                            name === 'projected' ? 'Projected Revenue' : name
                                        ]}
                                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="projected" 
                                        stroke="hsl(var(--primary))" 
                                        fill="hsl(var(--primary))" 
                                        fillOpacity={0.1}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            
                            {/* Forecast Confidence */}
                            <div className="mt-4 space-y-2">
                                <h4 className="font-medium">Forecast Confidence</h4>
                                <div className="space-y-1">
                                    {salesPerformanceData.salesForecast.map((forecast, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{forecast.month}:</span>
                                            <div className="flex items-center gap-2">
                                                <Progress value={forecast.confidence} className="w-20 h-2" />
                                                <span className="text-xs">{forecast.confidence}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SalesData;
