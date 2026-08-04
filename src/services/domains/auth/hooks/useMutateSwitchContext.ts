import { useMutation } from "@tanstack/react-query";
import authService from "@/services/domains/auth/auth.service";
import { ISwitchContextRequest } from "@/services/domains/auth/types/auth.type";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";

export type SwitchContextInput = ISwitchContextRequest & {
  salonName?: string;
  salonPublicId?: string;
  roleId?: number;
  roleName?: string;
};

export const useMutateSwitchContext = () => {
  const setToken = useTokenStore((s) => s.setToken);
  const setActiveContext = useSalonContextStore((s) => s.setActiveContext);
  const clearContext = useSalonContextStore((s) => s.clearContext);
  const upsertMembership = useSalonContextStore((s) => s.upsertMembership);

  return useMutation({
    mutationFn: ({ salonId, branchId }: SwitchContextInput) =>
      authService.switchContext({ salonId, branchId }),
    onSuccess: (res, variables) => {
      setToken(res.data, true);
      if (variables.salonId == null) {
        clearContext();
        return;
      }
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
    },
  });
};
