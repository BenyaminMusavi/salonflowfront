import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";
import {
  ReviewModerationStatus,
  ReviewTargetType,
} from "@/services/common/enums/domain-enums";

export interface IReviewReply {
  body: string;
  moderationStatus?: ReviewModerationStatus | number | null;
}

/**
 * In the public salon list, customerName is only a first name or «کاربر صفا», and
 * appointmentId / customerId / responderUserId come back 0 or empty — never rely on them there.
 */
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
  /** Prefer long when available; Guid may be sent after appointments Guid migration */
  appointmentId: string | number;
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

/** Admin moderation queue item — `GET /api/reviews/pending`. */
export interface IAdminPendingReview {
  id: number;
  rating: number;
  comment: string | null;
  customerId: number;
  customerName: string;
  /** null for a review of a staff member rather than the salon itself. */
  salonId: number | null;
  salonName: string | null;
  reply: IReviewReply | null;
}

export interface IAdminPendingReviewsParams {
  page?: number;
  pageSize?: number;
}

export type TReviewEntity = TResponse<IReview>;
export type TSalonReviewsEntity = TResponse<TPagedResult<IReview>>;
export type TAdminPendingReviewsEntity = TResponse<TPagedResult<IAdminPendingReview>>;
