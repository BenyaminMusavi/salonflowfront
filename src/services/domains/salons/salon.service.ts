import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IGetApprovedSalonsParams,
  TSalonsEntity,
} from "@/services/domains/salons/types/salons.type";
import { TSalonEntity } from "@/services/domains/salons/types/salon.type";

class SalonService {
  async getApproved(params: IGetApprovedSalonsParams = {}) {
    return await axiosInstance.get<unknown, TSalonsEntity>(
      API_ADDRESS.SALON.APPROVED,
      {
        params: {
          lat: params.lat,
          lng: params.lng,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          search: params.search || undefined,
          genderType: params.genderType,
          serviceTypeId: params.serviceTypeId,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          minRating: params.minRating,
        },
      }
    );
  }

  /** `id` = salon public Guid */
  async getById(id: string) {
    return await axiosInstance.get<unknown, TSalonEntity>(
      API_ADDRESS.SALON.BY_ID(id)
    );
  }
}

const salonService = new SalonService();
export default salonService;
