import { describe, expect, it } from "vitest";
import { toBookingStartTime } from "./booking-mappers";

// Regression coverage for a booking-create bug: the backend's POST /api/booking/create and
// POST /api/appointments/quick-book require startTime as a UTC ISO instant (see
// docs/FRONTEND_INTEGRATION_GUIDE.md — "startTime | datetime | UTC/ISO"). toBookingStartTime
// used to just concatenate `${date}T${time}` with no timezone info; System.Text.Json parses
// that as an unspecified-kind DateTime which the backend's TimeZoneDayRange.ToLocal then
// treats AS IF it were already UTC, converting it to Asia/Tehran local by adding +03:30 —
// so picking local "10:00" silently checked availability against local "13:30" instead,
// surfacing as a bogus "Time slot is not available" (or worse, booking the wrong real time).
describe("toBookingStartTime", () => {
  it("converts a local wall-clock date+time into a real UTC ISO instant (not a bare local string)", () => {
    const result = toBookingStartTime("2026-09-07", "10:00:00");

    expect(result.endsWith("Z")).toBe(true);
    // Round-tripping back through Date must reproduce the same local wall-clock time that
    // was passed in — this is what actually matters, independent of the runner's own TZ.
    const roundTripped = new Date(result);
    expect(roundTripped.getFullYear()).toBe(2026);
    expect(roundTripped.getMonth()).toBe(8); // 0-indexed: September
    expect(roundTripped.getDate()).toBe(7);
    expect(roundTripped.getHours()).toBe(10);
    expect(roundTripped.getMinutes()).toBe(0);
    expect(roundTripped.getSeconds()).toBe(0);
  });

  it("accepts a short HH:mm time and defaults seconds to 00", () => {
    const result = toBookingStartTime("2026-09-07", "14:30");
    const roundTripped = new Date(result);

    expect(roundTripped.getHours()).toBe(14);
    expect(roundTripped.getMinutes()).toBe(30);
    expect(roundTripped.getSeconds()).toBe(0);
  });
});
