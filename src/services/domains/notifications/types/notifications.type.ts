import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface INotification {
  id: number;
  title?: string | null;
  body?: string | null;
  isRead?: boolean;
  createdAt?: string | null;
}

export type TNotificationsEntity = TResponse<TPagedResult<INotification>>;

