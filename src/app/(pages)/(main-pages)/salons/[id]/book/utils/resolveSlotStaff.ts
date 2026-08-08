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

function slotStaffPublicId(
  slot: ISalonBrowseSlot,
  slotsData?: ISalonAvailableSlots | null
): string | null {
  return (
    slot.staffPublicId ||
    slot.staffProfilePublicId ||
    slotsData?.staffPublicId ||
    slotsData?.staffProfilePublicId ||
    null
  );
}

/**
 * Resolve staffPublicId from slot / slots response for «اولین زمان آزاد».
 * Does not resolve numeric staff ids — create payload needs Guid only.
 */
export function resolveStaffFromSlotResponse(params: {
  slot: ISalonBrowseSlot;
  slotsData?: ISalonAvailableSlots | null;
  staffList: IStaffAvailability[];
  staffProfiles: StaffProfile[];
}): IResolvedSlotStaff | null {
  const { slot, slotsData, staffList, staffProfiles } = params;

  const publicId = slotStaffPublicId(slot, slotsData);
  if (!publicId) return null;

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
