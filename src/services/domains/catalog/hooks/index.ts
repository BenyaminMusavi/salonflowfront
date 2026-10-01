"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import catalogService from "../catalog.service";
import {
  IAssignOfferingStaffRequest,
  ICreateOfferingRequest,
  ICreatePricingRuleRequest,
  IStaffServicesSyncRequest,
  IUpdateOfferingRequest,
} from "../types/catalog.type";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { STAFF_FOR_OFFERINGS_QUERY_KEY } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { STAFF_ROSTER_QUERY_KEY } from "@/services/domains/salons/hooks/useQueryStaffRoster";

const CATALOG_OFFERINGS_QUERY_KEY = "CATALOG_OFFERINGS_QUERY_KEY";
const CATALOG_PRICING_RULES_QUERY_KEY = "CATALOG_PRICING_RULES_QUERY_KEY";
const CATALOG_STAFF_SERVICES_QUERY_KEY = "CATALOG_STAFF_SERVICES_QUERY_KEY";
const CATALOG_OFFERING_STAFF_QUERY_KEY = "CATALOG_OFFERING_STAFF_QUERY_KEY";

/** Who-does-what changed: every view of the staff ↔ service relation must refetch. */
const ASSIGNMENT_KEYS = [
  CATALOG_STAFF_SERVICES_QUERY_KEY,
  CATALOG_OFFERING_STAFF_QUERY_KEY,
  STAFF_FOR_OFFERINGS_QUERY_KEY,
  STAFF_ROSTER_QUERY_KEY,
];

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
      mutationFn: (body: ICreateOfferingRequest) =>
        catalogService.createOffering(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: IUpdateOfferingRequest }) =>
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
      mutationFn: (body: ICreatePricingRuleRequest) =>
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
    onSuccess: () => {
      for (const key of ASSIGNMENT_KEYS) queryClient.invalidateQueries({ queryKey: [key] });
    },
  });
};


/** Staff assigned to one offering (with their own price/duration). */
export const useQueryOfferingStaff = (offeringId: number | undefined) => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [CATALOG_OFFERING_STAFF_QUERY_KEY, salonId, offeringId],
    queryFn: () => catalogService.getOfferingStaff(offeringId!),
    enabled: !!salonId && !!offeringId,
  });
};

export const useMutateOfferingStaff = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    for (const key of ASSIGNMENT_KEYS) queryClient.invalidateQueries({ queryKey: [key] });
  };
  return {
    /** Creates or updates (price/duration) the assignment. */
    assign: useMutation({
      mutationFn: ({ offeringId, body }: { offeringId: number; body: IAssignOfferingStaffRequest }) =>
        catalogService.assignOfferingStaff(offeringId, body),
      onSuccess: invalidate,
    }),
    unassign: useMutation({
      mutationFn: ({ offeringId, staffMemberId }: { offeringId: number; staffMemberId: number }) =>
        catalogService.unassignOfferingStaff(offeringId, staffMemberId),
      onSuccess: invalidate,
    }),
  };
};
