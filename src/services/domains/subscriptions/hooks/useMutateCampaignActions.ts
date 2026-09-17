import { useMutation, useQueryClient } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";
import {
  ICreatePlanCampaignRequest,
  IUpdatePlanCampaignRequest,
} from "../types/subscriptions.type";
import { ADMIN_CAMPAIGNS_QUERY_KEY } from "./useQueryAdminCampaigns";

export const useMutateCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreatePlanCampaignRequest) =>
      subscriptionsService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CAMPAIGNS_QUERY_KEY] });
    },
  });
};

export const useMutateUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      data,
    }: {
      campaignId: number;
      data: IUpdatePlanCampaignRequest;
    }) => subscriptionsService.updateCampaign(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CAMPAIGNS_QUERY_KEY] });
    },
  });
};

export const useMutateActivateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: number) => subscriptionsService.activateCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CAMPAIGNS_QUERY_KEY] });
    },
  });
};

export const useMutateDeactivateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: number) => subscriptionsService.deactivateCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CAMPAIGNS_QUERY_KEY] });
    },
  });
};
