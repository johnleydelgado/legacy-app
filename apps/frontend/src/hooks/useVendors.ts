import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

interface Vendor {
  pk_vendor_id: number;
  name: string;
  email?: string;
  phone_number?: string;
  website_url?: string;
  billing_address?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  industry?: string;
  vat_number?: string;
  tax_id?: string;
  tags?: any;
  notes?: string;
}

interface VendorsResponse {
  items: Vendor[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export function useVendors(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["vendors", page, limit],
    queryFn: async () => {
      try {
        return await apiClient.get<VendorsResponse>(
          `/api/v1/vendors?page=${page}&limit=${limit}`
        );
      } catch (error) {
        console.error("Error fetching vendors:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
