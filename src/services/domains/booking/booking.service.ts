import axiosInstance from "@/services/common/http/axios-instance";
import { CreateBookingRequest, GetAvailableSlotsRequest } from "./types/booking.type";
import { API_ADDRESS } from "@/services/common/apiAddress";

class BookingService {
  async getAvailableSlots(params: GetAvailableSlotsRequest) {
    return axiosInstance.get(API_ADDRESS.BOOKING.SLOTS, {
      params: {
        salonId: params.salonId,
        staffId: params.staffId ?? undefined,
        date: params.date,
        offeringIds: params.offeringIds,
      },
      paramsSerializer: {
        indexes: null,
      },
    });
  }

  async createBooking(body: CreateBookingRequest) {
    return axiosInstance.post(API_ADDRESS.BOOKING.CREATE, body);
  }
}

export default new BookingService();