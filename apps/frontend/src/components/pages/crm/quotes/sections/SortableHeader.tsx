'use client';

import * as React from "react";

import { QuoteSort, QuoteSortField, SortOrder } from "@/services/quotes/types";
import { ChevronDown, ChevronUp } from "lucide-react";


// Helper component for sortable table headers
const SortableHeader: React.FC<{
    field: QuoteSortField;
    label: string;
    currentSort?: Partial<QuoteSort>;
    onSort: (field: QuoteSortField, order: SortOrder) => void;
  }> = ({ field, label, currentSort, onSort }) => {
    const currentOrder = currentSort?.[field];
    
    const handleSort = () => {
      const newOrder: SortOrder = currentOrder === 'ASC' ? 'DESC' : 'ASC';
      onSort(field, newOrder);
    };
  
    return (
      <th 
        className="text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        style={{
          padding: '12px',
          fontWeight: '500',
          color: '#6C757D',
          backgroundColor: '#F5F5F5',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
        onClick={handleSort}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <div className="flex flex-col">
            <ChevronUp 
              className={`h-3 w-3 ${currentOrder === 'ASC' ? 'text-blue-600' : 'text-gray-400'}`} 
            />
            <ChevronDown 
              className={`h-3 w-3 -mt-1 ${currentOrder === 'DESC' ? 'text-blue-600' : 'text-gray-400'}`} 
            />
          </div>
        </div>
      </th>
    );
  };
    
export { 
    SortableHeader 
};
