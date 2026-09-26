import { describe, expect, it } from "vitest";
import { normalizeUsernameInput, usernameFormatProblem } from "./salonUsername";

describe("normalizeUsernameInput", () => {
  it("lowercases and turns underscores / spaces into hyphens", () => {
    expect(normalizeUsernameInput("Test_Salon")).toBe("test-salon");
    expect(normalizeUsernameInput("my salon")).toBe("my-salon");
  });
});

describe("usernameFormatProblem", () => {
  it("accepts valid usernames", () => {
    expect(usernameFormatProblem("test-salon", true)).toBeNull();
    expect(usernameFormatProblem("salon24", true)).toBeNull();
  });

  it("names the exact problem", () => {
    expect(usernameFormatProblem("سالن", false)).toContain("حروف فارسی");
    expect(usernameFormatProblem("a@b", false)).toContain("«@»");
    expect(usernameFormatProblem("-abc", false)).toContain("شروع");
    expect(usernameFormatProblem("a--b", false)).toContain("پشت‌سرهم");
    expect(usernameFormatProblem("12345", true)).toContain("فقط عدد");
  });

  it("waits until typing pauses for mid-typing states", () => {
    expect(usernameFormatProblem("ab", false)).toBeNull();
    expect(usernameFormatProblem("ab", true)).toContain("حداقل");
    expect(usernameFormatProblem("abc-", false)).toBeNull();
    expect(usernameFormatProblem("abc-", true)).toContain("تمام");
  });
});
