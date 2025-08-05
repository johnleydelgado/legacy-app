// Company information constants for shipping
export const COMPANY_INFO = {
  name: "Legacy Knitting LLC",
  description: "Legacy Knitting: Custom Socks and Beanies Manufacturer in USA",
  address: {
    street1: "3310 Kitty Hawk Rd",
    city: "Wilmington",
    state: "NC",
    zip: "28405",
    country: "US",
    phone: "(844) 762-2678",
  },
  email: "info@legacyknitting.com",
  website: "http://www.legacyknitting.com",
} as const;

// EasyPost address format for shipping rates
export const FROM_ADDRESS = {
  name: COMPANY_INFO.name,
  street1: COMPANY_INFO.address.street1,
  city: COMPANY_INFO.address.city,
  state: COMPANY_INFO.address.state,
  zip: COMPANY_INFO.address.zip,
  country: COMPANY_INFO.address.country,
  phone: COMPANY_INFO.address.phone.replace(/\D/g, ""),
} as const;
