"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader as DialogHeaderBase,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package as PackageIcon, Check } from "lucide-react";
import type { PackageSpec } from "./package-specifications";
import type { ShippingItem } from "./shipping-items-table";
import { formatDimension, formatWeight } from "@/lib/utils/unit-conversion";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageIndex: number | null;
  packages: PackageSpec[];
  shippingItems: ShippingItem[];
  selectedIds: Set<number>;
  itemQuantities: Record<number, number>;
  toggleSelection: (idx: number) => void;
  updateQuantity: (idx: number, quantity: number) => void;
  onAdd: () => void;
}

const PackageItemsDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  packageIndex,
  packages,
  shippingItems,
  selectedIds,
  itemQuantities,
  toggleSelection,
  updateQuantity,
  onAdd,
}) => {
  const currentPackage =
    packageIndex !== null ? packages[packageIndex] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {currentPackage && (
          <>
            <DialogHeaderBase>
              <DialogTitle>{currentPackage.name} Items</DialogTitle>
            </DialogHeaderBase>

            {/* Package Specifications */}
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                Package Specifications
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500">Dimensions</p>
                  <p className="text-gray-700 font-medium">
                    {formatDimension(
                      currentPackage.length,
                      currentPackage.measurement_unit
                    )}{" "}
                    ×{" "}
                    {formatDimension(
                      currentPackage.width,
                      currentPackage.measurement_unit
                    )}{" "}
                    ×{" "}
                    {formatDimension(
                      currentPackage.height,
                      currentPackage.measurement_unit
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Weight</p>
                  <p className="text-gray-700 font-medium">
                    {formatWeight(
                      currentPackage.weight,
                      currentPackage.measurement_unit
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2 mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              <p>
                Items fully allocated to other packages are disabled. Items can
                be assigned to multiple packages with different quantities.
              </p>
            </div>

            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              {shippingItems.length === 0 && (
                <p className="text-sm text-gray-500">
                  No shipping items available.
                </p>
              )}

              {shippingItems.map((itm, idx) => {
                const selected = selectedIds.has(idx);

                // Calculate total quantity allocated to other packages
                const totalAllocatedToOtherPackages = Object.entries(
                  itm.packageQuantities || {}
                )
                  .filter(
                    ([packageId]) => Number(packageId) !== currentPackage?.id
                  )
                  .reduce((sum, [, qty]) => sum + qty, 0);

                // Check if item is fully allocated to other packages
                const isFullyAllocatedToOthers =
                  totalAllocatedToOtherPackages >= itm.quantity;

                // Item is disabled only if fully allocated to other packages
                const isDisabled = isFullyAllocatedToOthers;
                const quantity = itemQuantities[idx] || 1;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 border border-gray-200 rounded p-2 text-sm ${
                      isDisabled
                        ? "cursor-not-allowed opacity-50 bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center h-7 w-7 rounded cursor-pointer ${
                        isDisabled
                          ? "bg-gray-200 text-gray-400"
                          : selected
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                      onClick={() => !isDisabled && toggleSelection(idx)}
                    >
                      {isDisabled ? (
                        <span className="text-xs">×</span>
                      ) : selected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <PackageIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {(itm as any).item_name ||
                          (itm as any).item_description ||
                          `Item ${idx + 1}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isFullyAllocatedToOthers ? (
                          <span className="text-red-600">
                            Fully allocated to other packages (
                            {totalAllocatedToOtherPackages}/{itm.quantity})
                          </span>
                        ) : totalAllocatedToOtherPackages > 0 ? (
                          <span className="text-orange-600">
                            Partially allocated ({totalAllocatedToOtherPackages}
                            /{itm.quantity} in other packages)
                          </span>
                        ) : (
                          <>
                            {(itm.packageID
                              ? packages.find((p) => p.id === itm.packageID)
                                  ?.name
                              : "Unassigned") || "Unassigned"}
                            {typeof (itm as any).weight === "number" &&
                              ` • ${(itm as any).weight} kg`}
                          </>
                        )}
                      </p>
                    </div>
                    {selected && !isDisabled && (
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`quantity-${idx}`}
                          className="text-xs text-gray-600"
                        >
                          Qty:
                        </Label>
                        <div className="flex flex-col gap-1">
                          <Input
                            id={`quantity-${idx}`}
                            type="number"
                            min="0.01"
                            step="0.01"
                            max={itm.quantity - totalAllocatedToOtherPackages}
                            value={quantity}
                            onChange={(e) => {
                              const inputValue =
                                parseFloat(e.target.value) || 0;
                              const maxAvailable =
                                itm.quantity - totalAllocatedToOtherPackages;
                              const validValue = Math.min(
                                inputValue,
                                maxAvailable
                              );
                              updateQuantity(idx, validValue);
                            }}
                            className="w-16 h-7 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs text-gray-400">
                            Max: {itm.quantity - totalAllocatedToOtherPackages}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="mt-4">
              <Button className="bg-sky-400 hover:bg-sky-700" onClick={onAdd}>
                Add to Package
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PackageItemsDialog;
