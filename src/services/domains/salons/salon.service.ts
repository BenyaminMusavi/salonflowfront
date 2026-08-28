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
import {
  IOnboardingBranch,
  IOnboardingService,
  IOnboardingStaff,
  ISaveBasicInfoRequest,
  IScheduleDay,
  TSaveBasicInfoEntity,
  TSaveBranchesEntity,
  TSaveServicesEntity,
  TSaveStaffEntity,
  TStaffRosterEntity,
} from "@/services/domains/salons/types/onboarding.type";

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

  async getById(id: string) {
    return await axiosInstance.get<unknown, TSalonEntity>(
      API_ADDRESS.SALON.BY_ID(id)
    );
  }

  async getBranchServices(branchPublicId: string) {
    return await axiosInstance.get<unknown, TBranchServicesEntity>(
      API_ADDRESS.SALON.BRANCH_SERVICES(branchPublicId)
    );
  }

  async getAvailableDates(branchPublicId: string, serviceTypePublicId: string) {
    return await axiosInstance.get<unknown, TAvailableDatesEntity>(
      API_ADDRESS.SALON.BRANCH_AVAILABLE_DATES(branchPublicId),
      { params: { serviceTypePublicId } }
    );
  }

  async getStaffAvailability(
    branchPublicId: string,
    serviceTypePublicId: string,
    date: string
  ) {
    return await axiosInstance.get<unknown, TStaffAvailabilityEntity>(
      API_ADDRESS.SALON.BRANCH_STAFF_AVAILABILITY(branchPublicId),
      { params: { serviceTypePublicId, date } }
    );
  }

  async calculatePrice(
    branchPublicId: string,
    serviceTypePublicIds: string[],
    staffPublicId?: string | null
  ) {
    return await axiosInstance.get<unknown, TCalculatePriceEntity>(
      API_ADDRESS.SALON.BRANCH_CALCULATE_PRICE(branchPublicId),
      {
        params: {
          serviceTypePublicIds,
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
          branchPublicId: params.branchPublicId,
          date: params.date,
          serviceTypePublicIds: params.serviceTypePublicIds,
          staffProfilePublicId: params.staffProfilePublicId || undefined,
        },
        paramsSerializer: { indexes: null },
      }
    );
  }

  /* ---------- Onboarding ---------- */

  async saveBasicInfo(body: ISaveBasicInfoRequest) {
    return await axiosInstance.post<unknown, TSaveBasicInfoEntity>(
      API_ADDRESS.SALON.SAVE_BASIC_INFO,
      body
    );
  }

  async saveBranches(salonPublicId: string, branches: IOnboardingBranch[]) {
    return await axiosInstance.post<unknown, TSaveBranchesEntity>(
      API_ADDRESS.SALON.SAVE_BRANCHES(salonPublicId),
      { branches }
    );
  }

  async saveServices(salonPublicId: string, services: IOnboardingService[]) {
    return await axiosInstance.post<unknown, TSaveServicesEntity>(
      API_ADDRESS.SALON.SAVE_SERVICES(salonPublicId),
      { services }
    );
  }

  async saveStaff(salonPublicId: string, staff: IOnboardingStaff[]) {
    return await axiosInstance.post<unknown, TSaveStaffEntity>(
      API_ADDRESS.SALON.SAVE_STAFF(salonPublicId),
      { staff }
    );
  }

  /** Server's source of truth for the current roster — replaces the old localStorage draft. */
  async getStaff(salonPublicId: string) {
    return await axiosInstance.get<unknown, TStaffRosterEntity>(
      API_ADDRESS.SALON.STAFF_ROSTER(salonPublicId)
    );
  }

  /** Only the invited user's own JWT may call these (backend returns 401 otherwise). */
  async acceptStaffInvitation(salonPublicId: string, staffPublicId: string) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SALON.ACCEPT_STAFF_INVITATION(salonPublicId, staffPublicId)
    );
  }

  async rejectStaffInvitation(salonPublicId: string, staffPublicId: string) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SALON.REJECT_STAFF_INVITATION(salonPublicId, staffPublicId)
    );
  }

  async saveMedias(
    salonPublicId: string,
    files: File[],
    keepMediaPublicIds?: string[]
  ) {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    if (keepMediaPublicIds?.length) {
      form.append("keepMediaPublicIds", keepMediaPublicIds.join(","));
    }
    return await axiosInstance.post(
      API_ADDRESS.SALON.SAVE_MEDIAS(salonPublicId),
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  }

  async saveMySchedule(salonPublicId: string, days: IScheduleDay[]) {
    return await axiosInstance.post(
      API_ADDRESS.SALON.SAVE_MY_SCHEDULE(salonPublicId),
      { days }
    );
  }

  async submitForReview(salonPublicId: string) {
    return await axiosInstance.post(
      API_ADDRESS.SALON.SUBMIT_FOR_REVIEW(salonPublicId)
    );
  }
}

const salonService = new SalonService();
export default salonService;
