'use client'

import * as React from 'react';
import {useQuoteTotals} from "../../../../../hooks/useQuoteItems";
import {QuoteTotals} from "../../../../../services/quote-items/types";
import {QueryObserverResult} from "@tanstack/react-query";
import {Card, CardContent, CardHeader, CardTitle} from "../../../../ui/card";
import {Separator} from "../../../../ui/separator";

export interface InvoicesSummaryTypes {
    addedQuantity: number;
    addedUnitPrice: number;
    addedTaxRate: number;
    addedLineTotal: number;
    paid: number;
}

interface ComponentsProps {
    invoiceSummary: InvoicesSummaryTypes;
}

export default function ItemsSummary(
    {
        invoiceSummary,
    }: ComponentsProps) {
    const [totalQuantity, setTotalQuantity] = React.useState<number>(0);
    const [totalUnitPrice, setTotalUnitPrice] = React.useState<number>(0);
    const [totalTaxRate, setTotalTaxRate] = React.useState<number>(0);
    const [totalLineTotal, setTotalLineTotal] = React.useState<number>(0);
    const [totalOutstandingAmount, setTotalOutstandingAmount] = React.useState<number>(0);

    // Format currency values
    const formatCurrency = (value: number) => {
        return `$${value.toFixed(2)}`;
    };

    React.useEffect(() => {
        setTotalQuantity(invoiceSummary.addedQuantity);
        setTotalUnitPrice(invoiceSummary.addedUnitPrice);
        setTotalTaxRate(invoiceSummary.addedTaxRate);
        setTotalLineTotal(invoiceSummary.addedLineTotal);
        setTotalOutstandingAmount(
            invoiceSummary.addedLineTotal - invoiceSummary.paid
        );
    }, [invoiceSummary]);

    return (
        <div className="flex flex-row justify-end w-full">
            <Card className="w-[50%]">
                <CardHeader>
                    <CardTitle>Invoice Summary</CardTitle>
                </CardHeader>
                <Separator className="my-2" />
                <CardContent className="space-y-3 mb-4 flex flex-col items-end w-full">
                    <div className="flex justify-between items-center w-[65%]">
                        <span className="text-sm">Total Items Quantity</span>
                        <span className="text-sm font-medium">{totalQuantity}</span>
                    </div>

                    <div className="flex justify-between items-center w-[65%]">
                        <span className="text-sm">Total Items Unit Price</span>
                        <span className="text-sm font-medium">{formatCurrency(totalUnitPrice)}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 mb-3 w-[65%]">{}</div>

                    <div className="flex justify-between items-center w-[65%]">
                        <span className="text-sm">Total Items Tax Rate</span>
                        <span className="text-sm font-medium">{formatCurrency(totalTaxRate)}</span>
                    </div>

                    <div className="flex justify-between items-center w-[65%]">
                        <span className="text-sm">Total Due</span>
                        <span className="font-medium text-sm">{formatCurrency(totalLineTotal)}</span>
                    </div>

                    <div className="flex justify-between items-center w-[65%]">
                        <span className="text-sm">Paid</span>
                        <span className="font-medium text-sm">{formatCurrency(invoiceSummary.paid)}</span>
                    </div>

                    <Separator className="my-2 w-1/2" />

                    <div className="flex justify-between items-center font-semibold w-[65%]">
                        <span className="text-sm">Outstanding Amount</span>
                        <span className="text-sm">{formatCurrency(totalOutstandingAmount)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
