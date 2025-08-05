import { FactoryStatus } from "@/services/factories/types";

export interface FactoryContact {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  position_title: string;
  contact_type: "PRIMARY" | "SECONDARY";
}

export interface FactoryForm {
  name: string;
  website: string;
  factory_type_id: number;
  factory_service_category_id: number;
  location_type_id: number;
  contact: FactoryContact;
  billing_address: FactoryBillingAddress;
  shipping_address: FactoryShippingAddress;
  industry: string;
  notes: string;
  status: FactoryStatus;
}

export interface FactoryBillingAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface FactoryShippingAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface FactoryType {
  id: number;
  name: string;
}

export interface FactoryServiceCategory {
  id: number;
  name: string;
} 