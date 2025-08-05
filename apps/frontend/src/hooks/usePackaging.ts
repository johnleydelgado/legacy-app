import { useQuery } from "@tanstack/react-query";
import { getPackaging } from "@/fetchers/packaging";

export function usePackaging(page: number = 1, limit: number = 100) {
  return useQuery({
    queryKey: ["packaging", page, limit],
    queryFn: () => getPackaging(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}
