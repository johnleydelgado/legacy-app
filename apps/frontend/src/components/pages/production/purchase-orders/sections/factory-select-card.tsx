'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SquarePen, Search, X, Building, Mail, Phone, Loader2, Factory, MapPin, Contact, Dot, MailIcon, PhoneIcon, Smartphone, Globe, Tag, CirclePlus } from 'lucide-react';
import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useInfiniteFactories, useFactoriesSearch } from '@/hooks/useFactories';
import { Factory as FactoryType, FactoryDetail } from '@/services/factories/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Union type for handling both factory types
type FactoryListItem = FactoryType | FactoryDetail;

interface FactorySelectCardProps {
    selectedFactory: FactoryType | null;
    showSearch: boolean;
    onShowSearchChange: (show: boolean) => void;
    onFactorySelect: (factory: FactoryType) => void;
    onClearSelection: () => void;
    searchOptions?: {
        pageSize?: number;
        debounceMs?: number;
        filters?: any;
        useVirtualScrolling?: boolean;
        itemHeight?: number;
        containerHeight?: number;
    };
}

const FactorySelectCard: React.FC<FactorySelectCardProps> = ({
    selectedFactory,
    showSearch,
    onShowSearchChange,
    onFactorySelect,
    onClearSelection,
    searchOptions = {}
}) => {
    const {
        useVirtualScrolling = true,
        itemHeight = 80,
        containerHeight = 200,
        ...restSearchOptions
    } = searchOptions;

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

    // Use factory search for search functionality
    const searchQuery = useFactoriesSearch({
        q: debouncedSearchTerm,
        limit: restSearchOptions.pageSize || 10,
    });

    // Use infinite factories for regular browsing (fallback when no search)
    const browseQuery = useInfiniteFactories({
        limit: restSearchOptions.pageSize || 10,
        ...restSearchOptions.filters
    });

    // Determine which data to use based on search state
    const isSearching = Boolean(debouncedSearchTerm.trim()) && showSearch;
    
    const factories: FactoryListItem[] = isSearching 
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
        ? Math.min(factories.length - 1, startIndex + visibleCount + bufferSize * 2)
        : factories.length - 1;

    const visibleFactories = useVirtualScrolling 
        ? factories.slice(startIndex, endIndex + 1)
        : factories;
    
    const totalHeight = useVirtualScrolling ? factories.length * itemHeight : 'auto';
    const offsetY = useVirtualScrolling ? startIndex * itemHeight : 0;

    // Load more when approaching the end of visible items (for virtual scrolling)
    React.useEffect(() => {
        if (!useVirtualScrolling || isSearching) return;
        
        const shouldLoadMore =
            endIndex >= factories.length - 10 &&
            hasNextPage &&
            !loadingMore;

        if (shouldLoadMore && browseQuery.fetchNextPage) {
            browseQuery.fetchNextPage();
        }
    }, [endIndex, factories.length, hasNextPage, loadingMore, isSearching, useVirtualScrolling]);

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

    const handleFactorySelect = (factory: FactoryListItem) => {
        onFactorySelect(factory as FactoryType);
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

    // Helper function to get service category from either factory type
    const getServiceCategory = (factory: FactoryListItem) => {
        // Handle Factory type (has factories_service_category)
        if ('factories_service_category' in factory) {
            return factory.factories_service_category;
        }
        // Handle FactoryDetail type (has factories_service)
        if ('factories_service' in factory) {
            return factory.factories_service;
        }
        return null;
    };

    const renderFactoryItem = (factory: FactoryListItem, index: number, virtualIndex?: number) => {
        const actualIndex = virtualIndex !== undefined ? virtualIndex : index;
        const isLast = actualIndex === factories.length - 1;
        
        const style = useVirtualScrolling ? {
            height: itemHeight,
            display: 'flex',
            alignItems: 'center'
        } : {};
        
        return (
            <div
                key={factory.pk_factories_id}
                className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                style={style}
                onClick={() => handleFactorySelect(factory)}
            >
                <div className="flex items-start gap-3 w-full">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Factory className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                            {factory.name}
                        </h4>
                        <div className="mt-1 grid grid-cols-2 gap-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {factory.factories_type?.name || 'N/A'} • {getServiceCategory(factory)?.name || 'N/A'}
                            </p>
                            {factory.industry && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {factory.industry}
                                </p>
                            )}
                            {factory.email && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {factory.email}
                                </p>
                            )}
                            {factory.location_types && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {factory.location_types.name}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            factory.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : factory.status === 'INACTIVE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {factory.status || 'UNKNOWN'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Card className="size-[30%] border border-solid rounded-md grow p-4" style={{gap: '5px'}}>
                <CardHeader className="flex flex-row items-center mb-3 justify-between border-b border-b-gray-300 min-h-[50px]" 
                            style={{paddingBottom: '10px', paddingLeft: '5px', paddingRight: '5px'}} >
                    <div className="flex flex-row gap-2 items-center">
                        <Factory className="w-4 h-4 text-gray-800" />
                        <p className="text-sm font-semibold text-gray-800">Factory Details</p>
                    </div>
                    <div className="flex flex-row gap-1">
                        {selectedFactory && 
                           <Button 
                             variant="ghost" 
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
                    {selectedFactory ? (
                        <div className="space-y-1 min-h-[200px] h-full">
                            <div className="flex flex-row gap-2 items-center">
                                <Building className="w-4 h-4 text-gray-600" />
                                <p className="text-sm text-gray-600">{selectedFactory.name}</p>
                                <span className={`ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    selectedFactory.status === 'ACTIVE' 
                                        ? 'bg-green-100 text-green-800' 
                                        : selectedFactory.status === 'INACTIVE'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {selectedFactory.status || 'UNKNOWN'}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-1">
                                <div className="flex flex-row gap-2 items-center col-span-2">
                                    <Factory className="w-4 h-4 text-gray-600" />
                                    <p className="text-sm text-gray-600">{selectedFactory.factories_type?.name || 'N/A'}</p>
                                    <Dot className="w-4 h-4 text-gray-600" />
                                    <p className="text-sm font-light text-gray-600">{getServiceCategory(selectedFactory)?.name || 'N/A'}</p>
                                </div>
                                {selectedFactory.industry && (
                                <div className="flex flex-row gap-2 items-center">
                                    <Tag className="w-4 h-4 text-gray-600" />
                                    <p className="text-sm text-gray-600">{selectedFactory.industry}</p>
                                </div>
                            )}
                            </div>        

                            <div className="grid grid-cols-3 gap-1">
                                {selectedFactory.website_url && (
                                    <div className="flex flex-row gap-2 items-center col-span-2">
                                        <Globe className="w-4 h-4 text-gray-600" />
                                        <p className="text-sm text-gray-600">{selectedFactory.website_url}</p>
                                    </div>
                                )}
                                {selectedFactory.location_types && (
                                <div className="flex flex-row gap-2 items-center">
                                    <MapPin className="w-4 h-4 text-gray-600" />
                                    <p className="text-sm text-gray-600">{selectedFactory.location_types.name}</p>
                                </div>
                                )}
                            </div>

                            {selectedFactory.contact && (
                                <div className="flex flex-row flex-wrap gap-1 items-center border-t border-gray-200 pt-2">
                                <div className="flex flex-row gap-2 items-center col-span-2">
                                        <Contact className="w-4 h-4 text-gray-600" />
                                        {selectedFactory.contact?.first_name || selectedFactory.contact?.last_name ? (
                                            <>
                                            <p className="text-sm text-gray-600">{selectedFactory.contact.first_name} {selectedFactory.contact.last_name}</p> 
                                            <Dot className="w-4 h-4 text-gray-600" />
                                            <p className="text-sm font-light text-gray-600">{`(${selectedFactory.contact.position_title || 'No title'})`}</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-600">No contact person information available</p>
                                        )}
                                    </div>

                                    <div className="flex flex-row gap-2 items-center">
                                        <MailIcon className="w-4 h-4 text-gray-600" />
                                        <p className="text-sm text-gray-600">{selectedFactory.contact?.email || 'No email available'}</p>
                                    </div>

                            <div className="grid grid-cols-2 gap-1 grow">
                                <div className="flex flex-row gap-2 items-center">
                                    <PhoneIcon className="w-4 h-4 text-gray-600" />
                                    <p className="text-sm text-gray-600">{selectedFactory.contact?.phone_number || 'No phone number available'}</p>
                                </div>

                                <div className="flex flex-row gap-2 items-center">
                                    <Smartphone className="w-4 h-4 text-gray-600" />
                                    <p className="text-sm text-gray-600">{selectedFactory.contact?.mobile_number || 'No mobile number available'}</p>
                                </div>
                            </div>        
                        </div>
                        )}
                        </div>
                    ) : (
                        <div className="space-y-1 min-h-[150px] flex flex-col justify-center items-center">
                            <div className="text-center py-2">
                                <Factory className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 mb-3">
                                    No factory selected
                                </p>
                            </div>
                            <Button 
                                className="bg-purple-500 hover:bg-purple-300 cursor-pointer"
                                onClick={handleOpenSearch}
                            >
                                <CirclePlus className="h-4 w-4 text-white" />
                                Add Factory
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Factory Search Dialog */}
            {showSearch && 
                <Dialog open={showSearch} onOpenChange={handleCloseSearch}>
                <DialogContent className="sm:max-w-2xl h-[50vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Select Factory
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search factories by name, industry, or type..."
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
                            {loading && factories.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    <span className="ml-2 text-gray-600">Loading factories...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <p className="text-red-600">Error loading factories</p>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-2"
                                        onClick={() => handleSearchTermChange(searchTerm)}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            ) : factories.length === 0 ? (
                                <div className="text-center py-8">
                                    <Factory className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">
                                        {searchTerm.trim() ? 'No factories found' : 'Start typing to search factories'}
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
                                                {visibleFactories.map((factory, index) => 
                                                    renderFactoryItem(factory, index, startIndex + index)
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {visibleFactories.map((factory, index) => renderFactoryItem(factory, index))}
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
                                    {!hasNextPage && factories.length > 0 && !isSearching && (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500 text-sm">
                                                Showing all {factories.length} factories
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
    );
};

export default FactorySelectCard; 
