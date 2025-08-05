"use client";

import * as React from "react";
import { Search, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  easyPostService,
  ShippingRate,
  EasyPostAddress,
  EasyPostParcel,
} from "@/services/easypost";

interface ShippingRateSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectShippingRate: (rate: ShippingRate) => void;
  toAddress: EasyPostAddress;
  fromAddress: EasyPostAddress;
  parcel: EasyPostParcel;
}

export function ShippingRateSelectDialog({
  open,
  onOpenChange,
  onSelectShippingRate,
  toAddress,
  fromAddress,
  parcel,
}: ShippingRateSelectDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [shippingRates, setShippingRates] = React.useState<ShippingRate[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch shipping rates when dialog opens
  React.useEffect(() => {
    if (open && toAddress && fromAddress && parcel) {
      fetchShippingRates();
    }
  }, [open, toAddress, fromAddress, parcel]);

  const fetchShippingRates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rates = await easyPostService.getShippingRates(
        toAddress,
        fromAddress,
        parcel
      );
      setShippingRates(rates);
    } catch (err) {
      console.error("Failed to fetch shipping rates:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch shipping rates"
      );
      setShippingRates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter shipping rates based on search term
  const filteredRates = React.useMemo(() => {
    if (!searchTerm.trim()) return shippingRates;
    const search = searchTerm.toLowerCase();
    return shippingRates.filter(
      (rate) =>
        rate.name.toLowerCase().includes(search) ||
        rate.carrier.toLowerCase().includes(search) ||
        rate.service.toLowerCase().includes(search) ||
        rate.description.toLowerCase().includes(search)
    );
  }, [searchTerm, shippingRates]);

  // Reset search when dialog opens
  React.useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open]);

  const handleSelectRate = (rate: ShippingRate) => {
    onSelectShippingRate(rate);
    onOpenChange(false);
  };

  const handleRetry = () => {
    fetchShippingRates();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Select Shipping Rate
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search shipping rates by carrier, service, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Shipping Rates List */}
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(80vh-180px)]">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading shipping rates...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-600 mb-4">
                  <p className="font-medium">Failed to load shipping rates</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            ) : filteredRates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm.trim()
                  ? "No shipping rates found matching your search"
                  : "No shipping rates available"}
              </div>
            ) : (
              filteredRates.map((rate) => (
                <div
                  key={rate.id}
                  onClick={() => handleSelectRate(rate)}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors duration-150 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="bg-green-50 rounded-full p-2 flex-shrink-0">
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-900">
                            {rate.name}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {rate.carrier}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 group-hover:text-blue-700 mb-1">
                          {rate.service} • {rate.estimatedDays}
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-blue-600">
                          {rate.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-900">
                        ${rate.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
