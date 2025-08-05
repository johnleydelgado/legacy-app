'use client';
import * as React from 'react';
import {useInfiniteProductsByCategory} from "../../../../../hooks/useProducts2";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "../../../../ui/select";
import {AlertCircle, Loader2, Package, Search} from "lucide-react";
import {Input} from "../../../../ui/input";
import {Alert, AlertDescription} from "../../../../ui/alert";

interface ItemProductsTypes {
    id: number;
    name: string;
    index: number;
    sku?: string;
}

interface InfiniteProductSelectProps {
    categoryId: number | null;
    value?: ItemProductsTypes;
    index?: number;
    onValueChange?: (value: ItemProductsTypes) => void;
    // onValueChange?: React.Dispatch<React.SetStateAction<ItemProductsTypes>>;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    enableSearch?: boolean;
}

const InfiniteProductSelect: React.FC<InfiniteProductSelectProps> = (
    {
        categoryId,
        value,
        index,
        onValueChange,
        placeholder = "Select a product...",
        searchPlaceholder = "Search products...",
        disabled = false,
        className = "",
        enableSearch = true
    }) => {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const scrollRef = React.useRef(null);
    const loadMoreTriggerRef = React.useRef(null);

    // Use the infinite products by category hook with search
    const {
        products,
        loading,
        loadingMore,
        error,
        hasNextPage,
        loadMore,
        isEmpty
    } = useInfiniteProductsByCategory(categoryId, {
        search: searchQuery,
        limit: 5
    });

    // Intersection Observer for infinite scroll
    React.useEffect(() => {
        if (!loadMoreTriggerRef.current || !isOpen) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasNextPage && !loadingMore) {
                    loadMore();
                }
            },
            {
                root: scrollRef.current,
                rootMargin: '20px',
                threshold: 0.1
            }
        );

        observer.observe(loadMoreTriggerRef.current);

        return () => observer.disconnect();
    }, [hasNextPage, loadingMore, loadMore, isOpen]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    const handleValueChange = (newValue: string) => {
        const selectedData = products.filter(data => data.pk_product_id === parseInt(newValue, 10))

        if (selectedData.length > 0) {
            if (onValueChange) {
                onValueChange({
                    index: index || 0, 
                    id: parseInt(newValue, 10), 
                    name: selectedData[0].product_name,
                    sku: selectedData[0].sku || ""
                })
            }
        }
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <Select
                value={value?.id?.toString() || ""}
                onValueChange={handleValueChange}
                disabled={disabled || !categoryId || categoryId === -1}
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <SelectTrigger className={`${className}`}>
                    <SelectValue placeholder={placeholder}>
                        {value?.name || placeholder}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent className="w-full max-h-80">
                    {/* Search Input */}
                    {enableSearch && (
                        <div className="p-2 border-b">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={searchPlaceholder}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="pl-8 pr-8"
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Scrollable Content */}
                    <div
                        ref={scrollRef}
                        className="max-h-60 overflow-y-auto"
                    >
                        {/* No Category Selected */}
                        {!categoryId && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Package className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Please select a category first
                                </p>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && categoryId && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">Loading products...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <Alert className="m-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Empty State */}
                        {isEmpty && !loading && categoryId && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Package className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? 'No products found' : 'No products in this category'}
                                </p>
                                {searchQuery && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Try adjusting your search terms
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Product Items */}
                        {products.map((product) => (
                            <SelectItem
                                key={product.pk_product_id}
                                value={product.pk_product_id.toString()}
                                className="flex flex-col items-start"
                            >
                                <div className="flex flex-col w-full">
                                    <div className="text-xs">{product.product_name}</div>
                                </div>
                            </SelectItem>
                        ))}

                        {/* Load More Trigger */}
                        {hasNextPage && categoryId && (
                            <div
                                ref={loadMoreTriggerRef}
                                className="flex items-center justify-center py-4"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-sm text-muted-foreground">
                      Loading more products...
                    </span>
                                    </>
                                ) : (
                                    <button
                                        onClick={loadMore}
                                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Load more products
                                    </button>
                                )}
                            </div>
                        )}

                        {/* End of Results */}
                        {!hasNextPage && products.length > 0 && (
                            <div className="text-center py-4 text-xs text-muted-foreground border-t">
                                You've reached the end of the list
                            </div>
                        )}
                    </div>
                </SelectContent>
            </Select>
        </div>
    );
};

export default InfiniteProductSelect;
