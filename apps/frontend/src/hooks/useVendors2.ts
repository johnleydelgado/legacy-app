import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { vendorsService } from "@/services/vendors";
import { 
  VendorsQueryParams, 
  CreateVendorDto, 
  UpdateVendorDto,
  VendorSearchParams,
  VendorProductCategoriesParams,
} from "@/services/vendors/types";

// Query Keys
export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  list: (params?: VendorsQueryParams) => [...vendorKeys.lists(), params] as const,
  infinites: () => [...vendorKeys.all, "infinite"] as const,
  infinite: (params?: Omit<VendorsQueryParams, 'page'>) => [...vendorKeys.infinites(), params] as const,
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: number) => [...vendorKeys.details(), id] as const,
  searches: () => [...vendorKeys.all, "search"] as const,
  search: (params: VendorSearchParams) => [...vendorKeys.searches(), params] as const,
  productCategories: () => [...vendorKeys.all, "productCategories"] as const,
  productCategory: (vendorId: number, params?: VendorProductCategoriesParams) => [...vendorKeys.productCategories(), vendorId, params] as const,   
};

// Get vendors with pagination and filtering
export function useVendors(params?: VendorsQueryParams, enabled: boolean = true) {
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () => vendorsService.getVendors(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Get single vendor by ID
export function useVendor(id: number) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => vendorsService.getVendorById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Create vendor mutation
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorDto) => vendorsService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      // queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
    },
  });
}

// Update vendor mutation
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVendorDto }) =>
      vendorsService.updateVendor(id, data),
    onSuccess: (updatedVendor) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: vendorKeys.detail(updatedVendor.pk_vendor_id) 
      });
      // queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
    },
  });
}

// Delete vendor mutation
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vendorsService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      // queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
    },
  });
}

// Get vendor KPIs overview
export function useVendorKpisOverview() {
  return useQuery({
    queryKey: [...vendorKeys.all, "kpis", "overview"],
    queryFn: () => vendorsService.getVendorKpisOverview(),
    staleTime: 2 * 60 * 1000, // 2 minutes (KPIs might need more frequent updates)
    retry: 1,
  });
}

// Get individual vendor KPIs
export function useVendorIndividualKpis(vendorId: number) {
  return useQuery({
    queryKey: [...vendorKeys.all, "kpis", "individual", vendorId],
    queryFn: () => vendorsService.getVendorIndividualKpis(vendorId),
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000, // 2 minutes (KPIs might need more frequent updates)
    retry: 1,
  });
}

// Search vendors
export function useVendorSearch(params: VendorSearchParams, enabled: boolean = true) {
  return useQuery({
    queryKey: vendorKeys.search(params),
    queryFn: () => vendorsService.searchVendors(params),
    enabled: enabled && !!params.q.trim(), // Only enable if search query is provided and not empty
    staleTime: 30 * 1000, // 30 seconds (search results should be relatively fresh)
    retry: 1,
  });
}

// Get vendors with infinite pagination
export function useVendorsInfinite(
  params?: Omit<VendorsQueryParams, 'page'>, 
  enabled: boolean = true
) {
  return useInfiniteQuery({
    queryKey: vendorKeys.infinite(params),
    queryFn: ({ pageParam }) => vendorsService.getVendors({ 
      ...params, 
      page: pageParam 
    }),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Get vendor product categories with pagination
export function useVendorProductCategories(
  vendorId: number, 
  params?: VendorProductCategoriesParams
) {
  const defaultParams = { page: 1, limit: 10 };
  const finalParams = { ...defaultParams, ...params };

  return useQuery({
    queryKey: vendorKeys.productCategory(vendorId, finalParams),
    queryFn: () => vendorsService.getVendorProductCategories(vendorId, finalParams),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
