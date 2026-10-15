import { describe, expect, it } from "vitest";
import type { IAdminNoShowReview, IAdminNoShowReviewLine } from "../types/admin.type";
import {
  buildRevertNoShowPayload,
  needsExplicitLines,
  parseAppointmentPublicId,
  selectableLines,
} from "./noShowReview";

const line = (id: string, over: Partial<IAdminNoShowReviewLine> = {}): IAdminNoShowReviewLine => ({
  servicePublicId: id,
  startTime: "2026-10-10T10:00:00Z",
  endTime: "2026-10-10T10:30:00Z",
  durationMinutes: 30,
  price: 100_000,
  status: 4,
  reopensAutomatically: false,
  ...over,
});

const review = (over: Partial<IAdminNoShowReview> = {}): IAdminNoShowReview => ({
  appointmentPublicId: "11111111-1111-1111-1111-111111111111",
  salonId: 1,
  status: 4,
  startTime: "2026-10-10T10:00:00Z",
  checkedInBefore: false,
  resolution: "automatic",
  ownerCanUndo: false,
  cancelledLinesOverlap: false,
  lines: [line("a"), line("b")],
  depositPayments: [],
  ...over,
});

describe("parseAppointmentPublicId", () => {
  it("accepts a Guid with stray spaces or braces and lower-cases it", () => {
    expect(parseAppointmentPublicId(" {AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE} ")).toBe(
      "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    );
  });

  it("rejects anything that is not a Guid (a numeric id, empty text, a path)", () => {
    expect(parseAppointmentPublicId("123")).toBeNull();
    expect(parseAppointmentPublicId("")).toBeNull();
    expect(parseAppointmentPublicId("api/appointments/xyz")).toBeNull();
  });
});

describe("buildRevertNoShowPayload", () => {
  it("sends only the reason for a stamped (automatic) row — lines are never chosen by the client", () => {
    const result = buildRevertNoShowPayload(review(), ["a"], "  خطای مالی  ");
    expect(result).toEqual({ ok: true, payload: { reason: "خطای مالی" } });
  });

  it("requires an explicit line choice for a legacy row", () => {
    const legacy = review({ resolution: "explicitLinesRequired" });
    expect(needsExplicitLines(legacy)).toBe(true);
    expect(buildRevertNoShowPayload(legacy, [], "نسخه آخر")).toEqual({
      ok: false,
      error: "حداقل یک خدمت را برای بازگرداندن انتخاب کنید.",
    });
  });

  it("sends the picked, de-duplicated lines of a legacy row and ignores ids that are not selectable", () => {
    const legacy = review({
      resolution: "explicitLinesRequired",
      lines: [line("a"), line("b"), line("active", { status: 1 })],
    });
    expect(selectableLines(legacy).map((l) => l.servicePublicId)).toEqual(["a", "b"]);

    const result = buildRevertNoShowPayload(legacy, ["b", "b", "active", "unknown"], "نسخه آخر");
    expect(result).toEqual({ ok: true, payload: { reason: "نسخه آخر", servicePublicIds: ["b"] } });
  });

  it("validates the reason with the 482 limit before anything is sent", () => {
    expect(buildRevertNoShowPayload(review(), [], "").ok).toBe(false);
    expect(buildRevertNoShowPayload(review(), [], "ا".repeat(482)).ok).toBe(true);
    expect(buildRevertNoShowPayload(review(), [], "ا".repeat(483)).ok).toBe(false);
  });

  it("refuses an appointment that is not a no-show", () => {
    expect(buildRevertNoShowPayload(review({ resolution: "notNoShow" }), [], "x")).toEqual({
      ok: false,
      error: "این نوبت در وضعیت «مراجعه نکرد» نیست.",
    });
  });
});
