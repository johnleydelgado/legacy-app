import * as React from 'react';

import Sidebar from '@/app/(protected)/Sidebar';
import Navbar from "../../components/widgets/navbar";
import { TITLE_PROFILE } from "../../constants/navbarTitle";


export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1">
                    <Navbar title={TITLE_PROFILE} />
                    <div className="p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
