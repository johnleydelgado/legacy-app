"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings as SettingsIcon,
  Mail,
  Package,
  Ruler,
  Scale,
} from "lucide-react";
import Link from "next/link";
import {
  PAGE_EMAIL_NOTIFICATION_URL,
  PAGE_SHIPPING_PRESETS_URL,
} from "@/constants/pageUrls";

const Settings = () => {
  return (
    <div className="space-y-8 pb-32">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
              Manage your application settings and configurations
            </p>
          </div>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Email Notifications */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={PAGE_EMAIL_NOTIFICATION_URL}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Email Notifications
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Configure email notification settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage email templates, recipients, and notification preferences
                for your shipping operations.
              </p>
              <Button variant="outline" className="w-full">
                Manage Notifications
              </Button>
            </CardContent>
          </Link>
        </Card>

        {/* Shipping Presets */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={PAGE_SHIPPING_PRESETS_URL}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Shipping Presets
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Manage dimension and weight presets
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Ruler className="h-4 w-4 text-blue-500" />
                  <span>Dimension presets for package sizes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Scale className="h-4 w-4 text-green-500" />
                  <span>Weight presets for common packages</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Manage Presets
              </Button>
            </CardContent>
          </Link>
        </Card>

        {/* Coming Soon */}
        <Card className="opacity-60">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <SettingsIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-400">
                  More Settings
                </CardTitle>
                <CardDescription className="text-sm text-gray-400">
                  Additional configuration options
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              More settings and configuration options will be available soon.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-gray-600" />
            Settings Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Configure email templates for shipping notifications
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Set up recipient lists and delivery schedules
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Customize notification triggers and conditions
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Shipping Presets</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  Create standard dimension presets for common package sizes
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  Define weight presets for quick package configuration
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  Support both metric and imperial measurement units
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
