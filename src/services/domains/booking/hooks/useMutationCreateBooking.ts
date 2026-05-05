import { useMutation } from "@tanstack/react-query";
import bookingService from "../booking.service";
import { CreateBookingRequest } from "../types/booking.type";

export const useMutationCreateBooking = () => {
  return useMutation({
    mutationFn: (data: CreateBookingRequest) =>
      bookingService.createBooking(data),
  });
};