import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IGetApprovedSalonsParams,
  TSalonsEntity,
} from "@/services/domains/salons/types/salons.type";
import { TSalonEntity } from "@/services/domains/salons/types/salon.type";
import {
  IGetSalonAvailableSlotsParams,
  TAvailableDatesEntity,
  TBranchServicesEntity,
  TCalculatePriceEntity,
  TSalonAvailableSlotsEntity,
  TStaffAvailabilityEntity,
} from "@/services/domains/salons/types/booking-browse.type";

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

  async getBranchServices(branchId: number) {
    return await axiosInstance.get<unknown, TBranchServicesEntity>(
      API_ADDRESS.SALON.BRANCH_SERVICES(branchId)
    );
  }

  async getAvailableDates(branchId: number, serviceTypeId: number) {
    return await axiosInstance.get<unknown, TAvailableDatesEntity>(
      API_ADDRESS.SALON.BRANCH_AVAILABLE_DATES(branchId),
      { params: { serviceTypeId } }
    );
  }

  async getStaffAvailability(
    branchId: number,
    serviceTypeId: number,
    date: string
  ) {
    return await axiosInstance.get<unknown, TStaffAvailabilityEntity>(
      API_ADDRESS.SALON.BRANCH_STAFF_AVAILABILITY(branchId),
      { params: { serviceTypeId, date } }
    );
  }

  async calculatePrice(
    branchId: number,
    serviceTypeIds: number[],
    staffPublicId?: string | null
  ) {
    return await axiosInstance.get<unknown, TCalculatePriceEntity>(
      API_ADDRESS.SALON.BRANCH_CALCULATE_PRICE(branchId),
      {
        params: {
          serviceTypeIds,
          staffPublicId: staffPublicId || undefined,
        },
        paramsSerializer: { indexes: null },
      }
    );
  }

  async getAvailableSlots(params: IGetSalonAvailableSlotsParams) {
    return await axiosInstance.get<unknown, TSalonAvailableSlotsEntity>(
      API_ADDRESS.SALON.AVAILABLE_SLOTS,
      {
        params: {
          branchId: params.branchId,
          date: params.date,
          serviceTypeIds: params.serviceTypeIds,
          staffProfilePublicId: params.staffProfilePublicId || undefined,
        },
        paramsSerializer: { indexes: null },
      }
    );
  }
}

const salonService = new SalonService();
export default salonService;
