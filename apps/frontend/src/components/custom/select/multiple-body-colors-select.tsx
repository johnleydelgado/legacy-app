'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, CircleDot } from 'lucide-react';

interface BodyColor {
  name: string;
  fk_yarn_id: number;
  description?: string;
}

interface MultipleBodyColorsSelectProps {
  availableYarns: Array<{ pk_yarn_id: number; yarn_color: string; color_code: string }>;
  value: BodyColor[];
  onChange: (colors: BodyColor[]) => void;
  className?: string;
}

export function MultipleBodyColorsSelect({ 
  availableYarns, 
  value, 
  onChange,
  className 
}: MultipleBodyColorsSelectProps) {
  const addBodyColor = () => {
    onChange([...value, { name: '', fk_yarn_id: 0, description: '' }]);
  };

  const removeBodyColor = (index: number) => {
    const newColors = value.filter((_, i) => i !== index);
    onChange(newColors);
  };

  const updateBodyColor = (index: number, field: keyof BodyColor, newValue: string | number) => {
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
          <CircleDot className="h-4 w-4 text-green-600" />
          <h4 className="text-sm font-semibold text-gray-900">Body Colors</h4>
        </div>
        <Button 
          type="button" 
          onClick={addBodyColor} 
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs border-green-300 text-green-600 hover:bg-green-50"
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
            <div key={index} className="border border-green-200 rounded-lg p-3 bg-green-50/30 relative">
              {/* Remove Button */}
              <Button
                type="button"
                onClick={() => removeBodyColor(index)}
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
                  <Label htmlFor={`body-name-${index}`} className="text-xs font-medium text-gray-600 mb-1 block">
                    Name *
                  </Label>
                  <Input
                    id={`body-name-${index}`}
                    value={color.name}
                    onChange={(e) => updateBodyColor(index, 'name', e.target.value)}
                    placeholder="Base White"
                    className="h-8 text-sm border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Yarn Selection */}
                <div>
                  <Label htmlFor={`body-yarn-${index}`} className="text-xs font-medium text-gray-600 mb-1 block">
                    Yarn *
                  </Label>
                  <Select
                    value={color.fk_yarn_id.toString()}
                    onValueChange={(value) => updateBodyColor(index, 'fk_yarn_id', parseInt(value))}
                  >
                    <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-green-500 focus:ring-green-500">
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
            <p className="text-xs text-gray-500 mb-2">No body colors added</p>
            <Button 
              type="button" 
              onClick={addBodyColor}
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Body Color
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}