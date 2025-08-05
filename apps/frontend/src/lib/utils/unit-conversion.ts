// Unit conversion utilities
export const convertCmToInches = (cm: number): number => {
  return cm / 2.54;
};

export const convertInchesToCm = (inches: number): number => {
  return inches * 2.54;
};

export const convertKgToOz = (kg: number): number => {
  return kg * 35.274;
};

export const convertOzToKg = (oz: number): number => {
  return oz / 35.274;
};

export const convertKgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

export const convertLbsToKg = (lbs: number): number => {
  return lbs / 2.20462;
};

export const formatDimension = (
  value: number,
  unit: "metric" | "imperial"
): string => {
  // Handle invalid values
  if (value === null || value === undefined || isNaN(value)) {
    return unit === "metric" ? "0.0 cm" : "0.0 in";
  }

  if (unit === "metric") {
    return `${value.toFixed(1)} cm`;
  } else {
    // Value is already in inches, no conversion needed
    return `${value.toFixed(1)} in`;
  }
};

export const formatWeight = (
  value: number,
  unit: "metric" | "imperial"
): string => {
  // Handle invalid values
  if (value === null || value === undefined || isNaN(value)) {
    return unit === "metric" ? "0.00 kg" : "0 lb";
  }

  if (unit === "metric") {
    return `${value.toFixed(2)} kg`;
  } else {
    // Value is already in lbs, no conversion needed
    const wholeLbs = Math.floor(value);
    const oz = Math.round((value - wholeLbs) * 16);
    if (oz === 0) {
      return `${wholeLbs} lb`;
    } else {
      return `${wholeLbs} lb ${oz} oz`;
    }
  }
};
