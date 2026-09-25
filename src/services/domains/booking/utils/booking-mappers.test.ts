import { describe, expect, it } from "vitest";
import { toBookingStartTime } from "./booking-mappers";
import { utcToSalonTime } from "@/shared/utils/salonTime";

// Regression coverage for a booking-create bug: the backend's POST /api/booking/create and
// POST /api/appointments/quick-book require startTime as a UTC ISO instant (see
// the backend's OpenAPI snapshot, D:\SourceSalon\docs\openapi\v1.json). toBookingStartTime
// used to just concatenate `${date}T${time}` with no timezone info; System.Text.Json parses
// that as an unspecified-kind DateTime which the backend's TimeZoneDayRange.ToLocal then
// treats AS IF it were already UTC, converting it to Asia/Tehran local by adding +03:30 —
// so picking local "10:00" silently checked availability against local "13:30" instead,
// surfacing as a bogus "Time slot is not available" (or worse, booking the wrong real time).
//
// The wall-clock is the salon's (Asia/Tehran, UTC+03:30), never the device's — these
// expectations hold whatever timezone the test runner (or a customer's phone) is in.
describe("toBookingStartTime", () => {
  it("converts a salon-local (Tehran) date+time into the matching UTC ISO instant", () => {
    expect(toBookingStartTime("2026-09-07", "10:00:00")).toBe("2026-09-07T06:30:00.000Z");
  });

  it("accepts a short HH:mm time and defaults seconds to 00", () => {
    expect(toBookingStartTime("2026-09-07", "14:30")).toBe("2026-09-07T11:00:00.000Z");
  });

  it("rolls back to the previous UTC day for early-morning salon times", () => {
    expect(toBookingStartTime("2026-09-07", "02:00")).toBe("2026-09-06T22:30:00.000Z");
  });
});

describe("utcToSalonTime", () => {
  it("shows a UTC slot instant in Tehran time regardless of the device timezone", () => {
    expect(utcToSalonTime("2026-09-27T06:30:00Z")).toBe("10:00:00");
    expect(utcToSalonTime("2026-09-27T20:45:00Z")).toBe("00:15:00");
  });

  it("round-trips with toBookingStartTime", () => {
    expect(utcToSalonTime(toBookingStartTime("2026-09-27", "17:15"))).toBe("17:15:00");
  });
});
