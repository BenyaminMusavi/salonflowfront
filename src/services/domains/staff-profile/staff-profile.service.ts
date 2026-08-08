import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TStaffProfileEntity } from "@/services/domains/staff-profile/types/staff-profile.type";

class StaffProfileService {
  async getStaffForOfferings(
    salonPublicId: string | number,
    offeringPublicIds: Array<string | number>
  ) {
    return await axiosInstance.get<unknown, TStaffProfileEntity>(
      API_ADDRESS.STAFF_PROFILE.BY_SALON_FOR_SERVICES(salonPublicId),
      {
        params: { offeringPublicIds },
        paramsSerializer: { indexes: null },
      }
    );
  }
}

const staffProfileService = new StaffProfileService();
export default staffProfileService;
