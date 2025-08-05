import * as React from 'react';

import Navbar from "../../../components/widgets/navbar";
import Sidebar from '@/app/(protected)/Sidebar';
import { TITLE_ADMIN_ANALYTICS } from "../../../constants/navbarTitle";


export default function AdminAnalyticsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1">
                    <Navbar title={TITLE_ADMIN_ANALYTICS} />
                    <div className="p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
