import {
  ISalonAvailableSlots,
  ISalonBrowseSlot,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";

export interface IResolvedSlotStaff {
  fullName: string;
  staffPublicId: string;
  /** Staff object when matched from availability list */
  staff?: IStaffAvailability | null;
}

type StaffProfile = {
  id?: number;
  staffPublicId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  publicId?: string | null;
};

function profileDisplayName(p: StaffProfile): string {
  return (
    p.fullName ||
    [p.firstName, p.lastName].filter(Boolean).join(" ") ||
    "پرسنل"
  );
}

function profilePublicId(p: StaffProfile): string | null {
  return p.staffPublicId || p.publicId || null;
}

/**
 * Resolve staffPublicId + display name from salon browse slots response
 * (response-level or per-slot assignment), used especially for «اولین زمان آزاد».
 */
export function resolveStaffFromSlotResponse(params: {
  slot: ISalonBrowseSlot;
  slotsData?: ISalonAvailableSlots | null;
  staffList: IStaffAvailability[];
  staffProfiles: StaffProfile[];
}): IResolvedSlotStaff | null {
  const { slot, slotsData, staffList, staffProfiles } = params;

  const publicId =
    slot.staffProfilePublicId || slotsData?.staffProfilePublicId || null;

  if (publicId) {
    const fromList = staffList.find((s) => s.staffPublicId === publicId);
    if (fromList) {
      return {
        fullName: fromList.fullName,
        staffPublicId: fromList.staffPublicId,
        staff: fromList,
      };
    }

    const fromProfile = staffProfiles.find(
      (p) => profilePublicId(p) === publicId
    );
    if (fromProfile) {
      return {
        fullName: profileDisplayName(fromProfile),
        staffPublicId: profilePublicId(fromProfile)!,
        staff: null,
      };
    }

    return {
      fullName: "پرسنل اختصاص‌یافته",
      staffPublicId: publicId,
      staff: null,
    };
  }

  const numericId =
    (typeof slot.staffId === "number" && slot.staffId > 0
      ? slot.staffId
      : null) ??
    (typeof slot.staffProfileId === "number" && slot.staffProfileId > 0
      ? slot.staffProfileId
      : null) ??
    (typeof slotsData?.staffId === "number" && slotsData.staffId > 0
      ? slotsData.staffId
      : null) ??
    (typeof slotsData?.staffProfileId === "number" &&
    slotsData.staffProfileId > 0
      ? slotsData.staffProfileId
      : null);

  if (numericId != null) {
    const fromList = staffList.find(
      (s) => s.staffId === numericId || s.staffMemberId === numericId
    );
    if (fromList?.staffPublicId) {
      return {
        fullName: fromList.fullName,
        staffPublicId: fromList.staffPublicId,
        staff: fromList,
      };
    }
    const fromProfile = staffProfiles.find((p) => p.id === numericId);
    const resolvedPublicId = fromProfile ? profilePublicId(fromProfile) : null;
    if (resolvedPublicId) {
      return {
        fullName: fromProfile
          ? profileDisplayName(fromProfile)
          : "پرسنل اختصاص‌یافته",
        staffPublicId: resolvedPublicId,
        staff: fromList ?? null,
      };
    }
  }

  return null;
}
