import { useMutation, useQueryClient } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";
import {
  ICheckoutPreviewRequest,
  ICheckoutRequest,
} from "../types/subscriptions.type";
import { SUBSCRIPTION_ME_QUERY_KEY } from "./useQuerySubscriptionMe";
import { SUBSCRIPTION_ENTITLEMENT_QUERY_KEY } from "./useSubscriptionEntitlement";
import { ADMIN_SUBSCRIPTIONS_QUERY_KEY } from "@/services/domains/admin/hooks/useQueryAdminSubscriptions";

const useInvalidateSubscription = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_ME_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_ENTITLEMENT_QUERY_KEY] });
  };
};

/** Purchase is free for now: the answer is an already-paid invoice, so just re-read `me`. */
export const useMutateCheckout = () => {
  const invalidate = useInvalidateSubscription();

  return useMutation({
    mutationFn: (body: ICheckoutRequest) =>
      subscriptionsService.checkout(body),
    onSuccess: invalidate,
  });
};

/** No invoice, no side effects — validates a promo code and previews the price breakdown. */
export const useMutatePreviewCheckout = () => {
  return useMutation({
    mutationFn: (body: ICheckoutPreviewRequest) =>
      subscriptionsService.previewCheckout(body),
  });
};

export const useMutateCancelSubscription = () => {
  const invalidate = useInvalidateSubscription();

  return useMutation({
    mutationFn: () => subscriptionsService.cancel(),
    onSuccess: invalidate,
  });
};

export const useMutateRequestResume = () => {
  const invalidate = useInvalidateSubscription();

  return useMutation({
    mutationFn: () => subscriptionsService.requestResume(),
    onSuccess: invalidate,
  });
};

/** Admin: confirm an owner's request to undo a cancellation. */
export const useMutateApproveResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionPublicId: string) =>
      subscriptionsService.approveResume(subscriptionPublicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_SUBSCRIPTIONS_QUERY_KEY] });
    },
  });
};
