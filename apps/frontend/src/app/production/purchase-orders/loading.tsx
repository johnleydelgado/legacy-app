import * as React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function PurchaseOrdersLoading() {
    return (
        <div className="space-y-6 w-full p-4">
            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Total amount card skeleton */}
            <div className="bg-white p-4 rounded-md">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-64" />
            </div>

            {/* Metric cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mb-4">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-4" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search bar skeleton */}
            <div className="flex flex-row items-center gap-1 border border-gray-200 px-2 p-1 rounded-md w-[40%]">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-8 w-full" />
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-lg border border-gray-200">
                {/* Table header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="grid grid-cols-8 gap-4">
                        {[...Array(8)].map((_, index) => (
                            <Skeleton key={index} className="h-4 w-20" />
                        ))}
                    </div>
                </div>
                
                {/* Table rows */}
                {[...Array(10)].map((_, index) => (
                    <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                        <div className="grid grid-cols-8 gap-4">
                            {[...Array(8)].map((_, colIndex) => (
                                <Skeleton key={colIndex} className="h-4 w-full" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
        </div>
    );
}


