import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// Import from the correct path where the hook is defined
import { useInfiniteStatuses } from "@/hooks/useStatus";
import {StatusItem} from "../../../services/status/types";


export interface InfiniteStatusSelectProps {
    onStatusSelect: (statusId: number, statusText?: string) => void;
    selectedStatusId?: number;
    placeholder?: string;
    platform?: string;
    process?: string;
    className?: string;
    disabled?: boolean;
}


export default function InfiniteStatusSelect(
    {
        onStatusSelect,
        selectedStatusId,
        placeholder = "Select a status",
        platform,
        process,
        className,
        disabled = false,
    }: InfiniteStatusSelectProps) {
    // Determine the initially selected status text
    const [selectedStatusText, setSelectedStatusText] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");

    // Get reference to the scroll container
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Track if the dropdown is open
    const [isOpen, setIsOpen] = useState(false);

    // Store previous filter values to prevent unnecessary API calls
    const prevFiltersRef = useRef({ platform, process });

    // Use our infinite statuses hook with initial filters
    const {
        items,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        loadMore,
        refresh,
        updateParams
    } = useInfiniteStatuses({
        limit: 20,
        platform,
        process,
    });

    // Update filters only when props actually change
    useEffect(() => {
        const prevFilters = prevFiltersRef.current;

        // Only update if the filters have actually changed
        if (prevFilters.platform !== platform || prevFilters.process !== process) {
            updateParams({
                platform,
                process,
            });

            // Update the ref with current values
            prevFiltersRef.current = { platform, process };
        }
    }, [platform, process, updateParams]);

    // Find and set the selected status text when items load or selectedStatusId changes
    useEffect(() => {
        if (selectedStatusId && items.length > 0) {
            const selectedStatus = items.find(item => item.id === selectedStatusId);
            if (selectedStatus) {
                setSelectedStatusText(`${selectedStatus.process} - ${selectedStatus.status}`);
                setSelectedColor(selectedStatus.color);
            }
        }
    }, [selectedStatusId, items]);

    // Handle scroll to implement infinite loading
    const handleScroll = () => {
        if (!scrollContainerRef.current || isLoadingMore || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

        // If scrolled to bottom (with a small threshold)
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            loadMore();
        }
    };

    // Handle selecting a status
    const handleSelectStatus = (value: string) => {
        const statusId = parseInt(value, 10);
        onStatusSelect(statusId);

        // Update the displayed text and color
        const selectedStatus = items.find(item => item.id === statusId);
        if (selectedStatus) {
            setSelectedStatusText(`${selectedStatus.process} - ${selectedStatus.status}`);
            setSelectedColor(selectedStatus.color);
            onStatusSelect(statusId, `${selectedStatus.process} - ${selectedStatus.status}`);
        }
    };

    return (
        <Select
            onValueChange={handleSelectStatus}
            value={selectedStatusId?.toString()}
            onOpenChange={(open) => setIsOpen(open)}
            disabled={disabled}
        >
            <SelectTrigger className={cn("text-white", className)} style={{ backgroundColor: selectedColor }}>
                <SelectValue placeholder={placeholder}>
                    {selectedStatusText}
                </SelectValue>
            </SelectTrigger>

            <SelectContent
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="max-h-[300px]"
            >
                {error ? (
                    <div className="p-2 text-red-500">Error loading statuses: {error.message}</div>
                ) : isLoading && items.length === 0 ? (
                    <div className="p-2 text-center">Loading statuses...</div>
                ) : items.length === 0 ? (
                    <div className="p-2 text-center">No statuses found</div>
                ) : (
                    <>
                        {/* Group statuses by platform */}
                        {Array.from(new Set(items.map(item => item.platform))).map(platform => (
                            <SelectGroup key={platform}>
                                {items
                                    .filter(item => item.platform === platform)
                                    .map(status => (
                                        <SelectItem
                                            key={status.id}
                                            value={status.id.toString()}
                                            className="flex items-center rounded-none text-white"
                                            style={{ backgroundColor: status.color }}
                                        >
                                            <div className="flex items-center">
                                                <span>{status.process} - {status.status}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                            </SelectGroup>
                        ))}

                        {/* Loading indicator */}
                        {isLoadingMore && (
                            <div className="p-2 text-center text-sm text-gray-500">
                                Loading more...
                            </div>
                        )}

                        {/* No more data indicator */}
                        {!hasMore && items.length > 0 && (
                            <div className="p-2 text-center text-xs text-gray-500">
                                No more statuses
                            </div>
                        )}
                    </>
                )}
            </SelectContent>
        </Select>
    );
}
