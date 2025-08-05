export interface DimensionPreset {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  description: string;
}

export interface WeightPreset {
  id: string;
  name: string;
  weight: number;
  description: string;
}

// Common shipping dimensions (in inches and cm)
export const DIMENSION_PRESETS: DimensionPreset[] = [
  // Small boxes
  {
    id: "small-box",
    name: "Small Box (6x4x4)",
    length: 6,
    width: 4,
    height: 4,
    description: '6" x 4" x 4" - Small items, jewelry, electronics',
  },
  {
    id: "medium-box",
    name: "Medium Box (12x9x6)",
    length: 12,
    width: 9,
    height: 6,
    description: '12" x 9" x 6" - Books, clothing, small appliances',
  },
  {
    id: "large-box",
    name: "Large Box (16x12x8)",
    length: 16,
    width: 12,
    height: 8,
    description: '16" x 12" x 8" - Larger items, multiple products',
  },
  {
    id: "extra-large-box",
    name: "Extra Large Box (20x16x12)",
    length: 20,
    width: 16,
    height: 12,
    description: '20" x 16" x 12" - Large appliances, furniture',
  },
  // Envelopes
  {
    id: "letter-envelope",
    name: "Letter Envelope (9x6x0.25)",
    length: 9,
    width: 6,
    height: 0.25,
    description: '9" x 6" x 0.25" - Documents, flat items',
  },
  {
    id: "large-envelope",
    name: "Large Envelope (12x9x0.5)",
    length: 12,
    width: 9,
    height: 0.5,
    description: '12" x 9" x 0.5" - Larger documents, small flat items',
  },
  // FedEx specific
  {
    id: "fedex-envelope",
    name: "FedEx Envelope (9.5x12.5x0.5)",
    length: 9.5,
    width: 12.5,
    height: 0.5,
    description: "FedEx Standard Envelope",
  },
  {
    id: "fedex-pak",
    name: "FedEx Pak (12x15.5x0.75)",
    length: 12,
    width: 15.5,
    height: 0.75,
    description: "FedEx Pak - Padded envelope",
  },
  {
    id: "fedex-box-10",
    name: "FedEx Box 10 (10x7x4.75)",
    length: 10,
    width: 7,
    height: 4.75,
    description: 'FedEx 10" x 7" x 4.75" Box',
  },
  {
    id: "fedex-box-25",
    name: "FedEx Box 25 (12x10.9x10.4)",
    length: 12,
    width: 10.9,
    height: 10.4,
    description: 'FedEx 12" x 10.9" x 10.4" Box',
  },
  // UPS specific
  {
    id: "ups-envelope",
    name: "UPS Envelope (9.5x12.5x0.5)",
    length: 9.5,
    width: 12.5,
    height: 0.5,
    description: "UPS Standard Envelope",
  },
  {
    id: "ups-box-1",
    name: "UPS Box 1 (13x11x2)",
    length: 13,
    width: 11,
    height: 2,
    description: 'UPS 13" x 11" x 2" Box',
  },
  {
    id: "ups-box-2",
    name: "UPS Box 2 (13x11x3)",
    length: 13,
    width: 11,
    height: 3,
    description: 'UPS 13" x 11" x 3" Box',
  },
  // USPS specific
  {
    id: "usps-flat-rate-envelope",
    name: "USPS Flat Rate Envelope (12.5x9.5x0.25)",
    length: 12.5,
    width: 9.5,
    height: 0.25,
    description: "USPS Flat Rate Envelope",
  },
  {
    id: "usps-flat-rate-box-small",
    name: "USPS Small Flat Rate Box (8.6x5.4x1.6)",
    length: 8.6,
    width: 5.4,
    height: 1.6,
    description: "USPS Small Flat Rate Box",
  },
  {
    id: "usps-flat-rate-box-medium",
    name: "USPS Medium Flat Rate Box (11.25x8.75x6)",
    length: 11.25,
    width: 8.75,
    height: 6,
    description: "USPS Medium Flat Rate Box",
  },
  {
    id: "usps-flat-rate-box-large",
    name: "USPS Large Flat Rate Box (12.25x12x5.5)",
    length: 12.25,
    width: 12,
    height: 5.5,
    description: "USPS Large Flat Rate Box",
  },
];

// Common shipping weights (in lbs and kg)
export const WEIGHT_PRESETS: WeightPreset[] = [
  // Light items
  {
    id: "under-1-lb",
    name: "Under 1 lb",
    weight: 0.5,
    description: "Documents, small items",
  },
  {
    id: "1-lb",
    name: "1 lb",
    weight: 1,
    description: "Standard 1 pound",
  },
  {
    id: "2-lb",
    name: "2 lbs",
    weight: 2,
    description: "Small packages, books",
  },
  {
    id: "3-lb",
    name: "3 lbs",
    weight: 3,
    description: "Medium packages",
  },
  {
    id: "5-lb",
    name: "5 lbs",
    weight: 5,
    description: "Standard package weight",
  },
  {
    id: "10-lb",
    name: "10 lbs",
    weight: 10,
    description: "Heavy packages",
  },
  {
    id: "15-lb",
    name: "15 lbs",
    weight: 15,
    description: "Large packages",
  },
  {
    id: "20-lb",
    name: "20 lbs",
    weight: 20,
    description: "Very heavy packages",
  },
  {
    id: "25-lb",
    name: "25 lbs",
    weight: 25,
    description: "Maximum for many services",
  },
  {
    id: "30-lb",
    name: "30 lbs",
    weight: 30,
    description: "Freight territory",
  },
  {
    id: "50-lb",
    name: "50 lbs",
    weight: 50,
    description: "Heavy freight",
  },
  {
    id: "100-lb",
    name: "100 lbs",
    weight: 100,
    description: "Very heavy freight",
  },
];

// Get dimension presets for a specific unit system
export const getDimensionPresets = (
  unit: "metric" | "imperial"
): DimensionPreset[] => {
  if (unit === "metric") {
    return DIMENSION_PRESETS.map((preset) => ({
      ...preset,
      length: Math.round(preset.length * 2.54 * 10) / 10, // Convert to cm
      width: Math.round(preset.width * 2.54 * 10) / 10,
      height: Math.round(preset.height * 2.54 * 10) / 10,
      name: `${preset.name} (${Math.round(preset.length * 2.54 * 10) / 10}x${
        Math.round(preset.width * 2.54 * 10) / 10
      }x${Math.round(preset.height * 2.54 * 10) / 10} cm)`,
    }));
  }
  return DIMENSION_PRESETS;
};

// Get weight presets for a specific unit system
export const getWeightPresets = (
  unit: "metric" | "imperial"
): WeightPreset[] => {
  if (unit === "metric") {
    return WEIGHT_PRESETS.map((preset) => ({
      ...preset,
      weight: Math.round(preset.weight * 0.453592 * 10) / 10, // Convert to kg
      name: `${preset.name} (${
        Math.round(preset.weight * 0.453592 * 10) / 10
      } kg)`,
    }));
  }
  return WEIGHT_PRESETS;
};
