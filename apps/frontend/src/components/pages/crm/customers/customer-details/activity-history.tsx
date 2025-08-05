'use client';

import * as React from 'react';
import { useState } from 'react';
import { ActivityHistoryItem } from "../../../../../services/activity-history/types";
import { Badge } from "../../../../ui/badge";
import { Skeleton } from "../../../../ui/skeleton";
import moment from "moment";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useCustomerActivityHistory } from "../../../../../hooks/useActivityHistory";

interface ComponentsProps {
    customerID: number;
}

const ActivityHistory = ({ customerID }: ComponentsProps) => {
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10; // Default items per page, adjust as needed

    const {
        data: dataPagination,
        isLoading: loading,
        error,
        refetch,
    } = useCustomerActivityHistory({
        customerId: customerID,
        page: page,
        limit: ITEMS_PER_PAGE
    });

    const data = dataPagination?.items || [];
    const meta = dataPagination?.meta;

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const renderSkeletonRows = () => {
        return Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
                <TableCell>
                    <Skeleton className="h-6 w-16 rounded-md" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-4 w-20" />
                </TableCell>
            </TableRow>
        ));
    };

    // Helper function to generate pagination links
    const renderPaginationLinks = () => {
        if (!meta) return null;

        const totalPages = meta.totalPages;
        const currentPage = meta.currentPage;

        // Generate array of page numbers to show
        let pages = [];

        // Always show first page
        pages.push(1);

        // Show pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (!pages.includes(i)) {
                pages.push(i);
            }
        }

        // Always show last page if more than 1 page
        if (totalPages > 1 && !pages.includes(totalPages)) {
            pages.push(totalPages);
        }

        // Sort pages and add ellipsis where needed
        pages.sort((a, b) => a - b);

        const paginationItems = [];

        for (let i = 0; i < pages.length; i++) {
            const pageNum = pages[i];

            // Add ellipsis if there's a gap
            if (i > 0 && pages[i] - pages[i-1] > 1) {
                paginationItems.push(
                    <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            // Add the page number
            paginationItems.push(
                <PaginationItem key={pageNum}>
                    <PaginationLink
                        href="#"
                        isActive={pageNum === currentPage}
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                        }}
                    >
                        {pageNum}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return paginationItems;
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
                <Table className="table-fixed w-full">
                    <TableHeader>
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="text-left text-gray-600 font-medium text-xs p-2 w-[10%]">TYPE</TableHead>
                            <TableHead className="text-left text-gray-600 font-medium text-xs p-2 w-[15%]">DATE</TableHead>
                            <TableHead className="text-left text-gray-600 font-medium text-xs p-2 w-[10%]">TIME</TableHead>
                            <TableHead className="text-left text-gray-600 font-medium text-xs p-2 w-[35%]">ACTIVITY</TableHead>
                            <TableHead className="text-left text-gray-600 font-medium text-xs p-2 w-[20%]">STATUS</TableHead>
                            <TableHead className="text-left text-gray-600 font-medium text-xs p-2 w-[10%]">USER</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && renderSkeletonRows()}
                        {!loading && data && data.length > 0 && data.map((activity, index) => (
                            <TableRow
                                key={index}
                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <TableCell className="p-1">
                                    <Badge style={{ backgroundColor: activity.activity_type.color }}>
                                        {`${activity.activity_type.type_name}`}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-700 p-1 text-xs">
                                    {moment(activity.created_at).format('MMMM D, YYYY')}
                                </TableCell>
                                <TableCell className="text-gray-700 p-1 text-xs">
                                    {moment(activity.created_at).format('h:mma')}
                                </TableCell>
                                <TableCell className="text-gray-700 p-1 text-xs max-w-[30%]">
                                    <div className="whitespace-normal break-words">
                                        {activity.activity}
                                    </div>
                                </TableCell>
                                <TableCell className="p-1">
                                    <Badge style={{ backgroundColor: activity.status_data.color }} 
                                            className="max-w-[100px] whitespace-normal break-words">
                                        {`${activity.status_data.process} - ${activity.status_data.status}`}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-700 p-1 text-xs">
                                    {activity.user_owner || "Undefined User"}
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && (!data || data.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                                    No activity history found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {meta && meta.totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (meta.currentPage > 1) {
                                                handlePageChange(meta.currentPage - 1);
                                            }
                                        }}
                                        className={meta.currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>

                                {renderPaginationLinks()}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (meta.currentPage < meta.totalPages) {
                                                handlePageChange(meta.currentPage + 1);
                                            }
                                        }}
                                        className={meta.currentPage >= meta.totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityHistory;
