'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { useInfiniteShippingAddresses } from '@/hooks/useAddresses';
import {AddressesTypes} from "../../../../../services/quotes/types";

interface AddressQuotesTypes {
    id: number;
    name?: string;
    index: number;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

interface InfiniteAddressSelectProps {
    index?: number;
    customerID: number;
    value?: AddressQuotesTypes;
    onValueChange?: (value: AddressQuotesTypes) => void;
    // onValueChange?: React.Dispatch<React.SetStateAction<AddressQuotesTypes>>;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const InfiniteAddressSelect: React.FC<InfiniteAddressSelectProps> = (
    {
        value,
        customerID,
        index,
        onValueChange,
        placeholder = "Select an address...",
        disabled = false,
        className,
    }) => {
    const {
        data: addresses,
        loading,
        error,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        refetch,
        totalCount,
    } = useInfiniteShippingAddresses(customerID);

    const observerRef = useRef<HTMLDivElement>(null);
    const selectContentRef = useRef<HTMLDivElement>(null);

    // Format address for display
    const formatAddress = useCallback((address: { address1: string; city: string; state: string; country: string; zip: string }): string => {
        return `${address.address1}, ${address.city}, ${address.state} ${address.country} ${address.zip}`;
    }, []);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !loading) {
                    fetchNextPage();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '20px',
            }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [hasNextPage, isFetchingNextPage, loading, fetchNextPage]);

    // Handle scroll to load more items
    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

        if (isNearBottom && hasNextPage && !isFetchingNextPage && !loading) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, loading, fetchNextPage]);

    // Retry handler for errors
    const handleRetry = useCallback(() => {
        refetch();
    }, [refetch]);

    if (loading && addresses.length === 0) {
        return (
            <Select disabled>
                <SelectTrigger className={className}>
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading addresses...</span>
                    </div>
                </SelectTrigger>
            </Select>
        );
    }

    if (error && addresses.length === 0) {
        return (
            <Select disabled>
                <SelectTrigger className={className}>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-500">Error loading addresses</span>
                    </div>
                </SelectTrigger>
            </Select>
        );
    }

    const handleValueChange = (newValue: string) => {
        const selectedData = addresses.filter(data => data.pk_address_id === parseInt(newValue, 10))

        if (selectedData.length > 0 && onValueChange) {
            onValueChange({
                index: index || 0,
                id: parseInt(newValue, 10),
                name: formatAddress(selectedData[0]),
                address1: selectedData[0]?.address1 || "",
                city: selectedData[0]?.city || "",
                state: selectedData[0]?.state || "",
                zip: selectedData[0]?.zip || "",
                country: selectedData[0]?.country || "",
            })
        }
    };

    return (
        <Select value={value?.id?.toString()} onValueChange={handleValueChange} disabled={disabled}>
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder}>
                    {value?.name}
                </SelectValue>
            </SelectTrigger>
            <SelectContent
                ref={selectContentRef}
                className="max-h-[300px] overflow-y-auto"
                onScroll={handleScroll}
            >
                {addresses.map((address) => (
                    <SelectItem
                        key={address.pk_address_id}
                        value={address.pk_address_id.toString()}
                    >
                        <div className="flex flex-col">
                            <span className="text-xs">{formatAddress(address)}</span>
                        </div>
                    </SelectItem>
                ))}

                {/* Loading indicator for next page */}
                {isFetchingNextPage && (
                    <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">
              Loading more...
            </span>
                    </div>
                )}

                {/* Error state for pagination */}
                {error && addresses.length > 0 && (
                    <div className="flex items-center justify-center py-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <button
                            onClick={handleRetry}
                            className="ml-2 text-sm text-red-500 hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* End of list indicator */}
                {!hasNextPage && addresses.length > 0 && (
                    <div className="flex items-center justify-center py-2">
            <span className="text-xs text-muted-foreground">
              {totalCount} addresses loaded
            </span>
                    </div>
                )}

                {/* Intersection observer target */}
                <div ref={observerRef} className="h-1" />
            </SelectContent>
        </Select>
    );
};
