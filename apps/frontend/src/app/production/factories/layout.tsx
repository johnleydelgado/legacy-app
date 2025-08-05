import * as React from 'react';

import Sidebar from '@/app/(protected)/Sidebar';
import DynamicFactoriesNavbar from "@/components/widgets/navbar/DynamicFactoriesNavbar";


export default function InventoryFactoriesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1">
                    <DynamicFactoriesNavbar />
                    <div className="p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
