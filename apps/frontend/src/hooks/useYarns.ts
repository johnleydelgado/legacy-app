import { useQuery } from "@tanstack/react-query";
import { getYarns } from "@/fetchers/yarns";

export function useYarns(page: number = 1, limit: number = 100) {
  return useQuery({
    queryKey: ["yarns", page, limit],
    queryFn: () => getYarns(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
}
