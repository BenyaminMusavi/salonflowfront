import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IAdminPendingReviewsParams,
  ICreateReviewRequest,
  IEditReviewRequest,
  IGetSalonReviewsParams,
  TAdminPendingReviewsEntity,
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

  /** Admin moderation queue. */
  async listPending(params: IAdminPendingReviewsParams) {
    return await axiosInstance.get<unknown, TAdminPendingReviewsEntity>(
      API_ADDRESS.REVIEWS.PENDING,
      {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      }
    );
  }

  async approve(id: number) {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.REVIEWS.APPROVE(id));
  }

  async reject(id: number) {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.REVIEWS.REJECT(id));
  }

  async approveReply(reviewId: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.REVIEWS.REPLY_APPROVE(reviewId)
    );
  }

  async rejectReply(reviewId: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.REVIEWS.REPLY_REJECT(reviewId)
    );
  }
}

const reviewsService = new ReviewsService();
export default reviewsService;
