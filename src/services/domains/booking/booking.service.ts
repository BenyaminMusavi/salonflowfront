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
        salonPublicId: params.salonPublicId,
        branchPublicId: params.branchPublicId,
        staffPublicId: params.staffPublicId ?? undefined,
        offeringPublicIds: params.offeringPublicIds,
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
        salonPublicId: request.salonPublicId,
        branchPublicId: request.branchPublicId ?? undefined,
        startTime: request.startTime,
        notes: request.notes ?? undefined,
        services: request.services,
      }
    );
  }
}

const bookingService = new BookingService();

export default bookingService;
