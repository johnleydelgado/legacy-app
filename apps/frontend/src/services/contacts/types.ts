export interface Contact {
  pk_contact_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  position_title: string;
  contact_type: string;
  fk_id: number;
  table: string;
}

export interface CreateContactDto {
  fk_id: number;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  mobileNumber: string;
  positionTitle: string;
  contactType: string;
  table: string;
}

export interface UpdateContactDto {
  firstname?: string;
  lastname?: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  positionTitle?: string;
  contactType?: string;
}

export type ContactType = "PRIMARY" | "BILLING" | "SHIPPING" | "OTHER" | string;

export enum ContactTypeEnums {
  PRIMARY = "PRIMARY",
  BILLING = "BILLING",
  SHIPPING = "SHIPPING",
  OTHER = "OTHER"
}

export interface ContactReference extends Contact {
  created_at: string;
  updated_at: string;
}
