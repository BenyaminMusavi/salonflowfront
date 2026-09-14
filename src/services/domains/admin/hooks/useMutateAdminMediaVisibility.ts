import { useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/domains/admin/admin.service";
import { IAdminMediaVisibilityRequest } from "@/services/domains/admin/types/admin.type";
import { ADMIN_SALON_DETAIL_QUERY_KEY } from "./useQueryAdminSalonDetail";

function useInvalidateSalonDetail() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [ADMIN_SALON_DETAIL_QUERY_KEY] });
  };
}

export const useMutateHideMedia = () => {
  const invalidate = useInvalidateSalonDetail();

  return useMutation({
    mutationFn: ({
      mediaId,
      data,
    }: {
      mediaId: number;
      data: IAdminMediaVisibilityRequest;
    }) => adminService.hideMedia(mediaId, data),
    onSuccess: invalidate,
  });
};

export const useMutateUnhideMedia = () => {
  const invalidate = useInvalidateSalonDetail();

  return useMutation({
    mutationFn: ({
      mediaId,
      data,
    }: {
      mediaId: number;
      data: IAdminMediaVisibilityRequest;
    }) => adminService.unhideMedia(mediaId, data),
    onSuccess: invalidate,
  });
};
