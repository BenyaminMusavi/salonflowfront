import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import {
  IGetApprovedSalonsParams,
  TSalonsEntity,
} from "@/services/domains/salons/types/salons.type";
import { TSalonEntity } from "@/services/domains/salons/types/salon.type";
import {
  IGetSalonAvailableSlotsParams,
  ISalonBrowseSlot,
  TAvailableDatesEntity,
  TBranchServicesEntity,
  TCalculatePriceEntity,
  TSalonAvailableSlotsEntity,
  TStaffAvailabilityEntity,
} from "@/services/domains/salons/types/booking-browse.type";
import { TimeSlotDto } from "@/services/domains/booking/types/booking.type";
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
          serviceTypePublicId: params.serviceTypePublicId,
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

  /**
   * GET /api/salons/available-slots was removed from the backend (SF-QA-022) — its logic
   * was a duplicate adapter over the same AvailabilityEngine behind GET /api/booking/slots,
   * which is [AllowAnonymous] and is the one endpoint that actually exists. Call that
   * endpoint here and adapt its response (a flat array of UTC start/end instants) back into
   * the ISalonAvailableSlots shape (local "HH:mm:ss" strings) the booking-wizard UI expects,
   * so BookSlotsStep / resolveSlotStaff don't need to change.
   */
  async getAvailableSlots(params: IGetSalonAvailableSlotsParams) {
    const res = await axiosInstance.get<unknown, TResponse<TimeSlotDto[]>>(
      API_ADDRESS.BOOKING.SLOTS,
      {
        params: {
          salonPublicId: params.salonPublicId,
          branchPublicId: params.branchPublicId,
          staffPublicId: params.staffProfilePublicId || undefined,
          offeringPublicIds: params.offeringPublicIds,
          date: params.date,
        },
        paramsSerializer: { indexes: null },
      }
    );

    const slots: ISalonBrowseSlot[] = (res.data ?? []).map((item) => ({
      time: toLocalTimeString(item.start),
      endTime: toLocalTimeString(item.end),
      staffPublicId: item.staffPublicId ?? null,
    }));

    return { ...res, data: { slots } } satisfies TSalonAvailableSlotsEntity;
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

/**
 * GET /api/booking/slots returns UTC instants (e.g. "2026-09-05T05:30:00Z"). The rest of
 * the booking wizard (date step, create-booking payload in booking-mappers.ts) works with
 * plain local "HH:mm:ss" wall-clock strings, matching the existing app-wide convention of
 * reading Date getters in the browser's own local time (see DashboardCalendarGrid.tsx's
 * formatClock) rather than converting through an explicit IANA zone.
 */
function toLocalTimeString(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
