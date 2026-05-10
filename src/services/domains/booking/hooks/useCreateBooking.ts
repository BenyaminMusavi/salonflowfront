import { useMutation } from "@tanstack/react-query";
import { CreateBookingRequest } from "../types/booking.type";
import bookingService from "../booking.service";


export const CREATE_BOOKING_MUTATION_KEY = "CREATE_BOOKING_MUTATION_KEY";

export const useCreateBooking = () => {
  return useMutation({
    mutationKey: [CREATE_BOOKING_MUTATION_KEY],

    mutationFn: async (
      request: CreateBookingRequest
    ) => {
      return await bookingService.create(request);
    },
  });
};