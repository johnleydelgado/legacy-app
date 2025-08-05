"use client";

import * as React from "react";
import { BackHeader } from "@/components/ui/back-header";
import { headerTitle } from "@/constants/HeaderTitle";
import { useCustomer, useCustomerMutations } from "@/hooks/useCustomers";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomerFormUI } from "@/components/forms/customer/customer-form";
import type {
  CreateCustomerDto,
  UpdateCustomerDto,
  Customer,
} from "@/services/customers/types";
import type {
  CustomerWithContacts,
  Contact as LegacyContact,
  Address as LegacyAddress,
} from "@/types/customer";
import type { CustomerForm } from "@/components/forms/customer/types";
import CustomerLoading from "@/app/crm/customers/loading";

// Convert Customer to CustomerWithContacts format for the form
function convertCustomerToFormFormat(customer: Customer): CustomerWithContacts {
  // Map service contacts to legacy contact format
  const legacyContacts: LegacyContact[] = (customer.contacts || []).map(
    (contact) => {
      return {
        pk_contact_id: contact.pk_contact_id,
        fk_id: customer.pk_customer_id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone_number: contact.phone_number || "",
        mobile_number: contact.mobile_number || "",
        position_title: contact.position_title || "",
        contact_type: (contact.contact_type || "OTHER") as
          | "PRIMARY"
          | "BILLING"
          | "SHIPPING"
          | "OTHER",
        table: "Customers",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  );

  // Map service addresses to legacy address format
  const legacyAddresses: LegacyAddress[] = (customer.addresses || []).map(
    (address) => ({
      pk_address_id: address.pk_address_id,
      fk_id: customer.pk_customer_id,
      address1: address.address1,
      address2: address.address2 || "",
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      address_type: address.address_type,
      table: "Customers",
    })
  );

  return {
    pk_customer_id: customer.pk_customer_id,
    fk_organization_id: customer.fk_organization_id,
    name: customer.name,
    email: customer.email,
    phone_number: customer.phone_number,
    mobile_number: customer.mobile_number,
    website_url: customer.website_url,
    billing_address: customer.billing_address,
    shipping_address: customer.shipping_address,
    city: customer.city,
    state: customer.state,
    postal_code: customer.postal_code,
    country: customer.country,
    industry: customer.industry,
    customer_type:
      customer.customer_type === "CUSTOMER"
        ? "CLIENT"
        : (customer.customer_type as "LEAD" | "PROSPECT"),
    status: customer.status as "ACTIVE" | "INACTIVE",
    source: customer.source,
    converted_at: customer.converted_at,
    notes: customer.notes,
    vat_number: customer.vat_number,
    tax_id: customer.tax_id,
    tags: customer.tags,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
    contacts: legacyContacts,
    addresses: legacyAddresses,
  };
}

// Convert CustomerWithContacts to CustomerForm format
function customerToForm(customer: CustomerWithContacts): CustomerForm {
  // Ensure we have at least one contact for the form
  let contacts = customer.contacts || [];
  if (contacts.length === 0) {
    contacts = [
      {
        pk_contact_id: 0,
        fk_id: customer.pk_customer_id,
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        mobile_number: "",
        position_title: "",
        contact_type: "PRIMARY",
        table: "Customers",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  // Ensure we have at least billing and shipping addresses
  let addresses = customer.addresses || [];
  if (addresses.length === 0) {
    addresses = [
      {
        pk_address_id: 0,
        fk_id: customer.pk_customer_id,
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        address_type: "BILLING",
        table: "Customers",
      },
      {
        pk_address_id: 0,
        fk_id: customer.pk_customer_id,
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        address_type: "SHIPPING",
        table: "Customers",
      },
    ];
  } else if (addresses.length === 1) {
    // Ensure we have both billing and shipping
    const hasShipping = addresses.some(
        (addr) => addr.address_type === "SHIPPING"
    );
    if (!hasShipping) {
      addresses.push({
        pk_address_id: 0,
        fk_id: customer.pk_customer_id,
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        address_type: "SHIPPING",
        table: "Customers",
      });
    }
  }

  const formData = {
    name: customer.name,
    ownerName: "", // Add the missing ownerName property
    customerType: customer.customer_type,
    email: customer.email,
    status: customer.status,
    addresses: addresses.map((addr) => ({
      address1: addr.address1 || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || "",
      country: addr.country || "",
      address_type: addr.address_type,
    })),
    contacts: contacts.map((contact) => {
      return {
        firstname: contact.first_name || "",
        lastname: contact.last_name || "",
        email: contact.email || "",
        phoneNumber: contact.phone_number || "",
        mobileNumber: contact.mobile_number || "",
        positionTitle: contact.position_title || "",
        contactType: contact.contact_type || "PRIMARY",
      };
    }),
  };

  return formData;
}

const EditCustomer = () => {
    const params = useParams();
  const router = useRouter();
  const { edit, list, detail } = headerTitle.crmCustomers;
  const customerId = Number(params.customerId);

  const { data: customer, isLoading, error } = useCustomer(customerId);
  const { updateCustomer } = useCustomerMutations();

  if (isLoading) {
    return <CustomerLoading />;
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-destructive">
          Error: {error?.message || "Customer not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Convert the customer data to the format expected by the form
  const customerWithContacts = convertCustomerToFormFormat(customer);
  const initialData = customerToForm(customerWithContacts);

  const handleSubmit = async (data: CreateCustomerDto) => {
    try {
      // Remove organizationID for update payload
      const { organizationID, ...updateData } = data;

      // Format addresses according to the DTO
      const formattedAddresses = updateData.addresses?.map((addr) => ({
        address1: addr.address1,
        address2: addr.address2 || "",
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
        country: addr.country,
        address_type: addr.address_type,
      }));

      // Format contacts according to the DTO
      const formattedContacts = updateData.contacts?.map((contact) => ({
        firstname: contact.firstname,
        lastname: contact.lastname,
        email: contact.email,
        phoneNumber: contact.phoneNumber || "",
        mobileNumber: contact.mobileNumber || "",
        positionTitle: contact.positionTitle || "",
        contactType: contact.contactType,
      }));

      // Prepare the update payload with the correct field names
      const updatePayload: UpdateCustomerDto = {
        name: updateData.name,
        ownerName: updateData.ownerName,
        email: updateData.email,
        phoneNumber: updateData.phoneNumber,
        mobileNumber: updateData.mobileNumber,
        websiteURL: updateData.websiteURL,
        industry: updateData.industry,
        customerType: updateData.customerType,
        status: updateData.status,
        source: updateData.source,
        convertedAt: updateData.convertedAt,
        notes: updateData.notes,
        vatNumber: updateData.vatNumber,
        taxID: updateData.taxID,
        tags: updateData.tags,
        addresses: formattedAddresses,
        contacts: formattedContacts,
      };

      const result = await updateCustomer.mutateAsync({
        id: customerId,
        data: updatePayload,
      });

      toast.success("Customer updated successfully");
      router.push(detail.href.replace(":id", params.customerId as string));
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Failed to update customer: ${err.message}`);
      } else {
        toast.error("Failed to update customer: Unknown error");
      }
      throw err;
    }
  };

  return (
    <div className="space-y-6 px-6">
      {/* <BackHeader
        href={detail.href.replace(":id", params.customerId as string)}
        title={edit.title}
      /> */}

      <CustomerFormUI
        mode="edit"
        initial={initialData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default EditCustomer;
