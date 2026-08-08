import {
  ISalonAvailableSlots,
  ISalonBrowseSlot,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";
import { resolveStaffNumericId } from "@/services/domains/booking/utils/booking-mappers";

export interface IResolvedSlotStaff {
  /** Legacy numeric id when available */
  staffId?: number;
  fullName: string;
  staffPublicId: string;
  /** Staff object when matched from availability list */
  staff?: IStaffAvailability | null;
}

type StaffProfile = {
  id: number;
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

  const publicId =
    slot.staffProfilePublicId ||
    slotsData?.staffProfilePublicId ||
    null;

  if (numericId != null) {
    const fromList = staffList.find(
      (s) =>
        s.staffId === numericId ||
        s.staffMemberId === numericId ||
        (publicId != null && s.staffPublicId === publicId)
    );
    if (fromList) {
      return {
        staffId: numericId,
        fullName: fromList.fullName,
        staffPublicId: fromList.staffPublicId,
        staff: fromList,
      };
    }
    const fromProfile = staffProfiles.find((p) => p.id === numericId);
    const resolvedPublicId = fromProfile?.publicId ?? publicId;
    if (!resolvedPublicId) return null;
    return {
      staffId: numericId,
      fullName: fromProfile
        ? profileDisplayName(fromProfile)
        : "پرسنل اختصاص‌یافته",
      staffPublicId: resolvedPublicId,
      staff: fromList ?? null,
    };
  }

  if (publicId) {
    const fromList = staffList.find((s) => s.staffPublicId === publicId);
    if (fromList) {
      const id = resolveStaffNumericId(fromList, staffProfiles);
      return {
        staffId: id,
        fullName: fromList.fullName,
        staffPublicId: fromList.staffPublicId,
        staff: fromList,
      };
    }

    const fromProfile = staffProfiles.find((p) => p.publicId === publicId);
    if (fromProfile?.publicId) {
      return {
        staffId: fromProfile.id,
        fullName: profileDisplayName(fromProfile),
        staffPublicId: fromProfile.publicId,
        staff: null,
      };
    }

    return {
      fullName: "پرسنل اختصاص‌یافته",
      staffPublicId: publicId,
      staff: null,
    };
  }

  return null;
}
