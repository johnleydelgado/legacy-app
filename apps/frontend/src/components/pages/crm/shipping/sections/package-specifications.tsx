"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  Package as PackageIcon,
  Check,
  Package,
  Truck,
  DollarSign,
  ExternalLink,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader as DialogHeaderBase,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ShippingRateSelectDialog } from "@/components/dialogs/shipping-rate-select-dialog";
import { ShippingRate } from "@/services/easypost";
import { FROM_ADDRESS } from "@/constants/company-info";

// Types ---------------------------------------------------- //
export interface PackageSpec {
  id: number;
  name: string;
  company_name?: string;
  phone_number?: string;
  length: number; // stored value (could be cm or inches based on measurement_unit)
  width: number; // stored value (could be cm or inches based on measurement_unit)
  height: number; // stored value (could be cm or inches based on measurement_unit)
  weight: number; // stored value (could be kg or lbs based on measurement_unit)
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  measurement_unit: "metric" | "imperial"; // Database field name
  // Preset ID fields
  fk_dimension_preset_id?: number;
  fk_weight_preset_id?: number;
  // Shipping rate fields
  carrier?: string;
  service?: string;
  carrier_description?: string;
  shipping_rate_id?: string;
  easypost_shipment_id?: string;
  easypost_shipment_rate_id?: string;
  tracking_code?: string;
  label_url?: string;
  shipment_status?: string;
  estimated_delivery_days?: string;
}

// Types from sibling component
import type { ShippingItem } from "./shipping-items-table";
import PackageEditDialog from "./package-edit-dialog";
import PackageItemsDialog from "./package-items-dialog";
import { formatDimension, formatWeight } from "@/lib/utils/unit-conversion";

// Helpers -------------------------------------------------- //
const getDefaultPackage = (index: number): PackageSpec => ({
  id: Date.now() + index,
  name: `Package ${String.fromCharCode(65 + index)}`,
  company_name: "",
  phone_number: "",
  length: 0,
  width: 0,
  height: 0,
  weight: 0,
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  measurement_unit: "metric",
  fk_dimension_preset_id: undefined,
  fk_weight_preset_id: undefined,
});

// Package Component
interface PackageAreaProps {
  package: PackageSpec;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onView: (index: number) => void;
  onShippingRateSelect: (rate: ShippingRate, packageId: number) => void;
  itemCount: number;
  items: ShippingItem[]; // Add items prop to show item details
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
  isDetailsPage?: boolean; // Added prop
}

const PackageArea: React.FC<PackageAreaProps> = ({
  package: pkg,
  index,
  onEdit,
  onDelete,
  onView,
  onShippingRateSelect,
  itemCount,
  items,
  shippingContact,
  shippingAddress,
  isDetailsPage,
}) => {
  const [showShippingRateDialog, setShowShippingRateDialog] =
    React.useState(false);

  const tagText =
    itemCount === 0
      ? "Empty"
      : `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  const handleShippingRateSelect = (rate: ShippingRate) => {
    onShippingRateSelect(rate, pkg.id);
    setShowShippingRateDialog(false);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-200 shadow-sm w-full max-w-sm">
        {/* Header with Package Name and Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">{pkg.name}</h3>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
              {tagText}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(index);
              }}
            >
              <Edit className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-50 text-red-500 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Company Name */}
        {pkg.company_name && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 font-medium">
              {pkg.company_name}
            </p>
          </div>
        )}

        {/* Package Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-md p-2">
            <p className="text-xs font-medium text-gray-600 mb-1">Dimensions</p>
            <p className="text-sm text-gray-900">
              {`${formatDimension(
                pkg.length,
                pkg.measurement_unit
              )} × ${formatDimension(
                pkg.width,
                pkg.measurement_unit
              )} × ${formatDimension(pkg.height, pkg.measurement_unit)}`}
            </p>
          </div>
          <div className="bg-gray-50 rounded-md p-2">
            <p className="text-xs font-medium text-gray-600 mb-1">Weight</p>
            <p className="text-sm text-gray-900">
              {formatWeight(pkg.weight, pkg.measurement_unit)}
            </p>
          </div>
        </div>

        {/* Shipping Rate Information */}
        {pkg.carrier ? (
          <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                  {pkg.carrier}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-green-600 hover:text-green-800 border-green-200 hover:border-green-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShippingRateDialog(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-green-700">
              <p className="font-medium">{pkg.service}</p>
              {pkg.estimated_delivery_days && (
                <p>{pkg.estimated_delivery_days}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p>No shipping rate selected</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-3 text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShippingRateDialog(true);
                }}
              >
                <Truck className="h-3 w-3 mr-1" />
                Select Rate
              </Button>
            </div>
          </div>
        )}

        {/* Label Information - Only show on details page */}
        {isDetailsPage && pkg.label_url && (
          <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">
                  Shipping Label
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-purple-600 hover:text-purple-800 border-purple-200 hover:border-purple-300"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(pkg.label_url, "_blank");
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-purple-700 space-y-1">
              {pkg.tracking_code && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tracking:</span>
                  <a
                    href={pkg.tracking_code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    View Tracking
                  </a>
                </div>
              )}
              {pkg.shipment_status && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <span className="capitalize">{pkg.shipment_status}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {pkg.address && (
          <div className="mb-3 p-2 bg-blue-50 rounded-md">
            <p className="text-xs font-medium text-blue-700 mb-1">
              Shipping Address
            </p>
            <p className="text-sm text-blue-800">
              {pkg.address}
              {pkg.city && `, ${pkg.city}`}
              {pkg.state && `, ${pkg.state}`}
              {pkg.zip && ` ${pkg.zip}`}
            </p>
          </div>
        )}

        {/* Items Section */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">Items:</p>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <p className="text-xs font-medium text-gray-600">
                  Total Qty:{" "}
                  {items.reduce(
                    (sum, item) =>
                      sum +
                      Number(item.packageQuantities?.[pkg.id] || item.quantity),
                    0
                  )}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(index);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="space-y-1">
              {items.slice(0, 3).map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>
                  <p className="text-gray-700 truncate flex-1">
                    {item.item_name ||
                      item.item_description ||
                      `Item #${item.itemNumber}`}
                  </p>
                  <span className="text-xs text-gray-500 font-medium">
                    (Qty: {item.packageQuantities?.[pkg.id] || item.quantity})
                  </span>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-xs text-gray-500 italic">
                  +{items.length - 3} more items
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-12 text-xs text-gray-400 italic bg-gray-50 rounded-md">
              <span>No items assigned to this package</span>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Rate Selection Dialog */}
      <ShippingRateSelectDialog
        open={showShippingRateDialog}
        onOpenChange={setShowShippingRateDialog}
        onSelectShippingRate={handleShippingRateSelect}
        toAddress={{
          name: pkg.company_name || "Recipient",
          street1: pkg.address || "123 Main St",
          city: pkg.city || "City",
          state: pkg.state || "CA",
          zip: pkg.zip || "90210",
          country: pkg.country || "US",
          phone:
            String(pkg.phone_number || "").replace(/\D/g, "") ||
            String(shippingContact?.phone_number || "").replace(/\D/g, "") ||
            "",
        }}
        fromAddress={FROM_ADDRESS}
        parcel={{
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          weight: pkg.weight,
        }}
      />
    </>
  );
};

// Component ------------------------------------------------ //
interface Props {
  className?: string;
  shippingItems?: ShippingItem[];
  setShippingItems?: React.Dispatch<React.SetStateAction<ShippingItem[]>>;
  packages?: PackageSpec[];
  setPackages?: React.Dispatch<React.SetStateAction<PackageSpec[]>>;
  onPackageChange?: () => void; // Callback to notify parent of changes
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
  isDetailsPage?: boolean; // Added prop to determine if this is the details page
}

const PackageSpecifications: React.FC<Props> = ({
  className,
  shippingItems = [],
  setShippingItems,
  packages: externalPackages,
  setPackages: externalSetPackages,
  onPackageChange,
  shippingContact,
  shippingAddress,
  isDetailsPage,
}) => {
  const [internalPackages, setInternalPackages] = React.useState<PackageSpec[]>(
    []
  );

  // Use external packages if provided, otherwise use internal state
  const packages = externalPackages || internalPackages;
  const setPackages = externalSetPackages || setInternalPackages;

  // Calculate item count for each package
  const getItemCountForPackage = (packageId: number): number => {
    return shippingItems.filter((item) => item.packageQuantities?.[packageId])
      .length;
  };

  // Get items for a specific package
  const getItemsForPackage = (packageId: number): ShippingItem[] => {
    return shippingItems.filter((item) => item.packageQuantities?.[packageId]);
  };

  // Handle shipping rate selection
  const handleShippingRateSelect = (rate: ShippingRate, packageId: number) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              carrier: rate.carrier,
              service: rate.service,
              carrier_description: rate.description,
              shipping_rate_id: rate.id,
              easypost_shipment_id: rate.shipmentId,
              easypost_shipment_rate_id: rate.rateId,
              estimated_delivery_days: rate.estimatedDays,
            }
          : pkg
      )
    );
    onPackageChange?.();
  };

  // Modal state for new/edit package
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = React.useState(false);
  const [editingPackageIndex, setEditingPackageIndex] = React.useState<
    number | null
  >(null);
  const [viewPackageIndex, setViewPackageIndex] = React.useState<number | null>(
    null
  );
  const [form, setForm] = React.useState<PackageSpec>(() =>
    getDefaultPackage(0)
  );

  const [selectedItemIds, setSelectedItemIds] = React.useState<Set<number>>(
    new Set()
  );
  const [itemQuantities, setItemQuantities] = React.useState<
    Record<number, number>
  >({});

  const handleAddPackageClick = () => {
    setEditingPackageIndex(null);
    setForm(getDefaultPackage(packages.length));
    setDialogOpen(true);
  };

  const handleEditPackageClick = (index: number) => {
    setEditingPackageIndex(index);
    setForm(packages[index]);
    setDialogOpen(true);
  };

  const handleDeletePackageClick = (index: number) => {
    setPackages((prev) => prev.filter((_, i) => i !== index));
    onPackageChange?.();
  };

  const handleViewPackageClick = (index: number) => {
    setViewPackageIndex(index);

    // Preselect items already in the package
    const pkgId = packages[index].id;
    const preselectedIds = new Set<number>();
    const preselectedQuantities: Record<number, number> = {};

    shippingItems.forEach((itm, idx) => {
      if (itm.packageQuantities?.[pkgId]) {
        preselectedIds.add(idx);
        preselectedQuantities[idx] = itm.packageQuantities[pkgId];
      }
    });

    setSelectedItemIds(preselectedIds);
    setItemQuantities(preselectedQuantities);
    setItemsDialogOpen(true);
  };

  const handleSavePackage = () => {
    if (editingPackageIndex === null) {
      // Create
      setPackages((prev) => [...prev, form]);
    } else {
      // Update
      setPackages((prev) =>
        prev.map((pkg, i) => (i === editingPackageIndex ? form : pkg))
      );
    }
    setDialogOpen(false);
    onPackageChange?.();
  };

  const handleChange = (field: keyof PackageSpec, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "name" ||
        field === "company_name" ||
        field === "phone_number" ||
        field === "address" ||
        field === "city" ||
        field === "state" ||
        field === "zip" ||
        field === "country" ||
        field === "measurement_unit" ||
        field === "carrier" ||
        field === "service" ||
        field === "carrier_description" ||
        field === "shipping_rate_id" ||
        field === "estimated_delivery_days"
          ? value
          : Number(value),
    }));
  };

  const toggleItemSelection = (idx: number) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
        // Remove quantity when unselecting
        setItemQuantities((prevQuantities) => {
          const newQuantities = { ...prevQuantities };
          delete newQuantities[idx];
          return newQuantities;
        });
      } else {
        newSet.add(idx);
        // Set default quantity when selecting
        setItemQuantities((prevQuantities) => ({
          ...prevQuantities,
          [idx]: 1,
        }));
      }
      return newSet;
    });
  };

  const updateItemQuantity = (idx: number, quantity: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [idx]: quantity,
    }));
  };

  const handleAddItemsToPackage = () => {
    if (!setShippingItems || viewPackageIndex === null) return;

    const pkgId = packages[viewPackageIndex].id;

    setShippingItems((prev) => {
      const updated = prev.map((itm, idx) => {
        // If selected, assign to package with quantity
        if (selectedItemIds.has(idx)) {
          const quantity = itemQuantities[idx] || 1;
          return {
            ...itm,
            packageQuantities: {
              ...itm.packageQuantities,
              [pkgId]: quantity,
            },
          } as ShippingItem;
        }
        // If previously assigned to this package but now unselected, remove assignment
        if (itm.packageQuantities?.[pkgId] && !selectedItemIds.has(idx)) {
          const newPackageQuantities = { ...itm.packageQuantities };
          delete newPackageQuantities[pkgId];
          return {
            ...itm,
            packageQuantities: newPackageQuantities,
          } as ShippingItem;
        }
        return itm;
      });
      return updated;
    });

    setItemsDialogOpen(false);
    onPackageChange?.();
  };

  return (
    <Card
      className={
        className ??
        "bg-white border border-gray-200 text-gray-900 shadow-sm w-full xl:w-full rounded-md self-start"
      }
    >
      <CardHeader className="border-b border-gray-100 px-6 flex flex-row items-center justify-between [.border-b]:pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 rounded-full p-2">
            <Package className="h-4 w-4 text-orange-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            Package Specifications
          </span>
        </div>
        {packages.length > 0 && (
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1 text-xs px-2 py-1 bg-sky-400 hover:bg-sky-700"
            onClick={handleAddPackageClick}
          >
            <Plus className="h-4 w-4" /> Add Package
          </Button>
        )}
      </CardHeader>

      {/* List Container */}
      <CardContent className="p-6">
        {packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-50 rounded-full p-4 mx-auto w-fit mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-2">
              No Package Specifications selected
            </p>
            <Button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-sky-400 hover:bg-sky-700 text-white transition-colors cursor-pointer text-sm"
              onClick={handleAddPackageClick}
              size="sm"
            >
              <Package className="h-4 w-4" />
              Add Package
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {packages.map((pkg, index) => (
              <PackageArea
                key={pkg.id}
                package={pkg}
                index={index}
                onEdit={handleEditPackageClick}
                onDelete={handleDeletePackageClick}
                onView={handleViewPackageClick}
                onShippingRateSelect={handleShippingRateSelect}
                itemCount={getItemCountForPackage(pkg.id)}
                items={getItemsForPackage(pkg.id)}
                shippingContact={shippingContact}
                shippingAddress={shippingAddress}
                isDetailsPage={isDetailsPage}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Package Dialog */}
      <PackageEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editingPackageIndex !== null}
        form={form}
        onChange={handleChange}
        onSave={handleSavePackage}
        onPackageChange={onPackageChange}
        shippingContact={shippingContact}
        shippingAddress={shippingAddress}
      />

      {/* Package Items Dialog */}
      <PackageItemsDialog
        open={itemsDialogOpen}
        onOpenChange={setItemsDialogOpen}
        packageIndex={viewPackageIndex}
        packages={packages}
        shippingItems={shippingItems as ShippingItem[]}
        selectedIds={selectedItemIds}
        itemQuantities={itemQuantities}
        toggleSelection={toggleItemSelection}
        updateQuantity={updateItemQuantity}
        onAdd={handleAddItemsToPackage}
      />
    </Card>
  );
};

export default PackageSpecifications;
