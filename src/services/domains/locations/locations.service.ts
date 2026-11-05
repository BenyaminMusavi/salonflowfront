import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ILocationPreference,
  ISaveLocationPreferenceRequest,
  TCitiesEntity,
  TDistrictsEntity,
  TLocationPreferenceEntity,
  TProvincesEntity,
} from "./types/locations.type";

class LocationsService {
  async provinces() {
    return await axiosInstance.get<unknown, TProvincesEntity>(API_ADDRESS.LOCATIONS.PROVINCES);
  }

  async cities(params: { provincePublicId?: string; search?: string }) {
    return await axiosInstance.get<unknown, TCitiesEntity>(API_ADDRESS.LOCATIONS.CITIES, {
      params: { provincePublicId: params.provincePublicId || undefined, search: params.search?.trim() || undefined },
    });
  }

  async districts(cityPublicId: string, search?: string) {
    return await axiosInstance.get<unknown, TDistrictsEntity>(API_ADDRESS.LOCATIONS.DISTRICTS(cityPublicId), {
      params: { search: search?.trim() || undefined },
    });
  }

  /** null = nothing saved (204). */
  async getPreference(): Promise<ILocationPreference | null> {
    const res = await axiosInstance.get<unknown, TLocationPreferenceEntity | "">(API_ADDRESS.LOCATIONS.PREFERENCE);
    return res && typeof res === "object" && res.data ? res.data : null;
  }

  async savePreference(body: ISaveLocationPreferenceRequest) {
    return await axiosInstance.put<unknown, TLocationPreferenceEntity>(API_ADDRESS.LOCATIONS.PREFERENCE, body);
  }

  async deletePreference() {
    return await axiosInstance.delete<unknown, void>(API_ADDRESS.LOCATIONS.PREFERENCE);
  }
}

const locationsService = new LocationsService();
export default locationsService;
