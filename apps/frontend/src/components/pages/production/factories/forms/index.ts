import { FactoryForm } from "@/components/pages/production/factories/forms/types";
import { FactoryStatus } from "@/services/factories/types";

export const emptyFactoryForm = (): FactoryForm => ({
  name: "",
  website: "",
  industry: "",
  factory_type_id: -1,
  factory_service_category_id: -1,
  location_type_id: -1,
  contact: {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    mobile_number: "",
    position_title: "",
    contact_type: "PRIMARY",
  },
  billing_address: {
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  }, 
  shipping_address: {
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  },
  notes: "",
  status: FactoryStatus.ACTIVE,
}); 
