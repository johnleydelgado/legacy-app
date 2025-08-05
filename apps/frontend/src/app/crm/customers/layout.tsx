import * as React from 'react';

import DynamicCustomersNavbar from "@/components/widgets/navbar/DynamicCustomersNavbar";
import Sidebar from '@/app/(protected)/Sidebar';


export default function CRMCustomersLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 min-w-0">
                    <DynamicCustomersNavbar />
                    <div className="p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
