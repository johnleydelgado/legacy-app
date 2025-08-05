'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultipleKnitColorsSelect } from '@/components/custom/select/multiple-knit-colors-select';
import { MultipleBodyColorsSelect } from '@/components/custom/select/multiple-body-colors-select';
import { MultiplePackagingSelect } from '@/components/custom/select/multiple-packaging-select';

interface ProductionOrderItemFormData {
  fk_product_id: number;
  fk_category_id: number;
  item_name: string;
  item_description: string;
  item_number: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  knit_colors: Array<{
    name: string;
    fk_yarn_id: number;
    description?: string;
  }>;
  body_colors: Array<{
    name: string;
    fk_yarn_id: number;
    description?: string;
  }>;
  packaging: Array<{
    fk_packaging_id: number;
  }>;
}

interface ProductionOrderItemFormProps {
  initialData?: Partial<ProductionOrderItemFormData>;
  availableYarns: Array<{ pk_yarn_id: number; yarn_color: string; color_code: string }>;
  availablePackaging: Array<{
    pk_packaging_id: number;
    name: string;
    type?: string;
    dimensions?: string;
    weight_capacity?: number;
    unit?: string;
    cost?: number;
  }>;
  onSubmit: (data: ProductionOrderItemFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ProductionOrderItemForm({
  initialData,
  availableYarns,
  availablePackaging,
  onSubmit,
  onCancel,
  isLoading = false
}: ProductionOrderItemFormProps) {
  const [formData, setFormData] = useState<ProductionOrderItemFormData>({
    fk_product_id: 0,
    fk_category_id: 0,
    item_name: '',
    item_description: '',
    item_number: '',
    quantity: 1,
    unit_price: 0,
    tax_rate: 0,
    knit_colors: [],
    body_colors: [],
    packaging: [],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof ProductionOrderItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required';
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (formData.unit_price <= 0) {
      newErrors.unit_price = 'Unit price must be greater than 0';
    }

    // Validate knit colors
    formData.knit_colors.forEach((color, index) => {
      if (!color.name.trim()) {
        newErrors[`knit_colors.${index}.name`] = 'Color name is required';
      }
      if (color.fk_yarn_id <= 0) {
        newErrors[`knit_colors.${index}.yarn`] = 'Yarn selection is required';
      }
    });

    // Validate body colors
    formData.body_colors.forEach((color, index) => {
      if (!color.name.trim()) {
        newErrors[`body_colors.${index}.name`] = 'Color name is required';
      }
      if (color.fk_yarn_id <= 0) {
        newErrors[`body_colors.${index}.yarn`] = 'Yarn selection is required';
      }
    });

    // Validate packaging
    formData.packaging.forEach((pkg, index) => {
      if (pkg.fk_packaging_id <= 0) {
        newErrors[`packaging.${index}.type`] = 'Packaging type is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const totalAmount = formData.quantity * formData.unit_price;
  const taxAmount = totalAmount * (formData.tax_rate / 100);
  const grandTotal = totalAmount + taxAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Item Information */}
      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => updateField('item_name', e.target.value)}
                className={errors.item_name ? 'border-red-500' : ''}
              />
              {errors.item_name && <p className="text-red-500 text-sm mt-1">{errors.item_name}</p>}
            </div>

            <div>
              <Label htmlFor="item_number">Item Number</Label>
              <Input
                id="item_number"
                value={formData.item_number}
                onChange={(e) => updateField('item_number', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="item_description">Description</Label>
              <Textarea
                id="item_description"
                value={formData.item_description}
                onChange={(e) => updateField('item_description', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateField('quantity', parseInt(e.target.value) || 0)}
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => updateField('unit_price', parseFloat(e.target.value) || 0)}
                className={errors.unit_price ? 'border-red-500' : ''}
              />
              {errors.unit_price && <p className="text-red-500 text-sm mt-1">{errors.unit_price}</p>}
            </div>

            <div>
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tax_rate}
                onChange={(e) => updateField('tax_rate', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knit Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Knit Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <MultipleKnitColorsSelect
            availableYarns={availableYarns}
            value={formData.knit_colors}
            onChange={(colors) => updateField('knit_colors', colors)}
          />
        </CardContent>
      </Card>

      {/* Body Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Body Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <MultipleBodyColorsSelect
            availableYarns={availableYarns}
            value={formData.body_colors}
            onChange={(colors) => updateField('body_colors', colors)}
          />
        </CardContent>
      </Card>

      {/* Packaging */}
      <Card>
        <CardHeader>
          <CardTitle>Packaging Options</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiplePackagingSelect
            availablePackaging={availablePackaging}
            value={formData.packaging}
            onChange={(packaging) => updateField('packaging', packaging)}
          />
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Item'}
        </Button>
      </div>
    </form>
  );
}