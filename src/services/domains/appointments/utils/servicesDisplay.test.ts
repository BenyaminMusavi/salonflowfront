import { describe, expect, it } from "vitest";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import {
  canShowAppointmentTotals,
  emptyServicesLabel,
  hasUnknownServices,
} from "./servicesDisplay";
import { historyReasonLabel } from "./historyReason";

const line = { name: "کوتاهی مو", price: 100_000, durationMinutes: 30 };

describe("appointments with and without service lines", () => {
  it("never hides totals of a normal, completed, cancelled or no-show appointment that has its services", () => {
    for (const status of [
      AppointmentStatus.Scheduled,
      AppointmentStatus.CheckedIn,
      AppointmentStatus.Completed,
      AppointmentStatus.Cancelled,
      AppointmentStatus.NoShow,
    ]) {
      expect(canShowAppointmentTotals(status, [line])).toBe(true);
      expect(hasUnknownServices(status, [line])).toBe(false);
    }
  });

  it("marks an older cancelled / no-show appointment without lines as unknown, not as a zero price", () => {
    for (const status of [AppointmentStatus.Cancelled, AppointmentStatus.NoShow]) {
      expect(hasUnknownServices(status, [])).toBe(true);
      expect(hasUnknownServices(status, undefined)).toBe(true);
      expect(canShowAppointmentTotals(status, [])).toBe(false);
      expect(emptyServicesLabel(status)).toBe("خدمات این نوبت نامشخص است");
    }
  });

  it("keeps the plain label for an open appointment with no lines", () => {
    expect(emptyServicesLabel(AppointmentStatus.Scheduled)).toBe("بدون خدمت");
    expect(canShowAppointmentTotals(AppointmentStatus.Scheduled, [])).toBe(true);
  });
});

describe("historyReasonLabel", () => {
  it("shows the correction reason in Persian instead of the machine prefix", () => {
    expect(historyReasonLabel("UndoNoShow: مشتری آمده بود")).toBe("اصلاح «مراجعه نکرد»: مشتری آمده بود");
    expect(historyReasonLabel("UndoNoShowLegacy: نسخه آخر")).toBe(
      "اصلاح «مراجعه نکرد» توسط پشتیبانی (نوبت قدیمی): نسخه آخر"
    );
  });

  it("translates the other machine tokens and keeps people's text", () => {
    expect(historyReasonLabel("Undo")).toBe("بازگردانی");
    expect(historyReasonLabel("Rescheduled")).toBe("جابه‌جا شد");
    expect(historyReasonLabel("Created")).toBeNull();
    expect(historyReasonLabel("درخواست مشتری")).toBe("درخواست مشتری");
    expect(historyReasonLabel(null)).toBeNull();
    expect(historyReasonLabel("  ")).toBeNull();
  });
});
