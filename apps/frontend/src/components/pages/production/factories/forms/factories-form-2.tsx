"use client";

import * as React from "react";
import { Building2, User, FileText, MapPinHouse } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FactoryAdditionalFields } from "./factories-additional-fields";
import { LocationType } from "@/services/location-types/types";
import { Address } from "@/services/addresses/types";
import { Factory, FactoryServiceCategory, FactoryType } from "@/services/factories/types";
import { FactoryForm } from "./types";
import { FactoryDetailsFieldsV2 } from "./factories-details-fields-2";
import { FactoryContactFieldsV2 } from "./factories-contact-fields-2";
import { FactoryBillingAddressFieldsV2 } from "./factories-billing-address-fields-2";
import { FactoryShippingAddressFieldsV2 } from "./factories-shipping-address-fields-2";

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
  factoryData?: Factory;
  billingAddressData?: Address;
  shippingAddressData?: Address;
  initial: FactoryForm;
  factoryTypes: FactoryType[];
  factoryServiceCategories: FactoryServiceCategory[];
  locationTypes: LocationType[];
  onSubmit: (data: FactoryForm) => void | Promise<void>;
}

const mapFactoryFormToCreatePayload = (data: FactoryForm): FactoryForm => {
  return {
    name: data.name,
    factory_type_id: Number(data.factory_type_id),
    factory_service_category_id: Number(data.factory_service_category_id),
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
    industry: data.industry,
  };
};

export function FactoryFormUIV2(
  { mode, factoryData, billingAddressData, shippingAddressData, initial, factoryTypes, factoryServiceCategories, locationTypes, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const methods = useForm<FactoryForm>({
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
              const payload = mapFactoryFormToCreatePayload(data);
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
                <FactoryDetailsFieldsV2 
                  factoryTypes={factoryTypes} 
                  factoryServiceCategories={factoryServiceCategories} 
                  locationTypes={locationTypes}
                  factoryData={factoryData}
                />
              </CardContent>
            </Card>
          </div>

          <div className="w-[40%] grow space-y-4">
          {/* ─── Contact Person ──────────────────────────────────── */}
            <SectionHeader icon={User} label="Contact Person" />
            <Card className="bg-white border border-gray-200 shadow-sm h-[90%]">
              <CardContent className="p-6">
                <FactoryContactFieldsV2 factoryData={factoryData} />
              </CardContent>
            </Card>
          </div>

          <div className="w-[40%] grow space-y-4">
          {/* ─── Company Billing Address ───────────────────────────────── */}
          <SectionHeader icon={MapPinHouse} label="Billing Address" />
          <Card className="bg-white border border-gray-200 shadow-sm h-[90%]">
            <CardContent className="p-6">
              <FactoryBillingAddressFieldsV2 billingAddressData={billingAddressData} />
            </CardContent>
          </Card>
          </div>

          <div className="w-[40%] grow space-y-4">
          {/* ─── Company Shipping Address ───────────────────────────────── */}
          <SectionHeader icon={MapPinHouse} label="Shipping Address" />
          <Card className="bg-white border border-gray-200 shadow-sm h-[90%]">
            <CardContent className="p-6">
              <FactoryShippingAddressFieldsV2 shippingAddressData={shippingAddressData} />
            </CardContent>
          </Card>
          </div>

          <div className="w-full space-y-4">
          {/* ─── Additional Information ─────────────────────────────────────── */}
          <SectionHeader icon={FileText} label="Additional Information" />
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <FactoryAdditionalFields notes={factoryData?.notes || ""} />
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
                ? "Save Factory"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
} 