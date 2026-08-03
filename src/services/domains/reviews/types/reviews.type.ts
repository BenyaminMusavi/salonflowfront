import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";
import {
  ReviewModerationStatus,
  ReviewTargetType,
} from "@/services/common/enums/domain-enums";

export interface IReviewReply {
  body: string;
  moderationStatus?: ReviewModerationStatus | number | null;
}

export interface IReview {
  id: number;
  appointmentId?: number | null;
  salonId?: number | null;
  rating: number;
  comment?: string | null;
  moderationStatus: ReviewModerationStatus | number;
  isVerified?: boolean;
  createdAt?: string | null;
  reply?: IReviewReply | null;
  customerName?: string | null;
}

export interface ICreateReviewRequest {
  appointmentId: number;
  targetType?: ReviewTargetType | number;
  staffMemberId?: number | null;
  rating: number;
  comment?: string | null;
}

export interface IEditReviewRequest {
  rating: number;
  comment?: string | null;
}

export interface IGetSalonReviewsParams {
  salonId: number;
  page?: number;
  pageSize?: number;
}

export type TReviewEntity = TResponse<IReview>;
export type TSalonReviewsEntity = TResponse<TPagedResult<IReview>>;
