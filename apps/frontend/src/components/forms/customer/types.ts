export interface Address {
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: "BILLING" | "SHIPPING";
}

export type ShippingCard = Address;

export interface Contact {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  mobileNumber: string;
  positionTitle: string;
  contactType: "PRIMARY" | "BILLING" | "SHIPPING" | "OTHER";
}

export interface CustomerForm {
  name: string;
  ownerName: string;
  customerType: "LEAD" | "PROSPECT" | "CLIENT";
  email: string;
  status: "ACTIVE" | "INACTIVE";
  addresses: Address[];
  contacts: Contact[];
}
