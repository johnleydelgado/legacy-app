'use client';

import React, { useState } from 'react';
import { MultipleKnitColorsSelect } from '@/components/custom/select/multiple-knit-colors-select';
import { MultipleBodyColorsSelect } from '@/components/custom/select/multiple-body-colors-select';
import { MultiplePackagingSelect } from '@/components/custom/select/multiple-packaging-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export function ModernProductionOrderUIShowcase() {
  // Mock data
  const mockYarns = [
    { pk_yarn_id: 1, yarn_color: 'Navy Blue', color_code: '#1B365D' },
    { pk_yarn_id: 2, yarn_color: 'Heather Gray', color_code: '#8B9DC3' },
    { pk_yarn_id: 3, yarn_color: 'Forest Green', color_code: '#228B22' },
    { pk_yarn_id: 4, yarn_color: 'Pure White', color_code: '#FFFFFF' },
    { pk_yarn_id: 5, yarn_color: 'Cream', color_code: '#F5F5DC' },
    { pk_yarn_id: 6, yarn_color: 'Burgundy', color_code: '#800020' },
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

  // Form state
  const [knitColors, setKnitColors] = useState([
    { name: 'Primary Navy', fk_yarn_id: 1 }
  ]);
  
  const [bodyColors, setBodyColors] = useState([
    { name: 'Base White', fk_yarn_id: 4 }
  ]);
  
  const [packaging, setPackaging] = useState([
    { fk_packaging_id: 1 }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Modern Production Order UI</h1>
              <p className="text-lg text-gray-600 mt-2">Enhanced design for multiple colors and packaging selection</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">✨ Modern Design</Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">🎨 Color-Coded</Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">📦 Smart Packaging</Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">💰 Cost Tracking</Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="text-2xl text-gray-800">Production Item Configuration</CardTitle>
            <p className="text-gray-600">Configure colors and packaging for your production order item</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-12">
            {/* Knit Colors Section */}
            <MultipleKnitColorsSelect
              availableYarns={mockYarns}
              value={knitColors}
              onChange={setKnitColors}
            />

            {/* Body Colors Section */}
            <MultipleBodyColorsSelect
              availableYarns={mockYarns}
              value={bodyColors}
              onChange={setBodyColors}
            />

            {/* Packaging Section */}
            <MultiplePackagingSelect
              availablePackaging={mockPackaging}
              value={packaging}
              onChange={setPackaging}
            />
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6 bg-blue-50 border-blue-200">
            <div className="text-blue-600 mb-3">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Dynamic Form Arrays</h3>
            <p className="text-sm text-gray-600">Add/remove multiple colors and packaging options dynamically</p>
          </Card>

          <Card className="text-center p-6 bg-green-50 border-green-200">
            <div className="text-green-600 mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Validation</h3>
            <p className="text-sm text-gray-600">Real-time validation with duplicate prevention and required field checking</p>
          </Card>

          <Card className="text-center p-6 bg-purple-50 border-purple-200">
            <div className="text-purple-600 mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Visual Feedback</h3>
            <p className="text-sm text-gray-600">Color previews, yarn selection, and packaging details at a glance</p>
          </Card>

          <Card className="text-center p-6 bg-orange-50 border-orange-200">
            <div className="text-orange-600 mb-3">💰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Cost Calculation</h3>
            <p className="text-sm text-gray-600">Automatic cost calculation for packaging with quantity multipliers</p>
          </Card>
        </div>

        {/* Data Structure Preview */}
        <Card className="bg-gray-900 text-green-400 font-mono">
          <CardHeader>
            <CardTitle className="text-green-300">💾 Data Structure Preview</CardTitle>
            <p className="text-green-200">See how the form data is structured for API submission</p>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-x-auto">
{JSON.stringify({
  knit_colors: knitColors,
  body_colors: bodyColors,
  packaging: packaging
}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Design Improvements */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900 flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Key Design Improvements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-indigo-900">🎨 Visual Enhancements</h4>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li>• Card-based layout with colored left borders</li>
                  <li>• Icon-driven section headers with descriptions</li>
                  <li>• Hover effects and smooth transitions</li>
                  <li>• Color swatches for yarn selection</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-indigo-900">⚡ User Experience</h4>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li>• Contextual placeholders (e.g. "Primary Navy")</li>
                  <li>• Real-time cost calculations</li>
                  <li>• Better empty states with call-to-action</li>
                  <li>• Improved spacing and typography</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}