"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface QuoteSummaryProps {
  totalQuantity: number;
  itemTotal: number;
  feesTotal: number;
  subTotal: number;
  tax: number;
  totalDue: number;
  paid: number;
  currency?: string;
}

export function QuoteSummarySection({
  totalQuantity = 0,
  itemTotal = 0,
  feesTotal = 0,
  subTotal = 0,
  tax = 0,
  totalDue = 0,
  paid = 0,
  currency = "USD",
}: QuoteSummaryProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);

  const amountOutstanding = totalDue - paid;

  const mainSummaryItems = [
    { label: "Total Quantity", value: totalQuantity.toString() },
    { label: "Item Total", value: formatCurrency(itemTotal) },
    { label: "Fees Total", value: formatCurrency(feesTotal) },
    { label: "Sub Total", value: formatCurrency(subTotal) },
    { label: "Tax", value: formatCurrency(tax) },
    { label: "Total Due", value: formatCurrency(totalDue) },
    { label: "Paid", value: formatCurrency(paid) },
  ];

  return (
    <Card className="border border-gray-200">
      {/* ─── header ─────────────────────────────────────── */}
      <CardHeader className="pb-3 border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4" />
          Quote Summary
        </CardTitle>
      </CardHeader>

      {/* ─── content ────────────────────────────────────── */}
      <CardContent className="pt-4 flex justify-end">
        {/* keeps the list narrow and flush to the right */}
        <div className="w-full max-w-xs">
          {mainSummaryItems.map(({ label, value }, i) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-gray-200"
            >
              <span className="text-sm text-gray-700">{label}</span>
              <span className="text-sm text-gray-900">{value}</span>
            </div>
          ))}

          {/* final row – no bottom border, bold font */}
          <div className="flex items-center justify-between py-2 font-semibold">
            <span className="text-sm text-gray-900">Amount Outstanding</span>
            <span className="text-sm text-gray-900">
              {formatCurrency(amountOutstanding)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
