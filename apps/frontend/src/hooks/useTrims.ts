import { useQuery } from "@tanstack/react-query";
import { getTrims } from "@/fetchers/trims";

export function useTrims(page: number = 1, limit: number = 100) {
  return useQuery({
    queryKey: ["trims", page, limit],
    queryFn: () => getTrims(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}
