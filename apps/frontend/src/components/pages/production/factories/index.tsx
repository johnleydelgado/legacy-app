'use client';

import * as React from 'react';
import KpiCard from './sections/kpiCards';
import { Filter, Plus, Search, TrendingUp, UserCheck, Users, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useFactories, useFactoriesSearch, useFactoryKpi } from '@/hooks/useFactories';
import { FactoriesQueryParams } from '@/services/factories/types';

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
const [debouncedValue, setDebouncedValue] = React.useState(value);
  
    React.useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
  
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
  
    return debouncedValue;
  };

const Factories = () => {
    const router = useRouter();
    
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize] = React.useState(10);

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const isSearchActive = debouncedSearchTerm.trim().length > 0;

    // API Hooks
    const { data: kpiData, isLoading: isKpiLoading, error: kpiError } = useFactoryKpi();
    
    // Query parameters for factories list
    const queryParams: FactoriesQueryParams = React.useMemo(() => ({
        page: currentPage,
        limit: pageSize,
    }), [currentPage, pageSize]);

    // Search parameters
    const searchParams = React.useMemo(() => ({
        q: debouncedSearchTerm,
        page: currentPage,
        limit: pageSize,
    }), [debouncedSearchTerm, currentPage, pageSize]);

    // Use search hook when searching, otherwise use regular factories hook
    const { 
        data: searchData, 
        isLoading: isSearchLoading, 
        error: searchError 
    } = useFactoriesSearch(searchParams);

    const { 
        data: factoriesData, 
        isLoading: isFactoriesLoading, 
        error: factoriesError 
    } = useFactories(queryParams);

    // Determine which data to use
    const currentData = isSearchActive ? searchData : factoriesData;
    const isLoading = isSearchActive ? isSearchLoading : isFactoriesLoading;
    const error = isSearchActive ? searchError : factoriesError;

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

    const handleAddFactory = () => {
        router.push('/production/factories/add');
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'INACTIVE':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="w-full max-w-full space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Total Factories"
                    value={kpiData?.overview.total_factories || 0}
                    icon={Users}
                    growthRate={kpiData?.overview.growth_rate || 0}
                    isLoading={isKpiLoading}
                />
                <KpiCard
                    title="Active Factories"
                    value={kpiData?.overview.active_factories || 0}
                    icon={UserCheck}
                    isLoading={isKpiLoading}
                />
                <KpiCard
                    title="Inactive Factories"
                    value={kpiData?.overview.inactive_factories || 0}
                    icon={UserX}
                    isLoading={isKpiLoading}
                />
                <KpiCard
                    title="Recent Registrations"
                    value={kpiData?.overview.recent_registrations || 0}
                    icon={TrendingUp}
                    isLoading={isKpiLoading}
                />
            </div>

            {/* Error Display */}
            {kpiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    Error loading KPI data: {kpiError.message}
                </div>
            )}

            {/* Search Bar */}
            <div className="w-full flex flex-row gap-3">
                <div className="flex flex-row items-center gap-2 border border-gray-200 px-3 py-2 rounded-xl grow bg-white shadow-sm">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search factories..."
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
                        onClick={handleAddFactory}>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Factory</span>
                    <span className="sm:hidden">Add</span>
                </Button>
            </div>

            {/* Factories Table */}
            <Card className="border-0 bg-white rounded-2xl shadow-sm">
                <CardHeader className="border-b border-gray-100 p-6">
                    <CardTitle className="flex items-center justify-between">
                        <span className="text-2xl font-semibold text-gray-900">
                            {isSearchActive ? `Search Results (${currentData?.meta.totalItems || 0})` : 'Factories Directory'}
                        </span>
                        {currentData?.meta && (
                            <span className="text-sm text-gray-500">
                                Page {currentData.meta.currentPage} of {currentData.meta.totalPages}
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 mx-6 mt-6">
                            Error loading factories: {error.message}
                        </div>
                    )}
                    
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-medium text-gray-600 px-3 py-3">Factory</TableHead>
                                    <TableHead className="font-medium text-gray-600 px-3 py-3">Contact</TableHead>
                                    <TableHead className="font-medium text-gray-600 px-3 py-3">Type</TableHead>
                                    <TableHead className="font-medium text-gray-600 px-3 py-3">Service Category</TableHead>
                                    <TableHead className="font-medium text-gray-600 px-3 py-3">Location</TableHead>
                                    <TableHead className="font-medium text-gray-600 px-3 py-3">Industry</TableHead>
                                    <TableHead className="font-medium text-gray-600 px-3 py-3">Website</TableHead>
                                    <TableHead className="font-medium text-gray-600 px-3 py-3">Status</TableHead>
                                    <TableHead className="font-medium text-gray-600 px-3 py-3">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <VendorTableSkeleton />
                                ) : currentData?.items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <Users className="h-12 w-12 text-gray-400 mb-4" />
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                    No factories found
                                                </h3>
                                                <p className="text-sm text-gray-600 max-w-md mx-auto">
                                                    {isSearchActive 
                                                        ? `No factories match your search. Try adjusting your search terms.` 
                                                        : 'Create your first factory to get started managing your manufacturing partners and tracking production.'
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentData?.items.map((factory) => (
                                        <TableRow key={factory.pk_factories_id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="px-3 py-3">
                                                <div className="flex flex-col gap-y-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {factory.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {`FID: ${factory.pk_factories_id}`}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <div className="text-sm text-gray-700">
                                                    {factory.contact.first_name} {factory.contact.last_name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <div className="text-sm text-gray-700">
                                                    {factory.factories_type.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <div className="text-sm text-gray-700">
                                                    {factory.factories_service_category.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <Badge className="text-xs font-medium text-white border-0 rounded-full px-2.5 py-0.5" 
                                                       style={{ backgroundColor: factory.location_types.color }}>
                                                    {factory.location_types.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <div className="text-sm text-gray-700">
                                                    {factory.industry}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <div className="text-sm text-gray-700">
                                                    {factory.website_url || "---"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <Badge className={`text-xs font-medium border-0 rounded-full px-2.5 py-0.5 ${
                                                    factory.status === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                                }`}>
                                                    {factory.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-3 py-3">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium cursor-pointer"
                                                    onClick={() => router.push(`/production/factories/${factory.pk_factories_id}`)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {currentData?.meta && currentData.meta.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 px-6 pb-6 border-t border-gray-100 pt-6">
                            <div className="text-sm text-gray-600">
                                Showing {((currentData.meta.currentPage - 1) * currentData.meta.itemsPerPage) + 1} to{' '}
                                {Math.min(currentData.meta.currentPage * currentData.meta.itemsPerPage, currentData.meta.totalItems)} of{' '}
                                {currentData.meta.totalItems} results
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer h-10 px-4 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                                    onClick={() => handlePageChange(currentData.meta.currentPage - 1)}
                                    disabled={currentData.meta.currentPage <= 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer h-10 px-4 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                                    onClick={() => handlePageChange(currentData.meta.currentPage + 1)}
                                    disabled={currentData.meta.currentPage >= currentData.meta.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default Factories;
