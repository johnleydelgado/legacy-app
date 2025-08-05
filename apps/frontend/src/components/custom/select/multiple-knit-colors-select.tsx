'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Palette } from 'lucide-react';

interface KnitColor {
  name: string;
  fk_yarn_id: number;
  description?: string;
}

interface MultipleKnitColorsSelectProps {
  availableYarns: Array<{ pk_yarn_id: number; yarn_color: string; color_code: string }>;
  value: KnitColor[];
  onChange: (colors: KnitColor[]) => void;
  className?: string;
}

export function MultipleKnitColorsSelect({ 
  availableYarns, 
  value, 
  onChange,
  className 
}: MultipleKnitColorsSelectProps) {
  const addKnitColor = () => {
    onChange([...value, { name: '', fk_yarn_id: 0, description: '' }]);
  };

  const removeKnitColor = (index: number) => {
    const newColors = value.filter((_, i) => i !== index);
    onChange(newColors);
  };

  const updateKnitColor = (index: number, field: keyof KnitColor, newValue: string | number) => {
    const newColors = [...value];
    newColors[index] = { ...newColors[index], [field]: newValue };
    onChange(newColors);
  };

  const getYarnDetails = (yarnId: number) => {
    return availableYarns.find(yarn => yarn.pk_yarn_id === yarnId);
  };

  return (
    <div className={className}>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-gray-900">Knit Colors</h4>
        </div>
        <Button 
          type="button" 
          onClick={addKnitColor} 
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Compact Colors List */}
      <div className="space-y-2">
        {value.map((color, index) => {
          const selectedYarn = getYarnDetails(color.fk_yarn_id);
          
          return (
            <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50/30 relative">
              {/* Remove Button */}
              <Button
                type="button"
                onClick={() => removeKnitColor(index)}
                size="sm"
                variant="ghost"
                className="absolute top-1 right-1 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Compact Form Fields */}
              <div className="grid grid-cols-2 gap-3 pr-8">
                {/* Name Field */}
                <div>
                  <Label htmlFor={`knit-name-${index}`} className="text-xs font-medium text-gray-600 mb-1 block">
                    Name *
                  </Label>
                  <Input
                    id={`knit-name-${index}`}
                    value={color.name}
                    onChange={(e) => updateKnitColor(index, 'name', e.target.value)}
                    placeholder="Primary Navy"
                    className="h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Yarn Selection */}
                <div>
                  <Label htmlFor={`knit-yarn-${index}`} className="text-xs font-medium text-gray-600 mb-1 block">
                    Yarn *
                  </Label>
                  <Select
                    value={color.fk_yarn_id.toString()}
                    onValueChange={(value) => updateKnitColor(index, 'fk_yarn_id', parseInt(value))}
                  >
                    <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select yarn" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYarns.map((yarn) => (
                        <SelectItem key={yarn.pk_yarn_id} value={yarn.pk_yarn_id.toString()}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full border border-gray-300" 
                              style={{ backgroundColor: yarn.color_code }}
                            />
                            <span className="text-sm">{yarn.yarn_color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Selected Yarn Preview */}
              {selectedYarn && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                  <div 
                    className="w-2 h-2 rounded-full border" 
                    style={{ backgroundColor: selectedYarn.color_code }}
                  />
                  <span>{selectedYarn.yarn_color}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Compact Empty State */}
        {value.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-2">No knit colors added</p>
            <Button 
              type="button" 
              onClick={addKnitColor}
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Knit Color
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}