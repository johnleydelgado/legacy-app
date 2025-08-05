'use client';

import * as React from 'react';
import {useState} from "react";
import {useDocumentActivityHistory} from "../../../../../hooks/useActivityHistory";
import {ActivityIcon} from "lucide-react";
import moment from "moment";
import {Card, CardContent, CardHeader, CardTitle} from "../../../../ui/card";
import {Table, TableBody, TableHead, TableHeader, TableRow, TableCell} from "../../../../ui/table";
import {Badge} from "../../../../ui/badge";
import {
    Pagination,
    PaginationContent, PaginationEllipsis,
    PaginationItem,
    PaginationLink, PaginationNext,
    PaginationPrevious
} from "../../../../ui/pagination";
import {Skeleton} from "../../../../ui/skeleton";

interface ComponentsProps {
    documentID: number;
    toggleRefetch: boolean;
}

const ActivityHistory = ({ documentID, toggleRefetch }: ComponentsProps) => {
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const {
        data: dataPagination,
        isLoading: loading,
        error,
        refetch,
    } = useDocumentActivityHistory({
        documentId: documentID,
        documentType: "INVOICES",
        activityTypeNames: ['Create', 'Delete', 'Email', 'Status Change', 'Convert', 'Duplicate', 'Update'],
        page,
        limit: ITEMS_PER_PAGE
    });

    const data = dataPagination?.items || [];
    const meta = dataPagination?.meta;

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    React.useEffect(() => {
        refetch().then();
    }, [toggleRefetch]);

    const renderSkeletonRows = () => {
        return Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            </TableRow>
        ));
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <ActivityIcon className="h-5 w-5 text-gray-600" />
                    <CardTitle>Activity History</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">TYPE</TableHead>
                                <TableHead>DATE</TableHead>
                                <TableHead>TIME</TableHead>
                                <TableHead>ACTIVITY</TableHead>
                                <TableHead>STATUS</TableHead>
                                <TableHead>USER</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && renderSkeletonRows()}
                            {!loading && data && data.length > 0 && data.map((activity, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Badge style={{ backgroundColor: activity.activity_type.color }}>
                                            {activity.activity_type.type_name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {moment(activity.created_at).format('MMMM D, YYYY')}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {moment(activity.created_at).format('h:mma')}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {activity.activity}
                                    </TableCell>
                                    <TableCell>
                                        <Badge style={{ backgroundColor: activity.status_data.color }}>
                                            {`${activity.status_data.process} - ${activity.status_data.status}`}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {activity.user_owner || "Undefined User"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {meta && meta.totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                {meta.currentPage > 1 && (
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(meta.currentPage - 1);
                                            }}
                                        />
                                    </PaginationItem>
                                )}

                                {/* First page */}
                                <PaginationItem>
                                    <PaginationLink
                                        isActive={meta.currentPage === 1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(1);
                                        }}
                                    >
                                        1
                                    </PaginationLink>
                                </PaginationItem>

                                {/* Ellipsis if there's a gap after first page */}
                                {meta.currentPage > 3 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}

                                {/* Page before current if not page 1 */}
                                {meta.currentPage > 2 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(meta.currentPage - 1);
                                            }}
                                        >
                                            {meta.currentPage - 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {/* Current page if not first or last */}
                                {meta.currentPage !== 1 && meta.currentPage !== meta.totalPages && (
                                    <PaginationItem>
                                        <PaginationLink
                                            isActive={true}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(meta.currentPage);
                                            }}
                                        >
                                            {meta.currentPage}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {/* Page after current if not last page */}
                                {meta.currentPage < meta.totalPages - 1 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(meta.currentPage + 1);
                                            }}
                                        >
                                            {meta.currentPage + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {/* Ellipsis if there's a gap before last page */}
                                {meta.currentPage < meta.totalPages - 2 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}

                                {/* Last page if more than one page */}
                                {meta.totalPages > 1 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            isActive={meta.currentPage === meta.totalPages}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(meta.totalPages);
                                            }}
                                        >
                                            {meta.totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {meta.currentPage < meta.totalPages && (
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(meta.currentPage + 1);
                                            }}
                                        />
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ActivityHistory;
