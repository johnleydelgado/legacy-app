'use client';

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export type GenericSortOrder = 'ASC' | 'DESC';

export interface SortableHeaderProps<T extends string> {
  field: T;
  label: string;
  currentSort?: Record<string, GenericSortOrder> | { [K in T]?: GenericSortOrder };
  onSort: (field: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Generic sortable header component that works with any sort field type
export const SortableHeader = <T extends string>({
  field,
  label,
  currentSort,
  onSort,
  className = "text-left font-medium text-gray-600 px-3 py-3 cursor-pointer hover:bg-gray-100 transition-colors",
  style,
}: SortableHeaderProps<T>) => {
  const currentOrder = currentSort?.[field] as GenericSortOrder | undefined;
  
  const handleSort = () => {
    onSort(field);
  };

  const getSortIcon = () => {
    if (currentOrder === 'ASC') {
      return <ChevronUp className="w-4 h-4 text-blue-600" />;
    } else if (currentOrder === 'DESC') {
      return <ChevronDown className="w-4 h-4 text-blue-600" />;
    }
    return (
      <div className="flex flex-col">
        <ChevronUp className="h-3 w-3 text-gray-400" />
        <ChevronDown className="h-3 w-3 -mt-1 text-gray-400" />
      </div>
    );
  };

  return (
    <th 
      className={className}
      style={style}
      onClick={handleSort}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {getSortIcon()}
      </div>
    </th>
  );
}; 
