export interface Customer {
  pk_customer_id: number;
  fk_organization_id: number;
  name: string;
  email: string;
  phone_number: string | null;
  mobile_number: string | null;
  website_url: string | null;
  industry: string | null;
  customer_type: "LEAD" | "PROSPECT" | "CLIENT";
  status: "ACTIVE" | "INACTIVE";
  source: string | null;
  converted_at: string | null;
  notes: string | null;
  vat_number: string | null;
  tax_id: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CustomersResponse {
  items: Customer[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface Contact {
  pk_contact_id: number;
  fk_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  mobile_number: string | null;
  position_title: string | null;
  contact_type: "PRIMARY" | "BILLING" | "SHIPPING" | "OTHER";
  table: string;
  created_at: string;
  updated_at: string;
}

export interface ContactsResponse {
  items: Contact[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface Address {
  pk_address_id: number;
  fk_id: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: "BILLING" | "SHIPPING";
  table: string;
}

export interface CustomerWithContacts {
  pk_customer_id: number;
  fk_organization_id: number;
  name: string;
  owner_name?: string;
  email: string;
  phone_number: string | null;
  mobile_number: string | null;
  website_url: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  industry: string | null;
  customer_type: "LEAD" | "PROSPECT" | "CLIENT";
  status: "ACTIVE" | "INACTIVE";
  source: string | null;
  converted_at: string | null;
  notes: string | null;
  vat_number: string | null;
  tax_id: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string | null;
  contacts: Contact[];
  addresses: Address[];
}

export interface CustomersWithContactsResponse {
  items: CustomerWithContacts[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface AddressPayload {
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: "BILLING" | "SHIPPING";
}

export interface ContactPayload {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  mobileNumber: string;
  positionTitle: string;
  contactType: "PRIMARY" | "BILLING" | "SHIPPING" | "OTHER";
}

export interface CreateCustomerPayload {
  organizationID: number;
  name: string;
  customerType: "LEAD" | "PROSPECT" | "CLIENT";
  status: "ACTIVE" | "INACTIVE";
  email: string;
  addresses: AddressPayload[];
  contacts: ContactPayload[];
}
