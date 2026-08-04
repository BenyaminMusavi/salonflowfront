import { useQuery } from "@tanstack/react-query";
import subscriptionsService from "../subscriptions.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";

export const SUBSCRIPTION_ME_QUERY_KEY = "SUBSCRIPTION_ME_QUERY_KEY";

export const useQuerySubscriptionMe = () => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [SUBSCRIPTION_ME_QUERY_KEY],
    queryFn: () => subscriptionsService.getMe(),
    enabled: isLoggedIn,
  });
};
