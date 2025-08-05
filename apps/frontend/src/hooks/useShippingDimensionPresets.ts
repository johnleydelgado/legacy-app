import { useState, useEffect, useCallback } from "react";
import { shippingDimensionPresetsService } from "@/services/shipping-dimension-presets";
import {
  ShippingDimensionPreset,
  ShippingDimensionPresetsResponse,
  CreateShippingDimensionPresetRequest,
  UpdateShippingDimensionPresetRequest,
  ShippingDimensionPresetResponse,
  PaginatedShippingDimensionPresetsResponse,
} from "@/services/shipping-dimension-presets/types";

// Hook for fetching shipping dimension presets with pagination
interface UseShippingDimensionPresetsResult {
  data: PaginatedShippingDimensionPresetsResponse | null;
  isLoading: boolean;
  error: Error | null;
  fetchShippingDimensionPresets: (
    page?: number,
    limit?: number
  ) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useShippingDimensionPresets = (
  initialPage: number = 1,
  initialLimit: number = 10
): UseShippingDimensionPresetsResult => {
  const [data, setData] =
    useState<PaginatedShippingDimensionPresetsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);

  const fetchShippingDimensionPresets = useCallback(
    async (newPage?: number, newLimit?: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentPage = newPage ?? page;
        const currentLimit = newLimit ?? limit;
        setPage(currentPage);
        setLimit(currentLimit);

        const response =
          await shippingDimensionPresetsService.getShippingDimensionPresets(
            currentPage,
            currentLimit
          );
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch shipping dimension presets")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit]
  );

  const refetch = useCallback(async () => {
    await fetchShippingDimensionPresets();
  }, [fetchShippingDimensionPresets]);

  useEffect(() => {
    fetchShippingDimensionPresets();
  }, []);

  return { data, isLoading, error, fetchShippingDimensionPresets, refetch };
};

// Hook for fetching a single shipping dimension preset
interface UseShippingDimensionPresetResult {
  data: ShippingDimensionPreset | null;
  isLoading: boolean;
  error: Error | null;
  fetchShippingDimensionPreset: (id: number) => Promise<void>;
}

export const useShippingDimensionPreset = (
  initialId?: number
): UseShippingDimensionPresetResult => {
  const [data, setData] = useState<ShippingDimensionPreset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!initialId);
  const [error, setError] = useState<Error | null>(null);

  const fetchShippingDimensionPreset = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await shippingDimensionPresetsService.getShippingDimensionPresetById(
          id
        );
      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(`Failed to fetch shipping dimension preset with id ${id}`)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) {
      fetchShippingDimensionPreset(initialId);
    }
  }, [initialId, fetchShippingDimensionPreset]);

  return { data, isLoading, error, fetchShippingDimensionPreset };
};

// Hook for creating shipping dimension presets
interface UseCreateShippingDimensionPresetResult {
  isLoading: boolean;
  error: Error | null;
  createShippingDimensionPreset: (
    data: CreateShippingDimensionPresetRequest
  ) => Promise<ShippingDimensionPreset | null>;
}

export const useCreateShippingDimensionPreset =
  (): UseCreateShippingDimensionPresetResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const createShippingDimensionPreset = useCallback(
      async (
        data: CreateShippingDimensionPresetRequest
      ): Promise<ShippingDimensionPreset | null> => {
        try {
          setIsLoading(true);
          setError(null);

          const response =
            await shippingDimensionPresetsService.createShippingDimensionPreset(
              data
            );
          return response.data;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err
              : new Error("Failed to create shipping dimension preset");
          setError(errorMessage);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { isLoading, error, createShippingDimensionPreset };
  };

// Hook for updating shipping dimension presets
interface UseUpdateShippingDimensionPresetResult {
  isLoading: boolean;
  error: Error | null;
  updateShippingDimensionPreset: (
    id: number,
    data: UpdateShippingDimensionPresetRequest
  ) => Promise<ShippingDimensionPreset | null>;
}

export const useUpdateShippingDimensionPreset =
  (): UseUpdateShippingDimensionPresetResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const updateShippingDimensionPreset = useCallback(
      async (
        id: number,
        data: UpdateShippingDimensionPresetRequest
      ): Promise<ShippingDimensionPreset | null> => {
        try {
          setIsLoading(true);
          setError(null);

          const response =
            await shippingDimensionPresetsService.updateShippingDimensionPreset(
              id,
              data
            );
          return response.data;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err
              : new Error("Failed to update shipping dimension preset");
          setError(errorMessage);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { isLoading, error, updateShippingDimensionPreset };
  };

// Hook for deleting shipping dimension presets
interface UseDeleteShippingDimensionPresetResult {
  isLoading: boolean;
  error: Error | null;
  deleteShippingDimensionPreset: (id: number) => Promise<boolean>;
}

export const useDeleteShippingDimensionPreset =
  (): UseDeleteShippingDimensionPresetResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteShippingDimensionPreset = useCallback(
      async (id: number): Promise<boolean> => {
        try {
          setIsLoading(true);
          setError(null);

          await shippingDimensionPresetsService.deleteShippingDimensionPreset(
            id
          );
          return true;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err
              : new Error("Failed to delete shipping dimension preset");
          setError(errorMessage);
          return false;
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { isLoading, error, deleteShippingDimensionPreset };
  };

// Hook for fetching active shipping dimension presets
interface UseActiveShippingDimensionPresetsResult {
  data: ShippingDimensionPreset[] | null;
  isLoading: boolean;
  error: Error | null;
  fetchActivePresets: () => Promise<void>;
}

export const useActiveShippingDimensionPresets =
  (): UseActiveShippingDimensionPresetsResult => {
    const [data, setData] = useState<ShippingDimensionPreset[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchActivePresets = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await shippingDimensionPresetsService.getActiveShippingDimensionPresets();
        setData(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch active shipping dimension presets")
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

    return { data, isLoading, error, fetchActivePresets };
  };

// Hook for fetching shipping dimension presets by measurement unit
interface UseShippingDimensionPresetsByUnitResult {
  data: ShippingDimensionPreset[] | null;
  isLoading: boolean;
  error: Error | null;
  fetchByUnit: (measurementUnit: "metric" | "imperial") => Promise<void>;
}

export const useShippingDimensionPresetsByUnit =
  (): UseShippingDimensionPresetsByUnitResult => {
    const [data, setData] = useState<ShippingDimensionPreset[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchByUnit = useCallback(
      async (measurementUnit: "metric" | "imperial") => {
        try {
          setIsLoading(true);
          setError(null);

          const response =
            await shippingDimensionPresetsService.getShippingDimensionPresetsByUnit(
              measurementUnit
            );
          setData(response.data);
        } catch (err) {
          setError(
            err instanceof Error
              ? err
              : new Error(
                  `Failed to fetch ${measurementUnit} shipping dimension presets`
                )
          );
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { data, isLoading, error, fetchByUnit };
  };
