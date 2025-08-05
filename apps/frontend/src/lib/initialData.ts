// lib/emptyCustomer.ts

import {
  Contact,
  CustomerForm,
  ShippingCard,
  Address,
} from "@/components/forms/customer/types";
import { ProductForm } from "@/components/forms/product/types";
import { CustomerWithContacts } from "@/types/customer";
import { QuoteForm } from "@/types/quote";

export const emptyAddress = (): Address => ({
  address1: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  address_type: "BILLING",
});

export const emptyContact = (
    type: "PRIMARY" | "BILLING" | "SHIPPING" | "OTHER" = "PRIMARY"
): Contact => ({
  firstname: "",
  lastname: "",
  email: "",
  phoneNumber: "",
  mobileNumber: "",
  positionTitle: "",
  contactType: type,
});

/**
 * Returns a blank CustomerForm object with sensible defaults.
 * Useful for the "Add Customer" page so the form starts with empty fields.
 */
export function emptyCustomer(): CustomerForm {
  return {
    name: "",
    ownerName: "", // Add the missing ownerName property
    customerType: "LEAD",
    email: "",
    status: "ACTIVE",
    addresses: [
      { ...emptyAddress(), address_type: "BILLING" },
      { ...emptyAddress(), address_type: "SHIPPING" },
    ],
    contacts: [emptyContact("PRIMARY")],
  };
}

/**
 * Converts a CustomerWithContacts record into a CustomerForm format.
 * Useful for the "Edit Customer" page to populate the form with existing data.
 */
export function customerToForm(customer: CustomerWithContacts): CustomerForm {
  return {
    name: customer.name,
    ownerName: customer.owner_name || "", // Add the missing ownerName property
    customerType: customer.customer_type,
    email: customer.email,
    status: customer.status,
    addresses: (customer.addresses || []).map((addr) => ({
      address1: addr.address1 || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || "",
      country: addr.country || "",
      address_type: addr.address_type,
    })),
    contacts: (customer.contacts || []).map((contact) => ({
      firstname: contact.first_name,
      lastname: contact.last_name,
      email: contact.email,
      phoneNumber: contact.phone_number || "",
      mobileNumber: contact.mobile_number || "",
      positionTitle: contact.position_title || "",
      contactType: contact.contact_type,
    })),
  };
}

export function emptyProduct(): ProductForm {
  return {
    category: "",
    name: "",
    style: "",
    status: "ACTIVE",
    imageURL: null,
    imageURLs: [],
    trims: "",
    packaging: "",
    pricing: {
      basePrice: 0,
    },
    priceMatrix: [
      {
        id: 0,
        max_qty: 0,
        price: 0,
      },
    ],
    vendor: "",
  };
}

export function emptyQuote(): QuoteForm {
  return {
    customerId: "",
    customerName: "",
    quoteNumber: "",
    quoteDate: new Date().toISOString().split("T")[0], // Today's date
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days from now
    status: "DRAFT",
    billingAddress: {
      name: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    shippingAddress: {
      name: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    customerNotes: "",
    items: [],
    subtotal: 0,
    taxTotal: 0,
    totalAmount: 0,
    currency: "USD",
    notes: "",
    terms: "",
    tags: [],
  };
}
