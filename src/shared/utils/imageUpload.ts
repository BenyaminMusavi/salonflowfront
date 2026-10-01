/**
 * Backend media rules: images only (video/PDF are rejected), at most 16 MB per file.
 * Check on the client so the user gets a clear message before the upload starts.
 */
export const IMAGE_UPLOAD_MAX_MB = 16;
export const IMAGE_UPLOAD_ACCEPT = "image/*";
/** Salon gallery holds at most this many images. */
export const SALON_GALLERY_LIMIT = 5;

/** Returns a Persian error message, or null when the file can be uploaded. */
export function validateImageUpload(file: File): string | null {
  if (!file.type.startsWith("image/")) return "فقط فایل تصویری مجاز است.";
  if (file.size > IMAGE_UPLOAD_MAX_MB * 1024 * 1024) {
    return `حجم تصویر حداکثر ${IMAGE_UPLOAD_MAX_MB} مگابایت است.`;
  }
  return null;
}
