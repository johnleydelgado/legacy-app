'use client';

import * as React from 'react';
import { CustomerList } from '@/services/customers/types';
import { HighlightedSearchResult } from '@/services/customers/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

interface SearchResultsCardProps {
    results: CustomerList[] | HighlightedSearchResult[];
    highlightedResults?: HighlightedSearchResult[];
    isLoading: boolean;
    loadingMore?: boolean;
    hasNextPage?: boolean;
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    onLoadMore?: () => void;
    onGoToPage?: (page: number) => void;
    onNextPage?: () => void;
    onPrevPage?: () => void;
    lastElementRef?: (node: HTMLElement | null) => void;
    searchTerm?: string;
    infiniteScroll?: boolean;
}


export default function SearchResultsCard(
    {
        results,
        highlightedResults,
        isLoading,
        loadingMore = false,
        hasNextPage = false,
        currentPage = 1,
        totalPages = 1,
        totalItems = 0,
        onLoadMore,
        onGoToPage,
        onNextPage,
        onPrevPage,
        lastElementRef,
        searchTerm = '',
        infiniteScroll = false,
    }: SearchResultsCardProps) {

    // Function to render highlighted text
    const renderHighlight = (text: string, field: string, customer: HighlightedSearchResult) => {
        if (!customer?.highlights?.[field]) return text;

        const highlight = customer.highlights[field][0];
        if (!highlight) return text;

        // Replace <em> tags with spans for styling
        return (
            <span dangerouslySetInnerHTML={{
                __html: highlight.replace(/<em>/g, '<span class="bg-yellow-100 text-yellow-800">').replace(/<\/em>/g, '</span>')
            }} />
        );
    };

    // Function to generate pagination items
    const generatePaginationItems = () => {
        if (!totalPages || totalPages <= 1) return null;

        const items = [];

        // Always show first page
        items.push(
            <PaginationItem key="first">
                <PaginationLink
                    className="text-xs text-gray-500 cursor-pointer"
                    onClick={() => onGoToPage && onGoToPage(1)}
                    isActive={currentPage === 1}
                >
                    1
                </PaginationLink>
            </PaginationItem>
        );

        // Show ellipsis if needed
        if (currentPage > 3) {
            items.push(
                <PaginationItem key="ellipsis1" className="text-xs text-gray-500 cursor-pointer">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Show pages around current page
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        className="text-xs text-gray-500 cursor-pointer"
                        onClick={() => onGoToPage && onGoToPage(i)}
                        isActive={i === currentPage}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Show ellipsis if needed
        if (currentPage < totalPages - 2) {
            items.push(
                <PaginationItem key="ellipsis2" className="text-xs text-gray-500 cursor-pointer">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Always show last page if it exists
        if (totalPages > 1) {
            items.push(
                <PaginationItem key="last">
                    <PaginationLink
                        className="text-xs text-gray-500 cursor-pointer"
                        onClick={() => onGoToPage && onGoToPage(totalPages)}
                        isActive={currentPage === totalPages}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <Card>
            <CardHeader className="border-b pt-6 pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                    <span>{searchTerm ? `Search Results for "${searchTerm}"` : 'Customer Directory'}</span>
                    {totalItems > 0 && (
                        <span className="text-sm text-gray-500">
                            {totalItems} result{totalItems !== 1 ? 's' : ''}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="p-2 font-semibold" style={{ paddingLeft: '20px' }}>Company</TableHead>
                            <TableHead className="p-2 font-semibold">Contact</TableHead>
                            <TableHead className="p-2 font-semibold">Contact Info</TableHead>
                            <TableHead className="p-2 font-semibold">Last Order</TableHead>
                            <TableHead className="p-2 font-semibold">Orders</TableHead>
                            <TableHead className="p-2 font-semibold">Total Spent</TableHead>
                            <TableHead className="p-2 font-semibold">Status</TableHead>
                            <TableHead className="p-2 font-semibold invisible">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && results.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10">
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                                        <p className="text-sm text-gray-500">Searching...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : results.length > 0 ? (
                            results.map((customer, index) => {
                                const isLastElement = index === results.length - 1;
                                const hasHighlights = 'highlights' in customer;
                                const highlightedCustomer = hasHighlights
                                    ? customer as HighlightedSearchResult
                                    : highlightedResults?.find(r => r.pk_customer_id === customer.pk_customer_id);

                                return (
                                    <TableRow
                                        key={customer.pk_customer_id}
                                        ref={isLastElement && infiniteScroll ? lastElementRef : undefined}
                                    >
                                        <TableCell className="p-2 flex flex-col" style={{ rowGap: '5px', paddingLeft: '20px' }}>
                                            <p className="text-sm">
                                                {highlightedCustomer
                                                    ? renderHighlight(customer.name, 'name', highlightedCustomer)
                                                    : customer.name}
                                            </p>
                                            <p className="font-light text-gray-500 text-sm">{`C${customer.pk_customer_id}`}</p>
                                        </TableCell>
                                        <TableCell className="p-2 text-sm">
                                            {customer.primary_contact ? (
                                                <>
                                                    {highlightedCustomer
                                                        ? renderHighlight(`${customer.primary_contact.first_name} ${customer.primary_contact.last_name}`, 'primary_contact.name', highlightedCustomer)
                                                        : `${customer.primary_contact.first_name} ${customer.primary_contact.last_name}`}
                                                </>
                                            ) : "—"}
                                        </TableCell>
                                        <TableCell className="p-2 text-sm">
                                            <div>
                                                {highlightedCustomer
                                                    ? renderHighlight(customer.email, 'email', highlightedCustomer)
                                                    : customer.email}
                                            </div>
                                            {customer.phone_number && <div>{customer.phone_number}</div>}
                                        </TableCell>
                                        <TableCell className="p-2 text-sm">{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="p-2 text-sm">{customer.total_orders || 0}</TableCell>
                                        <TableCell className="p-2 text-sm">{`$${(customer?.total_orders_spent || 0) < 0 ? 0 : (customer?.total_orders_spent || 0)}`}</TableCell>
                                        <TableCell className="p-2 text-sm">
                                            {customer.status === 'ACTIVE' ?
                                                <Badge className="bg-green-600 text-white text-xs font-light capitalize">
                                                    {customer.status}
                                                </Badge> :
                                                <Badge className="bg-gray-600 text-white text-xs font-light capitalize">
                                                    {customer.status}
                                                </Badge>
                                            }
                                        </TableCell>
                                        <TableCell className="p-2 text-sm">
                                            <Button variant="ghost" className="cursor-pointer hover:underline" asChild>
                                                <Link href={`/crm/customers/${customer.pk_customer_id}`}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : searchTerm ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-6">
                                    No customers found matching "{searchTerm}". Try using different keywords.
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-6">
                                    No customers found. Try changing your filters.
                                </TableCell>
                            </TableRow>
                        )}

                        {loadingMore && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-6">
                                    <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {results.length > 0 && (
                    <div className="w-full flex flex-row justify-end border-t border-solid text-xs text-gray-500 p-4">
                        showing {results.length} of {totalItems || 0} customers
                    </div>
                )}

                {infiniteScroll && hasNextPage && !loadingMore && (
                    <div className="w-full flex justify-center py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLoadMore}
                            className="text-sm"
                        >
                            Load More
                        </Button>
                    </div>
                )}

                {!infiniteScroll && totalPages > 1 && (
                    <div className="flex justify-center mt-4 mb-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        className={`text-xs text-gray-500 p-4 ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                                        onClick={() => onPrevPage && currentPage > 1 && onPrevPage()}
                                    />
                                </PaginationItem>
                                {generatePaginationItems()}
                                <PaginationItem>
                                    <PaginationNext
                                        className={`text-xs text-gray-500 p-4 ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                                        onClick={() => onNextPage && currentPage < totalPages && onNextPage()}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
