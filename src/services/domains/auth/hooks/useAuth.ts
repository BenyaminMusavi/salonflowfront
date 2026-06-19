import { useMutation, useQuery } from "@tanstack/react-query";
import authService from "../auth.service";

export const AUTH_QUERY_KEY = "AUTH_QUERY_KEY";

// ---------------- OTP ----------------

export const useSendOtp = () => {
  return useMutation({
    mutationFn: authService.sendOtp,
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: authService.verifyOtp,
  });
};

// ---------------- PASSWORD ----------------



// ---------------- ME ----------------

export const useMe = () => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEY],
    queryFn: authService.me,
  });
};

// ---------------- SWITCH CONTEXT ----------------

export const useSwitchContext = () => {
  return useMutation({
    mutationFn: ({ salonId, branchId }: { salonId?: number; branchId?: number }) =>
      authService.switchContext(salonId, branchId),
  });
};