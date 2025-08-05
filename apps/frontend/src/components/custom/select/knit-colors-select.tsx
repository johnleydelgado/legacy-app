"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
const mockKnitColors = [
  { id: 1, name: "Navy Blue Knit", yarnColor: "Navy Blue", colorCode: "#001f3f" },
  { id: 2, name: "Heather Gray Knit", yarnColor: "Heather Gray", colorCode: "#87CEEB" },
  { id: 3, name: "Forest Green Knit", yarnColor: "Forest Green", colorCode: "#228B22" },
  { id: 4, name: "Burgundy Knit", yarnColor: "Burgundy", colorCode: "#800020" },
  { id: 5, name: "Charcoal Knit", yarnColor: "Charcoal", colorCode: "#36454F" },
];

interface KnitColorsSelectProps {
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  className?: string;
}

export function KnitColorsSelect({
  selectedIds,
  onChange,
  placeholder = "Select knit colors...",
  className,
}: KnitColorsSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedColors = mockKnitColors.filter(color => selectedIds.includes(color.id));

  const handleSelect = (colorId: number) => {
    if (selectedIds.includes(colorId)) {
      onChange(selectedIds.filter(id => id !== colorId));
    } else {
      onChange([...selectedIds, colorId]);
    }
  };

  const handleRemove = (colorId: number) => {
    onChange(selectedIds.filter(id => id !== colorId));
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
              {selectedColors.length > 0
                ? `${selectedColors.length} knit color${selectedColors.length > 1 ? 's' : ''} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search knit colors..." />
            <CommandEmpty>No knit colors found.</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-y-auto">
              {mockKnitColors.map((color) => (
                <CommandItem
                  key={color.id}
                  value={color.name}
                  onSelect={() => handleSelect(color.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedIds.includes(color.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.colorCode }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{color.name}</span>
                      <span className="text-xs text-gray-500">{color.yarnColor}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Colors Display */}
      {selectedColors.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedColors.map((color) => (
            <Badge
              key={color.id}
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color.colorCode }}
              />
              {color.name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={() => handleRemove(color.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}