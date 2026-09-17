"use client";

import * as React from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { UploadFile } from "@/shared/components/composites/upload-file";
import { salonImageSrc } from "@/shared/utils/salonDisplay";
import { MediaUsageType } from "@/services/common/enums/domain-enums";
import {
  useMutateUploadSalonMedia,
  useMutateDeleteSalonMedia,
} from "@/services/domains/salons/hooks";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";

export type MediaSlotState = {
  publicId: string | null;
  url: string | null;
  file: File | null;
  fileName: string | null;
  previewUrl: string | null;
};

export type GalleryMediaItem = MediaSlotState & {
  clientKey: string;
};

export const createEmptyMediaSlot = (): MediaSlotState => ({
  publicId: null,
  url: null,
  file: null,
  fileName: null,
  previewUrl: null,
});

export const createGalleryClientKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `gallery-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function revokePreview(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

interface MediaSectionProps {
  salonPublicId: string;
  cover: MediaSlotState;
  banner: MediaSlotState;
  logo: MediaSlotState;
  gallery: GalleryMediaItem[];
  onCoverChange: (cover: MediaSlotState) => void;
  onBannerChange: (banner: MediaSlotState) => void;
  onLogoChange: (logo: MediaSlotState) => void;
  onGalleryChange: (gallery: GalleryMediaItem[]) => void;
}

export default function MediaSection({
  salonPublicId,
  cover,
  banner,
  logo,
  gallery,
  onCoverChange,
  onBannerChange,
  onLogoChange,
  onGalleryChange,
}: MediaSectionProps) {
  const uploadMedia = useMutateUploadSalonMedia();
  const deleteMedia = useMutateDeleteSalonMedia();
  const [galleryError, setGalleryError] = React.useState<string | null>(null);
  const [deletingGalleryKey, setDeletingGalleryKey] = React.useState<
    string | null
  >(null);

  /** Every persisted media Guid this section currently knows about, except the one
   * being removed — the reconcile keep-list a single eager delete sends.
   * Gap: GET /api/salons/{id} returns cover/banner/logo only as bare URLs, never a
   * publicId (unlike gallery items, which do carry one) — see ISalon in salon.type.ts.
   * So a cover/banner/logo set in an earlier session hydrates with publicId=null, and
   * this list can't include it. Any reconcile call fired while that's true (e.g.
   * deleting a gallery photo, or deleting one of the other two slots) will make the
   * backend drop that not-yet-identifiable image too. Fixing this needs the backend to
   * expose a publicId for cover/banner/logo the way it already does for gallery. */
  const keepIdsExcept = (excludedPublicId: string | null) => {
    const ids = [cover.publicId, banner.publicId, logo.publicId, ...gallery.map((g) => g.publicId)]
      .filter((id): id is string => !!id && id !== excludedPublicId);
    return Array.from(new Set(ids));
  };

  const uploadSlot = async (
    slot: MediaSlotState,
    usageType: MediaUsageType,
    file: File
  ) => {
    try {
      const res = await uploadMedia.mutateAsync({
        salonPublicId,
        file,
        usageType,
        isPrimary: true,
        mediaPublicId: slot.publicId,
      });
      revokePreview(slot.previewUrl);
      return {
        ...slot,
        publicId: res.data?.publicId ?? slot.publicId,
        url: res.data?.url ?? res.data?.imageUrl ?? slot.url,
        file: null,
        fileName: null,
        previewUrl: null,
      } satisfies MediaSlotState;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "آپلود تصویر ناموفق بود."));
    }
  };

  const deleteSlot = async (slot: MediaSlotState) => {
    if (slot.publicId) {
      try {
        await deleteMedia.mutateAsync({
          salonPublicId,
          keepMediaPublicIds: keepIdsExcept(slot.publicId),
        });
      } catch (err) {
        throw new Error(getApiErrorMessage(err, "حذف تصویر ناموفق بود."));
      }
    }
    revokePreview(slot.previewUrl);
    return createEmptyMediaSlot();
  };

  const removeGalleryItem = async (clientKey: string) => {
    const target = gallery.find((g) => g.clientKey === clientKey);
    if (!target || deletingGalleryKey) return;

    setGalleryError(null);
    setDeletingGalleryKey(clientKey);
    try {
      if (target.publicId) {
        await deleteMedia.mutateAsync({
          salonPublicId,
          keepMediaPublicIds: keepIdsExcept(target.publicId),
        });
      }
      revokePreview(target.previewUrl);
      onGalleryChange(gallery.filter((g) => g.clientKey !== clientKey));
    } catch (err) {
      setGalleryError(getApiErrorMessage(err, "حذف تصویر ناموفق بود."));
    } finally {
      setDeletingGalleryKey(null);
    }
  };

  return (
    <section
      id="salon-media"
      className="scroll-mt-24 rounded-[20px] border border-border bg-surface p-4"
    >
      <h2 className="mb-3 text-sm font-bold text-foreground">رسانه</h2>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UploadFile
            title="کاور"
            description="تصویر کارت سالن در صفحه اصلی و جستجو"
            buttonText="انتخاب کاور"
            accept="image/*"
            previewShape="rect"
            uploadedUrl={salonImageSrc(cover.previewUrl || cover.url, "") || undefined}
            uploadedFileName={cover.fileName || (cover.url ? "کاور فعلی" : undefined)}
            onUpload={async (file) => {
              onCoverChange(await uploadSlot(cover, MediaUsageType.Cover, file));
            }}
            onDelete={async () => {
              onCoverChange(await deleteSlot(cover));
            }}
          />
          <UploadFile
            title="بنر"
            description="تصویر شاخص سالن در بالای صفحه جستجو"
            buttonText="انتخاب بنر"
            accept="image/*"
            previewShape="rect"
            uploadedUrl={salonImageSrc(banner.previewUrl || banner.url, "") || undefined}
            uploadedFileName={banner.fileName || (banner.url ? "بنر فعلی" : undefined)}
            onUpload={async (file) => {
              onBannerChange(await uploadSlot(banner, MediaUsageType.Banner, file));
            }}
            onDelete={async () => {
              onBannerChange(await deleteSlot(banner));
            }}
          />
          <UploadFile
            title="لوگو"
            description="نماد سالن، کنار نام آن در صفحه جزئیات"
            buttonText="انتخاب لوگو"
            accept="image/*"
            previewShape="circle"
            uploadedUrl={salonImageSrc(logo.previewUrl || logo.url, "") || undefined}
            uploadedFileName={logo.fileName || (logo.url ? "لوگوی فعلی" : undefined)}
            onUpload={async (file) => {
              onLogoChange(await uploadSlot(logo, MediaUsageType.Profile, file));
            }}
            onDelete={async () => {
              onLogoChange(await deleteSlot(logo));
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground">گالری</p>
          {gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {gallery.map((item) => {
                const src = salonImageSrc(item.previewUrl || item.url, "");
                const isDeleting = deletingGalleryKey === item.clientKey;
                return (
                  <div
                    key={item.clientKey}
                    className="relative aspect-square overflow-hidden rounded-[2px] bg-foreground/5"
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-foreground-muted">
                        تصویر
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => removeGalleryItem(item.clientKey)}
                      className="absolute top-1 left-1 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 disabled:opacity-50"
                      aria-label="حذف تصویر"
                    >
                      <TrashIcon size={14} className="text-error" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <UploadFile
            title="افزودن به گالری"
            buttonText="انتخاب تصویر"
            accept="image/*"
            hint="می‌توانید چند تصویر به‌صورت جداگانه اضافه کنید."
            onUpload={async (file) => {
              try {
                const res = await uploadMedia.mutateAsync({
                  salonPublicId,
                  file,
                  usageType: MediaUsageType.Gallery,
                  isPrimary: false,
                });
                const next: GalleryMediaItem = {
                  ...createEmptyMediaSlot(),
                  clientKey: createGalleryClientKey(),
                  publicId: res.data?.publicId ?? null,
                  url: res.data?.url ?? res.data?.imageUrl ?? null,
                };
                onGalleryChange([...gallery, next]);
              } catch (err) {
                throw new Error(
                  getApiErrorMessage(err, "آپلود تصویر ناموفق بود.")
                );
              }
            }}
          />
          {gallery.length === 0 && (
            <p className="flex items-center gap-1 text-xs text-foreground-muted">
              <PlusIcon size={12} />
              هنوز تصویری در گالری نیست.
            </p>
          )}
          {galleryError && (
            <p className="text-xs text-content-error">{galleryError}</p>
          )}
        </div>
      </div>
    </section>
  );
}
