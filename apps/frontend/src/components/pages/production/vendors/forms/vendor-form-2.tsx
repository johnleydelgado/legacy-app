"use client";

import * as React from "react";
import { Building2, User, FileText, MapPinHouse } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorForm, VendorType, VendorServiceCategory } from "./types";
import { VendorDetailsFields } from "./vendor-details-fields";
import { VendorContactFields } from "./vendor-contact-fields";
import { VendorAdditionalFields } from "./vendor-additional-fields";
import { CreateVendorDto, Vendor } from "@/services/vendors/types";
import { LocationType } from "@/services/location-types/types";
import { VendorBillingAddressFields } from "./vendor-billing-address-fields";
import { VendorShippingAddressFields } from "./vendor-shipping-address-fields";
import { Address } from "@/services/addresses/types";
import { VendorDetailsFieldsV2 } from "./vendor-details-fields-2";
import { VendorContactFieldsV2 } from "./vendor-contact-fields-2";
import { VendorBillingAddressFieldsV2 } from "./vendor-billing-address-fields-2";
import { VendorShippingAddressFieldsV2 } from "./vendor-shipping-address-fields-2";

/* ── header component ─────────────────────────────────────── */
function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="pt-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <hr className="mt-2 border-t border-gray-200" />
    </div>
  );
}
/* --------------------------------------------------------------------- */

interface Props {
  mode: "create" | "edit";
  vendorData?: Vendor;
  billingAddressData?: Address;
  shippingAddressData?: Address;
  initial: VendorForm;
  vendorTypes: VendorType[];
  serviceCategories: VendorServiceCategory[];
  locationTypes: LocationType[];
  onSubmit: (data: VendorForm) => void | Promise<void>;
}

const mapVendorFormToCreatePayload = (data: VendorForm): VendorForm => {
  return {
    name: data.name,
    vendor_type_id: Number(data.vendor_type_id),
    vendor_service_category_id: Number(data.vendor_service_category_id),
    location_type_id: Number(data.location_type_id),
    status: data.status,
    contact: {
      first_name: data.contact.first_name,
      last_name: data.contact.last_name,
      email: data.contact.email,
      phone_number: data.contact.phone_number,
      mobile_number: data.contact.mobile_number,
      position_title: data.contact.position_title,
      contact_type: data.contact.contact_type,
    },
    billing_address: {
      address1: data.billing_address.address1,
      address2: data.billing_address.address2,
      city: data.billing_address.city,
      state: data.billing_address.state,
      zip: data.billing_address.zip,
      country: data.billing_address.country,
    },
    shipping_address: {
      address1: data.shipping_address.address1,
      address2: data.shipping_address.address2,
      city: data.shipping_address.city,
      state: data.shipping_address.state,
      zip: data.shipping_address.zip,
      country: data.shipping_address.country,
    },
    notes: data.notes,
    website: data.website,
  };
};

export function VendorFormUIV2(
  { mode, vendorData, billingAddressData, shippingAddressData, initial, vendorTypes, serviceCategories, locationTypes, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const methods = useForm<VendorForm>({
    defaultValues: initial,
    mode: "onChange",
  });

  return (
    <div className="min-h-screen">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (data) => {
            setIsSubmitting(true);
            try {
              const payload = mapVendorFormToCreatePayload(data);
              await onSubmit(payload);
            } finally {
              setIsSubmitting(false);
            }
          })}
          className="flex flex-row flex-wrap gap-6"
        >
          <div className="w-[40%] grow space-y-4">
            {/* ─── Company Information ───────────────────────────────── */}
            <SectionHeader icon={Building2} label="Company Information" />
            <Card className="bg-white border border-gray-200 shadow-sm h-[90%]">
              <CardContent className="p-6">
                <VendorDetailsFieldsV2 
                  vendorTypes={vendorTypes} 
                  serviceCategories={serviceCategories} 
                  locationTypes={locationTypes}
                  vendorData={vendorData}
                />
              </CardContent>
            </Card>
          </div>

          <div className="w-[40%] grow space-y-4">
          {/* ─── Contact Person ──────────────────────────────────── */}
            <SectionHeader icon={User} label="Contact Person" />
            <Card className="bg-white border border-gray-200 shadow-sm h-[90%]">
              <CardContent className="p-6">
                <VendorContactFieldsV2 vendorData={vendorData} />
              </CardContent>
            </Card>
          </div>

          <div className="w-[40%] grow space-y-4">
          {/* ─── Company Billing Address ───────────────────────────────── */}
          <SectionHeader icon={MapPinHouse} label="Billing Address" />
          <Card className="bg-white border border-gray-200 shadow-sm h-[90%]">
            <CardContent className="p-6">
              <VendorBillingAddressFieldsV2 billingAddressData={billingAddressData} />
            </CardContent>
          </Card>
          </div>

          <div className="w-[40%] grow space-y-4">
          {/* ─── Company Shipping Address ───────────────────────────────── */}
          <SectionHeader icon={MapPinHouse} label="Shipping Address" />
          <Card className="bg-white border border-gray-200 shadow-sm h-[90%]">
            <CardContent className="p-6">
              <VendorShippingAddressFieldsV2 shippingAddressData={shippingAddressData} />
            </CardContent>
          </Card>
          </div>

          <div className="w-full space-y-4">
          {/* ─── Additional Information ─────────────────────────────────────── */}
          <SectionHeader icon={FileText} label="Additional Information" />
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <VendorAdditionalFields notes={vendorData?.notes || ""} />
            </CardContent>
          </Card>
          </div>

          {/* ─── Actions ───────────────────────────────────────── */}
          <div className="flex justify-end gap-2 pt-4 w-full">
            <Button 
              type="button" 
              variant="outline" 
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Save Vendor"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
} 