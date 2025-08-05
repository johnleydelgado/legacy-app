export { VendorFormUI } from "@/components/pages/production/vendors/forms/vendor-form";
export type { VendorForm, VendorType, VendorServiceCategory, VendorContact } from "@/components/pages/production/vendors/forms/types";

import { VendorForm } from "@/components/pages/production/vendors/forms/types";
import { VendorStatus } from "@/services/vendors/types";

export const emptyVendorForm = (): VendorForm => ({
  name: "",
  website: "",
  vendor_type_id: -1,
  vendor_service_category_id: -1,
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
  status: VendorStatus.ACTIVE,
}); 
