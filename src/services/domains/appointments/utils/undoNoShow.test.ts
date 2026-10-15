import { describe, expect, it } from "vitest";
import {
  UNDO_NO_SHOW_REASON_MAX,
  checkUndoNoShowReason,
  getUndoNoShowErrorMessage,
} from "./undoNoShow";

const apiError = (errors: { field: string; message: string }[]) => ({ response: { data: { errors } } });

describe("checkUndoNoShowReason", () => {
  it("uses the backend ceiling of 482 characters", () => {
    expect(UNDO_NO_SHOW_REASON_MAX).toBe(482);
  });

  it("requires a reason and trims it", () => {
    expect(checkUndoNoShowReason("")).toEqual({ ok: false, error: "علت اصلاح را بنویسید." });
    expect(checkUndoNoShowReason("   \n ")).toEqual({ ok: false, error: "علت اصلاح را بنویسید." });
    expect(checkUndoNoShowReason("  مشتری آمده بود  ")).toEqual({ ok: true, reason: "مشتری آمده بود" });
  });

  it("accepts exactly 482 characters and rejects 483", () => {
    expect(checkUndoNoShowReason("ا".repeat(482)).ok).toBe(true);
    const tooLong = checkUndoNoShowReason("ا".repeat(483));
    expect(tooLong.ok).toBe(false);
    expect(tooLong).toEqual({ ok: false, error: "علت اصلاح حداکثر 482 نویسه است." });
  });

  it("counts the trimmed text, not the spaces around it", () => {
    expect(checkUndoNoShowReason(` ${"ا".repeat(482)} `).ok).toBe(true);
  });
});

describe("getUndoNoShowErrorMessage", () => {
  it("maps the expired window to a clear instruction", () => {
    const message = getUndoNoShowErrorMessage(apiError([{ field: "appointment_undo_noshow_expired", message: "x" }]));
    expect(message).toContain("24 ساعته");
    expect(message).toContain("پشتیبانی");
  });

  it("explains a legacy row without a stamp", () => {
    const message = getUndoNoShowErrorMessage(apiError([{ field: "appointment_undo_noshow_unavailable", message: "x" }]));
    expect(message).toContain("قدیمی");
  });

  it("explains that explicit services are required for legacy rows", () => {
    const message = getUndoNoShowErrorMessage(apiError([{ field: "appointment_undo_noshow_lines_required", message: "x" }]));
    expect(message).toContain("انتخاب کنید");
  });

  it("matches the field case-insensitively", () => {
    const message = getUndoNoShowErrorMessage(apiError([{ field: "Appointment_Undo_NoShow_Lines_Invalid", message: "x" }]));
    expect(message).toContain("معتبر نیستند");
  });

  it("keeps the server text for errors it does not know", () => {
    expect(getUndoNoShowErrorMessage(apiError([{ field: "concurrency", message: "هم‌زمان تغییر کرد" }]))).toBe(
      "هم‌زمان تغییر کرد"
    );
  });

  it("falls back when there is no response body", () => {
    expect(getUndoNoShowErrorMessage(new Error("network"))).toBe("اصلاح «مراجعه نکرد» ناموفق بود.");
    expect(getUndoNoShowErrorMessage(undefined, "خطا")).toBe("خطا");
  });
});
