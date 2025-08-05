"use client";

import * as React from 'react';
import MainNav from "./sections/mainNav";
import Search from "./sections/search";
import UserNav from "./sections/userNav";
import { ArrowLeft, Dot } from 'lucide-react';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


interface NavbarProps {
    title: string;
    path?: string;
}


const Navbar = ({ title, path = '/' }: NavbarProps) => {
    const router = useRouter();
    
    const lastUpdated = (new Date()).toLocaleString(
        "en-US",
        {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        }
    );
        
    return (
        <div className="border-b" style={{ backgroundColor: '#FFFFFF', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            <div className="flex flex-row gap-x-0 h-16 items-center px-8">
                <div className="flex flex-row gap-x-2">
                    {path !== '/' &&
                        <Button
                            variant="ghost"
                            className="!p-0 cursor-pointer"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="!h-6 !w-6" />
                        </Button>
                    }
                    <p className="text-2xl font-semibold">{title}</p>
                </div>
                {path === '/' &&
                    <>
                        <Dot className="text-gray-500" size={40} />
                        <span className="text-sm text-gray-500">
                            Last updated: {moment(lastUpdated).format("MMMM Do YYYY")}
                        </span>
                    </>
                }

                {/*<MainNav className="mx-6" />*/}
                <div className="ml-auto flex items-center space-x-4">
                    {/*<Search />*/}
                    <UserNav />
                </div>
            </div>
        </div>
    )
}

export default Navbar;
