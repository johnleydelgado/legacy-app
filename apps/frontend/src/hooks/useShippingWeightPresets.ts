import { useState, useEffect, useCallback } from "react";
import { shippingWeightPresetsService } from "@/services/shipping-weight-presets";
import {
  ShippingWeightPreset,
  ShippingWeightPresetsResponse,
  CreateShippingWeightPresetRequest,
  UpdateShippingWeightPresetRequest,
  ShippingWeightPresetResponse,
  PaginatedShippingWeightPresetsResponse,
} from "@/services/shipping-weight-presets/types";

// Hook for fetching shipping weight presets with pagination
interface UseShippingWeightPresetsResult {
  data: PaginatedShippingWeightPresetsResponse | null;
  isLoading: boolean;
  error: Error | null;
  fetchShippingWeightPresets: (page?: number, limit?: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useShippingWeightPresets = (
  initialPage: number = 1,
  initialLimit: number = 10
): UseShippingWeightPresetsResult => {
  const [data, setData] =
    useState<PaginatedShippingWeightPresetsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);

  const fetchShippingWeightPresets = useCallback(
    async (newPage?: number, newLimit?: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentPage = newPage ?? page;
        const currentLimit = newLimit ?? limit;
        setPage(currentPage);
        setLimit(currentLimit);

        const response =
          await shippingWeightPresetsService.getShippingWeightPresets(
            currentPage,
            currentLimit
          );
        setData(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch shipping weight presets")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit]
  );

  const refetch = useCallback(async () => {
    await fetchShippingWeightPresets();
  }, [fetchShippingWeightPresets]);

  useEffect(() => {
    fetchShippingWeightPresets();
  }, []);

  return { data, isLoading, error, fetchShippingWeightPresets, refetch };
};

// Hook for fetching a single shipping weight preset
interface UseShippingWeightPresetResult {
  data: ShippingWeightPreset | null;
  isLoading: boolean;
  error: Error | null;
  fetchShippingWeightPreset: (id: number) => Promise<void>;
}

export const useShippingWeightPreset = (
  initialId?: number
): UseShippingWeightPresetResult => {
  const [data, setData] = useState<ShippingWeightPreset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!initialId);
  const [error, setError] = useState<Error | null>(null);

  const fetchShippingWeightPreset = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await shippingWeightPresetsService.getShippingWeightPresetById(id);
      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(`Failed to fetch shipping weight preset with id ${id}`)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) {
      fetchShippingWeightPreset(initialId);
    }
  }, [initialId, fetchShippingWeightPreset]);

  return { data, isLoading, error, fetchShippingWeightPreset };
};

// Hook for creating shipping weight presets
interface UseCreateShippingWeightPresetResult {
  isLoading: boolean;
  error: Error | null;
  createShippingWeightPreset: (
    data: CreateShippingWeightPresetRequest
  ) => Promise<ShippingWeightPreset | null>;
}

export const useCreateShippingWeightPreset =
  (): UseCreateShippingWeightPresetResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const createShippingWeightPreset = useCallback(
      async (
        data: CreateShippingWeightPresetRequest
      ): Promise<ShippingWeightPreset | null> => {
        try {
          setIsLoading(true);
          setError(null);

          const response =
            await shippingWeightPresetsService.createShippingWeightPreset(data);
          return response.data;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err
              : new Error("Failed to create shipping weight preset");
          setError(errorMessage);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { isLoading, error, createShippingWeightPreset };
  };

// Hook for updating shipping weight presets
interface UseUpdateShippingWeightPresetResult {
  isLoading: boolean;
  error: Error | null;
  updateShippingWeightPreset: (
    id: number,
    data: UpdateShippingWeightPresetRequest
  ) => Promise<ShippingWeightPreset | null>;
}

export const useUpdateShippingWeightPreset =
  (): UseUpdateShippingWeightPresetResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const updateShippingWeightPreset = useCallback(
      async (
        id: number,
        data: UpdateShippingWeightPresetRequest
      ): Promise<ShippingWeightPreset | null> => {
        try {
          setIsLoading(true);
          setError(null);

          const response =
            await shippingWeightPresetsService.updateShippingWeightPreset(
              id,
              data
            );
          return response.data;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err
              : new Error("Failed to update shipping weight preset");
          setError(errorMessage);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { isLoading, error, updateShippingWeightPreset };
  };

// Hook for deleting shipping weight presets
interface UseDeleteShippingWeightPresetResult {
  isLoading: boolean;
  error: Error | null;
  deleteShippingWeightPreset: (id: number) => Promise<boolean>;
}

export const useDeleteShippingWeightPreset =
  (): UseDeleteShippingWeightPresetResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteShippingWeightPreset = useCallback(
      async (id: number): Promise<boolean> => {
        try {
          setIsLoading(true);
          setError(null);

          await shippingWeightPresetsService.deleteShippingWeightPreset(id);
          return true;
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err
              : new Error("Failed to delete shipping weight preset");
          setError(errorMessage);
          return false;
        } finally {
          setIsLoading(false);
        }
      },
      []
    );

    return { isLoading, error, deleteShippingWeightPreset };
  };

// Hook for fetching active shipping weight presets
interface UseActiveShippingWeightPresetsResult {
  data: ShippingWeightPreset[] | null;
  isLoading: boolean;
  error: Error | null;
  fetchActivePresets: () => Promise<void>;
}

export const useActiveShippingWeightPresets =
  (): UseActiveShippingWeightPresetsResult => {
    const [data, setData] = useState<ShippingWeightPreset[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchActivePresets = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await shippingWeightPresetsService.getActiveShippingWeightPresets();
        setData(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch active shipping weight presets")
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

    return { data, isLoading, error, fetchActivePresets };
  };

// Hook for fetching shipping weight presets by measurement unit
interface UseShippingWeightPresetsByUnitResult {
  data: ShippingWeightPreset[] | null;
  isLoading: boolean;
  error: Error | null;
  fetchByUnit: (measurementUnit: "metric" | "imperial") => Promise<void>;
}

export const useShippingWeightPresetsByUnit =
  (): UseShippingWeightPresetsByUnitResult => {
    const [data, setData] = useState<ShippingWeightPreset[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchByUnit = useCallback(
      async (measurementUnit: "metric" | "imperial") => {
        try {
          setIsLoading(true);
          setError(null);

          const response =
            await shippingWeightPresetsService.getShippingWeightPresetsByUnit(
              measurementUnit
            );
          setData(response.data);
        } catch (err) {
          setError(
            err instanceof Error
              ? err
              : new Error(
                  `Failed to fetch ${measurementUnit} shipping weight presets`
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
