import { TResponse } from "@/services/common/data-types/SharedDataTypes";

/** 1 پذیرایی، 2 رفاهی، 3 امکانات و دسترسی (همان AmenityCategory بک‌اند). */
export enum AmenityCategory {
  Refreshments = 1,
  Comfort = 2,
  Access = 3,
}

export const AMENITY_CATEGORY_LABELS: Record<AmenityCategory, string> = {
  [AmenityCategory.Refreshments]: "امکانات پذیرایی",
  [AmenityCategory.Comfort]: "امکانات رفاهی",
  [AmenityCategory.Access]: "امکانات و دسترسی",
};

/** One amenity of the public catalog (GET /api/amenities). `key` is stable and is what branches and the search filter send. */
export interface IAmenity {
  key: string;
  title: string;
  category: AmenityCategory;
  /** Shown on the salon card when the branch has it. */
  showOnCard: boolean;
}

/** An amenity a branch has (salon detail branches[].amenities, card amenities). */
export interface IBranchAmenity {
  key: string;
  title: string;
  category: AmenityCategory;
}

export type TAmenitiesEntity = TResponse<IAmenity[]>;
