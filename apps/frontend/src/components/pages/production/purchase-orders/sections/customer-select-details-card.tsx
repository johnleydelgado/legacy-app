'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Contact, PhoneIcon, Users, X, Dot, Smartphone, MailIcon, User, CirclePlus, Mail, Phone, MapPin, Search, Loader2 } from "lucide-react";
import * as React from "react";
import { useInfiniteCustomers, useInfiniteUnifiedSearch } from "@/hooks/useCustomers2";
import { Address } from "@/services/addresses/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CustomerSelectCardProps {
    selectedCustomer: any;
    showSearch: boolean;
    onShowSearchChange: (show: boolean) => void;
    onCustomerSelect: (customer: any) => void;
    onClearSelection: () => void;
    searchOptions?: {
        pageSize?: number;
        debounceMs?: number;
        filters?: any;
        useVirtualScrolling?: boolean;
        itemHeight?: number;
        containerHeight?: number;
    };
    customerAddress: Address | null;
    setModifyFlag?: (modifyFlag: boolean) => void;
}

const CustomerSelectDetailsCard: React.FC<CustomerSelectCardProps> = ({
    selectedCustomer,
    showSearch,
    onShowSearchChange,
    onCustomerSelect,
    onClearSelection,
    searchOptions = {},
    customerAddress,
    setModifyFlag
}) => {

    const {
        useVirtualScrolling = true,
        itemHeight = 80,
        containerHeight = 200,
        ...restSearchOptions
    } = searchOptions;

    // Local state for search term
    const [searchTerm, setSearchTerm] = React.useState<string>('');

    // Use unified search for search functionality
    const searchHook = useInfiniteUnifiedSearch({
        initialQuery: searchTerm,
        pageSize: restSearchOptions.pageSize || 10,
        debounceMs: restSearchOptions.debounceMs || 300,
        enabled: showSearch && Boolean(searchTerm.trim()),
        filters: restSearchOptions.filters || {},
        scrollThreshold: 100
    });

    // Use infinite customers for regular browsing (fallback when no search)
    const browseHook = useInfiniteCustomers({
        pageSize: restSearchOptions.pageSize || 10,
        enabled: showSearch && !searchTerm.trim(),
        threshold: 100
    });

    // Determine which hook to use based on search state
    const isSearching = Boolean(searchTerm.trim());
    
    // Extract data from active hook
    const {
        results: customers = [],
        debouncedQuery: debouncedSearchTerm = '',
        loading,
        loadingMore,
        error,
        hasNextPage,
        lastElementRef,
        handleScroll: hookHandleScroll,
        clearSearch: clearSearchHook,
        isDebouncing
    } = isSearching ? searchHook : {
        ...browseHook,
        results: browseHook.customers,
        debouncedQuery: '',
        clearSearch: () => {},
        isDebouncing: false
    };

    // Virtual scrolling state and calculations
    const [scrollTop, setScrollTop] = React.useState(0);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const bufferSize = Math.floor(visibleCount / 2);

    const startIndex = useVirtualScrolling 
        ? Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
        : 0;
    const endIndex = useVirtualScrolling
        ? Math.min(customers.length - 1, startIndex + visibleCount + bufferSize * 2)
        : customers.length - 1;

    const visibleCustomers = useVirtualScrolling 
        ? customers.slice(startIndex, endIndex + 1)
        : customers;
    
    const totalHeight = useVirtualScrolling ? customers.length * itemHeight : 'auto';
    const offsetY = useVirtualScrolling ? startIndex * itemHeight : 0;

    // Sync local search term with search hook when needed
    React.useEffect(() => {
        if (isSearching && searchHook.updateQuery) {
            searchHook.updateQuery(searchTerm);
        }
    }, [searchTerm, isSearching]);

    // Load more when approaching the end of visible items (for virtual scrolling)
    React.useEffect(() => {
        if (!useVirtualScrolling) return;
        
        const shouldLoadMore =
            endIndex >= customers.length - 10 &&
            hasNextPage &&
            !loadingMore;

        if (shouldLoadMore) {
            if (isSearching && searchHook.loadMore) {
                searchHook.loadMore();
            } else if (!isSearching && browseHook.loadMore) {
                browseHook.loadMore();
            }
        }
    }, [endIndex, customers.length, hasNextPage, loadingMore, isSearching, useVirtualScrolling]);

    // Combined scroll handler
    const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
        if (useVirtualScrolling) {
            setScrollTop(event.currentTarget.scrollTop);
        }
        // Call the hook's scroll handler for intersection observer
        if (hookHandleScroll) {
            hookHandleScroll(event.nativeEvent);
        }
    }, [useVirtualScrolling, hookHandleScroll]);

    const handleOpenSearch = () => {
        onShowSearchChange(true);
    };

    const handleCloseSearch = () => {
        onShowSearchChange(false);
        clearSearch();
    };

    const handleCustomerSelect = (customer: any) => {
        onCustomerSelect(customer);
        if (setModifyFlag) {
            setModifyFlag(true);
        }
        handleCloseSearch();
    };

    const handleSearchTermChange = (term: string) => {
        setSearchTerm(term);
        setScrollTop(0); // Reset scroll when searching
    };

    const clearSearch = () => {
        setSearchTerm('');
        setScrollTop(0);
        if (clearSearchHook) {
            clearSearchHook();
        }
    };

    const renderCustomerItem = (customer: any, index: number, virtualIndex?: number) => {
        const actualIndex = virtualIndex !== undefined ? virtualIndex : index;
        const isLast = actualIndex === customers.length - 1;
        
        const style = useVirtualScrolling ? {
            height: itemHeight,
            display: 'flex',
            alignItems: 'center'
        } : {};
        
        return (
            <div
                key={customer.id || customer.pk_customer_id}
                ref={isLast ? lastElementRef : undefined}
                className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                style={style}
                onClick={() => handleCustomerSelect(customer)}
            >
                <div className="flex items-start gap-3 w-full">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                            {customer.name}
                        </h4>
                        {customer.primary_contact && (
                            <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {customer.primary_contact.first_name} {customer.primary_contact.last_name}
                                </p>
                                {customer.primary_contact.email && (
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {customer.primary_contact.email}
                                    </p>
                                )}
                                {customer.primary_contact.phone && (
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {customer.primary_contact.phone_number}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Card className="w-1/4 grow p-4" style={{gap: '5px'}}>
                <CardHeader className="flex flex-row items-center mb-3 justify-between border-b border-b-gray-300 min-h-[50px]" 
                            style={{paddingBottom: '10px', paddingLeft: '5px', paddingRight: '5px'}}>
                    <div className="flex flex-row gap-2 items-center">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Users className="w-4 h-4 text-blue-700" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">Customer Information</p>
                    </div>
                    <div className="flex flex-row gap-1">
                        {selectedCustomer && 
                            <Button variant="ghost" 
                                    size="icon" 
                                    className="hover:bg-gray-200 cursor-pointer" 
                                    onClick={onClearSelection}
                            >
                                <X className="h-4 w-4 text-gray-600" />
                            </Button> 
                        }
                    </div>
                </CardHeader>
                <CardContent className="px-2">
                    {selectedCustomer ? (
                        <div className="space-y-1 min-h-[200px] h-full">
                            <div className="flex flex-row gap-2 items-center">
                                <Building2 className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">{selectedCustomer.name}</p>
                                <span className={`ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    selectedCustomer.status === 'ACTIVE' 
                                        ? 'bg-green-100 text-green-800' 
                                        : selectedCustomer.status === 'INACTIVE'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {selectedCustomer.status || 'UNKNOWN'}
                                </span>
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                <Contact className="w-4 h-4 text-gray-600" />
                                { selectedCustomer.primary_contact?.first_name || selectedCustomer.primary_contact?.last_name ? (
                                    <>
                                    <p className="text-sm text-gray-600">{selectedCustomer.primary_contact.first_name} {selectedCustomer.primary_contact.last_name}</p> 
                                    <Dot className="w-4 h-4 text-gray-600" />
                                    <p className="text-sm font-light text-gray-600">{`(${selectedCustomer.primary_contact.position_title || 'No title'})`}</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-600">No contact person information available</p>
                                )}
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                <MailIcon className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">{selectedCustomer.primary_contact?.email || 'No email available'}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                <PhoneIcon className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">{selectedCustomer.primary_contact?.phone_number || 'No phone number available'}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                <Smartphone className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">{selectedCustomer.primary_contact?.mobile_number || 'No mobile number available'}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                <MapPin className="w-4 h-4 text-gray-600" />
                                {customerAddress ? (
                                    <p className="text-sm text-gray-600 text-wrap">{`${customerAddress?.address1}, ${customerAddress?.city}, ${customerAddress?.state}, ${customerAddress?.zip}, ${customerAddress?.country}`}</p>
                                ) : (
                                    <p className="text-sm text-gray-600">No address available</p>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="space-y-1 min-h-[150px] flex flex-col justify-center items-center">
                            <div className="text-center py-2">
                                <User className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 mb-3">
                                    No customer selected
                                </p>
                            </div>
                            <Button 
                                className="bg-blue-500 hover:bg-blue-300 cursor-pointer"
                                onClick={handleOpenSearch}
                            >
                                <CirclePlus className="h-4 w-4 text-white" />
                                Add Customer
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Customer Search Dialog */}
            {showSearch && 
                <Dialog open={showSearch} onOpenChange={handleCloseSearch}>
                    <DialogContent className="sm:max-w-2xl h-[50vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Select Customer
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search customers by name, contact, or email..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchTermChange(e.target.value)}
                                    className="pl-10"
                                />
                                {isDebouncing && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Search Info */}
                            {debouncedSearchTerm && (
                                <p className="text-sm text-gray-600">
                                    {isDebouncing 
                                        ? `Searching for "${debouncedSearchTerm}"...`
                                        : `Results for "${debouncedSearchTerm}"`
                                    }
                                </p>
                            )}

                            {/* Results */}
                            <div className="flex-1 overflow-hidden">
                                {loading && customers.length === 0 ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                        <span className="ml-2 text-gray-600">Loading customers...</span>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8">
                                        <p className="text-red-600">Error loading customers</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="mt-2"
                                            onClick={() => handleSearchTermChange(searchTerm)}
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                ) : customers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">
                                            {searchTerm.trim() ? 'No customers found' : 'Start typing to search customers'}
                                        </p>
                                    </div>
                                ) : (
                                    <div 
                                        className="overflow-y-auto"
                                        style={{ height: useVirtualScrolling ? containerHeight : 'auto', maxHeight: useVirtualScrolling ? containerHeight : '400px' }}
                                        onScroll={handleScroll}
                                    >
                                        {useVirtualScrolling ? (
                                            <div style={{ height: totalHeight, position: 'relative' }}>
                                                <div style={{ transform: `translateY(${offsetY}px)` }}>
                                                    {visibleCustomers.map((customer, index) => 
                                                        renderCustomerItem(customer, index, startIndex + index)
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {visibleCustomers.map((customer, index) => renderCustomerItem(customer, index))}
                                            </>
                                        )}
                                    
                                        {/* Load More Indicator */}
                                        {loadingMore && (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                                <span className="ml-2 text-gray-600">Loading more...</span>
                                            </div>
                                        )}
                                        
                                        {/* End of Results */}
                                        {!hasNextPage && customers.length > 0 && (
                                            <div className="text-center py-4">
                                                <p className="text-gray-500 text-sm">
                                                    Showing all {customers.length} customers
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog> 
            }
        </>
    )
 }

 export default CustomerSelectDetailsCard;
