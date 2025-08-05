"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorForm, VendorType, VendorServiceCategory } from "./types";
import { Globe, MapPin } from "lucide-react";
import { useState } from "react";
import { Address } from "@/services/addresses/types";

interface Props {
  shippingAddressData?: Address;
}

export function VendorShippingAddressFieldsV2({ shippingAddressData }: Props) {
  const { register, setValue, watch } = useFormContext<VendorForm>();
  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Watch billing address values
  const billingAddress = watch("billing_address");

  // Function to copy billing address to shipping address
  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    
    if (checked && billingAddress) {
      setValue("shipping_address.address1", billingAddress.address1 || "");
      setValue("shipping_address.address2", billingAddress.address2 || "");
      setValue("shipping_address.city", billingAddress.city || "");
      setValue("shipping_address.state", billingAddress.state || "");
      setValue("shipping_address.zip", billingAddress.zip || "");
      setValue("shipping_address.country", billingAddress.country || "");
    }
  };

  React.useEffect(() => {

    if (shippingAddressData) {
      setValue("shipping_address.address1", shippingAddressData.address1 || "");
      setValue("shipping_address.address2", shippingAddressData.address2 || "");
      setValue("shipping_address.city", shippingAddressData.city || "");
      setValue("shipping_address.state", shippingAddressData.state || "");
      setValue("shipping_address.zip", shippingAddressData.zip || "");
      setValue("shipping_address.country", shippingAddressData.country || "");
    }
  }, [shippingAddressData, setValue]);

  return (
    <div className="space-y-6">
      {/* ── Same as Billing Address Checkbox ────────────────────────────── */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="same-as-billing"
          checked={sameAsBilling}
          onCheckedChange={handleSameAsBillingChange}
        />
        <label
          htmlFor="same-as-billing"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Same as billing address
        </label>
      </div>

      <div className="flex flex-row flex-wrap gap-4">
        {/* ── Address Line 1 ────────────────────────────────────────────── */}
        <div className="w-full">
          <label htmlFor="address1" className="mb-2 block text-sm font-medium text-gray-700">
            Address Line 1<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="address1"
            required
            placeholder="Enter Address Line 1"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("shipping_address.address1", { required: true })}
            disabled={sameAsBilling}
          />
        </div>

        {/* ── Address Line 2 ────────────────────────────────────────────── */}
        <div className="w-full">
          <label htmlFor="address2" className="mb-2 block text-sm font-medium text-gray-700">
            Address Line 2
          </label>
          <Input
            id="address2"
            placeholder="Enter Address Line 2"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("shipping_address.address2", { required: false })}
            disabled={sameAsBilling}
          />
        </div>

        {/* ── City ────────────────────────────────────────────── */}
        <div className="w-[40%] grow">
          <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700">
            City<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="city"
            required
            placeholder="Enter City"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("shipping_address.city", { required: true })}
            disabled={sameAsBilling}
          />
        </div>

        {/* ── State ────────────────────────────────────────────── */}
        <div className="w-[40%] grow">
          <label htmlFor="state" className="mb-2 block text-sm font-medium text-gray-700">
            State<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="state"
            required
            placeholder="Enter State"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("shipping_address.state", { required: true })}
            disabled={sameAsBilling}
          />
        </div>

        {/* ── Zip ────────────────────────────────────────────── */}
        <div className="w-[40%] grow">
          <label htmlFor="zip" className="mb-2 block text-sm font-medium text-gray-700">
            Zip<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="zip"
            required
            placeholder="Enter Zip"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("shipping_address.zip", { required: true })}
            disabled={sameAsBilling}
          />
        </div>

        {/* ── Country ────────────────────────────────────────────── */}
        <div className="w-[40%] grow">
          <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-700">
            Country<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="country"
            required
            placeholder="Enter Country"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("shipping_address.country", { required: true })}
            disabled={sameAsBilling}
          />
        </div>
      </div>
    </div>
  );
} 
