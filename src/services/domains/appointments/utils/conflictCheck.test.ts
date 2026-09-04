import { describe, it, expect } from "vitest";
import { findConflictingAppointment } from "./conflictCheck";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { ISalonAppointmentItem } from "../types/appointments.type";

function appt(
  id: number,
  startTime: string,
  endTime: string
): ISalonAppointmentItem {
  return {
    numericId: id,
    startTime,
    endTime,
    status: AppointmentStatus.Scheduled,
    salonName: "Test Salon",
  };
}

describe("findConflictingAppointment", () => {
  it("returns null when the staff member has no appointments that day", () => {
    expect(
      findConflictingAppointment([], "2026-08-30T10:00:00.000Z", 30)
    ).toBeNull();
  });

  it("returns null when the candidate slot ends exactly when an existing one starts", () => {
    // Half-open interval: [10:30, 11:00) does not overlap [10:00, 10:30).
    const existing = [appt(1, "2026-08-30T10:30:00.000Z", "2026-08-30T11:00:00.000Z")];
    expect(
      findConflictingAppointment(existing, "2026-08-30T10:00:00.000Z", 30)
    ).toBeNull();
  });

  it("returns null when the candidate slot starts exactly when an existing one ends", () => {
    const existing = [appt(1, "2026-08-30T10:00:00.000Z", "2026-08-30T10:30:00.000Z")];
    expect(
      findConflictingAppointment(existing, "2026-08-30T10:30:00.000Z", 30)
    ).toBeNull();
  });

  it("flags a conflict when the candidate overlaps the start of an existing appointment", () => {
    const existing = [appt(1, "2026-08-30T10:15:00.000Z", "2026-08-30T11:00:00.000Z")];
    const result = findConflictingAppointment(
      existing,
      "2026-08-30T10:00:00.000Z",
      30 // 10:00–10:30, overlaps 10:15–11:00
    );
    expect(result?.numericId).toBe(1);
  });

  it("flags a conflict when the candidate is fully contained inside an existing appointment", () => {
    const existing = [appt(1, "2026-08-30T09:00:00.000Z", "2026-08-30T12:00:00.000Z")];
    const result = findConflictingAppointment(existing, "2026-08-30T10:00:00.000Z", 15);
    expect(result?.numericId).toBe(1);
  });

  it("flags a conflict when the candidate fully contains an existing appointment", () => {
    const existing = [appt(1, "2026-08-30T10:00:00.000Z", "2026-08-30T10:15:00.000Z")];
    const result = findConflictingAppointment(existing, "2026-08-30T09:00:00.000Z", 180);
    expect(result?.numericId).toBe(1);
  });

  it("returns the first conflicting appointment when several exist that day", () => {
    const existing = [
      appt(1, "2026-08-30T08:00:00.000Z", "2026-08-30T08:30:00.000Z"),
      appt(2, "2026-08-30T10:00:00.000Z", "2026-08-30T10:30:00.000Z"),
      appt(3, "2026-08-30T10:15:00.000Z", "2026-08-30T10:45:00.000Z"),
    ];
    const result = findConflictingAppointment(existing, "2026-08-30T10:10:00.000Z", 10);
    expect(result?.numericId).toBe(2);
  });

  it("treats a non-positive duration as 'nothing to book' rather than throwing", () => {
    const existing = [appt(1, "2026-08-30T10:00:00.000Z", "2026-08-30T10:30:00.000Z")];
    expect(findConflictingAppointment(existing, "2026-08-30T10:00:00.000Z", 0)).toBeNull();
    expect(findConflictingAppointment(existing, "2026-08-30T10:00:00.000Z", -15)).toBeNull();
  });

  it("returns null instead of throwing when the candidate start time is unparseable", () => {
    const existing = [appt(1, "2026-08-30T10:00:00.000Z", "2026-08-30T10:30:00.000Z")];
    expect(findConflictingAppointment(existing, "not-a-date", 30)).toBeNull();
  });

  it("skips appointments with unparseable stored dates instead of crashing the whole check", () => {
    const existing = [
      appt(1, "garbage-start", "garbage-end"),
      appt(2, "2026-08-30T10:00:00.000Z", "2026-08-30T10:30:00.000Z"),
    ];
    const result = findConflictingAppointment(existing, "2026-08-30T10:10:00.000Z", 10);
    expect(result?.numericId).toBe(2);
  });
});
