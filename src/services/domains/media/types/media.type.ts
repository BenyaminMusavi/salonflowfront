import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import {
  MediaType,
  MediaUsageType,
} from "@/services/common/enums/domain-enums";

export interface IMediaUploadRequest {
  file: File;
  mediaType?: MediaType;
  usageType: MediaUsageType;
  isPrimary?: boolean;
  mediaPublicId?: string | null;
}

export interface IMediaUploadResult {
  publicId?: string | null;
  url?: string | null;
  imageUrl?: string | null;
}

export type TMediaUploadEntity = TResponse<IMediaUploadResult>;
