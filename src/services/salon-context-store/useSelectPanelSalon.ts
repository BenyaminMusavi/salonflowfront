"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ISalonMembership,
  useSalonContextStore,
} from "@/services/salon-context-store/useSalonContextStore";

/**
 * Makes `membership` this tab's active panel salon (ADR-0012: no token swap, the
 * interceptor sends it as `X-Salon-Id` from `/dashboard` pages). Moving to a different
 * salon drops cached queries so one salon's data never shows under another.
 */
export function useSelectPanelSalon() {
  const queryClient = useQueryClient();
  return useCallback(
    (membership: ISalonMembership) => {
      const previous = useSalonContextStore.getState().salonPublicId;
      useSalonContextStore.getState().setActiveContext(membership);
      if (previous && previous !== membership.salonPublicId) {
        queryClient.clear();
      }
    },
    [queryClient]
  );
}
