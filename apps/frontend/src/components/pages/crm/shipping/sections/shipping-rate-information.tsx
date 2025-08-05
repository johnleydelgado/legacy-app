"use client";

import * as React from "react";
import { Truck, Package, X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import PackageSelectDialog from "@/components/dialogs/package-select-dialog";
import { ShippingRateSelectDialog } from "@/components/dialogs/shipping-rate-select-dialog";
import { ShippingRate } from "@/services/easypost";
import { PackageSpec } from "./package-specifications";
import { formatDimension, formatWeight } from "@/lib/utils/unit-conversion";
import { FROM_ADDRESS } from "@/constants/company-info";

// Interface for package with its selected shipping rate
interface PackageWithRate {
  package: PackageSpec;
  rate: ShippingRate | null;
}

interface ShippingRateInformationProps {
  selectedPackagesWithRates: PackageWithRate[];
  setSelectedPackagesWithRates: React.Dispatch<
    React.SetStateAction<PackageWithRate[]>
  >;
  setModifyFlag: React.Dispatch<React.SetStateAction<boolean>>;
  packages?: PackageSpec[];
  setShippingData?: React.Dispatch<
    React.SetStateAction<{
      carrier: string;
      carrierDescription: string;
      service: string;
      insuranceValue: number;
      shippingRatePrice: number;
    }>
  >;
  shippingData?: {
    carrier: string;
    carrierDescription: string;
    service: string;
    insuranceValue: number;
    shippingRatePrice: number;
  };
  // Contact and address data for shipping rate calculation
  shippingContact?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  shippingAddress?: {
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  dataContactCustomerShipping?: any;
  dataCustomerAddressShipping?: any;
}

const ShippingRateInformation: React.FC<ShippingRateInformationProps> = ({
  selectedPackagesWithRates,
  setSelectedPackagesWithRates,
  setModifyFlag,
  packages = [],
  setShippingData,
  shippingData,
  shippingContact,
  shippingAddress,
  dataContactCustomerShipping,
  dataCustomerAddressShipping,
}) => {
  const [selectPackage, setSelectPackage] = React.useState<boolean>(false);
  const [selectShippingRate, setSelectShippingRate] =
    React.useState<boolean>(false);
  const [currentPackageForRate, setCurrentPackageForRate] =
    React.useState<PackageSpec | null>(null);

  // Handle package selection
  const handlePackageSelect = (packageIndex: number) => {
    const pkg = packages[packageIndex];
    if (!pkg) return;
    
    // Check if package is already selected
    const existingIndex = selectedPackagesWithRates.findIndex(
      (item) => item.package.id === pkg.id
    );

    if (existingIndex >= 0) {
      // Package already exists, open rate selection for this package
      setCurrentPackageForRate(pkg);
      setSelectShippingRate(true);
    } else {
      // Add new package with no rate yet
      setSelectedPackagesWithRates((prev) => [
        ...prev,
        { package: pkg, rate: null },
      ]);
      setCurrentPackageForRate(pkg);
      setSelectShippingRate(true);
    }
    setSelectPackage(false);
  };

  // Handle shipping rate selection
  const handleShippingRateSelect = (rate: ShippingRate) => {
    if (!currentPackageForRate) return;

    setSelectedPackagesWithRates((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.package.id === currentPackageForRate.id
      );

      if (existingIndex >= 0) {
        // Update existing package with rate
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], rate };
        return updated;
      } else {
        // Add new package with rate
        return [...prev, { package: currentPackageForRate, rate }];
      }
    });

    setModifyFlag(true);

    // Update parent's shipping data if setter is provided
    if (setShippingData) {
      // Convert package dimensions to cm if needed
      const lengthCm =
        currentPackageForRate.measurement_unit === "imperial"
          ? currentPackageForRate.length * 2.54 // Convert inches to cm
          : currentPackageForRate.length;
      const widthCm =
        currentPackageForRate.measurement_unit === "imperial"
          ? currentPackageForRate.width * 2.54 // Convert inches to cm
          : currentPackageForRate.width;
      const heightCm =
        currentPackageForRate.measurement_unit === "imperial"
          ? currentPackageForRate.height * 2.54 // Convert inches to cm
          : currentPackageForRate.height;
      const weightKg =
        currentPackageForRate.measurement_unit === "imperial"
          ? currentPackageForRate.weight * 0.453592 // Convert lbs to kg
          : currentPackageForRate.weight;

      setShippingData((prev) => ({
        ...prev,
        carrier: rate.carrier,
        service: rate.service,
        shippingRatePrice: rate.price,
        carrierDescription: rate.description,
      }));
    }

    setTimeout(() => {
      setSelectShippingRate(false);
    }, 500);
  };

  // Handle removing a specific package
  const handleRemovePackage = (packageId: number) => {
    setSelectedPackagesWithRates((prev) =>
      prev.filter((item) => item.package.id !== packageId)
    );
    setModifyFlag(true);
  };

  return (
    <Card className="bg-white border border-gray-200 text-gray-900 shadow-sm w-full rounded-md self-start">
      {/* header: icon + label share the same baseline */}
      <CardHeader className="border-b border-gray-100 px-6 [.border-b]:pb-2 flex justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-100 rounded-full p-2">
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            Shipping Rate Information
            {selectedPackagesWithRates.length > 1 && (
              <span className="text-xs text-gray-500 ml-2">
                ({selectedPackagesWithRates.length} packages)
              </span>
            )}
          </span>
        </div>
        {selectedPackagesWithRates.length > 0 && (
          <Button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer text-sm"
            onClick={() => setSelectPackage(true)}
            size="sm"
          >
            <Truck className="h-4 w-4" />
            Add Shipping Rate
          </Button>
        )}
      </CardHeader>

      {/* body */}
      <CardContent className="px-6">
        {selectedPackagesWithRates.length > 0 ? (
          <div className="space-y-4">
            {selectedPackagesWithRates.map((item) => (
              <div
                key={item.package.id}
                className="relative p-4 border border-gray-200 rounded-md hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                {/* Remove button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  onClick={() => handleRemovePackage(item.package.id)}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* Three-column layout */}
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {/* Package Info Section */}
                  <div className="bg-gray-50 rounded-md p-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      Package Info
                    </h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        Weight:{" "}
                        {formatWeight(
                          item.package.weight,
                          item.package.measurement_unit
                        )}
                      </p>
                      <p>
                        Dimensions:{" "}
                        {formatDimension(
                          item.package.length,
                          item.package.measurement_unit
                        )}{" "}
                        ×{" "}
                        {formatDimension(
                          item.package.width,
                          item.package.measurement_unit
                        )}{" "}
                        ×{" "}
                        {formatDimension(
                          item.package.height,
                          item.package.measurement_unit
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Carrier Section */}
                  {item.rate ? (
                    <div className="bg-gray-50 rounded-md p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        Carrier
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>{item.rate.carrier}</p>
                        <p>{item.rate.estimatedDays}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-md p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        Carrier
                      </h4>
                      <div className="text-xs text-gray-600">
                        <p>No rate selected</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-blue-600 hover:text-blue-800 mt-1"
                          onClick={() => {
                            setCurrentPackageForRate(item.package);
                            setSelectShippingRate(true);
                          }}
                        >
                          Select Rate
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Rate Section */}
                  {item.rate ? (
                    <div className="bg-gray-50 rounded-md p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        Rate
                      </h4>
                      <div className="text-xs text-gray-600">
                        <p className="text-lg font-bold text-gray-900">
                          ${item.rate.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Base Rate</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-md p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        Rate
                      </h4>
                      <div className="text-xs text-gray-600">
                        <p className="text-gray-500">Not available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-gray-50 rounded-full p-4 mx-auto w-fit mb-4">
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              No packages selected
            </h4>
            <p className="text-xs text-gray-500 mb-6 max-w-xs">
              Select packages and shipping rates to get accurate delivery times
              and costs
            </p>
            <Button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer text-sm"
              onClick={() => setSelectPackage(true)}
              size="sm"
            >
              <Truck className="h-4 w-4" />
              Select Package
            </Button>
          </div>
        )}
      </CardContent>

      <PackageSelectDialog
        open={selectPackage}
        onOpenChange={setSelectPackage}
        onPackageSelect={handlePackageSelect}
        packages={packages}
      />

      <ShippingRateSelectDialog
        open={selectShippingRate}
        onOpenChange={setSelectShippingRate}
        onSelectShippingRate={handleShippingRateSelect}
        toAddress={{
          name: currentPackageForRate?.company_name || "Recipient",
          street1: currentPackageForRate?.address || "123 Main St",
          city: currentPackageForRate?.city || "City",
          state: currentPackageForRate?.state || "CA",
          zip: currentPackageForRate?.zip || "90210",
          country: currentPackageForRate?.country || "US",
          phone:
            String(shippingContact?.phone_number || "").replace(/\D/g, "") ||
            "",
        }}
        fromAddress={FROM_ADDRESS}
        parcel={{
          length: currentPackageForRate?.length || 20.2,
          width: currentPackageForRate?.width || 10.9,
          height: currentPackageForRate?.height || 5,
          weight: currentPackageForRate?.weight || 65.9,
        }}
      />
    </Card>
  );
};

export default ShippingRateInformation;
