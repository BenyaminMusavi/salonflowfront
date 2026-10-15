import { describe, expect, it } from "vitest";
import type { ICalculatePriceResult } from "../types/booking-browse.type";
import { cancellationSummary } from "./cancellationPolicy";

const quote = (over: Partial<ICalculatePriceResult>): ICalculatePriceResult => ({
  services: [],
  totalPrice: 0,
  totalDepositAmount: 0,
  amountDueNow: 0,
  remainingAfterDeposit: 0,
  freeCancellationWindowHours: 0,
  ...over,
});

describe("cancellationSummary", () => {
  it("says cancelling is always free when the window is 0", () => {
    const s = cancellationSummary(quote({ services: [{ serviceTypePublicId: "a", serviceName: "رنگ", price: 1, requiresDeposit: false }] }));
    expect(s.freeText).toBe("لغو همیشه رایگان است.");
    expect(s.lines).toEqual([]);
  });

  it("uses the quote's window and lists each ladder, hardest step first", () => {
    const s = cancellationSummary(
      quote({
        freeCancellationWindowHours: 48,
        services: [
          {
            serviceTypePublicId: "a",
            serviceName: "رنگ",
            price: 1,
            requiresDeposit: true,
            cancellationTiers: [
              { hoursBefore: 48, penaltyPercent: 20 },
              { hoursBefore: 6, penaltyPercent: 100 },
            ],
            noShowPenaltyPercent: 100,
          },
          { serviceTypePublicId: "b", serviceName: "کوتاهی", price: 1, requiresDeposit: false },
        ],
      })
    );
    expect(s.freeText).toBe("لغو رایگان تا 48 ساعت قبل از نوبت.");
    expect(s.lines).toEqual([
      {
        serviceName: "رنگ",
        tiers: ["کمتر از 48 ساعت مانده: 20٪", "کمتر از 6 ساعت مانده: 100٪"],
        noShow: "مراجعه‌نکردن: 100٪",
      },
    ]);
  });
});
