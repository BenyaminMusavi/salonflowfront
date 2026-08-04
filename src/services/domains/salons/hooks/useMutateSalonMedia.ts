import { useMutation, useQueryClient } from "@tanstack/react-query";
import mediaService from "@/services/domains/media/media.service";
import salonService from "../salon.service";
import {
  MediaEntityType,
  MediaUsageType,
} from "@/services/common/enums/domain-enums";
import { SALON_BY_ID_QUERY_KEY } from "./useQuerySalonById";

export type SaveSalonMediaVars = {
  salonPublicId: string;
  coverFile?: File | null;
  profileFile?: File | null;
  galleryFiles: File[];
  /** Existing media Guids the user kept (not deleted). */
  keepMediaPublicIds: string[];
};

function readUploadedPublicId(res: unknown): string | null {
  const data = (res as { data?: { publicId?: string | null } } | undefined)
    ?.data;
  return data?.publicId ?? null;
}

export const useMutateSalonMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: SaveSalonMediaVars) => {
      const uploadedPublicIds: string[] = [];

      const uploadOne = async (
        file: File,
        usageType: MediaUsageType,
        isPrimary: boolean
      ) => {
        const res = await mediaService.upload(
          MediaEntityType.Salon,
          vars.salonPublicId,
          { file, usageType, isPrimary }
        );
        const publicId = readUploadedPublicId(res);
        if (publicId) uploadedPublicIds.push(publicId);
      };

      if (vars.coverFile) {
        await uploadOne(vars.coverFile, MediaUsageType.Cover, true);
      }
      if (vars.profileFile) {
        await uploadOne(vars.profileFile, MediaUsageType.Profile, true);
      }
      for (const file of vars.galleryFiles) {
        await uploadOne(file, MediaUsageType.Gallery, false);
      }

      const keepMediaPublicIds = Array.from(
        new Set([...vars.keepMediaPublicIds, ...uploadedPublicIds])
      );

      // Reconcile kept set (handles deletions). New files already uploaded via Media/upload.
      // Fallback: if typed upload path produced no new publicIds but files remain, send via save-medias.
      const fallbackFiles =
        uploadedPublicIds.length === 0
          ? [
              ...(vars.coverFile ? [vars.coverFile] : []),
              ...(vars.profileFile ? [vars.profileFile] : []),
              ...vars.galleryFiles,
            ]
          : [];

      await salonService.saveMedias(
        vars.salonPublicId,
        fallbackFiles,
        keepMediaPublicIds
      );

      return { keepMediaPublicIds, uploadedPublicIds };
    },
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY, variables.salonPublicId],
      });
      queryClient.invalidateQueries({
        queryKey: [SALON_BY_ID_QUERY_KEY],
      });
    },
  });
};
