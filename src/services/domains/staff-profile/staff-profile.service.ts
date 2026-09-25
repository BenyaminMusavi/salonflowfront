import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TStaffProfileEntity } from "@/services/domains/staff-profile/types/staff-profile.type";

class StaffProfileService {
  /**
   * Default: staff who perform ANY of the offerings (dashboard pickers rely on that).
   * Customer booking passes `branchPublicId` + `matchAll: true` — one staff member does the whole
   * booking, so only staff of that branch who perform ALL the offerings qualify.
   */
  async getStaffForOfferings(
    salonPublicId: string | number,
    offeringPublicIds: Array<string | number>,
    filters?: { branchPublicId?: string | null; matchAll?: boolean }
  ) {
    return await axiosInstance.get<unknown, TStaffProfileEntity>(
      API_ADDRESS.STAFF_PROFILE.BY_SALON_FOR_SERVICES(salonPublicId),
      {
        params: {
          offeringPublicIds,
          branchPublicId: filters?.branchPublicId || undefined,
          matchAll: filters?.matchAll || undefined,
        },
        paramsSerializer: { indexes: null },
      }
    );
  }
}

const staffProfileService = new StaffProfileService();
export default staffProfileService;
