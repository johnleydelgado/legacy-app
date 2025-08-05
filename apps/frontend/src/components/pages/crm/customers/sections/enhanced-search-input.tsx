'use client';

import { useState, ChangeEvent, KeyboardEvent, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";

interface EnhancedSearchInputProps {
    /** Placeholder text for the input */
    placeholder?: string;
    /** Function to handle search */
    onSearch?: (query: string) => void;
    /** Function called when input value changes */
    onQueryChange?: (query: string) => void;
    /** Initial value */
    initialValue?: string;
    /** Additional CSS classes */
    className?: string;
    /** Whether search is currently loading */
    isLoading?: boolean;
    /** Whether search is debouncing */
    isDebouncing?: boolean;
    /** Whether to search as the user types */
    searchAsYouType?: boolean;
    /** Whether to clear results when input is empty */
    clearOnEmpty?: boolean;
}

export default function EnhancedSearchInput(
    {
        placeholder = "Search customers...",
        onSearch,
        onQueryChange,
        initialValue = "",
        className = "",
        isLoading = false,
        isDebouncing = false,
        searchAsYouType = true,
        clearOnEmpty = true,
    }: EnhancedSearchInputProps) {

    const [value, setValue] = useState<string>(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update internal value if initialValue changes
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        if (onQueryChange) {
            onQueryChange(newValue);
        }

        if (searchAsYouType) {
            if (newValue.trim() === "" && clearOnEmpty && onSearch) {
                onSearch("");
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (onSearch) {
                onSearch(value);
            }
        }
    };

    const handleClear = () => {
        setValue("");
        if (onQueryChange) {
            onQueryChange("");
        }
        if (onSearch) {
            onSearch("");
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
                ref={inputRef}
                className={`pl-10 pr-10 ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            {value && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {(isLoading || isDebouncing) ? (
                        <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
                    ) : (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
