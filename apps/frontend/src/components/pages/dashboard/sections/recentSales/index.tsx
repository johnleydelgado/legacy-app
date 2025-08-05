"use client"

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign } from "lucide-react";
import { useDashboardRecentSales } from "@/hooks/useDashboard";

const RecentSales = () => {
    const { data: recentSalesData, isLoading, isError } = useDashboardRecentSales();

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                        </div>
                        <div className="h-5 bg-muted rounded animate-pulse w-20" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-sm text-destructive">Error loading recent sales</div>
            </div>
        );
    }

    const recentSales = recentSalesData?.recentSales || [];

    // Show only the first 5 sales
    const displayedSales = recentSales.slice(0, 5);

    return (
        <div className="space-y-6">
            {displayedSales.map((sale, index) => (
                <div key={index} className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-muted">
                        <AvatarImage src={`/placeholder.svg?height=48&width=48`} alt={sale.customerName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {sale.customerInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <p className="font-medium leading-none">{sale.customerName}</p>
                        <p className="text-sm text-muted-foreground">{sale.customerEmail}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-semibold text-emerald-600">
                            +${sale.amount.toFixed(2)}
                        </div>
                    </div>
                </div>
            ))}
            {displayedSales.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <DollarSign className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">No recent sales</h3>
                    <p className="text-sm text-muted-foreground">Sales will appear here once you start making them.</p>
                </div>
            )}
        </div>
    )
}

export default RecentSales;
