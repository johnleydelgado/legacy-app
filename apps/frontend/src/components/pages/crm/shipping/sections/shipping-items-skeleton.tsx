"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Separator } from "../../../../ui/separator";
import { Skeleton } from "../../../../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../ui/table";

const ShippingItemsSkeleton = () => {
  return (
    <Card>
      <CardHeader className="py-2 px-6 flex flex-row justify-between items-center w-full">
        <CardTitle className="text-sm font-semibold text-gray-700">
          Shipping Items
        </CardTitle>
        <Skeleton className="h-9 w-32" />
      </CardHeader>
      <Separator className="mb-2" />
      <CardContent>
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="p-2 text-xs w-20">Category</TableHead>
              <TableHead className="p-2 text-xs w-16">Item #</TableHead>
              <TableHead className="p-2 text-xs w-32">Description</TableHead>
              <TableHead className="p-2 text-xs w-24">Yarns</TableHead>
              <TableHead className="p-2 text-xs w-20">Package</TableHead>
              <TableHead className="p-2 text-xs w-20">Trims</TableHead>
              <TableHead className="p-2 text-xs text-center w-16">
                Quantity
              </TableHead>
              <TableHead className="p-2 text-xs w-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 1 }).map((_, index) => (
              <React.Fragment key={`skeleton-${index}`}>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="p-2 text-xs min-w-[100px] max-w-[100px]">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="p-2 text-xs">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="p-2 text-xs">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="p-2 text-xs">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="p-2 text-xs">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="p-2 text-xs">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="p-2 text-xs text-center">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </TableCell>
                  <TableCell className="p-2 text-xs">
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={8} className="min-h-[100px]">
                    <div className="w-full">
                      <div className="max-h-[150px] overflow-hidden">
                        <div className="flex flex-row flex-wrap gap-1 p-1 items-center">
                          {Array.from({ length: 3 }).map((_, imgIndex) => (
                            <div
                              key={`skeleton-img-${imgIndex}`}
                              className="relative flex flex-col gap-y-2"
                            >
                              <Skeleton className="h-4 w-12" />
                              <div className="relative size-[70px] flex items-center justify-center border rounded-lg">
                                <Skeleton className="h-full w-full rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ShippingItemsSkeleton;
