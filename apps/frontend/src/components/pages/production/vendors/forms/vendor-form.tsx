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
import { VendorBillingAddressFields } from "./vendor-billing-address-fields";
import { VendorShippingAddressFields } from "./vendor-shipping-address-fields";
import { Address } from "@/services/addresses/types";

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

export function VendorFormUI(
  { mode, vendorData, billingAddressData, shippingAddressData, initial, vendorTypes, serviceCategories, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const methods = useForm<VendorForm>({
    defaultValues: initial,
    mode: "onChange",
  });

  return (
    <div className="bg-white min-h-screen">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (data) => {
            console.log("submit data:", data);

            setIsSubmitting(true);
            try {
              const payload = mapVendorFormToCreatePayload(data);
              await onSubmit(payload);
            } finally {
              setIsSubmitting(false);
            }
          })}
          className="space-y-6 pb-4 mx-auto p-6"
        >
          {/* ─── Company Information ───────────────────────────────── */}
          <SectionHeader icon={Building2} label="Company Information" />
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <VendorDetailsFields 
                vendorTypes={vendorTypes} 
                serviceCategories={serviceCategories} 
                vendorData={vendorData}
              />
            </CardContent>
          </Card>

          {/* ─── Contact Person ──────────────────────────────────── */}
          <SectionHeader icon={User} label="Contact Person" />
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <VendorContactFields vendorData={vendorData} />
            </CardContent>
          </Card>

          {/* ─── Company Billing Address ───────────────────────────────── */}
          <SectionHeader icon={MapPinHouse} label="Billing Address" />
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <VendorBillingAddressFields billingAddressData={billingAddressData} />
            </CardContent>
          </Card>

          {/* ─── Company Shipping Address ───────────────────────────────── */}
          <SectionHeader icon={MapPinHouse} label="Shipping Address" />
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <VendorShippingAddressFields shippingAddressData={shippingAddressData} />
            </CardContent>
          </Card>

          {/* ─── Additional Information ─────────────────────────────────────── */}
          <SectionHeader icon={FileText} label="Additional Information" />
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <VendorAdditionalFields notes={vendorData?.notes || ""} />
            </CardContent>
          </Card>

          {/* ─── Actions ───────────────────────────────────────── */}
          <div className="flex justify-end gap-2 pt-4">
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