import { describe, expect, it } from "vitest";
import {
  addDaysYmd,
  formatSalonTime,
  salonClockParts,
  salonTodayYmd,
  salonWeekday,
  utcToSalonYmd,
  ymdToDate,
  formatSalonDate,
} from "./salonTime";

// Every expectation is in Tehran time (UTC+03:30) and must hold whatever timezone the runner —
// or a customer's phone — is in (run with TZ=America/New_York / Asia/Tokyo to check).
describe("salon (Tehran) calendar helpers", () => {
  it("puts a late-evening UTC instant on the next Tehran day", () => {
    // 21:00Z on the 26th is 00:30 on the 27th in Tehran.
    expect(utcToSalonYmd("2026-09-26T21:00:00Z")).toBe("2026-09-27");
    expect(salonTodayYmd(new Date("2026-09-26T21:00:00Z"))).toBe("2026-09-27");
  });

  it("keeps an early UTC instant on the same Tehran day", () => {
    expect(utcToSalonYmd("2026-09-26T19:00:00Z")).toBe("2026-09-26");
  });

  it("adds days across month boundaries without timezone drift", () => {
    expect(addDaysYmd("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDaysYmd("2026-10-01", -29)).toBe("2026-09-02");
  });

  it("reads the salon clock and weekday of an instant", () => {
    expect(salonClockParts("2026-09-27T06:30:00Z")).toEqual({ hours: 10, minutes: 0 });
    // 2026-09-27 is a Sunday; 21:00Z Saturday is already Sunday 00:30 in Tehran.
    expect(salonWeekday(new Date("2026-09-26T21:00:00Z"))).toBe(0);
  });

  it("formats instants and calendar days in Tehran time with Latin digits", () => {
    expect(formatSalonTime("2026-09-27T06:30:00Z", { hour: "2-digit", minute: "2-digit" })).toBe(
      "10:00"
    );
    // A date-only value renders as the same Jalali day everywhere (5 مهر 1405 = 2026-09-27).
    expect(formatSalonDate(ymdToDate("2026-09-27"), { day: "numeric" })).toBe("5");
  });
});
