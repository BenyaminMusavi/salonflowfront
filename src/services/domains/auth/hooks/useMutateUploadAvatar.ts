import { useMutation, useQueryClient } from "@tanstack/react-query";
import mediaService from "@/services/domains/media/media.service";
import {
  MediaEntityType,
  MediaUsageType,
} from "@/services/common/enums/domain-enums";
import { AUTH_QUERY_KEY } from "./useQueryAuthMe";

export const useMutateUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      customerPublicId,
    }: {
      file: File;
      customerPublicId: string;
    }) =>
      mediaService.upload(MediaEntityType.Customer, customerPublicId, {
        file,
        usageType: MediaUsageType.Profile,
        isPrimary: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
    },
  });
};
