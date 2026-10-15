import { AppointmentStatus } from "@/services/common/enums/domain-enums";

/**
 * Cancelled and no-show appointments keep only their final service version. A row saved before the
 * backend stamped service lines has none to show — it is still a real appointment and must stay
 * visible, but its price and duration are unknown, never «0 تومان».
 */
export function isFinalStatus(status: number): boolean {
  return status === AppointmentStatus.Cancelled || status === AppointmentStatus.NoShow;
}

export function hasNoServices(services: readonly unknown[] | null | undefined): boolean {
  return !services || services.length === 0;
}

/** True when the service list is empty on a cancelled / no-show appointment (older data). */
export function hasUnknownServices(status: number, services: readonly unknown[] | null | undefined): boolean {
  return isFinalStatus(status) && hasNoServices(services);
}

/** Row label for an appointment with no service lines. */
export function emptyServicesLabel(status: number): string {
  return isFinalStatus(status) ? "خدمات این نوبت نامشخص است" : "بدون خدمت";
}

/** Totals (price, duration) are shown only when they can be trusted; the backend stays the source of the numbers. */
export function canShowAppointmentTotals(status: number, services: readonly unknown[] | null | undefined): boolean {
  return !hasUnknownServices(status, services);
}
