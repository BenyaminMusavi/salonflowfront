import { IBranchService } from "@/services/domains/salons/types/booking-browse.type";
import { ISalonOffering } from "@/services/domains/salon-offering/types/salon-offering-type";
import { IStaffAvailability } from "@/services/domains/salons/types/booking-browse.type";

/** Enrich branch services with offeringId/serviceTypeId from salon offerings catalog. */
export function enrichBranchServices(
  services: IBranchService[],
  offerings: ISalonOffering[]
): IBranchService[] {
  return services.map((svc) => {
    if (svc.offeringId && svc.serviceTypeId) return svc;

    const byName = offerings.find(
      (o) =>
        o.serviceName?.trim() === svc.name?.trim() ||
        (svc.serviceTypeId != null && o.serviceTypeId === svc.serviceTypeId)
    );

    return {
      ...svc,
      offeringId: svc.offeringId ?? byName?.id ?? null,
      serviceTypeId: svc.serviceTypeId ?? byName?.serviceTypeId ?? null,
    };
  });
}

export function resolveStaffNumericId(
  staff: IStaffAvailability,
  staffProfiles: Array<{
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    publicId?: string | null;
  }>
): number | undefined {
  if (typeof staff.staffId === "number") return staff.staffId;
  if (typeof staff.staffMemberId === "number") return staff.staffMemberId;

  const byPublic = staffProfiles.find(
    (p) => p.publicId && p.publicId === staff.staffPublicId
  );
  if (byPublic) return byPublic.id;

  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
  const target = normalize(staff.fullName);

  const byName = staffProfiles.find((p) => {
    const full =
      p.fullName ||
      [p.firstName, p.lastName].filter(Boolean).join(" ");
    return normalize(full) === target;
  });

  return byName?.id;
}

export function toBookingStartTime(date: string, time: string): string {
  const normalized =
    time.length === 5 ? `${time}:00` : time.length === 8 ? time : `${time}:00`;
  return `${date}T${normalized}`;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "خطایی رخ داده است"
): string {
  const data = (error as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;
  if (!data) return fallback;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  const errors = data.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0] as { message?: string };
    if (first?.message) return first.message;
  }

  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    const values = Object.values(errors as Record<string, unknown>);
    const first = values[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    if (typeof first === "string") return first;
  }

  const type = data.type;
  if (type === "authorization_error") {
    return "برای رزرو باید وارد حساب مشتری شوید.";
  }
  if (type === "authentication_error") {
    return "نشست شما منقضی شده است. دوباره وارد شوید.";
  }

  return fallback;
}
