'use client';

import React, { useState } from 'react';
import { ProductionOrderItemForm } from '@/components/forms/production-order-item-form';
import { productionOrderItemService } from '@/services/production-order-items.service';
import { toast } from 'sonner';

// Example usage of the multiple selection components in a production order
export function ProductionOrderMultipleSelectionExample() {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, these would come from API calls
  const mockYarns = [
    { pk_yarn_id: 1, yarn_color: 'Navy Blue', color_code: '#1B365D' },
    { pk_yarn_id: 2, yarn_color: 'Heather Gray', color_code: '#8B9DC3' },
    { pk_yarn_id: 3, yarn_color: 'Forest Green', color_code: '#228B22' },
    { pk_yarn_id: 4, yarn_color: 'Pure White', color_code: '#FFFFFF' },
    { pk_yarn_id: 5, yarn_color: 'Cream', color_code: '#F5F5DC' },
  ];

  const mockPackaging = [
    {
      pk_packaging_id: 1,
      name: 'Standard Poly Bag',
      type: 'Plastic Bag',
      dimensions: '12x18 inches',
      weight_capacity: 500,
      unit: 'g',
      cost: 0.25
    },
    {
      pk_packaging_id: 2,
      name: 'Premium Gift Box',
      type: 'Cardboard Box',
      dimensions: '10x8x3 inches',
      weight_capacity: 1000,
      unit: 'g',
      cost: 2.50
    },
    {
      pk_packaging_id: 3,
      name: 'Eco-Friendly Wrapper',
      type: 'Biodegradable Wrap',
      dimensions: '15x20 inches',
      weight_capacity: 300,
      unit: 'g',
      cost: 0.75
    }
  ];

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    
    try {
      // Transform form data to match API expectations
      const apiData = {
        fk_production_order_id: 1, // This would come from the parent form
        fk_product_id: formData.fk_product_id || 1,
        fk_category_id: formData.fk_category_id || 1,
        item_name: formData.item_name,
        item_description: formData.item_description,
        item_number: formData.item_number,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        tax_rate: formData.tax_rate,
        knit_colors: formData.knit_colors,
        body_colors: formData.body_colors,
        packaging: formData.packaging,
      };

      const result = await productionOrderItemService.createCompleteItem(apiData);
      
      toast.success('Production order item created successfully!');
      console.log('Created item with related data:', result);
      
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create production order item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Production Order Item - Multiple Selection Example</h1>
        <p className="text-gray-600 mt-2">
          This example demonstrates how to handle multiple colors and packaging options for a single production order item.
        </p>
      </div>

      <ProductionOrderItemForm
        availableYarns={mockYarns}
        availablePackaging={mockPackaging}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={{
          item_name: 'Custom Knit Sweater',
          item_description: 'Premium cotton blend sweater with custom branding',
          quantity: 100,
          unit_price: 25.50,
          tax_rate: 8.75,
          // Pre-populate some selections for demo
          knit_colors: [
            { name: 'Primary Navy', fk_yarn_id: 1, description: 'Main body color' }
          ],
          body_colors: [
            { name: 'Base White', fk_yarn_id: 4, description: 'Base layer color' }
          ],
          packaging: [
            { fk_packaging_id: 1 }
          ]
        }}
      />

      {/* Example of how the data structure works */}
      <div className="mt-12 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">How It Works</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">1. Relational Structure</h3>
            <p className="text-sm text-gray-600">
              Each production order item can have multiple knit colors, body colors, and packaging options.
              Each is stored as a separate record with a foreign key reference.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">2. Dynamic Form Arrays</h3>
            <p className="text-sm text-gray-600">
              Users can add/remove multiple colors and packaging options using the "Add" buttons.
              Each selection validates required fields and prevents duplicates where needed.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">3. API Integration</h3>
            <p className="text-sm text-gray-600">
              When saving, the system first creates the main item, then creates all related records in parallel
              for optimal performance.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">4. Data Flow Example</h3>
            <pre className="bg-white p-4 rounded text-xs overflow-x-auto">
{`// Form submits this structure:
{
  item_name: "Custom Knit Sweater",
  quantity: 100,
  unit_price: 25.50,
  knit_colors: [
    { name: "Primary Navy", fk_yarn_id: 1, description: "Main body color" },
    { name: "Accent Gray", fk_yarn_id: 2, description: "Sleeve accents" }
  ],
  body_colors: [
    { name: "Base White", fk_yarn_id: 4, description: "Base layer" }
  ],
  packaging: [
    { fk_packaging_id: 1 },
    { fk_packaging_id: 2 }
  ]
}

// API creates:
// 1. ProductionOrderItem record
// 2. Two ProductionOrdersKnitColors records
// 3. One ProductionOrdersBodyColors record  
// 4. Two ProductionOrdersPackaging records`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}