// components/forms/customer/CustomerForm.tsx
"use client";

import * as React from "react";
import { Building2, MapPin, User, Plus } from "lucide-react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerDetailsFields } from "./customer-details-fields";
import { Address, Contact, CustomerForm, ShippingCard } from "./types";
import { emptyAddress, emptyContact } from "@/lib/initialData";
import { AddressCardItem } from "./address-card";
import { AddressBlock } from "./address-block";
import { BillingContactFields } from "./contact-fields";
import { mapCustomerFormToCreatePayload } from "@/lib/mappers/customer/mappers";
import { CreateCustomerDto } from "@/services/customers/types";
import { useRouter } from "next/navigation";
import { headerTitle } from "@/constants/HeaderTitle";

/* ── header component (unchanged) ─────────────────────────────────────── */
function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="pt-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <hr className="mt-2 border-t border-muted-foreground/30" />
    </div>
  );
}
/* --------------------------------------------------------------------- */

interface Props {
  mode: "create" | "edit";
  initial: CustomerForm;
  onSubmit: (data: CreateCustomerDto) => void | Promise<void>;
}

/* ─────────────────────────────────────────────────────────────────────── */

export function CustomerFormUI({ mode, initial, onSubmit }: Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [copyBillingAddress, setCopyBillingAddress] = React.useState(false);
  const router = useRouter();
  const { list } = headerTitle.crmCustomers;
  const methods = useForm<CustomerForm>({
    defaultValues: initial,
    mode: "onChange",
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control: methods.control,
    name: "addresses",
  });

  const addAddress = () => appendAddress(emptyAddress());

  // Handle copying billing address to shipping address
  const handleCopyBillingAddress = (checked: boolean) => {
    setCopyBillingAddress(checked);

    if (checked) {
      const billingAddress = methods.getValues("addresses.0");
      if (billingAddress) {
        // Copy all address fields except address_type
        methods.setValue("addresses.1.address1", billingAddress.address1);
        methods.setValue("addresses.1.city", billingAddress.city);
        methods.setValue("addresses.1.state", billingAddress.state);
        methods.setValue("addresses.1.zip", billingAddress.zip);
        methods.setValue("addresses.1.country", billingAddress.country);
        // Keep address_type as "SHIPPING"
        methods.setValue("addresses.1.address_type", "SHIPPING");
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(async (data) => {
          setIsSubmitting(true);
          try {
            const payload = mapCustomerFormToCreatePayload(data, 1);
            await onSubmit(payload);
          } finally {
            setIsSubmitting(false);
          }
        })}
        className="space-y-6 pb-4"
      >
        {/* ─── Customer InvoiceDetails ───────────────────────────────── */}
        <SectionHeader icon={Building2} label="Customer InvoiceDetails" />
        <Card>
          <CardContent>
            <CustomerDetailsFields />
          </CardContent>
        </Card>

        {/* ─── Contacts ──────────────────────────────────────── */}
        <SectionHeader icon={User} label="Contacts" />
        <Card>
          <CardContent>
            <BillingContactFields />
          </CardContent>
        </Card>

        {/* ─── Addresses ─────────────────────────────────────── */}
        <SectionHeader icon={MapPin} label="Addresses" />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddressBlock prefix="addresses.0" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-sm font-semibold">
              Shipping Address
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-billing"
                checked={copyBillingAddress}
                onCheckedChange={handleCopyBillingAddress}
              />
              <label
                htmlFor="copy-billing"
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Same as billing address
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <AddressBlock prefix="addresses.1" />
          </CardContent>
        </Card>
        {addressFields.slice(2).map((field, index) => (
          <AddressCardItem
            key={field.id}
            idx={index + 2}
            prefix={`addresses.${index + 2}`}
            onRemove={() => removeAddress(index + 2)}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAddress}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add shipping address
        </Button>

        {/* ─── Actions ───────────────────────────────────────── */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
              ? "Save Customer"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
