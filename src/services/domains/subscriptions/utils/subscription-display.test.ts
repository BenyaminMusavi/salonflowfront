import { describe, expect, it } from "vitest";
import { PromoDiscountType } from "@/services/common/enums/domain-enums";
import {
  formatDiscountValue,
  formatRialAsToman,
  rialToToman,
  tomanToRial,
} from "./subscription-display";

// Subscription money is RIALS in the API and Toman in the UI (backend contract).
describe("rial ↔ toman", () => {
  it("converts between the API's rials and the UI's toman", () => {
    expect(rialToToman(10_000_000)).toBe(1_000_000);
    expect(tomanToRial(1_000_000)).toBe(10_000_000);
    expect(rialToToman(tomanToRial(123_456))).toBe(123_456);
  });

  it("formats a rial amount as toman", () => {
    expect(formatRialAsToman(8_000_000)).toBe("800,000");
    expect(formatRialAsToman(null)).toBe("—");
  });

  it("shows promo fixed amounts (rials) in toman and percentages as-is", () => {
    expect(formatDiscountValue(PromoDiscountType.FixedAmount, 500_000)).toBe("50,000 تومان");
    expect(formatDiscountValue(PromoDiscountType.Percentage, 20)).toBe("20٪");
  });
});
