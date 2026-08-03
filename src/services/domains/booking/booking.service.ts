import axiosInstance from "@/services/common/http/axios-instance";

import {
  CreateBookingRequest,
  GetAvailableSlotsRequest,
  TCreateBookingEntity,
} from "./types/booking.type";

import { API_ADDRESS } from "@/services/common/apiAddress";

class BookingService {
  async getAvailableSlots(params: GetAvailableSlotsRequest) {
    return await axiosInstance.get(API_ADDRESS.BOOKING.SLOTS, {
      params: {
        salonId: params.salonId,
        branchId: params.branchId,
        staffId: params.staffId ?? undefined,
        offeringIds: params.offeringIds,
        date: params.date.split("T")[0],
      },
      paramsSerializer: {
        indexes: null,
      },
    });
  }

  async create(request: CreateBookingRequest) {
    return await axiosInstance.post<unknown, TCreateBookingEntity>(
      API_ADDRESS.BOOKING.CREATE,
      {
        salonId: request.salonId,
        branchId: request.branchId ?? undefined,
        startTime: request.startTime,
        notes: request.notes ?? undefined,
        services: request.services,
      }
    );
  }
}

const bookingService = new BookingService();

export default bookingService;
