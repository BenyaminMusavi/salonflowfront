import axiosInstance from "@/services/common/http/axios-instance";

import {
  CreateBookingRequest,
  GetAvailableSlotsRequest,
} from "./types/booking.type";

import { API_ADDRESS } from "@/services/common/apiAddress";

class BookingService {
  async getAvailableSlots(
    params: GetAvailableSlotsRequest
  ) {
    const data = await axiosInstance.get(
      API_ADDRESS.BOOKING.SLOTS,
      {
        params: {
          salonId: params.salonId,
          staffId: params.staffId ?? undefined,
          offeringIds: params.offeringIds,
          date: params.date.split("T")[0],
        },

        paramsSerializer: {
          indexes: null,
        },
      }
    );

    return data;
  }

  async create(request: CreateBookingRequest) {
    return await axiosInstance.post(
      API_ADDRESS.BOOKING.CREATE,
      {
        salonId: request.salonId,
        staffId: request.staffId,
        customerId: request.customerId,
        offeringIds: request.offeringIds,
        startTime: request.startTime,
      }
    );
  }
}

const bookingService = new BookingService();

export default bookingService;