import { useQuery } from "@tanstack/react-query";
import { vendorServiceCategoryService } from "@/services/vendors-service-category";
import {
  VendorServiceCategoryQueryParams,
} from "@/services/vendors-service-category/types";

// Hook to fetch vendor service categories with pagination
export function useVendorServiceCategories(params?: VendorServiceCategoryQueryParams) {
  return useQuery({
    queryKey: ["vendor-service-categories", params],
    queryFn: () => vendorServiceCategoryService.getVendorServiceCategories(params),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch a single vendor service category by ID
export function useVendorServiceCategory(id: number) {
  return useQuery({
    queryKey: ["vendor-service-category", id],
    queryFn: () => vendorServiceCategoryService.getVendorServiceCategoryById(id),
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
