import { useMutation, useQueryClient } from "@tanstack/react-query";
import mediaService from "@/services/domains/media/media.service";
import salonService from "../salon.service";
import {
  MediaEntityType,
  MediaUsageType,
} from "@/services/common/enums/domain-enums";
import { SALON_BY_ID_QUERY_KEY } from "./useQuerySalonById";

export type UploadSalonMediaVars = {
  salonPublicId: string;
  file: File;
  usageType: MediaUsageType;
  isPrimary?: boolean;
  /** Existing media Guid to replace in place; omit to create a new record. */
  mediaPublicId?: string | null;
  /** Display position within its usageType — used for gallery ordering. */
  displayOrder?: number;
};

/** Uploads (or, given `mediaPublicId`, replaces in place) a single salon media item
 * the moment it's selected — see useMutateDeleteSalonMedia for the matching eager delete. */
export const useMutateUploadSalonMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: UploadSalonMediaVars) =>
      mediaService.upload(MediaEntityType.Salon, vars.salonPublicId, {
        file: vars.file,
        usageType: vars.usageType,
        isPrimary: vars.isPrimary,
        mediaPublicId: vars.mediaPublicId ?? undefined,
        displayOrder: vars.displayOrder,
      }),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY, variables.salonPublicId],
      });
      queryClient.invalidateQueries({ queryKey: [SALON_BY_ID_QUERY_KEY] });
    },
  });
};

export type DeleteSalonMediaVars = {
  salonPublicId: string;
  /** Every media Guid that should remain after this delete — i.e. all currently
   * known persisted media except the one being removed. */
  keepMediaPublicIds: string[];
};

/** No dedicated single-media delete endpoint exists yet — deleting eagerly means
 * reconciling immediately via save-medias with no new files, keeping everything
 * except the removed item (same reconcile semantics the wizard's final save used). */
export const useMutateDeleteSalonMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: DeleteSalonMediaVars) =>
      salonService.saveMedias(vars.salonPublicId, [], vars.keepMediaPublicIds),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY, variables.salonPublicId],
      });
      queryClient.invalidateQueries({ queryKey: [SALON_BY_ID_QUERY_KEY] });
    },
  });
};
