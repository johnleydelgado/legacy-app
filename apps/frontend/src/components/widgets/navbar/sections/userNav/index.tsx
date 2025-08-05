"use client"

import * as React from 'react';

import { CreditCard, LogOut, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {handleSignOut} from "../../../../../lib/cognito-actions";
import { PAGE_PROFILE_URL, PAGE_BILLING_URL, PAGE_SETTINGS_URL } from "../../../../../constants/pageUrls";
import {useRouter} from "next/navigation";
import { useAuthCookies } from '@/hooks/useCookies';
import { checkDomainOfScale } from 'recharts/types/util/ChartUtils';
import { useDispatch } from 'react-redux';
import { setUser } from '@/features/users/usersSlice';


const UserNav = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [data, formAction, isPending] = React.useActionState(handleSignOut, { redirectUrl: '' });

    const { getProfileData } = useAuthCookies();
    const profileData = getProfileData();

    React.useEffect(() => {
        if (data && data?.redirectUrl) {
            router.push(data.redirectUrl);
        }
    }, [data]);

    React.useEffect(() => {
        if (profileData) {
            dispatch(setUser(profileData));
        }
    }, [profileData]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={profileData?.avatar || "/placeholder.svg?height=32&width=32"} alt="@user" />
                        <AvatarFallback>{`${profileData?.firstname?.charAt(0)}${profileData?.lastname?.charAt(0)}` || "---"}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profileData?.fullname || "---"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{profileData?.email || "---"}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push(PAGE_PROFILE_URL)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(PAGE_BILLING_URL)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(PAGE_SETTINGS_URL)}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {/*@ts-ignore*/}
                <DropdownMenuItem onClick={() => formAction(new FormData())}>
                {/*<DropdownMenuItem>*/}
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserNav;
