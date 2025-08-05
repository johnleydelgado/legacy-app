"use client";

import * as React from 'react';
// import LegacyLogo from '@/assets/images/LegacyLogo.avif';
import LegacyLogo from '@/assets/images/LegacyLogo.png';

import Image from "next/image";
import LoginForm from "./sections/loginForm";


const LoginPage = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
            <div className="w-full h-screen">
                <LoginForm />
            </div>
            <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-100 relative">
                <div className="relative w-64 h-64 mb-4">
                    <Image
                        src={LegacyLogo}
                        alt="login-page-logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="absolute bottom-8 text-gray-500 text-sm w-full text-center">
                    © 2025 Legacy Knitting. All rights reserved.
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
