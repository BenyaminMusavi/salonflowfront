import { useQuery } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";

export const MY_APPOINTMENTS_QUERY_KEY = "MY_APPOINTMENTS_QUERY_KEY";

export const useQueryMyAppointments = () => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [MY_APPOINTMENTS_QUERY_KEY],
    queryFn: () => appointmentsService.getMine(),
    enabled: isLoggedIn,
  });
};
