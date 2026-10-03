"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import salonPanelService from "../salon-panel.service";
import type { IBranchRequest, IPatchSalonProfileRequest } from "../types/salon-panel.type";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { SALON_BY_ID_QUERY_KEY } from "@/services/domains/salons/hooks/useQuerySalonById";

export const SALON_PROFILE_QUERY_KEY = "SALON_PROFILE_QUERY_KEY";

export const useQuerySalonProfile = () => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [SALON_PROFILE_QUERY_KEY, salonId],
    queryFn: () => salonPanelService.getProfile(),
    enabled: !!salonId,
  });
};

export const useQueryBranchRemovalImpact = (publicId: string | null) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [SALON_PROFILE_QUERY_KEY, "branch-impact", salonId, publicId],
    queryFn: () => salonPanelService.branchRemovalImpact(publicId!),
    enabled: !!salonId && !!publicId,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useMutateSalonPanel = () => {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [SALON_PROFILE_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [SALON_BY_ID_QUERY_KEY] });
  };

  return {
    patchProfile: useMutation({
      mutationFn: (body: IPatchSalonProfileRequest) => salonPanelService.patchProfile(body),
      onSuccess: refresh,
    }),
    createBranch: useMutation({
      mutationFn: (body: IBranchRequest) => salonPanelService.createBranch(body),
      onSuccess: refresh,
    }),
    patchBranch: useMutation({
      mutationFn: ({ publicId, body }: { publicId: string; body: IBranchRequest }) =>
        salonPanelService.patchBranch(publicId, body),
      onSuccess: refresh,
    }),
    removeBranch: useMutation({
      mutationFn: (publicId: string) => salonPanelService.removeBranch(publicId),
      onSuccess: refresh,
    }),
    orderGallery: useMutation({
      mutationFn: (publicIds: string[]) => salonPanelService.orderGallery(publicIds),
      onSuccess: refresh,
    }),
  };
};
