"use client"

import * as React from 'react';
import Link from "next/link";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
    PAGE_DASHBOARD_ANALYTICS_URL,
    PAGE_DASHBOARD_CUSTOMERS_URL,
    PAGE_DASHBOARD_SALES_URL,
    PAGE_DASHBOARD_URL
} from "@/constants/pageUrls_old";
import {
    SIDEBAR_TITLE_ANALYTICS,
    SIDEBAR_TITLE_CUSTOMERS,
    SIDEBAR_TITLE_OVERVIEW,
    SIDEBAR_TITLE_SALES
} from "@/constants/sidebarTitles";


interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
    items?: {
        href: string
        title: string
    }[]
}


const MainNav = ({ className, items, ...props }: MainNavProps) => {
    const pathname = usePathname()

    const navItems = [
        {
            href: PAGE_DASHBOARD_URL,
            title: SIDEBAR_TITLE_OVERVIEW,
        },
        {
            href: PAGE_DASHBOARD_CUSTOMERS_URL,
            title: SIDEBAR_TITLE_CUSTOMERS,
        },
        {
            href: PAGE_DASHBOARD_SALES_URL,
            title: SIDEBAR_TITLE_SALES,
        },
        {
            href: PAGE_DASHBOARD_ANALYTICS_URL,
            title: SIDEBAR_TITLE_ANALYTICS,
        },
    ]

    return (
        <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        pathname === item.href ? "text-primary" : "text-muted-foreground",
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}

export default MainNav;
