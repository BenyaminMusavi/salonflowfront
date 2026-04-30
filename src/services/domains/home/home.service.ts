import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";

import { THomeServiceEntity } from "@/services/domains/home/types/serivce.type"
import { THomeSalonEntity } from "@/services/domains/home/types/salon.type";

class HomeService {
  // ======================================================
  // 1️⃣ Get Home Services (SalonOfferings)
  // ======================================================
  async getServices() {
    return await axiosInstance.get<unknown, THomeServiceEntity>(
      API_ADDRESS.HOME.SERVICES
    );
  }

  // ======================================================
  // 2️⃣ Get Home Salons (feed)
  // ======================================================
  async getSalons() {
    return await axiosInstance.get<unknown, THomeSalonEntity>(
      API_ADDRESS.HOME.SALONS
    );
  }
}

const homeService = new HomeService();
export default homeService;