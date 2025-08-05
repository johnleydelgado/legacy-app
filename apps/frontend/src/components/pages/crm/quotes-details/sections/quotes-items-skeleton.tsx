'use client';
import * as React from 'react';


// Skeleton Loading Component for Quote Items Table
const QuoteItemsSkeleton = () => {
    return (
        <div className="p-6 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2 mb-6">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header Skeleton */}
                <div className="bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-8 gap-4 px-6 py-3">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Table Rows Skeleton */}
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="border-b border-gray-200 last:border-b-0">
                        <div className="grid grid-cols-8 gap-4 px-6 py-4">
                            {Array.from({ length: 8 }).map((_, colIndex) => (
                                <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuoteItemsSkeleton;
