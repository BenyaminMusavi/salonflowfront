import type { ISalon, ISalonGalleryItem } from "@/services/domains/salons/types/salon.type";
import { GenderType } from "@/services/common/enums/domain-enums";
import type { BasicInfoValues } from "../components/sections/BasicInfoSection";
import type { ContactSocialValues } from "../components/sections/ContactSocialSection";
import {
  createEmptyBranch,
  type BranchEditorValues,
} from "../components/sections/BranchEditorItem";
import {
  createEmptyMediaSlot,
  createGalleryClientKey,
  type GalleryMediaItem,
  type MediaSlotState,
} from "../components/sections/MediaSection";

function parseGenderType(value: number | string | null | undefined): GenderType {
  const n = Number(value);
  if (n === GenderType.Male || n === GenderType.Female || n === GenderType.Mixed) {
    return n;
  }
  return GenderType.Mixed;
}

function galleryUrl(item: string | ISalonGalleryItem): string | null {
  if (typeof item === "string") return item || null;
  return item.url || item.imageUrl || null;
}

function galleryPublicId(item: string | ISalonGalleryItem): string | null {
  if (typeof item === "string") return null;
  return item.publicId || null;
}

export function mapSalonToBasicInfo(salon: ISalon): BasicInfoValues {
  return {
    name: salon.name ?? "",
    description: salon.description ?? "",
  };
}

export function mapSalonToContactInfo(salon: ISalon): ContactSocialValues {
  return {
    instagramHandle: salon.instagramHandle ?? "",
    whatsappNumber: salon.whatsappNumber ?? "",
    websiteUrl: salon.websiteUrl ?? "",
  };
}

export function mapSalonToCover(salon: ISalon): MediaSlotState {
  return {
    ...createEmptyMediaSlot(),
    url: salon.coverImageUrl ?? null,
  };
}

export function mapSalonToBanner(salon: ISalon): MediaSlotState {
  return {
    ...createEmptyMediaSlot(),
    url: salon.bannerImageUrl ?? null,
  };
}

/** MediaUsageType.Profile — surfaced in the UI as the salon's "logo". */
export function mapSalonToLogo(salon: ISalon): MediaSlotState {
  return {
    ...createEmptyMediaSlot(),
    url: salon.imageUrl ?? null,
  };
}

export function mapSalonToGallery(salon: ISalon): GalleryMediaItem[] {
  const items = salon.gallery ?? [];
  return items
    .map((item) => {
      const url = galleryUrl(item);
      const publicId = galleryPublicId(item);
      if (!url && !publicId) return null;
      return {
        ...createEmptyMediaSlot(),
        clientKey: createGalleryClientKey(),
        url,
        publicId,
      } satisfies GalleryMediaItem;
    })
    .filter((item): item is GalleryMediaItem => item != null);
}

export function mapSalonToBranches(salon: ISalon): BranchEditorValues[] {
  const branches = salon.branches ?? [];
  if (branches.length === 0) return [createEmptyBranch()];

  return branches.map((branch) => ({
    ...createEmptyBranch(),
    publicId: branch.publicId ?? null,
    name: branch.name ?? "",
    city: branch.city ?? "",
    address: branch.address ?? "",
    phone: branch.phone ?? "",
    genderType: parseGenderType(branch.genderType),
  }));
}
