import axiosInstance from "@/services/common/http/axios-instance";
import { CreateBookingRequest, GetAvailableSlotsRequest } from "./types/booking.type";
import { API_ADDRESS } from "@/services/common/apiAddress";

class BookingService {
  async getAvailableSlots(params: GetAvailableSlotsRequest) {
    console.log("BOOKING SERVICE REQUEST PARAMS", {
      salonId: params.salonId,
      staffId: params.staffId,
      offeringIds: params.offeringIds,
      date: params.date,
    });

const data = await axiosInstance.get(API_ADDRESS.BOOKING.SLOTS, {
  params: {
    salonId: params.salonId,
    staffId: params.staffId ?? undefined,
    offeringIds: params.offeringIds,
    date: params.date.split("T")[0],
  },
  paramsSerializer: {
    indexes: null,
  },
});

    console.log("BOOKING SERVICE RAW RESPONSE:", data);
    console.log("IS ARRAY?", Array.isArray(data));

    console.log("BOOKING SERVICE RETURNING:", data);

    return data;
  }
}

const bookingService = new BookingService();
export default bookingService;