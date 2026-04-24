import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS, API_BASE_URL } from "@/services/common/apiAddress";
import { TSalonEntity } from "@/services/domains/salon/types/salon.type";

 class SalonService {
  async getApproved() {
    return await axiosInstance.get<unknown, TSalonEntity>(
      API_ADDRESS.SALON.APPROVED,
    );
  }
}
const salonService = new SalonService();
export default salonService;