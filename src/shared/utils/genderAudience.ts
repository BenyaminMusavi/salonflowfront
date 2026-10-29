import { GenderType } from "@/services/common/enums/domain-enums";

/**
 * Who a salon (or a single branch) serves, from the real `SalonBranch.GenderType` the API sends
 * (`genderAudience` on cards, `genderType` on map pins): 1 men, 2 women, 3 mixed. There is no stored
 * user preference — the user's own gender is never used to pick or pre-fill this. Anything else
 * (missing, legacy) is «unknown»: shown neutrally, never guessed.
 *
 * Colour is never the only cue: each audience also has its own icon and marker shape, so the same
 * meta can drive list badges now and map markers / legend later.
 */
export type TGenderAudienceKey = "female" | "male" | "mixed" | "unknown";

export interface IGenderAudienceMeta {
  key: TGenderAudienceKey;
  label: string;
  /** Marker outline for the map: women circle, men rounded square, mixed diamond, unknown ring. */
  markerShape: "circle" | "square" | "diamond" | "ring";
}

const META: Record<TGenderAudienceKey, IGenderAudienceMeta> = {
  female: { key: "female", label: "بانوان", markerShape: "circle" },
  male: { key: "male", label: "آقایان", markerShape: "square" },
  mixed: { key: "mixed", label: "بانوان و آقایان", markerShape: "diamond" },
  unknown: { key: "unknown", label: "مخاطب نامشخص", markerShape: "ring" },
};

export function getGenderAudience(value: number | null | undefined): IGenderAudienceMeta {
  if (value === GenderType.Female) return META.female;
  if (value === GenderType.Male) return META.male;
  if (value === GenderType.Mixed) return META.mixed;
  return META.unknown;
}

/** Legend order shown to users. */
export const GENDER_AUDIENCE_LEGEND: IGenderAudienceMeta[] = [META.female, META.male, META.mixed, META.unknown];
