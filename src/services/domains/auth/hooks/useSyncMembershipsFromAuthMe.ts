"use client";

import { useEffect } from "react";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { mapAuthMeMembershipsToSalon } from "@/services/salon-context-store/mapAuthMeMembership";

/**
 * Seeds useSalonContextStore.memberships from GET /api/auth/me.
 * Does not set active salon context — that must go through switch-context.
 */
export const useSyncMembershipsFromAuthMe = () => {
  const { data, isSuccess } = useQueryAuthMe();
  const setMemberships = useSalonContextStore((s) => s.setMemberships);

  useEffect(() => {
    if (!isSuccess || !data?.data) return;
    setMemberships(mapAuthMeMembershipsToSalon(data.data.memberships));
  }, [isSuccess, data, setMemberships]);
};
