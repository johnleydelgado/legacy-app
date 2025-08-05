'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, Users, UserCheck, UserX, TrendingUp, DollarSign } from 'lucide-react';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useVendors, useVendorKpisOverview, useVendorSearch } from '@/hooks/useVendors2';
import { Vendor, VendorSearchItem } from '@/services/vendors/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import KpiCard from './sections/kpiCards';

const getStatusBadge = (status: string) => {
  return status === 'ACTIVE' ? (
    <Badge className="bg-green-600 text-white text-xs font-light">
      Active
    </Badge>
  ) : (
    <Badge className="bg-red-600 text-white text-xs font-light">
      Blocked
    </Badge>
  );
};

// Skeleton loading component for table rows
const VendorTableSkeleton = () => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <TableRow key={index} className="border-b border-gray-100">
          <TableCell className="px-4 py-4">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="px-4 py-4">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="px-4 py-4">
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell className="px-4 py-4">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="px-4 py-4">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="px-4 py-4">
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell className="px-4 py-4">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="px-4 py-4">
            <Skeleton className="h-8 w-12 rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

// Custom hook for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Vendors = () => {
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const isSearchActive = debouncedSearchTerm.trim().length > 0;

    // Get KPIs data
    const { 
        data: kpisData, 
        isLoading: isLoadingKpis,
        error: errorKpis 
    } = useVendorKpisOverview();

    // Regular vendors listing (when not searching)
    const { 
        data: vendorsData, 
        isLoading: isLoadingVendors,
        error: errorVendors,
    } = useVendors({
      page: currentPage, 
      limit: 10,
    }, !isSearchActive); // Disable when searching

    // Search vendors (when searching)
    const { 
        data: searchData, 
        isLoading: isLoadingSearch,
        error: errorSearch,
    } = useVendorSearch({
        q: debouncedSearchTerm,
        page: currentPage,
        limit: 10,
    }, isSearchActive);

    // Determine which data to use
    const currentData = isSearchActive ? searchData : vendorsData;
    const currentItems = isSearchActive ? searchData?.items || [] : vendorsData?.items || [];
    const currentMeta = currentData?.meta;
    const isLoading = isSearchActive ? isLoadingSearch : isLoadingVendors;
    const error = isSearchActive ? errorSearch : errorVendors;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Search is handled automatically by the debounced search term
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when search term changes
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleAddVendor = () => {
        router.push('/production/vendors/add');
    };

    // Generate pagination items following the same pattern as other components
    const generatePaginationItems = () => {
        if (!currentMeta || currentMeta.totalPages <= 1) return null;

        const { currentPage, totalPages } = currentMeta;
        const items = [] as React.ReactNode[];

        // Always show first page
        items.push(
            <PaginationItem key="first">
                <PaginationLink
                    className={`cursor-pointer transition-colors ${
                        currentPage === 1 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "hover:bg-gray-50"
                    }`}
                    onClick={() => handlePageChange(1)}
                >
                    1
                </PaginationLink>
            </PaginationItem>
        );

        // Show ellipsis if needed
        if (currentPage > 3) {
            items.push(
                <PaginationItem
                    key="ellipsis1"
                    className="text-xs text-gray-500 cursor-pointer"
                >
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
                        className={`cursor-pointer transition-colors ${
                            i === currentPage 
                                ? "bg-blue-600 text-white hover:bg-blue-700" 
                                : "hover:bg-gray-50"
                        }`}
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Show ellipsis if needed
        if (currentPage < totalPages - 2) {
            items.push(
                <PaginationItem
                    key="ellipsis2"
                    className="text-xs text-gray-500 cursor-pointer"
                >
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Always show last page if it exists and is different from first
        if (totalPages > 1) {
            items.push(
                <PaginationItem key="last">
                    <PaginationLink
                        className={`cursor-pointer transition-colors ${
                            currentPage === totalPages 
                                ? "bg-blue-600 text-white hover:bg-blue-700" 
                                : "hover:bg-gray-50"
                        }`}
                        onClick={() => handlePageChange(totalPages)}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    // Helper function to get vendor data consistently
    const getVendorDisplayData = (vendor: Vendor | VendorSearchItem) => {
        return {
            pk_vendor_id: vendor.pk_vendor_id,
            name: vendor.name,
            contact: vendor.contact,
            vendor_type: vendor.vendor_type,
            vendor_service_category: vendor.vendor_service_category,
            status: vendor.status,
        };
    };

    return (
        <div className="w-full max-w-full space-y-6 font-inter bg-white">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Total Vendors"
                    value={kpisData?.total_vendors || 0}
                    icon={Users}
                    growthRate={kpisData?.growth_rate}
                    isLoading={isLoadingKpis}
                />
                <KpiCard
                    title="Active Vendors"
                    value={kpisData?.active_vendors || 0}
                    icon={UserCheck}
                    isLoading={isLoadingKpis}
                />
                <KpiCard
                    title="Blocked Vendors"
                    value={kpisData?.blocked_vendors || 0}
                    icon={UserX}
                    isLoading={isLoadingKpis}
                />
                <KpiCard
                    title="Recent Registrations"
                    value={kpisData?.recent_registrations || 0}
                    icon={TrendingUp}
                    isLoading={isLoadingKpis}
                />
            </div>

            {/* Search Bar */}
            <div className="w-full flex flex-row gap-3">
                <div className="flex flex-row items-center gap-2 border border-gray-200 px-3 py-2 rounded-xl grow bg-white shadow-sm">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="flex-1 border-none focus:ring-0 outline-none bg-transparent text-sm h-auto p-0"
                    />
                </div>
                <Button variant="outline" className="flex items-center space-x-2 cursor-pointer h-10 px-4 border-gray-200 hover:bg-gray-50 rounded-xl">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                </Button>
                <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 cursor-pointer h-10 px-4 rounded-xl shadow-sm"
                        onClick={handleAddVendor}>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Vendor</span>
                    <span className="sm:hidden">Add</span>
                </Button>
            </div>

            {/* Search Results Info */}
            {isSearchActive && searchData && (
                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                            Found {searchData.total_found} results for "{searchData.searchTerm}"
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                            Searched: {searchData.searchFields.join(', ')}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                            Match: {searchData.matchType}
                        </span>
                    </div>
                </div>
            )}

            {/* Vendors Table */}
            <div className="w-full">
                <Card className="border-0 bg-white rounded-2xl shadow-sm">
                    <CardHeader className="border-b border-gray-100 p-6">
                        <CardTitle className="text-2xl font-semibold text-gray-900">
                            {isSearchActive ? 'Search Results' : 'Vendors Directory'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                                        <TableHead className="font-medium text-gray-600 px-3 py-3">
                                            Company
                                        </TableHead>
                                        <TableHead className="font-medium text-gray-600 px-3 py-3">
                                            Contact
                                        </TableHead>
                                        <TableHead className="font-medium text-gray-600 px-3 py-3">
                                            Email
                                        </TableHead>
                                        <TableHead className="font-medium text-gray-600 px-3 py-3">
                                            Phone
                                        </TableHead>
                                        <TableHead className="font-medium text-gray-600 px-3 py-3">
                                            Type
                                        </TableHead>
                                        <TableHead className="font-medium text-gray-600 px-3 py-3">
                                            Service Category
                                        </TableHead>
                                        <TableHead className="font-medium text-gray-600 px-3 py-3">
                                            Status
                                        </TableHead>
                                        <TableHead className="font-medium text-gray-600 px-3 py-3">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <VendorTableSkeleton />
                                    ) : currentItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                        No vendors found
                                                    </h3>
                                                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                                                        {isSearchActive 
                                                            ? `No vendors match your search for "${searchTerm}". Try adjusting your search terms.` 
                                                            : 'Create your first vendor to get started managing your vendor relationships and tracking services.'
                                                        }
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentItems.map((vendor) => {
                                            const vendorData = getVendorDisplayData(vendor);
                                            return (
                                                <TableRow key={vendorData.pk_vendor_id} className="hover:bg-gray-50 transition-colors">
                                                    <TableCell className="px-3 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-sm font-medium text-gray-900">{vendorData.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {`ID ${vendorData.pk_vendor_id}`}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="text-sm text-gray-900">
                                                            {vendorData?.contact?.first_name || '---'} {vendorData?.contact?.last_name || '---'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="text-sm text-gray-700">
                                                            <span className="hidden sm:inline">{vendorData?.contact?.email || '---'}</span>
                                                            <span className="sm:hidden truncate max-w-[120px] block">{vendorData?.contact?.email || '---'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="text-sm text-gray-700">
                                                            {vendorData?.contact?.phone_number || vendorData?.contact?.mobile_number || '---'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="text-sm text-gray-700">
                                                            {vendorData.vendor_type.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <div className="text-sm text-gray-700">
                                                            <span className="hidden md:inline">{vendorData.vendor_service_category.name}</span>
                                                            <span className="md:hidden truncate max-w-[100px] block">{vendorData.vendor_service_category.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <Badge className={`text-xs font-medium text-white border-0 rounded-full px-2.5 py-0.5 ${
                                                            vendorData.status === 'ACTIVE' ? 'bg-green-600' : 'bg-red-600'
                                                        }`}>
                                                            {vendorData.status === 'ACTIVE' ? 'Active' : 'Blocked'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <Button 
                                                            onClick={() => router.push(`/production/vendors/${vendorData.pk_vendor_id}`)}
                                                            variant="ghost" 
                                                            size="sm"
                                                            className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium cursor-pointer"
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    
                    {/* Pagination Footer */}
                    <CardFooter className="flex flex-col w-full p-0">
                        {!isLoading && (
                            <>
                                {/* Items summary */}
                                {currentItems.length > 0 && currentMeta && (
                                    <div className="w-full flex flex-row justify-end border-t border-gray-100 text-sm p-6 text-gray-600">
                                        Showing {currentItems.length} of {currentMeta.totalItems || 0} 
                                        {isSearchActive ? ' search results' : ' vendors'}
                                    </div>
                                )}

                                {/* Pagination */}
                                {currentMeta && currentMeta.totalPages > 1 && (
                                    <div className="flex justify-center mt-4 mb-6 w-full">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        className={`cursor-pointer transition-colors ${
                                                            currentMeta.currentPage <= 1 || isLoading
                                                                ? "opacity-50 pointer-events-none"
                                                                : "hover:bg-gray-50"
                                                        }`}
                                                        onClick={() =>
                                                            currentMeta.currentPage > 1 && handlePageChange(currentMeta.currentPage - 1)
                                                        }
                                                    />
                                                </PaginationItem>
                                                {generatePaginationItems()}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        className={`cursor-pointer transition-colors ${
                                                            currentMeta.currentPage >= currentMeta.totalPages || isLoading
                                                                ? "opacity-50 pointer-events-none"
                                                                : "hover:bg-gray-50"
                                                        }`}
                                                        onClick={() =>
                                                            currentMeta.currentPage < currentMeta.totalPages && handlePageChange(currentMeta.currentPage + 1)
                                                        }
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Vendors;
