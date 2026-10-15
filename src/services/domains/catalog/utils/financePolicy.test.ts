import { describe, expect, it } from "vitest";
import { DepositMode } from "@/services/common/enums/domain-enums";
import { EMPTY_POLICY, policyToRequest, validatePolicy } from "./financePolicy";

const tier = (hours: string, percent: string) => ({ hours, percent });

describe("validatePolicy", () => {
  it("accepts no deposit and no ladder", () => {
    expect(validatePolicy(EMPTY_POLICY, 500_000)).toBeNull();
  });

  it("checks the deposit value per mode", () => {
    expect(validatePolicy({ ...EMPTY_POLICY, mode: DepositMode.FixedAmount, amount: null }, 100)).not.toBeNull();
    expect(validatePolicy({ ...EMPTY_POLICY, mode: DepositMode.FixedAmount, amount: 200 }, 100)).not.toBeNull();
    expect(validatePolicy({ ...EMPTY_POLICY, mode: DepositMode.FixedAmount, amount: 50 }, 100)).toBeNull();
    expect(validatePolicy({ ...EMPTY_POLICY, mode: DepositMode.Percent, percent: "0" }, 100)).not.toBeNull();
    expect(validatePolicy({ ...EMPTY_POLICY, mode: DepositMode.Percent, percent: "30" }, 100)).toBeNull();
  });

  it("rejects duplicate hours, more than 5 steps and a cheaper late cancel", () => {
    expect(validatePolicy({ ...EMPTY_POLICY, tiers: [tier("24", "50"), tier("24", "60")] }, 1)).not.toBeNull();
    const six = ["1", "2", "3", "4", "5", "6"].map((h) => tier(h, "10"));
    expect(validatePolicy({ ...EMPTY_POLICY, tiers: six }, 1)).not.toBeNull();
    // 48 h → 50%, 6 h → 20%: closer to the start but cheaper
    expect(validatePolicy({ ...EMPTY_POLICY, tiers: [tier("48", "50"), tier("6", "20")] }, 1)).not.toBeNull();
    expect(validatePolicy({ ...EMPTY_POLICY, tiers: [tier("48", "20"), tier("6", "50")] }, 1)).toBeNull();
  });

  it("keeps the no-show percent at or above the hardest step", () => {
    const tiers = [tier("24", "40")];
    expect(validatePolicy({ ...EMPTY_POLICY, tiers, noShow: "30" }, 1)).not.toBeNull();
    expect(validatePolicy({ ...EMPTY_POLICY, tiers, noShow: "100" }, 1)).toBeNull();
    expect(validatePolicy({ ...EMPTY_POLICY, tiers, noShow: "" }, 1)).toBeNull();
  });
});

describe("policyToRequest", () => {
  it("sends only the value of the chosen mode and an explicit ladder", () => {
    const body = policyToRequest({
      mode: DepositMode.Percent,
      amount: 999,
      percent: "25",
      tiers: [tier("6", "100"), tier("48", "30")],
      noShow: "",
    });
    expect(body).toMatchObject({
      depositMode: DepositMode.Percent,
      requiresDeposit: true,
      depositAmount: null,
      depositPercent: 25,
      noShowPenaltyPercent: null,
    });
    expect(body.cancellationTiers.map((t) => t.hoursBefore)).toEqual([48, 6]);
    expect(policyToRequest(EMPTY_POLICY).cancellationTiers).toEqual([]);
  });
});
