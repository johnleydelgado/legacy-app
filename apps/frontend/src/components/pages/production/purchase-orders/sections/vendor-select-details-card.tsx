'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vendor, VendorSearchItem } from "@/services/vendors/types";
import * as React from "react";
import { Building, Contact, Dot, Loader2, Mail, Package, Phone, Search, Store, Truck, X } from "lucide-react";
import { MailIcon } from "lucide-react";
import { PhoneIcon } from "lucide-react";
import { Smartphone } from "lucide-react";
import { MapPin } from "lucide-react";
import { CirclePlus } from "lucide-react";
import { useVendor, useVendorProductCategories, useVendorSearch, useVendorsInfinite } from "@/hooks/useVendors2";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Address } from "@/services/addresses/types";

// Union type for handling both vendor types
type VendorListItem = Vendor | VendorSearchItem;

interface VendorSelectCardProps {
    selectedVendor: Vendor | null;
    showSearch: boolean;
    onShowSearchChange: (show: boolean) => void;
    onVendorSelect: (vendor: Vendor) => void;
    onClearSelection: () => void;
    searchOptions?: {
        pageSize?: number;
        debounceMs?: number;
        filters?: any;
        useVirtualScrolling?: boolean;
        itemHeight?: number;
        containerHeight?: number;
    };
    vendorAddress: Address | null;
    setModifyFlag?: (modifyFlag: boolean) => void;
}

// Type guard to check if item is a full Vendor
const isVendor = (item: VendorListItem): item is Vendor => {
    return 'tags' in item && 'notes' in item && 'location' in item && 'user_owner' in item;
};

const VendorSelectDetailsCard: React.FC<VendorSelectCardProps> = ({
    selectedVendor,
    showSearch,
    onShowSearchChange,
    onVendorSelect,
    onClearSelection,
    searchOptions = {},
    vendorAddress,
    setModifyFlag
}) => {
    const {
        useVirtualScrolling = true,
        itemHeight = 80,
        containerHeight = 200,
        ...restSearchOptions
    } = searchOptions;

    const { data: vendorData } = useVendor(selectedVendor?.pk_vendor_id || 0);
    const { data: vendorProductCategories } = useVendorProductCategories(selectedVendor?.pk_vendor_id || 0);

    // Local state for search term
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [isDebouncing, setIsDebouncing] = React.useState(false);

    // Debounce search term
    const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
    
    React.useEffect(() => {
        setIsDebouncing(true);
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setIsDebouncing(false);
        }, restSearchOptions.debounceMs || 300);

        return () => clearTimeout(timer);
    }, [searchTerm, restSearchOptions.debounceMs]);

    // Use vendor search for search functionality
    const searchQuery = useVendorSearch({
        q: debouncedSearchTerm,
        limit: restSearchOptions.pageSize || 10,
    }, showSearch && Boolean(debouncedSearchTerm.trim()));

    // Use infinite vendors for regular browsing (fallback when no search)
    const browseQuery = useVendorsInfinite({
        limit: restSearchOptions.pageSize || 10,
        ...restSearchOptions.filters
    }, showSearch && !debouncedSearchTerm.trim());

    // Determine which data to use based on search state
    const isSearching = Boolean(debouncedSearchTerm.trim());
    
    const vendors: VendorListItem[] = isSearching 
        ? searchQuery.data?.items || []
        : browseQuery.data?.pages.flatMap(page => page.items) || [];
    
    const loading = isSearching ? searchQuery.isLoading : browseQuery.isLoading;
    const loadingMore = isSearching ? false : browseQuery.isFetchingNextPage;
    const error = isSearching ? searchQuery.error : browseQuery.error;
    const hasNextPage = isSearching ? false : browseQuery.hasNextPage;

    // Virtual scrolling state and calculations
    const [scrollTop, setScrollTop] = React.useState(0);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const bufferSize = Math.floor(visibleCount / 2);

    const startIndex = useVirtualScrolling 
        ? Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
        : 0;
    const endIndex = useVirtualScrolling
        ? Math.min(vendors.length - 1, startIndex + visibleCount + bufferSize * 2)
        : vendors.length - 1;

    const visibleVendors = useVirtualScrolling 
        ? vendors.slice(startIndex, endIndex + 1)
        : vendors;
    
    const totalHeight = useVirtualScrolling ? vendors.length * itemHeight : 'auto';
    const offsetY = useVirtualScrolling ? startIndex * itemHeight : 0;

    // Load more when approaching the end of visible items (for virtual scrolling)
    React.useEffect(() => {
        if (!useVirtualScrolling || isSearching) return;
        
        const shouldLoadMore =
            endIndex >= vendors.length - 10 &&
            hasNextPage &&
            !loadingMore;

        if (shouldLoadMore && browseQuery.fetchNextPage) {
            browseQuery.fetchNextPage();
        }
    }, [endIndex, vendors.length, hasNextPage, loadingMore, isSearching, useVirtualScrolling]);

    // Combined scroll handler
    const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
        if (useVirtualScrolling) {
            setScrollTop(event.currentTarget.scrollTop);
        }
        
        // Auto-load more when scrolling near bottom (for non-virtual scrolling)
        if (!useVirtualScrolling && !isSearching) {
            const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
            if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !loadingMore) {
                browseQuery.fetchNextPage?.();
            }
        }
    }, [useVirtualScrolling, isSearching, hasNextPage, loadingMore]);

    const handleOpenSearch = () => {
        onShowSearchChange(true);
    };

    const handleCloseSearch = () => {
        onShowSearchChange(false);
        clearSearch();
    };

    const handleVendorSelect = (vendor: VendorListItem) => {
        onVendorSelect(vendor as Vendor);
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
        setDebouncedSearchTerm('');
        setScrollTop(0);
    };

    const renderVendorItem = (vendor: VendorListItem, index: number, virtualIndex?: number) => {
        const actualIndex = virtualIndex !== undefined ? virtualIndex : index;
        const isLast = actualIndex === vendors.length - 1;
        const primaryContact = vendor.contact;
        
        const style = useVirtualScrolling ? {
            height: itemHeight,
            display: 'flex',
            alignItems: 'center'
        } : {};
        
        return (
            <div
                key={vendor.pk_vendor_id}
                className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                style={style}
                onClick={() => handleVendorSelect(vendor)}
            >
                <div className="flex items-start gap-3 w-full">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                            {vendor.name}
                        </h4>
                        <div className="mt-1 grid grid-cols-2 gap-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {vendor.vendor_type.name} • {vendor.vendor_service_category.name}
                            </p>
                            {primaryContact && (
                                <>
                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                            <Contact className="w-3 h-3" />
                                            {primaryContact.first_name} {primaryContact.last_name}
                                    </p>
                                    {primaryContact.email && (
                                        <p className="text-xs text-gray-600 flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {primaryContact.email}
                                        </p>
                                    )}
                                    {primaryContact.phone_number && (
                                        <p className="text-xs text-gray-600 flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {primaryContact.phone_number}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            vendor.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {vendor.status || 'UNKNOWN'}
                        </span>
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
                        <div className="p-2 bg-orange-100 rounded-full">
                        <Store className="w-4 h-4 text-orange-700" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">Vendor Information</p>
                    </div>
                    <div className="flex flex-row gap-1">
                        {selectedVendor && 
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
                    {selectedVendor ? (
                        <div className="space-y-1 min-h-[200px] h-full">
                            <div className="flex flex-row gap-2 items-center">
                                <Building className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">{vendorData?.name}</p>
                                <span className={`ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    vendorData?.status === 'ACTIVE' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {vendorData?.status || 'UNKNOWN'}
                                </span>
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                <Package className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">{vendorData?.vendor_type.name}</p>
                                <Dot className="w-4 h-4 text-gray-600" />
                                <p className="text-sm font-light text-gray-600">{vendorData?.vendor_service_category.name}</p>
                                <Dot className="w-4 h-4 text-gray-600" />
                                <p className="text-sm font-light text-gray-600">{vendorData?.location.name}</p>
                            </div>

                            <div className="flex flex-row gap-2 items-center">
                                <Contact className="w-4 h-4 text-gray-600" />
                                {vendorData?.contact?.first_name || vendorData?.contact?.last_name ? (
                                    <>
                                        <p className="text-sm text-gray-600">{vendorData?.contact.first_name} {vendorData?.contact.last_name}</p> 
                                        <Dot className="w-4 h-4 text-gray-600" />
                                        <p className="text-sm font-light text-gray-600">{`(${vendorData?.contact.position_title || 'No title'})`}</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-600">No contact person information available</p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1 col-span-2">
                                    <div className="flex flex-row gap-2 items-center">
                                        <MailIcon className="w-4 h-4 text-gray-600" />
                                        <p className="text-sm text-gray-600">{vendorData?.contact?.email || 'No email available'}</p>
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <div className="flex flex-row gap-2 items-center">
                                            <PhoneIcon className="w-4 h-4 text-gray-600" />
                                            <p className="text-sm text-gray-600">{vendorData?.contact?.phone_number || 'No phone number available'}</p>    
                                        </div>
                                        <Dot className="w-4 h-4 text-gray-600" />
                                        <div className="flex flex-row gap-2 items-center">
                                            <Smartphone className="w-4 h-4 text-gray-600" />
                                            <p className="text-sm text-gray-600">{vendorData?.contact?.mobile_number || 'No mobile number available'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2 items-start">
                                        <MapPin className="w-4 h-4 text-gray-600" />
                                        <div className="flex flex-row gap-1 items-center flex-wrap max-w-[230px]">
                                            {vendorAddress ? (
                                                <p className="text-sm text-gray-600 text-wrap">{`${vendorAddress?.address1}, ${vendorAddress?.city}, ${vendorAddress?.state}, ${vendorAddress?.zip}, ${vendorAddress?.country}`}</p>
                                            ) : (
                                                <p className="text-sm text-gray-600">No address available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-span-1 space-y-1">
                                    <p className="text-sm text-gray-800 font-medium">Product Categories</p>
                                    <div className="flex flex-col gap-0">
                                        {vendorProductCategories?.product_categories.map((category) => (
                                            <p key={category.category_id} className="text-sm text-gray-500">{`${category.category_name} (${category.product_count})`}</p>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">Total Products: {vendorProductCategories?.total_products || '---'}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1 min-h-[150px] flex flex-col justify-center items-center">
                            <div className="text-center py-2">
                                <Store className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 mb-3">
                                    No vendor selected
                                </p>
                            </div>
                            <Button 
                                className="bg-orange-500 hover:bg-orange-300 cursor-pointer"
                                onClick={handleOpenSearch}
                            >
                                <CirclePlus className="h-4 w-4 text-white" />
                                Add Vendor
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Vendor Search Dialog */}
            {showSearch && 
                <Dialog open={showSearch} onOpenChange={handleCloseSearch}>
                    <DialogContent className="sm:max-w-2xl h-[50vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Select Vendor
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search vendors by name, contact, or type..."
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
                                {loading && vendors.length === 0 ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                        <span className="ml-2 text-gray-600">Loading vendors...</span>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8">
                                        <p className="text-red-600">Error loading vendors</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="mt-2"
                                            onClick={() => handleSearchTermChange(searchTerm)}
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                ) : vendors.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">
                                            {searchTerm.trim() ? 'No vendors found' : 'Start typing to search vendors'}
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
                                                    {visibleVendors.map((vendor, index) => 
                                                        renderVendorItem(vendor, index, startIndex + index)
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {visibleVendors.map((vendor, index) => renderVendorItem(vendor, index))}
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
                                        {!hasNextPage && vendors.length > 0 && !isSearching && (
                                            <div className="text-center py-4">
                                                <p className="text-gray-500 text-sm">
                                                    Showing all {vendors.length} vendors
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

 export default VendorSelectDetailsCard;
