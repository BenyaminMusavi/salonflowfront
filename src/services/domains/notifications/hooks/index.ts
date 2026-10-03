"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import notificationsService from "../notifications.service";

export const NOTIFICATIONS_QUERY_KEY = "NOTIFICATIONS_QUERY_KEY";

export const useQueryNotifications = (params?: {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}) => {
  const { enabled = true, ...listParams } = params ?? {};
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, listParams],
    queryFn: () => notificationsService.list(listParams),
    enabled,
  });
};

/** Bell badge — shares the list key so read / read-all refresh it; polled once a minute. */
export const useQueryUnreadNotificationsCount = (enabled = true) =>
  useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, "unread-count"],
    queryFn: () => notificationsService.unreadCount(),
    enabled,
    refetchInterval: 60_000,
    select: (res) => res.data?.count ?? 0,
  });

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

