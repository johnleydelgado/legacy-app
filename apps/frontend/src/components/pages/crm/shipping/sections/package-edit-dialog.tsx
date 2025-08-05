"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader as DialogHeaderBase,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { US_STATES } from "@/constants/states";
import {
  searchCities,
  getZipCodesForCity,
  type CitySuggestion,
} from "@/lib/utils/us-zip-data";
import {
  Ruler,
  Scale,
  MapPin,
  Package,
  User,
  MapPinIcon,
  Building2,
  Phone,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { PackageSpec } from "./package-specifications";
import {
  convertCmToInches,
  convertInchesToCm,
  convertKgToLbs,
  convertLbsToKg,
} from "@/lib/utils/unit-conversion";
import { useActiveShippingDimensionPresets } from "@/hooks/useShippingDimensionPresets";
import { useActiveShippingWeightPresets } from "@/hooks/useShippingWeightPresets";
import type { ShippingDimensionPreset } from "@/services/shipping-dimension-presets/types";
import type { ShippingWeightPreset } from "@/services/shipping-weight-presets/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  form: PackageSpec;
  onChange: (field: keyof PackageSpec, value: string) => void;
  onSave: () => void;
  onPackageChange?: () => void;
  // Customer shipping data for default values
  shippingContact?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  shippingAddress?: {
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

const PackageEditDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  editing,
  form,
  onChange,
  onSave,
  onPackageChange,
  shippingContact,
  shippingAddress,
}) => {
  // Dropdown states
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [zipOpen, setZipOpen] = useState(false);

  // Search queries
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [zipSearch, setZipSearch] = useState("");

  // Visible inputs
  const [stateInput, setStateInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [zipInput, setZipInput] = useState("");

  // Data states
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [zipSuggestions, setZipSuggestions] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingZips, setIsLoadingZips] = useState(false);

  // Request cancellation for city search
  const latestCityRequest = useRef(0);

  // Dimension and weight dropdown states
  const [useDimensionPresets, setUseDimensionPresets] = useState(false);
  const [useWeightPresets, setUseWeightPresets] = useState(false);
  const [dimensionPresets, setDimensionPresets] = useState<
    ShippingDimensionPreset[]
  >([]);
  const [weightPresets, setWeightPresets] = useState<ShippingWeightPreset[]>(
    []
  );
  const [dimensionOpen, setDimensionOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [dimensionSearch, setDimensionSearch] = useState("");
  const [weightSearch, setWeightSearch] = useState("");

  // Refs for closing on outside click
  const stateWrapperRef = useRef<HTMLDivElement | null>(null);
  const cityWrapperRef = useRef<HTMLDivElement | null>(null);
  const zipWrapperRef = useRef<HTMLDivElement | null>(null);
  const dimensionWrapperRef = useRef<HTMLDivElement | null>(null);
  const weightWrapperRef = useRef<HTMLDivElement | null>(null);

  const defaultsSetRef = useRef(false);

  // API hooks for fetching presets - fetch all presets instead of by unit
  const {
    data: dimensionPresetsData,
    isLoading: isLoadingDimensionPresets,
    error: dimensionPresetsError,
    fetchActivePresets: fetchDimensionPresets,
  } = useActiveShippingDimensionPresets();

  const {
    data: weightPresetsData,
    isLoading: isLoadingWeightPresets,
    error: weightPresetsError,
    fetchActivePresets: fetchWeightPresets,
  } = useActiveShippingWeightPresets();

  // Sync visible state text with stored abbreviation
  useEffect(() => {
    const match = US_STATES.find((s) => s.value === form.state);
    setStateInput(match ? match.label : form.state || "");
  }, [form.state]);

  // Sync city & zip visible inputs
  useEffect(() => {
    setCityInput(form.city || "");
  }, [form.city]);

  useEffect(() => {
    setZipInput(form.zip || "");
  }, [form.zip]);

  // Set default values from customer data when dialog opens for new packages
  useEffect(() => {
    if (open && !editing && !defaultsSetRef.current) {
      // Company name
      if (!form.company_name && shippingContact) {
        const companyName =
          `${shippingContact.first_name} ${shippingContact.last_name}`.trim();
        if (companyName) onChange("company_name", companyName);
      }
      // Phone
      if (!form.phone_number && shippingContact?.phone_number) {
        onChange("phone_number", shippingContact.phone_number);
      }
      // Address fields
      if (!form.address && shippingAddress?.address1)
        onChange("address", shippingAddress.address1);
      if (!form.city && shippingAddress?.city)
        onChange("city", shippingAddress.city);
      if (!form.state && shippingAddress?.state)
        onChange("state", shippingAddress.state);
      if (!form.zip && shippingAddress?.zip)
        onChange("zip", shippingAddress.zip);

      // Country must be US only
      if (form.country !== "US") onChange("country", "US");

      defaultsSetRef.current = true;
    }
    if (!open) {
      defaultsSetRef.current = false;
    }
  }, [
    open,
    editing,
    shippingContact,
    shippingAddress,
    form.company_name,
    form.phone_number,
    form.address,
    form.city,
    form.state,
    form.zip,
    form.country,
    onChange,
  ]);

  // Load dimension and weight presets from API
  useEffect(() => {
    if (open) {
      // Only load when dialog is open - fetch all active presets
      fetchDimensionPresets();
      fetchWeightPresets();
    }
  }, [open, fetchDimensionPresets, fetchWeightPresets]);

  // Convert presets to current measurement unit and update local state
  useEffect(() => {
    if (dimensionPresetsData && form.measurement_unit) {
      const convertedPresets = dimensionPresetsData.map((preset) => {
        if (preset.measurement_unit === form.measurement_unit) {
          return preset; // No conversion needed
        }

        // Convert from imperial to metric or vice versa
        const convertedPreset = {
          ...preset,
          measurement_unit: form.measurement_unit,
          length:
            form.measurement_unit === "metric"
              ? convertInchesToCm(preset.length)
              : convertCmToInches(preset.length),
          width:
            form.measurement_unit === "metric"
              ? convertInchesToCm(preset.width)
              : convertCmToInches(preset.width),
          height:
            form.measurement_unit === "metric"
              ? convertInchesToCm(preset.height)
              : convertCmToInches(preset.height),
        };

        return convertedPreset;
      });

      setDimensionPresets(convertedPresets);
    } else if (dimensionPresetsData) {
      // If no measurement unit, just use the original data
      setDimensionPresets(dimensionPresetsData);
    }
  }, [dimensionPresetsData, form.measurement_unit]);

  useEffect(() => {
    if (weightPresetsData && form.measurement_unit) {
      const convertedPresets = weightPresetsData.map((preset) => {
        if (preset.measurement_unit === form.measurement_unit) {
          return preset; // No conversion needed
        }

        // Convert from imperial to metric or vice versa
        const convertedPreset = {
          ...preset,
          measurement_unit: form.measurement_unit,
          weight:
            form.measurement_unit === "metric"
              ? convertLbsToKg(preset.weight)
              : convertKgToLbs(preset.weight),
        };

        return convertedPreset;
      });

      setWeightPresets(convertedPresets);
    } else if (weightPresetsData) {
      // If no measurement unit, just use the original data
      setWeightPresets(weightPresetsData);
    }
  }, [weightPresetsData, form.measurement_unit]);

  // Auto-enable preset mode if package has preset IDs (for editing existing packages)
  useEffect(() => {
    if (editing) {
      if (form.fk_dimension_preset_id) {
        setUseDimensionPresets(true);
      }
      if (form.fk_weight_preset_id) {
        setUseWeightPresets(true);
      }
    }
  }, [editing, form.fk_dimension_preset_id, form.fk_weight_preset_id]);

  // Auto-enable preset mode if package has preset IDs (for editing existing packages)
  useEffect(() => {
    if (editing && open) {
      if (form.fk_dimension_preset_id) {
        setUseDimensionPresets(true);
      }
      if (form.fk_weight_preset_id) {
        setUseWeightPresets(true);
      }
    }
  }, [editing, open, form.fk_dimension_preset_id, form.fk_weight_preset_id]);

  // Sync search fields with current form values when switching modes
  useEffect(() => {
    if (useDimensionPresets) {
      // First try to find preset by ID (for editing existing packages)
      let matchingPreset = dimensionPresets.find(
        (preset) =>
          preset.pk_dimension_preset_id === form.fk_dimension_preset_id
      );

      // If no preset found by ID, try to find by dimensions (for backward compatibility)
      if (!matchingPreset) {
        matchingPreset = dimensionPresets.find(
          (preset) =>
            preset.length === form.length &&
            preset.width === form.width &&
            preset.height === form.height
        );
      }

      if (matchingPreset) {
        setDimensionSearch(matchingPreset.name);
      }
    }
  }, [
    useDimensionPresets,
    form.length,
    form.width,
    form.height,
    form.fk_dimension_preset_id,
    dimensionPresets,
  ]);

  useEffect(() => {
    if (useWeightPresets) {
      // First try to find preset by ID (for editing existing packages)
      let matchingPreset = weightPresets.find(
        (preset) => preset.pk_weight_preset_id === form.fk_weight_preset_id
      );

      // If no preset found by ID, try to find by weight (for backward compatibility)
      if (!matchingPreset) {
        matchingPreset = weightPresets.find(
          (preset) => preset.weight === form.weight
        );
      }

      if (matchingPreset) {
        setWeightSearch(matchingPreset.name);
      }
    }
  }, [useWeightPresets, form.weight, form.fk_weight_preset_id, weightPresets]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (stateWrapperRef.current && !stateWrapperRef.current.contains(t))
        setStateOpen(false);
      if (cityWrapperRef.current && !cityWrapperRef.current.contains(t)) {
        setCityOpen(false);
        // Clear search when closing dropdown
        setCitySearch("");
      }
      if (zipWrapperRef.current && !zipWrapperRef.current.contains(t))
        setZipOpen(false);
      if (
        dimensionWrapperRef.current &&
        !dimensionWrapperRef.current.contains(t)
      )
        setDimensionOpen(false);
      if (weightWrapperRef.current && !weightWrapperRef.current.contains(t))
        setWeightOpen(false);
    }
    if (stateOpen || cityOpen || zipOpen || dimensionOpen || weightOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [stateOpen, cityOpen, zipOpen, dimensionOpen, weightOpen]);

  // Handle manual typing for state input
  const handleStateInputChange = (val: string) => {
    setStateInput(val);
    const match = US_STATES.find(
      (s) =>
        s.label.toLowerCase() === val.toLowerCase() ||
        s.value.toLowerCase() === val.toLowerCase()
    );
    if (match) {
      onChange("state", match.value); // store abbreviation
    } else {
      onChange("state", val); // raw
    }
  };

  // Handle city search
  const handleCitySearch = async (query: string) => {
    setCitySearch(query);

    if (!query || query.length < 2) {
      setCitySuggestions([]);
      setCityOpen(false);
      return;
    }

    const requestId = ++latestCityRequest.current;
    setIsLoadingCities(true);

    // Add a small delay to prevent too many rapid API calls
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Check if this request is still the latest
    if (requestId !== latestCityRequest.current) {
      setIsLoadingCities(false);
      return;
    }

    try {
      const suggestions = await searchCities(query);

      // Only update if this is still the latest request
      if (requestId === latestCityRequest.current) {
        setCitySuggestions(suggestions);
        // Always open dropdown if we have suggestions, or if we're still loading
        setCityOpen(suggestions.length > 0 || isLoadingCities);
      }
    } catch (error) {
      console.error("Error searching cities:", error);

      // Only update if this is still the latest request
      if (requestId === latestCityRequest.current) {
        setCitySuggestions([]);
        setCityOpen(false);
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (requestId === latestCityRequest.current) {
        setIsLoadingCities(false);
        // If we're no longer loading and have no suggestions, close dropdown
        if (citySuggestions.length === 0) {
          setCityOpen(false);
        }
      }
    }
  };

  // Handle city selection
  const handleCitySelect = async (cityData: CitySuggestion) => {
    onChange("city", cityData.city);
    onChange("state", cityData.state);
    setCityInput(cityData.city);

    // Update state input
    const stateMatch = US_STATES.find((s) => s.value === cityData.state);
    setStateInput(stateMatch ? stateMatch.label : cityData.state);

    // Clear ZIP when city changes
    onChange("zip", "");
    setZipInput("");
    setZipSuggestions([]);

    // Close city dropdown
    setCitySearch("");
    setCityOpen(false);

    // Load ZIP codes for the selected city
    setIsLoadingZips(true);
    try {
      const zips = await getZipCodesForCity(cityData.city, cityData.state);
      setZipSuggestions(zips);
    } catch (error) {
      console.error("Error loading ZIP codes:", error);
      setZipSuggestions([]);
    } finally {
      setIsLoadingZips(false);
    }
  };

  // Handle dimension preset selection
  const handleDimensionSelect = (preset: ShippingDimensionPreset) => {
    onChange("length", preset.length.toString());
    onChange("width", preset.width.toString());
    onChange("height", preset.height.toString());
    onChange(
      "fk_dimension_preset_id",
      preset.pk_dimension_preset_id.toString()
    );
    setDimensionSearch(preset.name); // Show selected preset name
    setDimensionOpen(false);
    onPackageChange?.();
  };

  // Handle weight preset selection
  const handleWeightSelect = (preset: ShippingWeightPreset) => {
    onChange("weight", preset.weight.toString());
    onChange("fk_weight_preset_id", preset.pk_weight_preset_id.toString());
    setWeightSearch(preset.name); // Show selected preset name
    setWeightOpen(false);
    onPackageChange?.();
  };

  // When city or state changes, load ZIP codes
  useEffect(() => {
    if (form.city && form.state) {
      const loadZips = async () => {
        setIsLoadingZips(true);
        try {
          const zips = await getZipCodesForCity(form.city, form.state);
          setZipSuggestions(zips);
        } catch (error) {
          console.error("Error loading ZIP codes:", error);
          setZipSuggestions([]);
        } finally {
          setIsLoadingZips(false);
        }
      };
      loadZips();
    } else {
      setZipSuggestions([]);
    }
  }, [form.city, form.state]);

  // Ensure country is set to US
  useEffect(() => {
    if (form.country !== "US") {
      onChange("country", "US");
    }
  }, [form.country, onChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeaderBase className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {editing ? "Edit Package" : "Add New Package"}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Configure package details and shipping information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Metric
                </span>
              </div>
              <Switch
                checked={form.measurement_unit === "imperial"}
                onCheckedChange={(checked) => {
                  const newUnitSystem = checked ? "imperial" : "metric";
                  const oldUnitSystem = form.measurement_unit;

                  if (oldUnitSystem !== newUnitSystem) {
                    if (newUnitSystem === "imperial") {
                      onChange(
                        "length",
                        convertCmToInches(form.length).toString()
                      );
                      onChange(
                        "width",
                        convertCmToInches(form.width).toString()
                      );
                      onChange(
                        "height",
                        convertCmToInches(form.height).toString()
                      );
                      onChange(
                        "weight",
                        convertKgToLbs(form.weight).toString()
                      );
                    } else {
                      onChange(
                        "length",
                        convertInchesToCm(form.length).toString()
                      );
                      onChange(
                        "width",
                        convertInchesToCm(form.width).toString()
                      );
                      onChange(
                        "height",
                        convertInchesToCm(form.height).toString()
                      );
                      onChange(
                        "weight",
                        convertLbsToKg(form.weight).toString()
                      );
                    }
                  }

                  onChange("measurement_unit", newUnitSystem);
                  onPackageChange?.();
                }}
                className="data-[state=checked]:bg-blue-600"
              />
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Imperial
                </span>
              </div>
            </div>
          </div>
        </DialogHeaderBase>

        <div className="space-y-8">
          {/* Package Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Package Information
              </h3>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Package Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Package A"
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Company Name
                  </label>
                  <Input
                    value={form.company_name || ""}
                    onChange={(e) => onChange("company_name", e.target.value)}
                    placeholder={
                      shippingContact
                        ? `${shippingContact.first_name} ${shippingContact.last_name}`
                        : "Enter company name"
                    }
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-gray-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Dimensions
                    </label>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border">
                    <span className="text-xs text-gray-500">Presets</span>
                    <Switch
                      checked={useDimensionPresets}
                      onCheckedChange={setUseDimensionPresets}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span className="text-xs text-gray-500">Manual</span>
                  </div>
                </div>

                {useDimensionPresets ? (
                  <div className="space-y-3">
                    <div className="relative" ref={dimensionWrapperRef}>
                      <Input
                        placeholder={
                          isLoadingDimensionPresets
                            ? "Loading dimensions..."
                            : "Select dimensions..."
                        }
                        value={dimensionSearch}
                        onFocus={() => setDimensionOpen(true)}
                        onChange={(e) => {
                          setDimensionSearch(e.target.value);
                          setDimensionOpen(true);
                        }}
                        disabled={isLoadingDimensionPresets}
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      {dimensionOpen && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
                          <Command>
                            <CommandInput
                              placeholder="Search dimensions..."
                              value={dimensionSearch}
                              onValueChange={setDimensionSearch}
                              className="h-10"
                              autoFocus
                            />
                            <CommandEmpty>
                              {isLoadingDimensionPresets
                                ? "Loading dimensions..."
                                : dimensionPresetsError
                                ? "Error loading dimensions"
                                : "No dimensions found."}
                            </CommandEmpty>
                            <CommandGroup className="max-h-52 overflow-auto">
                              {dimensionPresets
                                .filter(
                                  (preset) =>
                                    preset.name
                                      .toLowerCase()
                                      .includes(
                                        dimensionSearch.toLowerCase()
                                      ) ||
                                    (preset.description &&
                                      preset.description
                                        .toLowerCase()
                                        .includes(
                                          dimensionSearch.toLowerCase()
                                        ))
                                )
                                .map((preset) => (
                                  <CommandItem
                                    key={preset.pk_dimension_preset_id}
                                    onSelect={() =>
                                      handleDimensionSelect(preset)
                                    }
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {preset.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {preset.description || ""}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </Command>
                        </div>
                      )}
                    </div>
                    {/* Show current values */}
                    {(form.length > 0 || form.width > 0 || form.height > 0) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        <span>
                          Current: {form.length} × {form.width} × {form.height}{" "}
                          {form.measurement_unit === "imperial" ? "in" : "cm"}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">
                        Length (
                        {form.measurement_unit === "imperial" ? "in" : "cm"})
                      </label>
                      <Input
                        type="number"
                        value={form.length === 0 ? "" : form.length}
                        onChange={(e) => {
                          const value = e.target.value;
                          onChange("length", value === "" ? "0" : value);
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isNaN(value) || value < 0) {
                            onChange("length", "0");
                          }
                        }}
                        min={0}
                        placeholder="0"
                        step="0.1"
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">
                        Width (
                        {form.measurement_unit === "imperial" ? "in" : "cm"})
                      </label>
                      <Input
                        type="number"
                        value={form.width === 0 ? "" : form.width}
                        onChange={(e) => {
                          const value = e.target.value;
                          onChange("width", value === "" ? "0" : value);
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isNaN(value) || value < 0) {
                            onChange("width", "0");
                          }
                        }}
                        min={0}
                        placeholder="0"
                        step="0.1"
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">
                        Height (
                        {form.measurement_unit === "imperial" ? "in" : "cm"})
                      </label>
                      <Input
                        type="number"
                        value={form.height === 0 ? "" : form.height}
                        onChange={(e) => {
                          const value = e.target.value;
                          onChange("height", value === "" ? "0" : value);
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isNaN(value) || value < 0) {
                            onChange("height", "0");
                          }
                        }}
                        min={0}
                        placeholder="0"
                        step="0.1"
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gray-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Weight (
                      {form.measurement_unit === "imperial" ? "lb" : "kg"})
                    </label>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border">
                    <span className="text-xs text-gray-500">Presets</span>
                    <Switch
                      checked={useWeightPresets}
                      onCheckedChange={setUseWeightPresets}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span className="text-xs text-gray-500">Manual</span>
                  </div>
                </div>

                {useWeightPresets ? (
                  <div className="space-y-3">
                    <div className="relative" ref={weightWrapperRef}>
                      <Input
                        placeholder={
                          isLoadingWeightPresets
                            ? "Loading weights..."
                            : "Select weight..."
                        }
                        value={weightSearch}
                        onFocus={() => setWeightOpen(true)}
                        onChange={(e) => {
                          setWeightSearch(e.target.value);
                          setWeightOpen(true);
                        }}
                        disabled={isLoadingWeightPresets}
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      {weightOpen && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
                          <Command>
                            <CommandInput
                              placeholder="Search weights..."
                              value={weightSearch}
                              onValueChange={setWeightSearch}
                              className="h-10"
                              autoFocus
                            />
                            <CommandEmpty>
                              {isLoadingWeightPresets
                                ? "Loading weights..."
                                : weightPresetsError
                                ? "Error loading weights"
                                : "No weights found."}
                            </CommandEmpty>
                            <CommandGroup className="max-h-52 overflow-auto">
                              {weightPresets
                                .filter(
                                  (preset) =>
                                    preset.name
                                      .toLowerCase()
                                      .includes(weightSearch.toLowerCase()) ||
                                    (preset.description &&
                                      preset.description
                                        .toLowerCase()
                                        .includes(weightSearch.toLowerCase()))
                                )
                                .map((preset) => (
                                  <CommandItem
                                    key={preset.pk_weight_preset_id}
                                    onSelect={() => handleWeightSelect(preset)}
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {preset.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {preset.description || ""}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </Command>
                        </div>
                      )}
                    </div>
                    {/* Show current value */}
                    {form.weight > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        <span>
                          Current: {form.weight}{" "}
                          {form.measurement_unit === "imperial" ? "lb" : "kg"}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={form.weight === 0 ? "" : form.weight}
                    onChange={(e) => {
                      const value = e.target.value;
                      onChange("weight", value === "" ? "0" : value);
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value) || value < 0) {
                        onChange("weight", "0");
                      }
                    }}
                    min={0}
                    placeholder="0"
                    step="0.1"
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={form.phone_number || ""}
                  onChange={(e) => onChange("phone_number", e.target.value)}
                  placeholder={
                    shippingContact?.phone_number || "Enter phone number"
                  }
                  className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Address Information
              </h3>
            </div>

            <div className="space-y-6">
              {/* Street */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Street Address
                </label>
                <Input
                  placeholder={shippingAddress?.address1 || "123 Main St"}
                  value={form.address}
                  onChange={(e) => onChange("address", e.target.value)}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-2 gap-4">
                {/* City input + dropdown */}
                <div className="relative" ref={cityWrapperRef}>
                  <label
                    className="text-sm font-medium text-gray-700 mb-2 block"
                    htmlFor="city"
                  >
                    City
                  </label>
                  <Input
                    id="city"
                    name="city"
                    placeholder={shippingAddress?.city || "City"}
                    value={cityInput}
                    onFocus={() => {
                      // If we have existing suggestions, show them
                      if (citySuggestions.length > 0) {
                        setCityOpen(true);
                      }
                      // If we have a value with 2+ characters, search for it
                      if (cityInput.length >= 2) {
                        handleCitySearch(cityInput);
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCityInput(val);
                      onChange("city", val);
                      // If the value is empty or too short, close dropdown
                      if (!val || val.length < 2) {
                        setCityOpen(false);
                        setCitySuggestions([]);
                      } else {
                        handleCitySearch(val);
                      }
                    }}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {cityOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
                      <Command>
                        <CommandEmpty>
                          {isLoadingCities ? "Searching..." : "No city found."}
                        </CommandEmpty>
                        <CommandGroup className="max-h-52 overflow-auto">
                          {isLoadingCities && citySuggestions.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 text-center">
                              Searching for cities...
                            </div>
                          ) : (
                            citySuggestions.map((cityData) => (
                              <CommandItem
                                key={`${cityData.city}|${cityData.state}`}
                                onSelect={() => handleCitySelect(cityData)}
                              >
                                {cityData.city}, {cityData.state}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </Command>
                    </div>
                  )}
                </div>

                {/* State input + dropdown (still available) */}
                <div className="relative" ref={stateWrapperRef}>
                  <label
                    className="text-sm font-medium text-gray-700 mb-2 block"
                    htmlFor="state"
                  >
                    State
                  </label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="State"
                    value={stateInput}
                    onFocus={() => setStateOpen(true)}
                    onChange={(e) => handleStateInputChange(e.target.value)}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {stateOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
                      <Command>
                        <CommandInput
                          placeholder="Search states…"
                          value={stateSearch}
                          onValueChange={setStateSearch}
                          className="h-10"
                          autoFocus
                        />
                        <CommandEmpty>No state found.</CommandEmpty>
                        <CommandGroup className="max-h-52 overflow-auto">
                          {US_STATES.filter(
                            (s) =>
                              s.label
                                .toLowerCase()
                                .includes(stateSearch.toLowerCase()) ||
                              s.value
                                .toLowerCase()
                                .includes(stateSearch.toLowerCase())
                          ).map((s) => (
                            <CommandItem
                              key={s.value}
                              onSelect={() => {
                                onChange("state", s.value);
                                setStateInput(s.label);
                                setStateSearch("");
                                setStateOpen(false);
                                // If state changes, clear ZIP and reload ZIP codes
                                onChange("zip", "");
                                setZipInput("");
                                setZipSuggestions([]);
                              }}
                            >
                              {s.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </div>
                  )}
                </div>
              </div>

              {/* ZIP + Country */}
              <div className="grid grid-cols-2 gap-4">
                {/* ZIP dropdown filtered by city */}
                <div className="relative" ref={zipWrapperRef}>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    ZIP Code
                  </label>
                  <div className="relative">
                    <Input
                      placeholder={
                        shippingAddress?.zip ||
                        (form.city ? "Select ZIP" : "Select a city first")
                      }
                      value={zipInput}
                      onFocus={() => setZipOpen(true)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setZipInput(val);
                        onChange("zip", val);
                        setZipOpen(true);
                      }}
                      disabled={!form.city || !form.state}
                      className="h-11 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {zipOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
                      <Command>
                        <CommandInput
                          placeholder="Search ZIPs…"
                          value={zipSearch}
                          onValueChange={setZipSearch}
                          className="h-10"
                          autoFocus
                        />
                        <CommandEmpty>
                          {isLoadingZips
                            ? "Loading ZIP codes..."
                            : form.city
                            ? "No ZIP codes found for this city."
                            : "Choose a city first."}
                        </CommandEmpty>
                        <CommandGroup className="max-h-52 overflow-auto">
                          {(zipSearch
                            ? zipSuggestions.filter((zip) =>
                                zip
                                  .toLowerCase()
                                  .includes(zipSearch.toLowerCase())
                              )
                            : zipSuggestions
                          ).map((zip) => (
                            <CommandItem
                              key={zip}
                              onSelect={() => {
                                onChange("zip", zip);
                                setZipInput(zip);
                                setZipSearch("");
                                setZipOpen(false);
                              }}
                            >
                              {zip}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </div>
                  )}
                </div>

                {/* Country (fixed to US) */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Country
                  </label>
                  <div className="relative">
                    <Input
                      value="US"
                      disabled
                      onChange={() => {}}
                      className="h-11 border-gray-300 bg-gray-100 text-gray-600"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Address Guidelines:</p>
                <ul className="space-y-1">
                  <li>
                    • Select a <b>City</b> to see valid <b>ZIP</b> codes
                  </li>
                  <li>
                    • <b>State</b> auto-fills from the selected city
                  </li>
                  <li>
                    • <b>Country</b> is fixed to <b>US</b> for shipping
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="h-4 w-4" />
                <span>All fields marked with * are required</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={onSave}
                className="h-11 px-8 bg-blue-600 hover:bg-blue-700"
              >
                {editing ? "Update Package" : "Create Package"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PackageEditDialog;
