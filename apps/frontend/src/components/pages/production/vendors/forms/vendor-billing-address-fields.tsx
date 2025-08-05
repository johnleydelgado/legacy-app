"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VendorForm, VendorType, VendorServiceCategory } from "./types";
import { Globe, MapPin } from "lucide-react";
import { Address } from "@/services/addresses/types";

interface Props {
  billingAddressData?: Address;
}

export function VendorBillingAddressFields({ billingAddressData }: Props) {
  const { register, setValue, watch } = useFormContext<VendorForm>();

  React.useEffect(() => {
    if (billingAddressData) {
      setValue("billing_address.address1", billingAddressData.address1);
      setValue("billing_address.address2", billingAddressData.address2 || "");
      setValue("billing_address.city", billingAddressData.city);
      setValue("billing_address.state", billingAddressData.state);
      setValue("billing_address.zip", billingAddressData.zip);
      setValue("billing_address.country", billingAddressData.country);  
    }
  }, [billingAddressData, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Address Line 1 ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="address1" className="mb-2 block text-sm font-medium text-gray-700">
            Address Line 1<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="address1"
            required
            placeholder="Enter Address Line 1"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("billing_address.address1", { required: true })}
          />
        </div>

        {/* ── Address Line 2 ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="address2" className="mb-2 block text-sm font-medium text-gray-700">
            Address Line 2
          </label>
          <Input
            id="address2"
            placeholder="Enter Address Line 2"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("billing_address.address2", { required: false })}
          />
        </div>

        {/* ── City ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700">
            City<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="city"
            required
            placeholder="Enter City"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("billing_address.city", { required: true })}
          />
        </div>

        {/* ── State ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="state" className="mb-2 block text-sm font-medium text-gray-700">
            State<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="state"
            required
            placeholder="Enter State"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("billing_address.state", { required: true })}
          />
        </div>

        {/* ── Zip ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="zip" className="mb-2 block text-sm font-medium text-gray-700">
            Zip<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="zip"
            required
            placeholder="Enter Zip"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("billing_address.zip", { required: true })}
          />
        </div>

        {/* ── Country ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-700">
            Country<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="country"
            required
            placeholder="Enter Country"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("billing_address.country", { required: true })}
          />
        </div>
      </div>
    </div>
  );
} 