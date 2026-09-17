import { useMutation, useQueryClient } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";
import {
  ICreatePromoCodeRequest,
  IUpdatePromoCodeRequest,
} from "../types/subscriptions.type";
import { ADMIN_PROMO_CODES_QUERY_KEY } from "./useQueryAdminPromoCodes";

export const useMutateCreatePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreatePromoCodeRequest) => subscriptionsService.createPromo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROMO_CODES_QUERY_KEY] });
    },
  });
};

export const useMutateUpdatePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      promoId,
      data,
    }: {
      promoId: number;
      data: IUpdatePromoCodeRequest;
    }) => subscriptionsService.updatePromo(promoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROMO_CODES_QUERY_KEY] });
    },
  });
};

export const useMutateActivatePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promoId: number) => subscriptionsService.activatePromo(promoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROMO_CODES_QUERY_KEY] });
    },
  });
};

export const useMutateDeactivatePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promoId: number) => subscriptionsService.deactivatePromo(promoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROMO_CODES_QUERY_KEY] });
    },
  });
};
