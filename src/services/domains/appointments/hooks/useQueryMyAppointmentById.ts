import { useQuery } from "@tanstack/react-query";
import appointmentsService from "../appointments.service";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";

export const MY_APPOINTMENT_DETAIL_QUERY_KEY = "MY_APPOINTMENT_DETAIL_QUERY_KEY";

export const useQueryMyAppointmentById = (
  appointmentPublicId: string | undefined
) => {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: [MY_APPOINTMENT_DETAIL_QUERY_KEY, appointmentPublicId],
    queryFn: () => appointmentsService.getMineById(appointmentPublicId!),
    enabled: isLoggedIn && !!appointmentPublicId,
  });
};
