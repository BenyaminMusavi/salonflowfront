import { useMutation, useQueryClient } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";
import {
  ICheckoutRequest,
  IStartTrialRequest,
} from "../types/subscriptions.type";
import { SUBSCRIPTION_ME_QUERY_KEY } from "./useQuerySubscriptionMe";
import { SUBSCRIPTION_ENTITLEMENT_QUERY_KEY } from "./useSubscriptionEntitlement";

export const useMutateStartTrial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IStartTrialRequest) =>
      subscriptionsService.startTrial(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_ME_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [SUBSCRIPTION_ENTITLEMENT_QUERY_KEY],
      });
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
