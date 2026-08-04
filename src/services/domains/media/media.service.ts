import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  MediaEntityType,
  MediaType,
} from "@/services/common/enums/domain-enums";
import {
  IMediaUploadRequest,
  TMediaUploadEntity,
} from "./types/media.type";

class MediaService {
  async upload(
    entityType: MediaEntityType,
    entityPublicId: string,
    body: IMediaUploadRequest
  ) {
    const form = new FormData();
    form.append("file", body.file);
    form.append("mediaType", String(body.mediaType ?? MediaType.Image));
    form.append("usageType", String(body.usageType));
    form.append("isPrimary", String(body.isPrimary ?? false));
    if (body.mediaPublicId) {
      form.append("mediaPublicId", body.mediaPublicId);
    }

    return await axiosInstance.post<unknown, TMediaUploadEntity>(
      API_ADDRESS.MEDIA.UPLOAD(entityType, entityPublicId),
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  }
}

const mediaService = new MediaService();
export default mediaService;
