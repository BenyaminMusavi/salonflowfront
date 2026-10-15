import { describe, expect, it } from "vitest";
import type { IMyAppointmentService } from "../types/appointments.type";
import { estimateCancelPenalty } from "./cancelPenalty";

const NOW = Date.parse("2026-10-20T10:00:00Z");
const startIn = (hours: number) => new Date(NOW + hours * 3_600_000).toISOString();

const svc = (over: Partial<IMyAppointmentService>): IMyAppointmentService => ({
  offeringPublicId: "o",
  staffPublicId: "s",
  name: "رنگ",
  durationMinutes: 60,
  price: 1_000_000,
  ...over,
});

const ladder = [
  { hoursBefore: 48, penaltyPercent: 20 },
  { hoursBefore: 6, penaltyPercent: 100 },
];

describe("estimateCancelPenalty", () => {
  it("says nothing when the API sent no ladder", () => {
    expect(estimateCancelPenalty([svc({})], startIn(5), NOW)).toBeNull();
  });

  it("is free outside the biggest step", () => {
    const est = estimateCancelPenalty([svc({ cancellationTiers: ladder, depositPaid: 200_000 })], startIn(72), NOW);
    expect(est).toMatchObject({ windowHours: 48, percent: 0, penalty: 0, refund: 200_000 });
  });

  it("applies the tightest step that already holds", () => {
    const mid = estimateCancelPenalty([svc({ cancellationTiers: ladder, depositPaid: 200_000 })], startIn(24), NOW);
    expect(mid).toMatchObject({ percent: 20, penalty: 40_000, refund: 160_000 });
    const late = estimateCancelPenalty([svc({ cancellationTiers: ladder, depositPaid: 200_000 })], startIn(3), NOW);
    expect(late).toMatchObject({ percent: 100, penalty: 200_000, refund: 0 });
  });

  it("sums each service's own share and keeps the percent when the deposit is unknown", () => {
    const two = estimateCancelPenalty(
      [
        svc({ cancellationTiers: ladder, depositPaid: 100_000 }),
        svc({ cancellationTiers: [{ hoursBefore: 24, penaltyPercent: 50 }], depositPaid: 100_000 }),
      ],
      startIn(10),
      NOW
    );
    expect(two).toMatchObject({ penalty: 70_000, refund: 130_000, windowHours: 48 });
    const unknown = estimateCancelPenalty([svc({ cancellationTiers: ladder })], startIn(10), NOW);
    expect(unknown).toMatchObject({ percent: 20, penalty: null, refund: null });
  });

  it("treats an empty ladder as always free", () => {
    const est = estimateCancelPenalty([svc({ cancellationTiers: [], depositPaid: 50_000 })], startIn(1), NOW);
    expect(est).toMatchObject({ windowHours: 0, percent: 0, penalty: 0 });
  });
});
