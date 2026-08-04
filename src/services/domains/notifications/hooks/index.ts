"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import notificationsService from "../notifications.service";

export const NOTIFICATIONS_QUERY_KEY = "NOTIFICATIONS_QUERY_KEY";

export const useQueryNotifications = (params?: {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => notificationsService.list(params),
  });
};

export const useMutateNotifications = () => {
  const queryClient = useQueryClient();
  return {
    read: useMutation({
      mutationFn: (id: number) => notificationsService.read(id),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] }),
    }),
    readAll: useMutation({
      mutationFn: () => notificationsService.readAll(),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] }),
    }),
  };
};

