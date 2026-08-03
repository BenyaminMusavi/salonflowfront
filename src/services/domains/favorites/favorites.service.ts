import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TFavoritesEntity } from "./types/favorites.type";

class FavoritesService {
  async list() {
    return await axiosInstance.get<unknown, TFavoritesEntity>(
      API_ADDRESS.FAVORITES.BASE
    );
  }

  /** `salonId` = numeric long internal id */
  async add(salonId: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.FAVORITES.BY_SALON(salonId)
    );
  }

  async remove(salonId: number) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.FAVORITES.BY_SALON(salonId)
    );
  }
}

const favoritesService = new FavoritesService();
export default favoritesService;
