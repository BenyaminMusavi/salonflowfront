import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { ISwitchContextRequest } from "@/services/domains/auth/types/auth.type";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

export type SwitchContextInput = Omit<ISwitchContextRequest, "refreshToken"> & {
  salonName?: string;
  salonPublicId?: string;
  roleId?: number;
  roleName?: string;
};

export const useMutateSwitchContext = () => {
  const queryClient = useQueryClient();
  const setToken = useTokenStore((s) => s.setToken);
  const setActiveContext = useSalonContextStore((s) => s.setActiveContext);
  const clearContext = useSalonContextStore((s) => s.clearContext);
  const upsertMembership = useSalonContextStore((s) => s.upsertMembership);

  return useMutation({
    mutationFn: ({ salonId, branchId }: SwitchContextInput) => {
      const refreshToken = useTokenStore.getState().token?.refreshToken;
      if (!refreshToken) {
        return Promise.reject(new Error("نشست منقضی شده؛ دوباره وارد شوید."));
      }
      return authService.switchContext({ salonId, branchId, refreshToken });
    },
    onSuccess: (res, variables) => {
      setToken(res.data, true);
      if (variables.salonId == null) {
        clearContext();
      } else {
        setActiveContext({
          salonId: variables.salonId,
          branchId: variables.branchId,
          salonPublicId: variables.salonPublicId ?? null,
          salonName: variables.salonName ?? null,
        });
        upsertMembership({
          salonId: variables.salonId,
          branchId: variables.branchId,
          salonPublicId: variables.salonPublicId,
          name: variables.salonName ?? `سالن ${variables.salonId}`,
          roleId: variables.roleId,
          roleName: variables.roleName,
        });
      }
      // Drop role-scoped caches so customer vs salon data never mix under the new JWT.
      queryClient.clear();
    },
  });
};
