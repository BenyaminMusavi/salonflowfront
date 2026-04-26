import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS, API_BASE_URL } from "@/services/common/apiAddress";
import { TSalonsEntity } from "@/services/domains/salon/types/salons.type";
import { TSalonEntity } from "@/services/domains/salon/types/salon.type";

 class SalonService {
  async getApproved() {
    return await axiosInstance.get<unknown, TSalonsEntity>(
      API_ADDRESS.SALON.APPROVED,
    );
  }
  
  async getById(id: number) {
    return await axiosInstance.get<unknown, TSalonEntity>(
      API_ADDRESS.SALON.BY_ID(id)
    );
  }
}
const salonService = new SalonService();
export default salonService;