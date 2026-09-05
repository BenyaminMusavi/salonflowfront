import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateBookingRequest } from "../types/booking.type";
import bookingService from "../booking.service";
import { SALON_AVAILABLE_SLOTS_QUERY_KEY } from "@/services/domains/salons/hooks/useQuerySalonAvailableSlots";


export const CREATE_BOOKING_MUTATION_KEY = "CREATE_BOOKING_MUTATION_KEY";

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [CREATE_BOOKING_MUTATION_KEY],

    mutationFn: async (
      request: CreateBookingRequest
    ) => {
      return await bookingService.create(request);
    },

    // Booking a slot (or finding out it's already taken by a "schedule" conflict) both mean the
    // previously-fetched slots list no longer reflects reality — without this, React Query's
    // 30-60s staleTime keeps showing the just-booked/just-taken time as available if the user
    // goes back a step or starts another booking, and re-submitting it produces the same
    // confusing "already booked" error against a slot the UI still displays as free.
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [SALON_AVAILABLE_SLOTS_QUERY_KEY],
      });
    },
  });
};