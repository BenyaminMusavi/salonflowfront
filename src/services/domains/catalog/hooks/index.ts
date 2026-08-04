"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import catalogService from "../catalog.service";
import {
  ICreateOrUpdateOfferingRequest,
  IStaffServicesSyncRequest,
} from "../types/catalog.type";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

const CATALOG_OFFERINGS_QUERY_KEY = "CATALOG_OFFERINGS_QUERY_KEY";
const CATALOG_PRICING_RULES_QUERY_KEY = "CATALOG_PRICING_RULES_QUERY_KEY";
const CATALOG_STAFF_SERVICES_QUERY_KEY = "CATALOG_STAFF_SERVICES_QUERY_KEY";

export const useQueryCatalogOfferings = (includeInactive = true) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [CATALOG_OFFERINGS_QUERY_KEY, salonId, includeInactive],
    queryFn: () => catalogService.getOfferings(includeInactive),
    enabled: !!salonId,
  });
};

export const useMutateCatalogOfferings = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [CATALOG_OFFERINGS_QUERY_KEY] });

  return {
    create: useMutation({
      mutationFn: (body: ICreateOrUpdateOfferingRequest) =>
        catalogService.createOffering(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: ICreateOrUpdateOfferingRequest }) =>
        catalogService.updateOffering(id, body),
      onSuccess: invalidate,
    }),
    patchActive: useMutation({
      mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
        catalogService.patchOfferingActive(id, isActive),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => catalogService.deleteOffering(id),
      onSuccess: invalidate,
    }),
  };
};

export const useQueryPricingRules = () => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [CATALOG_PRICING_RULES_QUERY_KEY, salonId],
    queryFn: () => catalogService.getPricingRules(),
    enabled: !!salonId,
  });
};

export const useMutatePricingRules = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [CATALOG_PRICING_RULES_QUERY_KEY],
    });

  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        catalogService.createPricingRule(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        catalogService.updatePricingRule(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => catalogService.deletePricingRule(id),
      onSuccess: invalidate,
    }),
  };
};

export const useQueryStaffServices = (staffMemberId: number | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [CATALOG_STAFF_SERVICES_QUERY_KEY, salonId, staffMemberId],
    queryFn: () => catalogService.getStaffServices(staffMemberId!),
    enabled: !!salonId && !!staffMemberId,
  });
};

export const useMutateStaffServices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffMemberId,
      body,
    }: {
      staffMemberId: number;
      body: IStaffServicesSyncRequest;
    }) => catalogService.syncStaffServices(staffMemberId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CATALOG_STAFF_SERVICES_QUERY_KEY, undefined, variables.staffMemberId],
      });
      queryClient.invalidateQueries({ queryKey: [CATALOG_STAFF_SERVICES_QUERY_KEY] });
    },
  });
};

