'use client';

import * as React from "react";
import { Organization } from "@/services/organizations/types";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface CompanyInfoProps {
    orgData: Organization;
    orgLoading: boolean;
}

const CompanyInfo = ({ orgData, orgLoading }: CompanyInfoProps) => {
    if (orgLoading) {
        return (
            <Card className="rounded-md">
                <CardHeader>
                    <CardTitle>
                        <div className="flex flex-row gap-2 items-center">
                            <div className="bg-blue-100 rounded-full p-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-sm text-black">Company Information</p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row gap-4">
                        <Skeleton className="h-12 w-12 rounded-md shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-[180px]" />
                                <Skeleton className="h-4 w-[220px]" />
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <MapPin className="w-4 h-4 text-gray-300" />
                                <Skeleton className="h-4 w-[280px]" />
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <Phone className="w-4 h-4 text-gray-300" />
                                <Skeleton className="h-4 w-[120px]" />
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <Mail className="w-4 h-4 text-gray-300" />
                                <Skeleton className="h-4 w-[160px]" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-md" style={{gap: '5px'}}>
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row gap-2 items-center">
                        <div className="bg-blue-100 rounded-full p-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-800">Company Information</p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row gap-4">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0">
                        <Image
                            src={orgData.logo_image_url || ''}
                            alt="Company Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="space-y-0">
                            <p className="font-semibold text-gray-900 text-sm">{orgData.name}</p>
                            <p className="text-gray-500 text-sm">{orgData.description}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <p className="text-gray-700 text-sm">{orgData.billing_address}, {orgData.city}, {orgData.state} {orgData.postal_code}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <p className="text-gray-700 text-sm">{orgData.phone_number}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <a href={`mailto:${orgData.email}`} className="text-blue-600 hover:underline text-sm">{orgData.email}</a>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CompanyInfo;
