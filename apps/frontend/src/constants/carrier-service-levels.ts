// constants/carrier-service-levels.ts

export interface ServiceLevel {
  carrier: string;
  name: string;
  human_readable: string | null;
  description: string | null;
  max_weight: number | null;
  dimensions: string[] | null;
}

export interface Carrier {
  name: string;
  human_readable: string;
  service_levels: ServiceLevel[];
}

export const CARRIER_SERVICE_LEVELS: Carrier[] = [
  {
    name: "ups",
    human_readable: "UPS",
    service_levels: [
      {
        carrier: "ups",
        name: "Ground",
        human_readable: "UPS Ground",
        description: "1-5 Business Days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "UPSStandard",
        human_readable: "UPS Standard",
        description: "1-5 Business Days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "UPSSaver",
        human_readable: "UPS Worldwide Saver",
        description: "Next Day to 4 Business Days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "Express",
        human_readable: "UPS Worldwide Express",
        description: "Next Day to 3 Business Days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "ExpressPlus",
        human_readable: "UPS Worldwide Express Plus",
        description: "Next Day to 2 Business Days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "Expedited",
        human_readable: "UPS Worldwide Expedited",
        description: "3 to 5 Business Days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "NextDayAir",
        human_readable: "UPS Next Day Air",
        description: "Next Business Day by 10:30am",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "NextDayAirSaver",
        human_readable: "UPS Next Day Air Saver",
        description: "Next Business Day by 3:00pm",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "NextDayAirEarlyAM",
        human_readable: "UPS Next Day Air A.M.",
        description: "Next Business Days by 8:00am",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "2ndDayAir",
        human_readable: "UPS 2nd Day Air",
        description: "2 Business Days by end of day",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "2ndDayAirAM",
        human_readable: null,
        description: null,
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "ups",
        name: "3DaySelect",
        human_readable: "UPS 3-Day Select",
        description: "3 Business Days by end of day",
        max_weight: null,
        dimensions: null,
      },
    ],
  },
  {
    name: "fedex",
    human_readable: "FedEx",
    service_levels: [
      {
        carrier: "fedex",
        name: "FEDEX_2_DAY",
        human_readable: "FedEx 2 Day",
        description: "2 business days by 4:30pm, Saturday delivery",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "FEDEX_2_DAY_AM",
        human_readable: "FedEx 2 Day (AM)",
        description: "2 business days by 10:30am",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "FEDEX_EXPRESS_SAVER",
        human_readable: "FedEx Express Saver",
        description: "3 business days by 4:30pm",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "FEDEX_GROUND",
        human_readable: "FedEx Ground",
        description: "1-6 days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "FEDEX_INTERNATIONAL_CONNECT_PLUS",
        human_readable: "FedEx International (Connect Plus)",
        description: "2-5 business days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "FIRST_OVERNIGHT",
        human_readable: "FedEx First (Overnight)",
        description: "By 8am the next business day, Saturday delivery",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "GROUND_HOME_DELIVERY",
        human_readable: "FedEx Ground (Home Delivery)",
        description: "1-5 days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "INTERNATIONAL_ECONOMY",
        human_readable: "FedEx International (Economy)",
        description: "4-5 business days",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "INTERNATIONAL_FIRST",
        human_readable: "FedEx International First",
        description: "1-3 business days, time definite to select markets",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "FEDEX_INTERNATIONAL_PRIORITY",
        human_readable: "FedEx International (First)",
        description: "1-3 business days, time definite to select markets",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "PRIORITY_OVERNIGHT",
        human_readable: "FedEx Priority Overnight",
        description: "By 10:30am the next business day, Saturday delivery",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "SMART_POST",
        human_readable: "FedEx Ground Economy (formerly FedEx SmartPost)",
        description: "2-7 business days; Sunday Delivery to select markets",
        max_weight: null,
        dimensions: null,
      },
      {
        carrier: "fedex",
        name: "STANDARD_OVERNIGHT",
        human_readable: "FedEx Standard Overnight",
        description: "By 4:30pm the next business day",
        max_weight: null,
        dimensions: null,
      },
    ],
  },
  {
    name: "usps",
    human_readable: "USPS",
    service_levels: [
      {
        carrier: "usps",
        name: "First",
        human_readable: "First-Class Mail®",
        description: "1-5 business days",
        max_weight: 13.0,
        dimensions: [
          "Cards, Letters and Flats only (no Parcels)",
          "See Predefined Packages (Card, Letter, Flat) for details",
        ],
      },
      {
        carrier: "usps",
        name: "Priority",
        human_readable: "Priority Mail®",
        description: "1-3 business days",
        max_weight: 1120.0,
        dimensions: ["Combined Length and Girth < 108in"],
      },
      {
        carrier: "usps",
        name: "Express",
        human_readable: "Priority Mail Express®",
        description: "1-2 days",
        max_weight: 1120.0,
        dimensions: ["Combined Length and Girth < 108in"],
      },
      {
        carrier: "usps",
        name: "GroundAdvantage",
        human_readable: "USPS Ground Advantage®",
        description: "2-5 days",
        max_weight: 70.0,
        dimensions: ["Combined Length and Girth < 130in"],
      },
      {
        carrier: "usps",
        name: "LibraryMail",
        human_readable: "Library Mail®",
        description: "2-8 business days",
        max_weight: 1120.0,
        dimensions: ["Combined Length and Girth < 108in"],
      },
      {
        carrier: "usps",
        name: "MediaMail",
        human_readable: "Media Mail®",
        description: "2-8 business days",
        max_weight: 1120.0,
        dimensions: ["Combined Length and Girth < 108in"],
      },
      {
        carrier: "usps",
        name: "FirstClassMailInternational",
        human_readable: "First-Class Mail International®",
        description: null,
        max_weight: 15.994,
        dimensions: [
          "Must be rectangular, otherwise an additional charge may apply.",
        ],
      },
      {
        carrier: "usps",
        name: "FirstClassPackageInternationalService",
        human_readable: "First-Class Package International Service®",
        description: "7-21 days",
        max_weight: 64.0,
        dimensions: [
          "Packages (Other Than Rolls): Combined Length and Girth < 108in",
          "Rolls (Tubes): Length: min 4in; max 36 in. Length plus twice the diameter (combined): min 6.75 in; max 42in.",
          "Some countries have specific prohibitions and restrictions",
        ],
      },
      {
        carrier: "usps",
        name: "PriorityMailInternational",
        human_readable: "Priority Mail International®",
        description: "6-10 business days",
        max_weight: 1120.0,
        dimensions: ["Combined Length and Girth < 108in"],
      },
      {
        carrier: "usps",
        name: "ExpressMailInternational",
        human_readable: "Priority Mail Express International®",
        description: "3-5 business days",
        max_weight: 1120.0,
        dimensions: ["Combined Length and Girth < 108in"],
      },
    ],
  },
];

// Helper functions to work with service levels
export function getServiceLevel(
  carrier: string,
  serviceName: string
): ServiceLevel | null {
  const carrierData = CARRIER_SERVICE_LEVELS.find(
    (c) => c.name === carrier.toLowerCase()
  );
  if (!carrierData) return null;

  return carrierData.service_levels.find((s) => s.name === serviceName) || null;
}

export function getServiceDescription(
  carrier: string,
  serviceName: string
): string {
  const serviceLevel = getServiceLevel(carrier, serviceName);
  return (
    serviceLevel?.description || `${carrier} ${serviceName} shipping service`
  );
}

export function getHumanReadableName(
  carrier: string,
  serviceName: string
): string {
  const serviceLevel = getServiceLevel(carrier, serviceName);
  return serviceLevel?.human_readable || `${carrier} ${serviceName}`;
}

export function getCarrierServiceLevels(carrier: string): ServiceLevel[] {
  const carrierData = CARRIER_SERVICE_LEVELS.find(
    (c) => c.name === carrier.toLowerCase()
  );
  return carrierData?.service_levels || [];
}
