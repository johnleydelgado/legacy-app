"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

const PackageSpecificationsSkeleton = () => {
  return (
    <Card className="bg-white border border-gray-200 text-gray-900 shadow-sm w-full xl:w-full rounded-md self-start">
      <CardHeader className="border-b border-gray-100 px-6 flex flex-row items-center justify-between [.border-b]:pb-4">
        <div className="flex items-center gap-2 h-full">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            Package Specifications
          </span>
        </div>
        <Skeleton className="h-8 w-24" />
      </CardHeader>

      <CardContent className="p-4 space-y-2 flex flex-row gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`skeleton-package-${index}`}
            className="flex items-start gap-3 p-3 border border-gray-200 rounded-md w-1/2 h-54"
          >
            {/* Status Dot */}
            <div className="flex-shrink-0 mt-1">
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              {/* Address Row */}
              <div className="mt-1">
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>

              <div className="border-b border-gray-200 my-2"></div>

              {/* Items in Package */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-1">
                  {Array.from({ length: 2 }).map((_, itemIndex) => (
                    <div
                      key={`skeleton-item-${itemIndex}`}
                      className="flex items-center gap-2"
                    >
                      <Skeleton className="h-1.5 w-1.5 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1">
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-7" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PackageSpecificationsSkeleton;
