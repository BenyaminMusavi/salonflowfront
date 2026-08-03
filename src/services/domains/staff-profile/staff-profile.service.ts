import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TStaffProfileEntity } from "@/services/domains/staff-profile/types/staff-profile.type";

class StaffProfileService {
  /** `salonId` = salon public Guid (or numeric if API accepts both). */
  async getStaffForOfferings(
    salonPublicId: string | number,
    offeringIds: number[]
  ) {
    return await axiosInstance.get<unknown, TStaffProfileEntity>(
      API_ADDRESS.STAFF_PROFILE.BY_SALON_FOR_SERVICES(salonPublicId),
      {
        params: { offeringIds },
        paramsSerializer: { indexes: null },
      }
    );
  }
}

const staffProfileService = new StaffProfileService();
export default staffProfileService;
