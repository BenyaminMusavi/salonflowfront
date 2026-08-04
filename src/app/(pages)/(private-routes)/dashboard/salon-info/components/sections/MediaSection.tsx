"use client";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import { UploadFile } from "@/shared/components/composites/upload-file";

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

function applyFileToSlot(slot: MediaSlotState, file: File): MediaSlotState {
  revokePreview(slot.previewUrl);
  return {
    ...slot,
    file,
    fileName: file.name,
    previewUrl: URL.createObjectURL(file),
  };
}

function clearSlotFile(slot: MediaSlotState): MediaSlotState {
  revokePreview(slot.previewUrl);
  return {
    ...slot,
    file: null,
    fileName: null,
    previewUrl: null,
  };
}

interface MediaSectionProps {
  cover: MediaSlotState;
  profile: MediaSlotState;
  gallery: GalleryMediaItem[];
  onCoverChange: (cover: MediaSlotState) => void;
  onProfileChange: (profile: MediaSlotState) => void;
  onGalleryChange: (gallery: GalleryMediaItem[]) => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export default function MediaSection({
  cover,
  profile,
  gallery,
  onCoverChange,
  onProfileChange,
  onGalleryChange,
  onSave,
  isSaving,
  canSave,
}: MediaSectionProps) {
  const removeGalleryItem = (clientKey: string) => {
    const target = gallery.find((g) => g.clientKey === clientKey);
    if (target) revokePreview(target.previewUrl);
    onGalleryChange(gallery.filter((g) => g.clientKey !== clientKey));
  };

  return (
    <section
      id="salon-media"
      className="scroll-mt-14 rounded-lg bg-surface-secondary p-3"
    >
      <h2 className="mb-3 text-sm font-bold text-foreground">رسانه</h2>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UploadFile
            title="کاور"
            description="تصویر کاور صفحه سالن"
            buttonText="انتخاب کاور"
            accept="image/*"
            disabled={isSaving}
            uploadedUrl={cover.previewUrl || cover.url || undefined}
            uploadedFileName={cover.fileName || (cover.url ? "کاور فعلی" : undefined)}
            onUpload={async (file) => {
              onCoverChange(applyFileToSlot(cover, file));
            }}
            onDelete={() => {
              onCoverChange({
                ...clearSlotFile(cover),
                publicId: null,
                url: null,
              });
            }}
          />
          <UploadFile
            title="لوگو / پروفایل"
            description="لوگوی سالن"
            buttonText="انتخاب لوگو"
            accept="image/*"
            disabled={isSaving}
            uploadedUrl={profile.previewUrl || profile.url || undefined}
            uploadedFileName={
              profile.fileName || (profile.url ? "لوگوی فعلی" : undefined)
            }
            onUpload={async (file) => {
              onProfileChange(applyFileToSlot(profile, file));
            }}
            onDelete={() => {
              onProfileChange({
                ...clearSlotFile(profile),
                publicId: null,
                url: null,
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground">گالری</p>
          {gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {gallery.map((item) => {
                const src = item.previewUrl || item.url;
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
                      disabled={isSaving}
                      onClick={() => removeGalleryItem(item.clientKey)}
                      className="absolute top-1 left-1 flex h-7 w-7 items-center justify-center rounded-full bg-background/90"
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
            disabled={isSaving}
            hint="می‌توانید چند تصویر به‌صورت جداگانه اضافه کنید."
            onUpload={async (file) => {
              const next: GalleryMediaItem = {
                ...applyFileToSlot(createEmptyMediaSlot(), file),
                clientKey: createGalleryClientKey(),
              };
              onGalleryChange([...gallery, next]);
            }}
          />
          {gallery.length === 0 && (
            <p className="flex items-center gap-1 text-xs text-foreground-muted">
              <PlusIcon size={12} />
              هنوز تصویری در گالری نیست.
            </p>
          )}
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={onSave}
          disabled={!canSave || isSaving}
          isLoading={isSaving}
        >
          ذخیره رسانه
        </Button>
      </div>
    </section>
  );
}
