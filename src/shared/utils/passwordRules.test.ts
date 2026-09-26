import { describe, expect, it } from "vitest";
import { newPasswordField, PASSWORD_RULES } from "./passwordRules";

const check = (value: string) => newPasswordField("required").safeParse(value);

describe("password rules (mirror the backend validators)", () => {
  it("accepts a password meeting every rule", () => {
    expect(check("Abcd@1234").success).toBe(true);
  });

  it("names the first missing rule", () => {
    const missingSymbol = check("Abcd1234");
    expect(missingSymbol.success).toBe(false);
    expect(missingSymbol.error?.issues[0].message).toContain("نماد");

    const tooShort = check("Ab@1");
    expect(tooShort.error?.issues[0].message).toContain("حداقل 8");
  });

  it("drives the live checklist rule by rule", () => {
    const passed = PASSWORD_RULES.filter((r) => r.test("abcdefgh")).map((r) => r.id);
    expect(passed).toEqual(["length", "lower"]);
  });
});
