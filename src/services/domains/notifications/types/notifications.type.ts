import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface INotification {
  id: number;
  title?: string | null;
  body?: string | null;
  /** Backend never sends an isRead boolean — read state is this being non-null (SF-QA-043). */
  readAt?: string | null;
  createdAt?: string | null;
  /** Backend EntityType (7 = Appointment) and its numeric id. */
  relatedEntityType?: number | null;
  relatedEntityId?: number | null;
  /** Requested from the backend: the related entity's Guid, so a reminder can open its appointment. */
  relatedEntityPublicId?: string | null;
}

export const NOTIFICATION_ENTITY_APPOINTMENT = 7;

export type TNotificationsEntity = TResponse<TPagedResult<INotification>>;

