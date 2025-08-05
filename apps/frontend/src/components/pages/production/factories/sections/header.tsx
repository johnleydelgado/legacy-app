'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Factory } from '@/services/factories/types';

interface HeaderProps {
    addPage?: boolean;
    editPage?: boolean;
    detailsPage?: boolean;
    factory?: Factory;
    onDelete?: () => void;
    onPaymentRequest?: () => void;
}

const Header = ({ addPage = false, editPage = false, detailsPage = false, factory, onDelete, onPaymentRequest }: HeaderProps) => {
    const router = useRouter();

    const formatLastUpdated = (dateString: string | null) => {
        if (!dateString) return 'Never updated';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };

    return (
        <div className="flex flex-row sm:items-center sm:justify-between gap-4">
            {/* {addPage &&
                <div className="flex flex-row sm:items-center sm:justify-between gap-4">
                <Button variant="ghost" className="cursor-pointer" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 truncate">Add Factory</h1>
                </div>
            </div>
            } */}
            {detailsPage &&
                <div className="p-2 w-full flex flex-row justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Left side - Back button and vendor info */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row gap-1 items-center">
                                {/* <Button 
                                    variant="ghost" 
                                    className="cursor-pointer p-2" 
                                    size="icon" 
                                    onClick={() => router.back()}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button> */}
                                <h1 className="text-xl font-bold text-gray-900 truncate">
                                    {factory?.name || '---'}
                                </h1>
                                <span className="text-sm text-gray-500 font-light">
                                    {factory?.website_url || ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    Factory ID: {factory?.pk_factories_id || '---'}
                                </span>
                                <Badge className={`text-xs font-medium text-white border-0 rounded-full px-2.5 py-0.5 ${
                                    factory?.status === 'ACTIVE' ? 'bg-green-600' : 'bg-red-600'
                                }`}>
                                    {factory?.status || 'ACTIVE'}
                                </Badge>
                                <Separator orientation="vertical" className="h-4 m-4 text-gray-600" />
                                <span className="text-sm text-gray-600">
                                    Location:
                                </span>
                                <Badge className="text-xs font-medium text-white border-0 rounded-full px-2.5 py-0.5" 
                                       style={{ backgroundColor: factory?.location_types?.color || '#67A3F0' }}>
                                    {factory?.location_types?.name || ''}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Right side - Action buttons */}
                        <div className="flex items-center gap-3">
                            <p className="text-xs text-gray-500">
                                Last updated: {formatLastUpdated(factory?.updated_at || factory?.created_at || '')}
                            </p>
                            {onPaymentRequest && (
                            <Button 
                                variant="outline" 
                                className="cursor-pointer text-sm h-10 px-4 border-gray-200 hover:bg-gray-50 rounded-xl"
                                onClick={onPaymentRequest}
                            >
                                Payment Request
                            </Button>
                            )}
                            {onDelete && (
                            <Button 
                                variant="destructive" 
                                className="cursor-pointer bg-red-600 hover:bg-red-700 text-sm h-10 px-4 rounded-xl"
                                onClick={onDelete}
                            >
                                Delete
                            </Button>
                            )}
                        </div>
                    </div>
                </div>
            }
            {/* {editPage &&
                <div className="flex flex-row sm:items-center sm:justify-between gap-4">
                <Button variant="ghost" className="cursor-pointer" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 truncate">Edit Factory</h1>
                </div>
            </div>
            } */}
        </div>
    )
}

export default Header;
