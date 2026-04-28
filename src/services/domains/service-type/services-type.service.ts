import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS, API_BASE_URL } from "@/services/common/apiAddress";
import { TServicesEntity, TServiceTypeEntity } from "@/services/domains/service-type/types/service-type.type";


 class ServicesTypeService {
  async getAll() {
    return await axiosInstance.get<unknown, TServiceTypeEntity>(
      API_ADDRESS.SERVICE_TYPE.BASE,
    );
  }

    async getBySalon(salonId: number) {
    return await axiosInstance.get<unknown, TServicesEntity>(
      API_ADDRESS.SERVICE_TYPE.BY_ID(salonId)
    );
  }
}
const serviceTypeService = new ServicesTypeService();
export default serviceTypeService;