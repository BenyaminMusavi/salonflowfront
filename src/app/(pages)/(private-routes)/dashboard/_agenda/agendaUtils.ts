import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import type { IAgendaItem } from "@/services/domains/appointments/types/appointments.type";
import { addDaysYmd, salonClockParts, salonWeekday, ymdToDate } from "@/shared/utils/salonTime";

export type AgendaView = "today" | "tomorrow" | "week" | "day";

/** Cancelled and no-show rows are folded away at the bottom of a day. */
export function isInactiveStatus(status: number): boolean {
  return status === AppointmentStatus.Cancelled || status === AppointmentStatus.NoShow;
}

/**
 * Inclusive `from`…`to` for a view. «این هفته» runs from today to Friday (end of the Iranian
 * week); `weekOffset` 1 is the whole next Saturday–Friday.
 */
export function agendaRange(
  view: AgendaView,
  today: string,
  pickedDay: string,
  weekOffset = 0
): { from: string; to: string } {
  if (view === "today") return { from: today, to: today };
  if (view === "tomorrow") {
    const d = addDaysYmd(today, 1);
    return { from: d, to: d };
  }
  if (view === "day") return { from: pickedDay, to: pickedDay };
  // JS weekday: Friday = 5, Saturday = 6.
  const daysToFriday = (5 - salonWeekday(ymdToDate(today)) + 7) % 7;
  const friday = addDaysYmd(today, daysToFriday);
  if (weekOffset <= 0) return { from: today, to: friday };
  const nextSaturday = addDaysYmd(friday, 1 + (weekOffset - 1) * 7);
  return { from: nextSaturday, to: addDaysYmd(nextSaturday, 6) };
}

export type DayPart = "morning" | "afternoon" | "evening";

export const DAY_PART_LABEL: Record<DayPart, string> = {
  morning: "صبح",
  afternoon: "بعدازظهر",
  evening: "عصر",
};

/** Salon-clock part of the day: before 12, 12–17, from 17. */
export function dayPart(iso: string): DayPart {
  const { hours } = salonClockParts(iso);
  if (hours < 12) return "morning";
  if (hours < 17) return "afternoon";
  return "evening";
}

export interface AgendaSummary {
  total: number;
  remaining: number;
  inSalon: number;
  done: number;
  inactive: number;
}

export function summarizeAgenda(items: IAgendaItem[]): AgendaSummary {
  const s: AgendaSummary = { total: 0, remaining: 0, inSalon: 0, done: 0, inactive: 0 };
  for (const item of items) {
    const status = Number(item.status);
    if (isInactiveStatus(status)) {
      s.inactive += 1;
      continue;
    }
    s.total += 1;
    if (status === AppointmentStatus.Scheduled) s.remaining += 1;
    if (status === AppointmentStatus.CheckedIn) s.inSalon += 1;
    if (status === AppointmentStatus.Completed) s.done += 1;
  }
  return s;
}

/** How long a scheduled customer can be past their start before we call them late. */
const LATE_WINDOW_MINUTES = 90;

export type NowState =
  | { kind: "late"; item: IAgendaItem; minutes: number }
  | { kind: "next"; item: IAgendaItem; minutes: number }
  | { kind: "done" };

/**
 * What the «الان» strip shows for today: the most overdue scheduled customer (within 90
 * minutes), else the next scheduled one, else «تمام شد» once something happened today.
 */
export function getNowState(items: IAgendaItem[], now: number): NowState | null {
  const scheduled = items.filter((x) => Number(x.status) === AppointmentStatus.Scheduled);
  const late = scheduled.find((x) => {
    const diff = (now - new Date(x.startTime).getTime()) / 60000;
    return diff >= 1 && diff <= LATE_WINDOW_MINUTES;
  });
  if (late) {
    return {
      kind: "late",
      item: late,
      minutes: Math.round((now - new Date(late.startTime).getTime()) / 60000),
    };
  }
  const next = scheduled.find((x) => new Date(x.startTime).getTime() >= now);
  if (next) {
    return {
      kind: "next",
      item: next,
      minutes: Math.max(0, Math.round((new Date(next.startTime).getTime() - now) / 60000)),
    };
  }
  return items.some((x) => !isInactiveStatus(Number(x.status))) ? { kind: "done" } : null;
}

/** «15 دقیقه» / «2 ساعت و 10 دقیقه» */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} دقیقه`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} ساعت و ${m} دقیقه` : `${h} ساعت`;
}

export function durationMinutes(item: IAgendaItem): number {
  return Math.max(
    0,
    Math.round((new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / 60000)
  );
}

export function serviceNames(item: IAgendaItem): string {
  return item.services.map((s) => s.name).filter(Boolean).join("، ");
}
