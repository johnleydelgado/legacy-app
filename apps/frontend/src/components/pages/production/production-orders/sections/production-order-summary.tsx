"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Badge } from "../../../../ui/badge";
import { Separator } from "../../../../ui/separator";
import { Calculator } from "lucide-react";

export interface ProductionOrderSummaryData {
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  grandTotal: number;
  estimatedCompletionDays?: number;
  status?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

interface ProductionOrderSummaryProps {
  data: ProductionOrderSummaryData;
  className?: string;
}

export default function ProductionOrderSummary({
  data,
  className = "",
}: ProductionOrderSummaryProps) {
  const formatCurrency = (value: number) => {
    // Handle NaN and invalid values
    if (isNaN(value) || !isFinite(value)) {
      return "$0.00";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <Card className={`bg-white border border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Production Order Summary
              </CardTitle>
              <p className="text-sm text-gray-500">
                Overview of costs and quantities
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex flex-col items-end">
        <div className="flex justify-between items-center w-1/4">
          <span className="text-sm">Total Items Quantity</span>
          <span className="text-sm font-medium">{data.totalQuantity}</span>
        </div>

        <div className="flex justify-between items-center w-1/4">
          <span className="text-sm">Total Items Unit Price</span>
          <span className="text-sm font-medium">
            {formatCurrency(data.subtotal)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3 mb-3 w-1/4"></div>

        <div className="flex justify-between items-center w-1/4">
          <span className="text-sm">Total Items Tax Rate</span>
          <span className="text-sm font-medium">
            {formatCurrency(data.taxAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center w-1/4">
          <span className="text-sm">Total Due</span>
          <span className="font-medium text-sm">
            {formatCurrency(data.grandTotal)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3 w-1/4"></div>

        <div className="flex justify-between items-center font-semibold w-1/4">
          <span className="text-sm">Amount Outstanding</span>
          <span className="text-sm">{formatCurrency(data.grandTotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
