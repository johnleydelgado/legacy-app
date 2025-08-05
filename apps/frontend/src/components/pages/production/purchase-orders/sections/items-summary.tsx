'use client'

import * as React from 'react';
import {QueryObserverResult} from "@tanstack/react-query";
import { PurchaseOrderTotals } from '../../../../../services/purchase-orders/types';

export interface PurchaseOrderSummaryTypes {
    addedQuantity: number;
    addedUnitPrice: number;
    addedTaxRate: number;
    addedLineTotal: number;
    paid: number;
}

interface ComponentsProps extends PurchaseOrderSummaryTypes{
    data?: PurchaseOrderTotals | null;
    refetch?: () => void | Promise<QueryObserverResult<PurchaseOrderTotals, Error>> | Promise<void>;
}

export default function ItemsSummary(
    {
        data,
        refetch,
        addedQuantity = 0,
        addedUnitPrice = 0,
        addedTaxRate = 0,
        addedLineTotal = 0,
        paid = 0
    }: ComponentsProps) {
    const [totalQuantity, setTotalQuantity] = React.useState<number>(0);
    const [totalUnitPrice, setTotalUnitPrice] = React.useState<number>(0);
    const [totalTaxRate, setTotalTaxRate] = React.useState<number>(0);
    const [totalLineTotal, setTotalLineTotal] = React.useState<number>(0);
    const [totalOutstandingAmount, setTotalOutstandingAmount] = React.useState<number>(0);

    // Format currency values
    const formatCurrency = (value: number) => {
        const numValue = Number(value);
        if (!numValue || numValue === 0) return '$0.00';
        return `$${numValue.toFixed(2)}`
    };

    React.useEffect(() => {
        const totalLineData = (data?.totalLineTotal || 0) + addedLineTotal;

        setTotalQuantity((data?.totalQuantity || 0) + addedQuantity)
        setTotalUnitPrice((data?.totalUnitPrice || 0) + addedUnitPrice)
        setTotalTaxRate((data?.totalTaxRate || 0) + addedTaxRate)
        setTotalLineTotal(totalLineData)
        setTotalOutstandingAmount(totalLineData - (paid || 0) + (addedTaxRate * totalLineData))
    }, [data, addedLineTotal, addedQuantity, addedUnitPrice, addedTaxRate]);

    React.useEffect(() => {
        if (refetch) refetch();
    }, [addedLineTotal, addedQuantity, addedUnitPrice, addedTaxRate]);

    return (
        <div className="bg-white text-gray-800 p-6 rounded-md shadow-md w-full border border-gray-100">
            <div className="flex items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Purchase Orders Summary</h2>
            </div>

            <div className="space-y-3 mb-4 flex flex-col items-end">
                <div className="flex justify-between items-center w-1/4">
                    <span className="text-sm">Total Items Quantity</span>
                    <span className="text-sm font-medium">{totalQuantity}</span>
                </div>

                <div className="flex justify-between items-center w-1/4">
                    <span className="text-sm">Total Items Unit Price</span>
                    <span className="text-sm font-medium">{formatCurrency(totalUnitPrice)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mb-3 w-1/4">{}</div>

                <div className="flex justify-between items-center w-1/4">
                    <span className="text-sm">Total Items Tax Rate</span>
                    <span className="text-sm font-medium">{formatCurrency(totalTaxRate)}</span>
                </div>
                
                <div className="flex justify-between items-center w-1/4">
                    <span className="text-sm">Total Due</span>
                    <span className="font-medium text-sm">{formatCurrency(totalLineTotal)}</span>
                </div>

                <div className="flex justify-between items-center w-1/4">
                    <span className="text-sm">Paid</span>
                    <span className="font-medium text-sm">{formatCurrency(paid)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 w-1/4">{}</div>

                <div className="flex justify-between items-center font-semibold w-1/4">
                    <span className="text-sm">Amount Outstanding</span>
                    <span className="text-sm">{formatCurrency(totalOutstandingAmount)}</span>
                </div>
            </div>
        </div>
    );
}
