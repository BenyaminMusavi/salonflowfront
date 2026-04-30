import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TServicesEntity, TServiceTypeEntity } from "@/services/domains/service-type/types/service-type.type";

class ServicesTypeService {
  // گرفتن همه سرویس‌تایپ‌ها (اگر پنل ادمین لازم داشت)
  async getAll() {
    return await axiosInstance.get<unknown, TServiceTypeEntity>(
      API_ADDRESS.SERVICE_TYPE.BASE
    );
  }

  // سرویس‌های یک سالن (اصلی برای UI رزرو تو)
  async getServicesBySalon(salonId: number) {
    return await axiosInstance.get<unknown, TServicesEntity>(
      API_ADDRESS.SALON_OFFERING.BY_SALON(salonId)
    );
  }

  // گرفتن یک service type (در صورت نیاز)
  async getById(id: number) {
    return await axiosInstance.get<unknown, TServiceTypeEntity>(
      `${API_ADDRESS.SERVICE_TYPE.BASE}/${id}`
    );
  }
}

const serviceTypeService = new ServicesTypeService();
export default serviceTypeService;