'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Package, DollarSign, Scale } from 'lucide-react';

interface PackagingSelection {
  fk_packaging_id: number;
}

interface PackagingOption {
  pk_packaging_id: number;
  name: string;
  type?: string;
  dimensions?: string;
  weight_capacity?: number;
  unit?: string;
  cost?: number;
}

interface MultiplePackagingSelectProps {
  availablePackaging: PackagingOption[];
  value: PackagingSelection[];
  onChange: (packaging: PackagingSelection[]) => void;
  className?: string;
}

export function MultiplePackagingSelect({ 
  availablePackaging, 
  value, 
  onChange,
  className 
}: MultiplePackagingSelectProps) {
  const addPackaging = () => {
    onChange([...value, { fk_packaging_id: 0 }]);
  };

  const removePackaging = (index: number) => {
    const newPackaging = value.filter((_, i) => i !== index);
    onChange(newPackaging);
  };

  const updatePackaging = (index: number, newValue: number) => {
    const newPackaging = [...value];
    newPackaging[index] = { fk_packaging_id: newValue };
    onChange(newPackaging);
  };

  const getPackagingDetails = (packagingId: number) => {
    return availablePackaging.find(p => p.pk_packaging_id === packagingId);
  };

  const getUsedPackagingIds = () => {
    return value.map(p => p.fk_packaging_id).filter(id => id > 0);
  };


  return (
    <div className={className}>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-purple-600" />
          <h4 className="text-sm font-semibold text-gray-900">Packaging</h4>
        </div>
        <Button 
          type="button" 
          onClick={addPackaging} 
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Compact Packaging List */}
      <div className="space-y-2">
        {value.map((packaging, index) => {
          const packageDetails = getPackagingDetails(packaging.fk_packaging_id);
          const usedIds = getUsedPackagingIds();
          
          return (
            <div key={index} className="border border-purple-200 rounded-lg p-3 bg-purple-50/30 relative">
              {/* Remove Button */}
              <Button
                type="button"
                onClick={() => removePackaging(index)}
                size="sm"
                variant="ghost"
                className="absolute top-1 right-1 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Packaging Selection */}
              <div className="pr-8">
                <Label htmlFor={`packaging-${index}`} className="text-xs font-medium text-gray-600 mb-1 block">
                  Packaging Type *
                </Label>
                <Select
                  value={packaging.fk_packaging_id.toString()}
                  onValueChange={(value) => updatePackaging(index, parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Select packaging" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePackaging.map((pkg) => (
                      <SelectItem 
                        key={pkg.pk_packaging_id} 
                        value={pkg.pk_packaging_id.toString()}
                        disabled={usedIds.includes(pkg.pk_packaging_id) && pkg.pk_packaging_id !== packaging.fk_packaging_id}
                      >
                        <span className="font-medium text-sm">{pkg.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}

        {/* Compact Empty State */}
        {value.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">No packaging added</p>
            <Button 
              type="button" 
              onClick={addPackaging}
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Packaging
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}