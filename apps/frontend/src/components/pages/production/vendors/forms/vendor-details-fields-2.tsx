"use client";

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VendorForm, VendorType, VendorServiceCategory } from "./types";
import { Globe, MapPin } from "lucide-react";
import { Vendor } from "@/services/vendors/types";
import { LocationType } from "@/services/location-types/types";
import { useAllLocationTypes } from "@/hooks/useLocationTypes";

interface Props {
  vendorTypes: VendorType[];
  serviceCategories: VendorServiceCategory[];
  locationTypes: LocationType[];
  vendorData?: Vendor;
}

export function VendorDetailsFieldsV2({ vendorTypes, serviceCategories, locationTypes, vendorData }: Props) {
  const { register, watch, reset, control, getValues } = useFormContext();
                                                                    
  const selectedVendorType = watch("vendor_type_id");
  const selectedServiceCategory = watch("vendor_service_category_id");

  React.useEffect(() => {
    if (vendorData && vendorTypes.length > 0 && serviceCategories.length > 0) {
      // Check if the IDs exist in the options
      const vendorTypeExists = vendorTypes.some(t => t.id === vendorData.vendor_type.id);
      const serviceCategoryExists = serviceCategories.some(c => c.id === vendorData.vendor_service_category.id);
      
      const currentValues = getValues();

      reset({
        ...currentValues,
        name: vendorData.name,
        website: vendorData.website_url || "",
        vendor_type_id: vendorTypeExists ? vendorData.vendor_type.id : -1,
        vendor_service_category_id: serviceCategoryExists ? vendorData.vendor_service_category.id : -1,
        location_type_id: vendorData.location.id,
      });
    }
  }, [vendorData, vendorTypes, serviceCategories, reset, getValues]);

  // Only render if we have the required data for edit mode
  if (vendorData && (vendorTypes.length === 0 || serviceCategories.length === 0)) {
    return <div>Loading form options...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        {/* ── Company Name ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
            Company Name<span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="name"
            required
            placeholder="Enter company name"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register("name", { required: true })}
          />
        </div>

        {/* ── Website ───────────────────────────────────── */}
        <div>
          <label htmlFor="website" className="mb-2 block text-sm font-medium text-gray-700">
            Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="website"
              placeholder="e.g. example.com"
              className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...register("website")}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* ── Vendor Type ───────────────────────────────────── */}
          <div className="w-[40%] grow">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Vendor Type<span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              name="vendor_type_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => value && field.onChange(Number(value))}
                >
                  <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-w-[200px]">
                    <SelectValue placeholder="Select vendor type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {vendorTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

        {/* ── Service Category ──────────────────────────────────────────── */}
        <div className="w-[40%] grow">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Service Category<span className="text-red-500 ml-1">*</span>
          </label>
          <Controller
            name="vendor_service_category_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(value) => value && field.onChange(Number(value))}
              >
                <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-w-[200px]">
                  <SelectValue placeholder="e.g. Fabrics, Printing, Logistics" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {serviceCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Vendor Location ───────────────────────────────────── */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Vendor Location<span className="text-red-500 ml-1">*</span>
          </label>
          <Controller
            name="location_type_id"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => value && field.onChange(Number(value))}
                >
                  <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-w-[200px]">
                    <SelectValue placeholder="Select vendor location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {locationTypes.map((type) => (
                      <SelectItem key={type.pk_location_type_id} value={type.pk_location_type_id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }
          />
        </div>
      </div>
    </div>
  );
} 