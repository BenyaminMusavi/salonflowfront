import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreateReviewRequest,
  IEditReviewRequest,
  IGetSalonReviewsParams,
  TReviewEntity,
  TSalonReviewsEntity,
} from "./types/reviews.type";

class ReviewsService {
  async listBySalon(params: IGetSalonReviewsParams) {
    return await axiosInstance.get<unknown, TSalonReviewsEntity>(
      API_ADDRESS.REVIEWS.BASE,
      {
        params: {
          salonId: params.salonId,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      }
    );
  }

  async getById(id: number) {
    return await axiosInstance.get<unknown, TReviewEntity>(
      API_ADDRESS.REVIEWS.BY_ID(id)
    );
  }

  async create(body: ICreateReviewRequest) {
    return await axiosInstance.post<unknown, TReviewEntity>(
      API_ADDRESS.REVIEWS.BASE,
      body
    );
  }

  async edit(id: number, body: IEditReviewRequest) {
    return await axiosInstance.put<unknown, TReviewEntity>(
      API_ADDRESS.REVIEWS.BY_ID(id),
      body
    );
  }

  /** Soft delete — 204 */
  async remove(id: number) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.REVIEWS.BY_ID(id)
    );
  }
}

const reviewsService = new ReviewsService();
export default reviewsService;
