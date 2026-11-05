import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TAmenitiesEntity } from "./types/amenities.type";

class AmenitiesService {
  /** Active amenities, ordered by category then display order. */
  async list() {
    return await axiosInstance.get<unknown, TAmenitiesEntity>(API_ADDRESS.AMENITIES.LIST);
  }
}

const amenitiesService = new AmenitiesService();
export default amenitiesService;
