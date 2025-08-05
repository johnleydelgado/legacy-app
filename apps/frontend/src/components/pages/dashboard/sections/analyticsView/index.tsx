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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Users,
  DollarSign,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Award,
  Eye,
  Download,
  ExternalLink
} from "lucide-react";

import { useDashboardAnalyticsInsights } from "@/hooks/useDashboard";

const AnalyticsView = () => {
    const { data: analyticsData, isLoading, isError, error } = useDashboardAnalyticsInsights();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
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
                                    {typeof entry.value === 'number' && entry.value > 1000 
                                        ? formatCompactNumber(entry.value)
                                        : entry.value}
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
                {/* Loading skeleton */}
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
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
                    <CardTitle className="text-destructive">Error Loading Analytics Data</CardTitle>
                    <CardDescription>
                        {error?.message || 'Failed to load analytics information'}
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

    if (!analyticsData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Analytics & Insights</CardTitle>
                    <CardDescription>No analytics data available</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{analyticsData.title}</h2>
                    <p className="text-muted-foreground">{analyticsData.description}</p>
                </div>
                <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export Analytics
                </Button>
            </div>

            {/* Key Insights Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analyticsData.customerBehavior.customerLifetimeValue.value)}
                        </div>
                        <div className="flex items-center text-xs">
                            {analyticsData.customerBehavior.customerLifetimeValue.percentage >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={analyticsData.customerBehavior.customerLifetimeValue.percentage >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {analyticsData.customerBehavior.customerLifetimeValue.percentage >= 0 ? '+' : ''}{analyticsData.customerBehavior.customerLifetimeValue.percentage.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground ml-1">{analyticsData.customerBehavior.customerLifetimeValue.label}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analyticsData.revenueAnalytics.monthlyRecurringRevenue.value)}
                        </div>
                        <div className="flex items-center text-xs">
                            {analyticsData.revenueAnalytics.monthlyRecurringRevenue.percentage >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={analyticsData.revenueAnalytics.monthlyRecurringRevenue.percentage >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {analyticsData.revenueAnalytics.monthlyRecurringRevenue.percentage >= 0 ? '+' : ''}{analyticsData.revenueAnalytics.monthlyRecurringRevenue.percentage.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground ml-1">{analyticsData.revenueAnalytics.monthlyRecurringRevenue.label}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Market Share</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.marketAnalytics.marketShare.value}%</div>
                        <div className="flex items-center text-xs">
                            {analyticsData.marketAnalytics.marketShare.percentage >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={analyticsData.marketAnalytics.marketShare.percentage >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {analyticsData.marketAnalytics.marketShare.percentage >= 0 ? '+' : ''}{analyticsData.marketAnalytics.marketShare.percentage.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground ml-1">{analyticsData.marketAnalytics.marketShare.label}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.customerBehavior.churnRate.value}%</div>
                        <div className="flex items-center text-xs">
                            {analyticsData.customerBehavior.churnRate.percentage <= 0 ? (
                                <TrendingDown className="h-3 w-3 text-emerald-500 mr-1" />
                            ) : (
                                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={analyticsData.customerBehavior.churnRate.percentage <= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {analyticsData.customerBehavior.churnRate.percentage.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground ml-1">{analyticsData.customerBehavior.churnRate.label}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Analytics Content */}
            <Tabs defaultValue="insights" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="insights">Business Insights</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
                    <TabsTrigger value="customers">Customer Behavior</TabsTrigger>
                    <TabsTrigger value="market">Market Analysis</TabsTrigger>
                    <TabsTrigger value="predictions">Predictions</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-4">
                    {/* Business Insights */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5" />
                                    Key Business Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analyticsData.businessInsights.map((insight, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge 
                                                    variant={insight.priority === 'high' ? 'destructive' : 
                                                            insight.priority === 'medium' ? 'default' : 'secondary'}
                                                >
                                                    {insight.priority} priority
                                                </Badge>
                                                <Badge variant="outline">{insight.category}</Badge>
                                            </div>
                                            <p className="text-sm font-medium mb-2">{insight.insight}</p>
                                            <p className="text-xs text-muted-foreground mb-3">{insight.recommendation}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <Zap className="h-3 w-3" />
                                                    <span className="text-xs">Impact: {insight.impact}/10</span>
                                                </div>
                                                <Progress value={insight.impact * 10} className="flex-1 h-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Actionable Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analyticsData.actionableRecommendations.map((rec, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge 
                                                    variant={rec.priority === 'high' ? 'destructive' : 
                                                            rec.priority === 'medium' ? 'default' : 'secondary'}
                                                >
                                                    {rec.priority}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">{rec.timeToImplement}</span>
                                            </div>
                                            <p className="text-sm font-medium mb-2">{rec.recommendation}</p>
                                            <p className="text-xs text-emerald-600 mb-2">{rec.estimatedImpact}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {rec.resources.map((resource, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {resource}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Key Takeaways */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Key Takeaways</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 md:grid-cols-2">
                                {analyticsData.keyTakeaways.map((takeaway, index) => (
                                    <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{takeaway}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    {/* Revenue Breakdown Chart */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Breakdown</CardTitle>
                                <CardDescription>Revenue sources and distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.revenueAnalytics.revenueBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ source, percentage }) => `${source} ${percentage}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="percentage"
                                        >
                                            {analyticsData.revenueAnalytics.revenueBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value}%`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Seasonal Trends</CardTitle>
                                <CardDescription>Quarterly revenue patterns</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analyticsData.revenueAnalytics.seasonalTrends}>
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
                                        <Bar 
                                            dataKey="revenue" 
                                            name="Revenue" 
                                            fill="hsl(var(--chart-1))" 
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4">
                    {/* Customer Behavior Segments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Behavior Segments</CardTitle>
                            <CardDescription>Customer segmentation analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analyticsData.customerBehavior.behaviorSegments.map((segment, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium">{segment.segment}</h4>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{segment.customerCount} customers</div>
                                                <div className="text-xs text-muted-foreground">{formatCurrency(segment.averageSpending)} avg</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {segment.characteristics.map((char, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {char}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="market" className="space-y-4">
                    {/* Brand Performance Radar */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Brand Performance</CardTitle>
                                <CardDescription>Performance across key brand metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart data={analyticsData.marketAnalytics.brandPerformance}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="metric" />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                        <Radar
                                            name="Your Score"
                                            dataKey="score"
                                            stroke="hsl(var(--chart-1))"
                                            fill="hsl(var(--chart-1))"
                                            fillOpacity={0.1}
                                            strokeWidth={2}
                                        />
                                        <Radar
                                            name="Benchmark"
                                            dataKey="benchmark"
                                            stroke="hsl(var(--chart-2))"
                                            fill="hsl(var(--chart-2))"
                                            fillOpacity={0.05}
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                        />
                                        <Tooltip />
                                        <Legend />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Market Opportunities</CardTitle>
                                <CardDescription>Potential growth areas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analyticsData.marketAnalytics.marketOpportunities.map((opportunity, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">{opportunity.opportunity}</h4>
                                                <Badge variant="outline">{opportunity.timeline}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Potential:</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={opportunity.potential * 10} className="flex-1 h-2" />
                                                        <span className="text-xs">{opportunity.potential}/10</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Effort:</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={opportunity.effort * 10} className="flex-1 h-2" />
                                                        <span className="text-xs">{opportunity.effort}/10</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="predictions" className="space-y-4">
                    {/* Predictive Analytics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Predictive Analytics
                            </CardTitle>
                            <CardDescription>AI-powered forecasts and predictions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {analyticsData.predictiveAnalytics.predictions.map((prediction, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{prediction.metric}</h4>
                                            <Badge variant="outline">{prediction.timeframe}</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Current:</span>
                                                <span>{formatCompactNumber(prediction.currentValue)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Predicted:</span>
                                                <span className="font-medium">{formatCompactNumber(prediction.predictedValue)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Confidence:</span>
                                                <Progress value={prediction.confidence} className="flex-1 h-2" />
                                                <span className="text-xs">{prediction.confidence}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Factors */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Risk Factors
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analyticsData.predictiveAnalytics.riskFactors.map((risk, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{risk.factor}</h4>
                                            <div className="flex items-center gap-2">
                                                <Badge 
                                                    variant={risk.probability > 50 ? 'destructive' : 
                                                            risk.probability > 25 ? 'default' : 'secondary'}
                                                >
                                                    {risk.probability}% probability
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{risk.mitigation}</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Impact:</span>
                                                <Progress value={risk.impact * 10} className="w-20 h-2" />
                                                <span className="text-xs">{risk.impact}/10</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AnalyticsView;
