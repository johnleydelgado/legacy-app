import * as React from 'react';

import Navbar from "../../../components/widgets/navbar";
import { TITLE_ADMIN_ACTIVITY_LOGS } from "../../../constants/navbarTitle";
import Sidebar from '@/app/(protected)/Sidebar';


export default function AdminActivityLogsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1">
                    <Navbar title={TITLE_ADMIN_ACTIVITY_LOGS} />
                    <div className="p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
