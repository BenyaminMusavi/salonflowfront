import { useMutation, useQueryClient } from "@tanstack/react-query";
import salonService from "../salon.service";
import { AUTH_QUERY_KEY } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { STAFF_ROSTER_QUERY_KEY } from "./useQueryStaffRoster";

export type StaffInvitationVars = {
  salonPublicId: string;
  staffPublicId: string;
};

export const useMutateStaffInvitation = () => {
  const queryClient = useQueryClient();

  const onSettled = () => {
    // /api/auth/me carries pendingStaffInvitations — refetch so the prompt clears,
    // and refresh any roster the owner side might have open.
    queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [STAFF_ROSTER_QUERY_KEY] });
  };

  const accept = useMutation({
    mutationFn: ({ salonPublicId, staffPublicId }: StaffInvitationVars) =>
      salonService.acceptStaffInvitation(salonPublicId, staffPublicId),
    onSettled,
  });

  const reject = useMutation({
    mutationFn: ({ salonPublicId, staffPublicId }: StaffInvitationVars) =>
      salonService.rejectStaffInvitation(salonPublicId, staffPublicId),
    onSettled,
  });

  return { accept, reject };
};
