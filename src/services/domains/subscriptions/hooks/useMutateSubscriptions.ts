import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import subscriptionsService from "../subscriptions.service";
import {
  ICheckoutPreviewRequest,
  ICheckoutRequest,
  IStartTrialRequest,
} from "../types/subscriptions.type";
import { RouteAddress } from "@/shared/data/routeAddress";
import { SUBSCRIPTION_ME_QUERY_KEY } from "./useQuerySubscriptionMe";
import { SUBSCRIPTION_ENTITLEMENT_QUERY_KEY } from "./useSubscriptionEntitlement";

export const useMutateStartTrial = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: IStartTrialRequest) =>
      subscriptionsService.startTrial(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_ME_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [SUBSCRIPTION_ENTITLEMENT_QUERY_KEY],
      });
      router.push(RouteAddress.ONBOARDING.BASE);
    },
  });
};

export const useMutateCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ICheckoutRequest) =>
      subscriptionsService.checkout(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_ME_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [SUBSCRIPTION_ENTITLEMENT_QUERY_KEY],
      });
    },
  });
};

/** No invoice, no side effects — validates a promo code and previews the discounted price. */
export const useMutatePreviewCheckout = () => {
  return useMutation({
    mutationFn: (body: ICheckoutPreviewRequest) =>
      subscriptionsService.previewCheckout(body),
  });
};
