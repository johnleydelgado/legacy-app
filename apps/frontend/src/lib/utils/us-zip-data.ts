export interface ZipCodeEntry {
  zip: string;
  city: string;
  state: string;
  state_name: string;
  county: string;
  lat: number;
  lng: number;
  accuracy: number;
}

export interface CitySuggestion {
  city: string;
  state: string;
  state_name: string;
}

// Cache for processed data
let zipDataCache: ZipCodeEntry[] | null = null;
let cityStateCache: Map<string, CitySuggestion[]> | null = null;
let zipByCityStateCache: Map<string, string[]> | null = null;

// Load and cache the ZIP data
const loadZipData = async (): Promise<ZipCodeEntry[]> => {
  if (zipDataCache) {
    return zipDataCache;
  }

  try {
    const response = await fetch(
      "https://legacyknitting-app.s3.us-east-1.amazonaws.com/assets/us-zip-flat.json"
    );

    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
    }

    const data: ZipCodeEntry[] = await response.json();
    zipDataCache = data;
    return data;
  } catch (error) {
    console.error("Error loading ZIP data:", error);
    return [];
  }
};

// Get unique city/state combinations
const getCityStateSuggestions = async (): Promise<
  Map<string, CitySuggestion[]>
> => {
  if (cityStateCache) {
    return cityStateCache;
  }

  const data = await loadZipData();
  const cityStateMap = new Map<string, CitySuggestion[]>();

  data.forEach((entry) => {
    const key = `${entry.city.toLowerCase()}|${entry.state}`;
    if (!cityStateMap.has(key)) {
      cityStateMap.set(key, [
        {
          city: entry.city,
          state: entry.state,
          state_name: entry.state_name,
        },
      ]);
    }
  });

  cityStateCache = cityStateMap;
  return cityStateMap;
};

// Get ZIP codes by city/state
const getZipCodesByCityState = async (): Promise<Map<string, string[]>> => {
  if (zipByCityStateCache) {
    return zipByCityStateCache;
  }

  const data = await loadZipData();
  const zipMap = new Map<string, string[]>();

  data.forEach((entry) => {
    const key = `${entry.city}|${entry.state}`;
    if (!zipMap.has(key)) {
      zipMap.set(key, []);
    }
    zipMap.get(key)!.push(entry.zip);
  });

  zipByCityStateCache = zipMap;
  return zipMap;
};

// Search cities by query
export const searchCities = async (
  query: string
): Promise<CitySuggestion[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  const results: CitySuggestion[] = [];
  const queryLower = query.toLowerCase();

  try {
    const cityStateMap = await getCityStateSuggestions();

    // Search in ZIP database
    cityStateMap.forEach((suggestions, key) => {
      suggestions.forEach((suggestion) => {
        if (
          suggestion.city.toLowerCase().includes(queryLower) ||
          suggestion.state_name.toLowerCase().includes(queryLower) ||
          suggestion.state.toLowerCase().includes(queryLower)
        ) {
          results.push(suggestion);
        }
      });
    });
  } catch (error) {
    console.warn("Failed to load ZIP data, using major cities only:", error);
  }

  // Search in major cities list (always available as fallback)
  MAJOR_CITIES.forEach((city) => {
    if (
      city.city.toLowerCase().includes(queryLower) ||
      city.state_name.toLowerCase().includes(queryLower) ||
      city.state.toLowerCase().includes(queryLower)
    ) {
      // Check if not already in results to avoid duplicates
      const exists = results.some(
        (result) => result.city === city.city && result.state === city.state
      );
      if (!exists) {
        results.push(city);
      }
    }
  });

  // Sort by relevance (exact matches first, then alphabetical)
  return results
    .sort((a, b) => {
      const aExact = a.city.toLowerCase() === queryLower;
      const bExact = b.city.toLowerCase() === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.city.localeCompare(b.city);
    })
    .slice(0, 20); // Limit to 20 results
};

// Get ZIP codes for a specific city/state
export const getZipCodesForCity = async (
  city: string,
  state: string
): Promise<string[]> => {
  if (!city || !state) {
    return [];
  }

  const zipMap = await getZipCodesByCityState();
  const key = `${city}|${state}`;
  return zipMap.get(key) || [];
};

// Clear cache if needed
export const clearZipDataCache = () => {
  zipDataCache = null;
  cityStateCache = null;
  zipByCityStateCache = null;
};

// Common major cities that might not be in ZIP database
const MAJOR_CITIES: CitySuggestion[] = [
  { city: "New York", state: "NY", state_name: "New York" },
  { city: "Los Angeles", state: "CA", state_name: "California" },
  { city: "Chicago", state: "IL", state_name: "Illinois" },
  { city: "Houston", state: "TX", state_name: "Texas" },
  { city: "Phoenix", state: "AZ", state_name: "Arizona" },
  { city: "Philadelphia", state: "PA", state_name: "Pennsylvania" },
  { city: "San Antonio", state: "TX", state_name: "Texas" },
  { city: "San Diego", state: "CA", state_name: "California" },
  { city: "Dallas", state: "TX", state_name: "Texas" },
  { city: "San Jose", state: "CA", state_name: "California" },
  { city: "Austin", state: "TX", state_name: "Texas" },
  { city: "Jacksonville", state: "FL", state_name: "Florida" },
  { city: "Fort Worth", state: "TX", state_name: "Texas" },
  { city: "Columbus", state: "OH", state_name: "Ohio" },
  { city: "Charlotte", state: "NC", state_name: "North Carolina" },
  { city: "San Francisco", state: "CA", state_name: "California" },
  { city: "Indianapolis", state: "IN", state_name: "Indiana" },
  { city: "Seattle", state: "WA", state_name: "Washington" },
  { city: "Denver", state: "CO", state_name: "Colorado" },
  { city: "Washington", state: "DC", state_name: "District of Columbia" },
  { city: "Boston", state: "MA", state_name: "Massachusetts" },
  { city: "El Paso", state: "TX", state_name: "Texas" },
  { city: "Nashville", state: "TN", state_name: "Tennessee" },
  { city: "Detroit", state: "MI", state_name: "Michigan" },
  { city: "Oklahoma City", state: "OK", state_name: "Oklahoma" },
  { city: "Portland", state: "OR", state_name: "Oregon" },
  { city: "Las Vegas", state: "NV", state_name: "Nevada" },
  { city: "Memphis", state: "TN", state_name: "Tennessee" },
  { city: "Louisville", state: "KY", state_name: "Kentucky" },
  { city: "Baltimore", state: "MD", state_name: "Maryland" },
  { city: "Milwaukee", state: "WI", state_name: "Wisconsin" },
  { city: "Albuquerque", state: "NM", state_name: "New Mexico" },
  { city: "Tucson", state: "AZ", state_name: "Arizona" },
  { city: "Fresno", state: "CA", state_name: "California" },
  { city: "Sacramento", state: "CA", state_name: "California" },
  { city: "Mesa", state: "AZ", state_name: "Arizona" },
  { city: "Kansas City", state: "MO", state_name: "Missouri" },
  { city: "Atlanta", state: "GA", state_name: "Georgia" },
  { city: "Long Beach", state: "CA", state_name: "California" },
  { city: "Colorado Springs", state: "CO", state_name: "Colorado" },
  { city: "Raleigh", state: "NC", state_name: "North Carolina" },
  { city: "Miami", state: "FL", state_name: "Florida" },
  { city: "Virginia Beach", state: "VA", state_name: "Virginia" },
  { city: "Omaha", state: "NE", state_name: "Nebraska" },
  { city: "Oakland", state: "CA", state_name: "California" },
  { city: "Minneapolis", state: "MN", state_name: "Minnesota" },
  { city: "Tulsa", state: "OK", state_name: "Oklahoma" },
  { city: "Arlington", state: "TX", state_name: "Texas" },
  { city: "Tampa", state: "FL", state_name: "Florida" },
  { city: "New Orleans", state: "LA", state_name: "Louisiana" },
  { city: "Wichita", state: "KS", state_name: "Kansas" },
  { city: "Cleveland", state: "OH", state_name: "Ohio" },
  { city: "Bakersfield", state: "CA", state_name: "California" },
  { city: "Aurora", state: "CO", state_name: "Colorado" },
  { city: "Anaheim", state: "CA", state_name: "California" },
  { city: "Honolulu", state: "HI", state_name: "Hawaii" },
  { city: "Santa Ana", state: "CA", state_name: "California" },
  { city: "Corpus Christi", state: "TX", state_name: "Texas" },
  { city: "Riverside", state: "CA", state_name: "California" },
  { city: "Lexington", state: "KY", state_name: "Kentucky" },
  { city: "Stockton", state: "CA", state_name: "California" },
  { city: "Henderson", state: "NV", state_name: "Nevada" },
  { city: "Saint Paul", state: "MN", state_name: "Minnesota" },
  { city: "St. Louis", state: "MO", state_name: "Missouri" },
  { city: "Cincinnati", state: "OH", state_name: "Ohio" },
  { city: "Pittsburgh", state: "PA", state_name: "Pennsylvania" },
  { city: "Greensboro", state: "NC", state_name: "North Carolina" },
  { city: "Anchorage", state: "AK", state_name: "Alaska" },
  { city: "Plano", state: "TX", state_name: "Texas" },
  { city: "Lincoln", state: "NE", state_name: "Nebraska" },
  { city: "Orlando", state: "FL", state_name: "Florida" },
  { city: "Irvine", state: "CA", state_name: "California" },
  { city: "Newark", state: "NJ", state_name: "New Jersey" },
  { city: "Durham", state: "NC", state_name: "North Carolina" },
  { city: "Chula Vista", state: "CA", state_name: "California" },
  { city: "Toledo", state: "OH", state_name: "Ohio" },
  { city: "Fort Wayne", state: "IN", state_name: "Indiana" },
  { city: "St. Petersburg", state: "FL", state_name: "Florida" },
  { city: "Laredo", state: "TX", state_name: "Texas" },
  { city: "Jersey City", state: "NJ", state_name: "New Jersey" },
  { city: "Chandler", state: "AZ", state_name: "Arizona" },
  { city: "Madison", state: "WI", state_name: "Wisconsin" },
  { city: "Lubbock", state: "TX", state_name: "Texas" },
  { city: "Scottsdale", state: "AZ", state_name: "Arizona" },
  { city: "Reno", state: "NV", state_name: "Nevada" },
  { city: "Buffalo", state: "NY", state_name: "New York" },
  { city: "Gilbert", state: "AZ", state_name: "Arizona" },
  { city: "Glendale", state: "AZ", state_name: "Arizona" },
  { city: "North Las Vegas", state: "NV", state_name: "Nevada" },
  { city: "Winston-Salem", state: "NC", state_name: "North Carolina" },
  { city: "Chesapeake", state: "VA", state_name: "Virginia" },
  { city: "Norfolk", state: "VA", state_name: "Virginia" },
  { city: "Fremont", state: "CA", state_name: "California" },
  { city: "Garland", state: "TX", state_name: "Texas" },
  { city: "Irving", state: "TX", state_name: "Texas" },
  { city: "Hialeah", state: "FL", state_name: "Florida" },
  { city: "Richmond", state: "VA", state_name: "Virginia" },
  { city: "Boise", state: "ID", state_name: "Idaho" },
  { city: "Spokane", state: "WA", state_name: "Washington" },
  { city: "Baton Rouge", state: "LA", state_name: "Louisiana" },
];
