"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import commissionService from "../commission.service";

export const COMMISSION_PLANS_QUERY_KEY = "COMMISSION_PLANS_QUERY_KEY";

export const useQueryCommissionPlans = () => {
  const salonId = useSalonContextStore((s) => s.salonId);
  return useQuery({
    queryKey: [COMMISSION_PLANS_QUERY_KEY, salonId],
    queryFn: () => commissionService.getPlans(),
    enabled: !!salonId,
  });
};

export const useMutateCommission = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [COMMISSION_PLANS_QUERY_KEY] });

  return {
    createPlan: useMutation({
      mutationFn: (body: Record<string, unknown>) => commissionService.createPlan(body),
      onSuccess: invalidate,
    }),
    updatePlan: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        commissionService.updatePlan(id, body),
      onSuccess: invalidate,
    }),
    deletePlan: useMutation({
      mutationFn: (id: number) => commissionService.deletePlan(id),
      onSuccess: invalidate,
    }),
    createRule: useMutation({
      mutationFn: ({
        planId,
        body,
      }: {
        planId: number;
        body: Record<string, unknown>;
      }) => commissionService.createRule(planId, body),
      onSuccess: invalidate,
    }),
    updateRule: useMutation({
      mutationFn: ({
        planId,
        ruleId,
        body,
      }: {
        planId: number;
        ruleId: number;
        body: Record<string, unknown>;
      }) => commissionService.updateRule(planId, ruleId, body),
      onSuccess: invalidate,
    }),
    deleteRule: useMutation({
      mutationFn: ({ planId, ruleId }: { planId: number; ruleId: number }) =>
        commissionService.deleteRule(planId, ruleId),
      onSuccess: invalidate,
    }),
  };
};

