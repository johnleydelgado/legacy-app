"use client";

import * as React from "react";
import {
  FileText,
  Truck,
  StickyNote,
  Factory as FactoryIcon,
  Loader2,
} from "lucide-react";
import { FactoryTypes } from "./customer-factory-info";

interface FactoryBasedInfoProps {
  factoryData: FactoryTypes | null;
  factoryLoading?: boolean;
}

const FactoryBasedInfo: React.FC<FactoryBasedInfoProps> = ({
  factoryData,
  factoryLoading,
}) => {
  if (!factoryData && !factoryLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Billing Information */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-100 rounded-full p-2">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Billing Information
            </h3>
          </div>
          <div className="text-center py-4">
            <FactoryIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Select a factory to view billing information
            </p>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 rounded-full p-2">
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Shipping Information
            </h3>
          </div>
          <div className="text-center py-4">
            <FactoryIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Select a factory to view shipping information
            </p>
          </div>
        </div>

        {/* Factory Notes */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-orange-100 rounded-full p-2">
              <StickyNote className="h-4 w-4 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              Factory Notes
            </h3>
          </div>
          <div className="text-center py-4">
            <FactoryIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Select a factory to view production notes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Billing Information */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-green-100 rounded-full p-2">
            <FileText className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">
            Billing Information
          </h3>
        </div>

        {factoryLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-gray-400" />
          </div>
        ) : factoryData ? (
          <div className="space-y-4 text-sm">
            {/* Factory Name */}
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 text-base">
                {factoryData.name}
              </p>
              <p className="text-gray-600">
                {factoryData.industry || "Manufacturing"}
              </p>
            </div>

            {/* Billing Contact */}
            <div className="space-y-1">
              <p className="text-gray-600">
                Email: {factoryData.email || "billing@factory.com"}
              </p>
              {factoryData.website_url && (
                <p className="text-gray-600">
                  Website: <span className="text-purple-600">{factoryData.website_url}</span>
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <p className="text-gray-600">
                Status: <span className={`font-medium ${
                  factoryData.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {factoryData.status}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">
            No billing information available
          </p>
        )}
      </div>

      {/* Shipping Information */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-100 rounded-full p-2">
            <Truck className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">
            Shipping Information
          </h3>
        </div>

        {factoryLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-gray-400" />
          </div>
        ) : factoryData ? (
          <div className="space-y-4 text-sm">
            {/* Factory Name */}
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 text-base">
                {factoryData.name}
              </p>
              <p className="text-gray-600">Shipping Address</p>
            </div>

            {/* Shipping Details */}
            <div className="space-y-1">
              <p className="text-gray-600">
                {factoryData.industry || "Industrial District"}
              </p>
              <p className="text-gray-600">
                Email: {factoryData.email || "shipping@factory.com"}
              </p>
            </div>

            {/* Delivery Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
              <p className="text-xs font-medium text-blue-900 mb-1">Delivery Info:</p>
              <p className="text-xs text-blue-800">
                Standard delivery time: 14-21 business days
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">
            No shipping information available
          </p>
        )}
      </div>

      {/* Factory Notes */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-orange-100 rounded-full p-2">
            <StickyNote className="h-4 w-4 text-orange-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">
            Factory Notes
          </h3>
        </div>

        {factoryLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-gray-400" />
          </div>
        ) : factoryData ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-gray-700">
              {factoryData.notes || "High-quality production facility with excellent track record. Specializes in custom manufacturing with fast turnaround times. Recommended for premium projects."}
            </p>
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">
            No factory notes available. Select a factory to view production notes.
          </p>
        )}
      </div>
    </div>
  );
};

export default FactoryBasedInfo;