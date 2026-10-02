"use client";

import { useQuery } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

export const CAPABILITIES_QUERY_KEY = "CAPABILITIES_QUERY_KEY";

/**
 * Role abilities in the active panel salon. Show an action only when its capability is true —
 * the backend is the source of truth, not the role name.
 */
export const useQueryCapabilities = () => {
  const salonId = useSalonContextStore((s) => s.salonId);
  const query = useQuery({
    queryKey: [CAPABILITIES_QUERY_KEY, salonId],
    queryFn: () => authService.capabilities(),
    enabled: salonId != null,
    staleTime: 5 * 60_000,
  });
  return { capabilities: query.data?.data ?? null, isLoading: query.isLoading };
};
