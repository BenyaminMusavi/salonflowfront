import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";
import {
  IAdminSaveSubscriptionPlanRequest,
  IAdminSetPlanDiscountRequest,
} from "../types/subscriptions.type";
import { SUBSCRIPTION_PLANS_QUERY_KEY } from "./useQuerySubscriptionPlans";

export const ADMIN_SUBSCRIPTION_PLANS_QUERY_KEY = "ADMIN_SUBSCRIPTION_PLANS_QUERY_KEY";

/** Admin-only list of every plan (active + inactive). Amounts are in RIALS. */
export const useQueryAdminSubscriptionPlans = () =>
  useQuery({
    queryKey: [ADMIN_SUBSCRIPTION_PLANS_QUERY_KEY],
    queryFn: () => subscriptionsService.listAdminPlans(),
  });

/** Any plan change also changes the public plan list / prices. */
function useInvalidatePlans() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [ADMIN_SUBSCRIPTION_PLANS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_PLANS_QUERY_KEY] });
  };
}

export const useMutateSaveAdminPlan = () => {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: ({
      planPublicId,
      data,
    }: {
      /** null = create */
      planPublicId: string | null;
      data: IAdminSaveSubscriptionPlanRequest;
    }) =>
      planPublicId
        ? subscriptionsService.updateAdminPlan(planPublicId, data)
        : subscriptionsService.createAdminPlan(data),
    onSuccess: invalidate,
  });
};

export const useMutateToggleAdminPlan = () => {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: ({ planPublicId, active }: { planPublicId: string; active: boolean }) =>
      active
        ? subscriptionsService.activateAdminPlan(planPublicId)
        : subscriptionsService.deactivateAdminPlan(planPublicId),
    onSuccess: invalidate,
  });
};

export const useMutateSetAdminPlanDiscount = () => {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: ({
      planPublicId,
      data,
    }: {
      planPublicId: string;
      data: IAdminSetPlanDiscountRequest;
    }) => subscriptionsService.setAdminPlanDiscount(planPublicId, data),
    onSuccess: invalidate,
  });
};

export const useMutateRemoveAdminPlanDiscount = () => {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: (planPublicId: string) =>
      subscriptionsService.removeAdminPlanDiscount(planPublicId),
    onSuccess: invalidate,
  });
};
