'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Plus } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setActiveCustomerID } from '@/features/customers/customersSlice';
import { setActiveOrdersID, setActiveOrdersNumber } from '@/features/orders/ordersSlice';

interface ListHeadersProps {
    lastUpdated?: Date;
    handleExport: () => void;
}

const ListHeaders = ({ lastUpdated = new Date(), handleExport }: ListHeadersProps) => {
    const router = useRouter();
    const dispatch = useDispatch();

    const handleNewPurchaseOrder = () => {
        // @ts-ignore
        dispatch(setActiveCustomerID(-1));

        // @ts-ignore
        dispatch(setActiveOrdersID(-1));
        
        // @ts-ignore
        dispatch(setActiveOrdersNumber(""));

        router.push("/production/purchase-orders/add");
    }

    return (
        <div className="flex flex-col space-y-6 mb-2">
            {/* Header Section */}
            <div className="flex items-center justify-between hidden">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            All Purchase Orders
                        </h1>
                        {lastUpdated && (
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-500">
                                    Last updated: {lastUpdated.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 hidden">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="flex items-center space-x-2 cursor-pointer"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </Button>
                    
                    <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        onClick={handleNewPurchaseOrder}
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Purchase Order</span>
                    </Button>    
                </div>
            </div>
        </div>
    );
};

export default ListHeaders;

