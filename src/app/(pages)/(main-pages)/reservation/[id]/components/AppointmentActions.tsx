"use client";

import Link from "next/link";
import { ArrowsClockwiseIcon, CalendarPlusIcon, NavigationArrowIcon, PhoneIcon } from "@phosphor-icons/react";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import type { IMyAppointmentDetail } from "@/services/domains/appointments/types/appointments.type";
import { RouteAddress } from "@/shared/data/routeAddress";

/** ICS «20261012T153000Z». */
const icsStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (v: string) => v.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

/** A one-event .ics the phone's calendar app opens («افزودن به تقویم»). */
function downloadIcs(a: IMyAppointmentDetail) {
  const services = (a.services ?? []).map((s) => s.name).filter(Boolean).join("، ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Saffa//Appointment//FA",
    "BEGIN:VEVENT",
    `UID:${a.id}@saffa.ir`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(a.startTime)}`,
    `DTEND:${icsStamp(a.endTime)}`,
    `SUMMARY:${icsText(`نوبت ${a.salonName || "سالن"}`)}`,
    services ? `DESCRIPTION:${icsText(services)}` : null,
    a.branchAddress ? `LOCATION:${icsText(a.branchAddress)}` : null,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(`یک ساعت تا نوبت ${a.salonName || ""}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "saffa-appointment.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** iOS → Apple Maps; elsewhere a geo: link the phone hands to its map app (نشان، بلد، گوگل…). */
function mapsHref(lat: number, lng: number, label: string) {
  const ios = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return ios
    ? `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(label)}`
    : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
}

const actionClass =
  "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-[16px] bg-surface px-2 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-hover";

/**
 * Quick actions on a customer appointment. «افزودن به تقویم» works from the appointment alone;
 * call / directions / rebook appear once the details response carries the salon's public id,
 * phone and the branch's coordinates.
 */
export default function AppointmentActions({ appointment }: { appointment: IMyAppointmentDetail }) {
  const status = Number(appointment.status);
  const upcoming =
    (status === AppointmentStatus.Scheduled || status === AppointmentStatus.CheckedIn) &&
    new Date(appointment.endTime).getTime() > Date.now();
  const phone = appointment.branchPhone || appointment.salonPhone;
  const hasMap = appointment.branchLatitude != null && appointment.branchLongitude != null;
  const rebookHref = appointment.salonPublicId
    ? `${RouteAddress.SALONS.BOOK(appointment.salonPublicId)}?${new URLSearchParams({
        service: (appointment.services ?? []).map((s) => s.offeringPublicId).filter(Boolean).join(","),
      })}`
    : null;

  const buttons = [
    upcoming ? (
      <button key="cal" type="button" onClick={() => downloadIcs(appointment)} className={actionClass}>
        <CalendarPlusIcon size={22} className="text-primary" />
        افزودن به تقویم
      </button>
    ) : null,
    upcoming && hasMap ? (
      <a
        key="map"
        href={mapsHref(appointment.branchLatitude!, appointment.branchLongitude!, appointment.salonName || "سالن")}
        className={actionClass}
      >
        <NavigationArrowIcon size={22} className="text-primary" />
        مسیریابی
      </a>
    ) : null,
    upcoming && phone ? (
      <a key="call" href={`tel:${phone}`} className={actionClass}>
        <PhoneIcon size={22} className="text-primary" />
        تماس با سالن
      </a>
    ) : null,
    !upcoming && rebookHref ? (
      <Link key="again" href={rebookHref} className={actionClass}>
        <ArrowsClockwiseIcon size={22} className="text-primary" />
        رزرو دوباره
      </Link>
    ) : null,
  ].filter(Boolean);

  if (!buttons.length) return null;
  return <div className="flex gap-2">{buttons}</div>;
}
