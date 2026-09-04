import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface INotification {
  id: number;
  title?: string | null;
  body?: string | null;
  /** Backend never sends an isRead boolean — read state is this being non-null (SF-QA-043). */
  readAt?: string | null;
  createdAt?: string | null;
}

export type TNotificationsEntity = TResponse<TPagedResult<INotification>>;

