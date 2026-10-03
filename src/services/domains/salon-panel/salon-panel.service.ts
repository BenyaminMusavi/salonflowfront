import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import type {
  IBranchRequest,
  IPatchSalonProfileRequest,
  TBranchItemEntity,
  TBranchRemovalImpactEntity,
  TSalonProfileEntity,
} from "./types/salon-panel.type";

/** The active panel salon (from `X-Salon-Id`): profile, branches one by one, gallery order. */
class SalonPanelService {
  async getProfile() {
    return await axiosInstance.get<unknown, TSalonProfileEntity>(API_ADDRESS.SALON_PANEL.PROFILE);
  }

  async patchProfile(body: IPatchSalonProfileRequest) {
    return await axiosInstance.patch<unknown, TSalonProfileEntity>(API_ADDRESS.SALON_PANEL.PROFILE, body);
  }

  async createBranch(body: IBranchRequest) {
    return await axiosInstance.post<unknown, TBranchItemEntity>(API_ADDRESS.SALON_PANEL.BRANCHES, body);
  }

  async patchBranch(publicId: string, body: IBranchRequest) {
    return await axiosInstance.patch<unknown, TBranchItemEntity>(API_ADDRESS.SALON_PANEL.BRANCH(publicId), body);
  }

  async removeBranch(publicId: string) {
    return await axiosInstance.delete(API_ADDRESS.SALON_PANEL.BRANCH(publicId));
  }

  async branchRemovalImpact(publicId: string) {
    return await axiosInstance.get<unknown, TBranchRemovalImpactEntity>(
      API_ADDRESS.SALON_PANEL.BRANCH_REMOVAL_IMPACT(publicId)
    );
  }

  async orderGallery(publicIds: string[]) {
    return await axiosInstance.put(API_ADDRESS.SALON_PANEL.GALLERY_ORDER, { publicIds });
  }
}

const salonPanelService = new SalonPanelService();
export default salonPanelService;
