import { useMutation, useQueryClient } from "@tanstack/react-query";
import salonService from "../salon.service";
import { IOnboardingStaff } from "../types/onboarding.type";
import { STAFF_FOR_OFFERINGS_QUERY_KEY } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";

export type SaveSalonStaffVars = {
  salonPublicId: string;
  staff: IOnboardingStaff[];
};

export const useMutateSalonStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salonPublicId, staff }: SaveSalonStaffVars) =>
      salonService.saveStaff(salonPublicId, staff),
    onSuccess: () => {
      // So a newly saved staff member shows up immediately in every picker built on
      // this lookup (quick-book, the board filter, StaffServicesView).
      queryClient.invalidateQueries({
        queryKey: [STAFF_FOR_OFFERINGS_QUERY_KEY],
      });
    },
  });
};
