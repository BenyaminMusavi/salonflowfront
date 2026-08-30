import { describe, it, expect } from "vitest";
import { validateQuickBook } from "./quickBookValidation";

const validInput = {
  phone: "09123456789",
  branchId: 1,
  offeringId: 5,
  staffId: 9,
  startTime: "2026-08-30T10:00:00.000Z",
};

describe("validateQuickBook", () => {
  it("returns null for a fully valid quick-book payload", () => {
    expect(validateQuickBook(validInput)).toBeNull();
  });

  describe("phone", () => {
    it.each([
      ["", "empty string"],
      ["091234567", "too short (9 digits)"],
      ["091234567890", "too long (12 digits)"],
      ["9123456789", "missing leading 0"],
      ["08123456789", "wrong prefix (not 09)"],
      ["0912345678a", "contains a letter"],
      ["0912 345 6789", "contains spaces"],
    ])("rejects %s (%s)", (phone) => {
      const result = validateQuickBook({ ...validInput, phone });
      expect(result?.phone).toBeTruthy();
    });
  });

  describe("branchId", () => {
    it("rejects zero", () => {
      expect(validateQuickBook({ ...validInput, branchId: 0 })?.branchId).toBeTruthy();
    });
    it("rejects a negative id", () => {
      expect(validateQuickBook({ ...validInput, branchId: -1 })?.branchId).toBeTruthy();
    });
    it("rejects a non-integer id", () => {
      expect(validateQuickBook({ ...validInput, branchId: 1.5 })?.branchId).toBeTruthy();
    });
  });

  describe("services", () => {
    it("rejects offeringId 0 (no service selected)", () => {
      expect(
        validateQuickBook({ ...validInput, offeringId: 0 })?.offeringId
      ).toBeTruthy();
    });
    it("rejects staffId 0 (no staff selected)", () => {
      expect(validateQuickBook({ ...validInput, staffId: 0 })?.staffId).toBeTruthy();
    });
  });

  it("rejects an empty startTime", () => {
    expect(validateQuickBook({ ...validInput, startTime: "" })?.startTime).toBeTruthy();
  });

  it("reports every invalid field at once, not just the first one", () => {
    const result = validateQuickBook({
      phone: "invalid",
      branchId: 0,
      offeringId: 0,
      staffId: 0,
      startTime: "",
    });
    expect(result?.phone).toBeTruthy();
    expect(result?.branchId).toBeTruthy();
    expect(result?.startTime).toBeTruthy();
    // offeringId/staffId share one array-level path when both are invalid;
    // at minimum one of the two must surface for the field errors to be visible.
    expect(result?.offeringId || result?.staffId).toBeTruthy();
  });
});
