import { VendorStatus } from "@/services/vendors/types";

export interface VendorContact {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  position_title: string;
  contact_type: "PRIMARY" | "SECONDARY";
}

export interface VendorForm {
  name: string;
  website: string;
  vendor_type_id: number;
  vendor_service_category_id: number;
  location_type_id: number;
  contact: VendorContact;
  billing_address: VendorBillingAddress;
  shipping_address: VendorShippingAddress;
  notes: string;
  status: VendorStatus;
}

export interface VendorBillingAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface VendorShippingAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface VendorType {
  id: number;
  name: string;
}

export interface VendorServiceCategory {
  id: number;
  name: string;
} 