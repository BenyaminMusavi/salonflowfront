import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import { TFavoritesEntity } from "./types/favorites.type";

class FavoritesService {
  async list() {
    return await axiosInstance.get<unknown, TFavoritesEntity>(
      API_ADDRESS.FAVORITES.BASE
    );
  }

  /** `salonPublicId` = catalog Guid (`SalonCardDto.id`). POST is idempotent. */
  async add(salonPublicId: string) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.FAVORITES.BY_SALON(salonPublicId)
    );
  }

  /** Always 204 (idempotent), even if the favorite does not exist. */
  async remove(salonPublicId: string) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.FAVORITES.BY_SALON(salonPublicId)
    );
  }
}

const favoritesService = new FavoritesService();
export default favoritesService;
