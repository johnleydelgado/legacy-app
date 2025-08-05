"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Mock data - replace with actual API data
const mockPackaging = [
  { 
    id: 1, 
    name: "Standard Poly Bag", 
    type: "POLY_BAG", 
    dimensions: "12x10 inches",
    cost: 0.15
  },
  { 
    id: 2, 
    name: "Gift Box Small", 
    type: "BOX", 
    dimensions: "8x6x3 inches",
    cost: 2.50
  },
  { 
    id: 3, 
    name: "Bulk Carton", 
    type: "CARTON", 
    dimensions: "20x16x12 inches",
    cost: 5.00
  },
  { 
    id: 4, 
    name: "Eco Bag", 
    type: "BAG", 
    dimensions: "14x12 inches",
    cost: 0.35
  },
];

interface PackagingSelectProps {
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  className?: string;
}

export function PackagingSelect({
  selectedIds,
  onChange,
  placeholder = "Select packaging...",
  className,
}: PackagingSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedPackaging = mockPackaging.filter(pkg => selectedIds.includes(pkg.id));

  const handleSelect = (packagingId: number) => {
    if (selectedIds.includes(packagingId)) {
      onChange(selectedIds.filter(id => id !== packagingId));
    } else {
      onChange([...selectedIds, packagingId]);
    }
  };

  const handleRemove = (packagingId: number) => {
    onChange(selectedIds.filter(id => id !== packagingId));
  };

  const getPackageIcon = (type: string) => {
    switch (type) {
      case 'BOX':
        return '📦';
      case 'BAG':
        return '🛍️';
      case 'POLY_BAG':
        return '🗃️';
      case 'CARTON':
        return '📋';
      default:
        return '📦';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            <span className="truncate">
              {selectedPackaging.length > 0
                ? `${selectedPackaging.length} packaging option${selectedPackaging.length > 1 ? 's' : ''} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search packaging..." />
            <CommandEmpty>No packaging options found.</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-y-auto">
              {mockPackaging.map((pkg) => (
                <CommandItem
                  key={pkg.id}
                  value={pkg.name}
                  onSelect={() => handleSelect(pkg.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedIds.includes(pkg.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{getPackageIcon(pkg.type)}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{pkg.name}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{pkg.dimensions}</span>
                        <span>•</span>
                        <span>${pkg.cost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Packaging Display */}
      {selectedPackaging.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedPackaging.map((pkg) => (
            <Badge
              key={pkg.id}
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              <span>{getPackageIcon(pkg.type)}</span>
              {pkg.name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={() => handleRemove(pkg.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}