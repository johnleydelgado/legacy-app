'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const PurchaseOrderDetailsSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-6 pt-6">
                {/* Left side: Back button and title */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-48" />
                </div>

                {/* Right side: Action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                    </div>

                    {/* Save Button */}
                    <Skeleton className="h-9 w-32" />

                    {/* Status Dropdown */}
                    <Skeleton className="h-9 w-36" />
                </div>
            </div>

            {/* InfoBox Skeleton */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                {/* Title */}
                <Skeleton className="h-6 w-64 mb-4" />
                
                {/* Subtitle content */}
                <div className="pl-6 space-y-2">
                    <div className="flex flex-row gap-x-2 items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>

            {/* Additional Content Sections Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Purchase Order Details Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <Skeleton className="h-5 w-40 mb-4" />
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                </div>

                {/* Additional Info Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Table Skeleton */}
            <div className="bg-white border border-gray-200 rounded-lg">
                {/* Table Header */}
                <div className="p-4 border-b border-gray-200">
                    <Skeleton className="h-5 w-48 mb-4" />
                    <div className="grid grid-cols-6 gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-18" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
                
                {/* Table Rows */}
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                        <div className="grid grid-cols-6 gap-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Section Skeleton */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="space-y-2 md:text-right">
                        <div className="flex justify-between md:justify-end gap-8">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex justify-between md:justify-end gap-8">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex justify-between md:justify-end gap-8 pt-2 border-t">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderDetailsSkeleton;
