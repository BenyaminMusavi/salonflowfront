import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TSalonOfferingEntity } from "@/services/domains/salon-offering/types/salon-offering-type";
         
class SalonOfferingService {

  // گرفتن سرویس‌های یک سالن
  async getBySalonId(salonId: number) {
    return await axiosInstance.get<unknown, TSalonOfferingEntity>(
      API_ADDRESS.SALON_OFFERING.BY_SALON(salonId)
    );
  }

  // گرفتن یک offering خاص (اگر بعداً لازم شد)
  async getById(id: number) {
    return await axiosInstance.get<unknown, TSalonOfferingEntity>(
      `${API_ADDRESS.SALON_OFFERING.BASE}/${id}`
    );
  }

}

const salonOfferingService = new SalonOfferingService();
export default salonOfferingService;
