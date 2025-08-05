import { useQuery } from "@tanstack/react-query";
import { vendorTypeService } from "@/services/vendors-type";
import {
  VendorTypeQueryParams,
} from "@/services/vendors-type/types";

// Hook to fetch vendor types with pagination
export function useVendorTypes(params?: VendorTypeQueryParams) {
  return useQuery({
    queryKey: ["vendor-types", params],
    queryFn: () => vendorTypeService.getVendorTypes(params),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch a single vendor type by ID
export function useVendorType(id: number) {
  return useQuery({
    queryKey: ["vendor-type", id],
    queryFn: () => vendorTypeService.getVendorTypeById(id),
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
