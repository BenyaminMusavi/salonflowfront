import { keepPreviousData, useQuery } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import type { IAppointmentHistoryQuery } from "../types/appointments.type";

export const MY_APPOINTMENTS_QUERY_KEY = "MY_APPOINTMENTS_QUERY_KEY";

/** Works with any valid token (global or salon context) — no switch-context needed. */
export const useQueryMyAppointments = (
  query: IAppointmentHistoryQuery = {},
  options?: { enabled?: boolean }
) => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [MY_APPOINTMENTS_QUERY_KEY, query],
    queryFn: () => appointmentsService.getMine(query),
    enabled: (options?.enabled ?? true) && isLoggedIn,
    placeholderData: keepPreviousData,
  });
};
