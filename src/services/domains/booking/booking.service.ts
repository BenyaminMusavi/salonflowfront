import axiosInstance from "@/services/common/http/axios-instance";
import { CreateBookingRequest, GetAvailableSlotsRequest } from "./types/booking.type";
import { API_ADDRESS } from "@/services/common/apiAddress";

class BookingService {
  async getAvailableSlots(params: GetAvailableSlotsRequest) {
    const res = await axiosInstance.get(API_ADDRESS.BOOKING.SLOTS, {
      params: {
        salonId: params.salonId,
        staffId: params.staffId ?? undefined,
        offeringIds: params.offeringIds,
        date: params.date.split("T")[0], // فقط date
      },
      paramsSerializer: {
        indexes: null, // offeringIds=1&offeringIds=2
      },
    });

    // 🔥 مهم‌ترین fix: جلوگیری از undefined
    return res?.data ?? [];
  }

  async createBooking(body: CreateBookingRequest) {
    const res = await axiosInstance.post(API_ADDRESS.BOOKING.CREATE, body);
    return res.data;
  }
}

export default new BookingService();