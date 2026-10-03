import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import type { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { TNotificationsEntity } from "./types/notifications.type";

class NotificationsService {
  async list(params?: {
    unreadOnly?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    return await axiosInstance.get<unknown, TNotificationsEntity>(
      API_ADDRESS.NOTIFICATIONS.BASE,
      {
        params: {
          unreadOnly: params?.unreadOnly,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
        },
      }
    );
  }

  async unreadCount() {
    return await axiosInstance.get<unknown, TResponse<{ count: number }>>(API_ADDRESS.NOTIFICATIONS.UNREAD_COUNT);
  }

  async read(id: number) {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.NOTIFICATIONS.READ(id));
  }

  async readAll() {
    return await axiosInstance.post<unknown, void>(API_ADDRESS.NOTIFICATIONS.READ_ALL);
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;

