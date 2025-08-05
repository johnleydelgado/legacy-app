"use client"

import * as React from 'react';

import { Activity, CreditCard, DollarSign, Download, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CalendarDateRangePicker from "@/components/pages/dashboard/sections/dateRangePicker";
import Overview from "@/components/pages/dashboard/sections/overview";
import RecentSales from "@/components/pages/dashboard/sections/recentSales";

import CustomersList from "./sections/customerList";
import SalesData from "./sections/salesData";
import AnalyticsView from "./sections/analyticsView";

import { useDashboardOverview, useDashboardRecentSales } from "@/hooks/useDashboard";

const DashboardPage = () => {
    const { data: overview, isLoading: isOverviewLoading, isError: isOverviewError, error: overviewError } = useDashboardOverview();
    const { data: recentSalesData, isLoading: isRecentSalesLoading, isError: isRecentSalesError, error: recentSalesError } = useDashboardRecentSales();

    const formatValue = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
        } else {
            return `$${value.toFixed(2)}`;
        }
    };

    const formatPercentage = (percentage: number) => {
        const sign = percentage >= 0 ? '+' : '';
        return `${sign}${percentage.toFixed(1)}%`;
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's what's happening with your business today.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <CalendarDateRangePicker />
                    <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Report
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold tracking-tight">
                                    {isOverviewLoading ? (
                                        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                                    ) : isOverviewError ? (
                                        <span className="text-destructive">Error</span>
                                    ) : (
                                        formatValue(overview?.totalRevenue.value || 0)
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    {isOverviewLoading ? (
                                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                    ) : isOverviewError ? (
                                        <span className="text-destructive text-xs">{overviewError?.message || "Error loading data"}</span>
                                    ) : (
                                        <>
                                            <span className={`font-medium ${
                                                (overview?.totalRevenue.percentage || 0) >= 0 
                                                    ? 'text-emerald-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {formatPercentage(overview?.totalRevenue.percentage || 0)}
                                            </span>
                                            <span className="text-muted-foreground">{overview?.totalRevenue.label || ""}</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">New Customers</CardTitle>
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold tracking-tight">
                                    {isOverviewLoading ? (
                                        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                                    ) : isOverviewError ? (
                                        <span className="text-destructive">Error</span>
                                    ) : (
                                        `+${overview?.newCustomers.value || 0}`
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    {isOverviewLoading ? (
                                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                    ) : isOverviewError ? (
                                        <span className="text-destructive text-xs">{overviewError?.message || "Error loading data"}</span>
                                    ) : (
                                        <>
                                            <span className={`font-medium ${
                                                (overview?.newCustomers.percentage || 0) >= 0 
                                                    ? 'text-emerald-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {formatPercentage(overview?.newCustomers.percentage || 0)}
                                            </span>
                                            <span className="text-muted-foreground">{overview?.newCustomers.label || ""}</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Sales</CardTitle>
                                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-orange-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold tracking-tight">
                                    {isOverviewLoading ? (
                                        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                                    ) : isOverviewError ? (
                                        <span className="text-destructive">Error</span>
                                    ) : (
                                        `+${overview?.sales.value || 0}`
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    {isOverviewLoading ? (
                                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                    ) : isOverviewError ? (
                                        <span className="text-destructive text-xs">{overviewError?.message || "Error loading data"}</span>
                                    ) : (
                                        <>
                                            <span className={`font-medium ${
                                                (overview?.sales.percentage || 0) >= 0 
                                                    ? 'text-emerald-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {formatPercentage(overview?.sales.percentage || 0)}
                                            </span>
                                            <span className="text-muted-foreground">{overview?.sales.label || ""}</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-3xl font-bold tracking-tight">
                                    {isOverviewLoading ? (
                                        <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                                    ) : isOverviewError ? (
                                        <span className="text-destructive">Error</span>
                                    ) : (
                                        `+${overview?.activeNow.value || 0}`
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    {isOverviewLoading ? (
                                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                    ) : isOverviewError ? (
                                        <span className="text-destructive text-xs">{overviewError?.message || "Error loading data"}</span>
                                    ) : (
                                        <>
                                            <span className={`font-medium ${
                                                (overview?.activeNow.percentage || 0) >= 0 
                                                    ? 'text-emerald-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {formatPercentage(overview?.activeNow.percentage || 0)}
                                            </span>
                                            <span className="text-muted-foreground">{overview?.activeNow.label || ""}</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        {/* Overview component now includes its own card */}
                        <Overview />
                        <Card className="col-span-3 border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Recent Sales</CardTitle>
                                <CardDescription className="text-base">
                                    {isRecentSalesLoading ? (
                                        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                                    ) : isRecentSalesError ? (
                                        <span className="text-destructive">{recentSalesError?.message || "Error loading recent sales"}</span>
                                    ) : (
                                        recentSalesData?.summary || "You made 265 sales this month."
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentSales />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="customers" className="space-y-4">
                    <CustomersList />
                </TabsContent>
                <TabsContent value="sales" className="space-y-4">
                    <SalesData />
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <AnalyticsView />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default DashboardPage;
