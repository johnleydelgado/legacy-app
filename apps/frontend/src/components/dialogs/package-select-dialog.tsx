"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, MapPin, User, Phone, Building2 } from "lucide-react";

interface PackageSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: Array<{
    name: string;
    company_name?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }>;
  onPackageSelect: (packageIndex: number) => void;
  isLoading?: boolean;
}

const PackageSelectDialog: React.FC<PackageSelectDialogProps> = ({
  open,
  onOpenChange,
  packages,
  onPackageSelect,
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl ring-1 ring-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Select Package Destination
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Choose the shipping destination for your packing slip
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No shipping destinations found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Create package destinations first to generate packing slips for your orders.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {packages.map((pkg, index) => (
                <div
                  key={index}
                  className="group relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => onPackageSelect(index)}
                >
                  {/* Modern gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  
                  <div className="relative flex items-start gap-4">
                    {/* Icon section */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {pkg.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {/* Company info */}
                        {pkg.company_name && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{pkg.company_name}</span>
                          </div>
                        )}

                        {/* Phone */}
                        {pkg.phone_number && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{pkg.phone_number}</span>
                          </div>
                        )}

                        {/* Address - spans full width */}
                        {(pkg.address || pkg.city || pkg.state || pkg.zip || pkg.country) && (
                          <div className="md:col-span-2 flex items-start gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              {pkg.address && (
                                <div className="font-medium">{pkg.address}</div>
                              )}
                              {(pkg.city || pkg.state || pkg.zip || pkg.country) && (
                                <div className="text-gray-500">
                                  {[pkg.city, pkg.state, pkg.zip].filter(Boolean).join(", ")}
                                  {pkg.country && (pkg.city || pkg.state || pkg.zip) && " • "}
                                  {pkg.country}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Package className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-gray-500">
              {packages.length} destination{packages.length !== 1 ? 's' : ''} available
            </p>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PackageSelectDialog;
