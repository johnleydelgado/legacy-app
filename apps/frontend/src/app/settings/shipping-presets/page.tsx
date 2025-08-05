"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Ruler, Scale, Settings } from "lucide-react";
import DimensionPresetsList from "@/components/pages/settings/shipping-presets/dimension-presets-list";
import WeightPresetsList from "@/components/pages/settings/shipping-presets/weight-presets-list";

const ShippingPresetsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dimensions");

  return (
    <div className="space-y-8 pb-32">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Shipping Presets
            </h1>
            <p className="text-gray-600">
              Manage dimension and weight presets for shipping packages
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Preset Management
          </CardTitle>
          <CardDescription>
            Create and manage shipping dimension and weight presets for
            consistent package configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-6 pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="dimensions"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  <Ruler className="h-4 w-4 mr-2" />
                  Dimension Presets
                </TabsTrigger>
                <TabsTrigger
                  value="weights"
                  className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Weight Presets
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dimensions" className="m-0">
              <div className="px-6 pb-6">
                <DimensionPresetsList />
              </div>
            </TabsContent>

            <TabsContent value="weights" className="m-0">
              <div className="px-6 pb-6">
                <WeightPresetsList />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-600" />
            How to Use Shipping Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Dimension Presets</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Create standard box sizes for common shipping needs
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Support both metric (cm) and imperial (inches) units
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Include descriptions for easy identification
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Weight Presets</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  Define common package weights for quick selection
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  Support both metric (kg) and imperial (lbs) units
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  Toggle active/inactive status for organization
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingPresetsPage;
