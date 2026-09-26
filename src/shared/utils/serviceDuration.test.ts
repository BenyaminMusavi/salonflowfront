import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatDurationShort,
  isValidServiceDuration,
  stepDuration,
} from "./serviceDuration";

describe("service duration (15-minute steps)", () => {
  it("accepts only multiples of 15 between 15 minutes and 8 hours", () => {
    expect(isValidServiceDuration(45)).toBe(true);
    expect(isValidServiceDuration(480)).toBe(true);
    expect(isValidServiceDuration(20)).toBe(false);
    expect(isValidServiceDuration(0)).toBe(false);
    expect(isValidServiceDuration(495)).toBe(false);
    expect(isValidServiceDuration(null)).toBe(false);
  });

  it("formats readable labels", () => {
    expect(formatDuration(45)).toBe("45 دقیقه");
    expect(formatDuration(60)).toBe("1 ساعت");
    expect(formatDuration(75)).toBe("1 ساعت و 15 دقیقه");
    expect(formatDurationShort(90)).toBe("1.5 ساعت");
    expect(formatDurationShort(120)).toBe("2 ساعت");
  });

  it("steps by 15, snapping legacy off-grid values and clamping to the range", () => {
    expect(stepDuration(45, 1)).toBe(60);
    expect(stepDuration(45, -1)).toBe(30);
    expect(stepDuration(20, 1)).toBe(30);
    expect(stepDuration(20, -1)).toBe(15);
    expect(stepDuration(15, -1)).toBe(15);
    expect(stepDuration(480, 1)).toBe(480);
  });
});
