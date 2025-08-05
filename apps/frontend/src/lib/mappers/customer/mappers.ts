import type { CustomerForm } from "@/components/forms/customer/types";
import type { CreateCustomerDto } from "@/services/customers/types";

export function mapCustomerFormToCreatePayload(
  form: CustomerForm,
  organizationId: number
): CreateCustomerDto {
  const payload: CreateCustomerDto = {
    organizationID: organizationId,
    name: form.name,
    ownerName: form.ownerName,
    customerType:
      form.customerType === "CLIENT"
        ? "CUSTOMER"
        : (form.customerType as "LEAD" | "PROSPECT" | "CUSTOMER"),
    status: form.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
    email: form.email,
    addresses: form.addresses.map((addr) => ({
      address1: addr.address1,
      address2: "", // Default empty string since form doesn't have address2
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      address_type: addr.address_type,
    })),
    contacts: form.contacts.map((contact) => ({
      firstname: contact.firstname,
      lastname: contact.lastname,
      email: contact.email,
      phoneNumber: contact.phoneNumber || "",
      mobileNumber: contact.mobileNumber || "",
      positionTitle: contact.positionTitle || "",
      contactType: contact.contactType,
    })),
  };

  return payload;
}
