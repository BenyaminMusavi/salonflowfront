import { formatPercent } from "@/shared/utils/percent";
import { DepositMode } from "@/services/common/enums/domain-enums";
import type { ICancellationTier, IServiceOffering } from "../types/catalog.type";

/** Backend limits (`CancellationPolicy`): up to 5 steps, 1–720 hours before the start. */
export const MAX_CANCELLATION_TIERS = 5;
export const MAX_TIER_HOURS = 720;

export interface TierDraft {
  hours: string;
  percent: string;
}

/** Form state of a service's deposit + cancellation policy (text fields stay strings while typed). */
export interface PolicyDraft {
  mode: DepositMode;
  /** Toman, for FixedAmount. */
  amount: number | null;
  /** 0–100, for Percent. */
  percent: string;
  tiers: TierDraft[];
  /** Blank = same as the hardest step. */
  noShow: string;
}

export const EMPTY_POLICY: PolicyDraft = {
  mode: DepositMode.None,
  amount: null,
  percent: "",
  tiers: [],
  noShow: "",
};

export function policyFromOffering(o?: IServiceOffering | null): PolicyDraft {
  if (!o) return { ...EMPTY_POLICY, tiers: [] };
  // Older responses without `depositMode`: a fixed deposit was the only kind.
  const mode =
    o.depositMode ?? (o.requiresDeposit && o.depositAmount ? DepositMode.FixedAmount : DepositMode.None);
  return {
    mode,
    amount: mode === DepositMode.FixedAmount ? (o.depositAmount ?? null) : null,
    percent: mode === DepositMode.Percent && o.depositPercent != null ? String(o.depositPercent) : "",
    tiers: [...(o.cancellationTiers ?? [])]
      .sort((a, b) => b.hoursBefore - a.hoursBefore)
      .map((t) => ({ hours: String(t.hoursBefore), percent: String(t.penaltyPercent) })),
    noShow: o.noShowPenaltyPercent != null ? String(o.noShowPenaltyPercent) : "",
  };
}

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

/** Mirrors the backend rules so the form says what is wrong before the 400. Null = valid. */
export function validatePolicy(d: PolicyDraft, basePrice: number | null): string | null {
  if (d.mode === DepositMode.FixedAmount) {
    if (d.amount == null || d.amount <= 0) return "مبلغ بیعانه را وارد کنید.";
    if (basePrice != null && d.amount > basePrice) return "مبلغ بیعانه نمی‌تواند از قیمت خدمت بیشتر باشد.";
  }
  if (d.mode === DepositMode.Percent) {
    const p = num(d.percent);
    if (!(p > 0 && p <= 100)) return "درصد بیعانه باید بیشتر از 0 و حداکثر 100 باشد.";
  }

  if (d.tiers.length > MAX_CANCELLATION_TIERS) return `حداکثر ${MAX_CANCELLATION_TIERS} پله‌ی جریمه مجاز است.`;
  const parsed: ICancellationTier[] = [];
  for (const t of d.tiers) {
    const hours = num(t.hours);
    const percent = num(t.percent);
    if (!Number.isInteger(hours) || hours < 1 || hours > MAX_TIER_HOURS) {
      return `ساعت هر پله باید عددی بین 1 تا ${MAX_TIER_HOURS} باشد.`;
    }
    if (!(percent >= 0 && percent <= 100)) return "درصد جریمه باید بین 0 تا 100 باشد.";
    parsed.push({ hoursBefore: hours, penaltyPercent: percent });
  }
  if (new Set(parsed.map((t) => t.hoursBefore)).size !== parsed.length) {
    return "دو پله نمی‌توانند ساعت یکسان داشته باشند.";
  }
  // The closer to the start, the higher (never lower) the penalty.
  const byHoursAsc = [...parsed].sort((a, b) => a.hoursBefore - b.hoursBefore);
  for (let i = 1; i < byHoursAsc.length; i++) {
    if (byHoursAsc[i].penaltyPercent > byHoursAsc[i - 1].penaltyPercent) {
      return "هرچه به زمان نوبت نزدیک‌تر می‌شود، جریمه نباید کمتر شود.";
    }
  }

  if (d.noShow.trim() !== "") {
    const ns = num(d.noShow);
    if (!(ns >= 0 && ns <= 100)) return "درصد جریمه‌ی مراجعه‌نکردن باید بین 0 تا 100 باشد.";
    const hardest = Math.max(0, ...parsed.map((t) => t.penaltyPercent));
    if (ns < hardest) return "جریمه‌ی مراجعه‌نکردن نباید از سخت‌ترین پله کمتر باشد.";
  }
  return null;
}

/** Request fields. An empty ladder is sent as [] so removing every step really removes them. */
export function policyToRequest(d: PolicyDraft) {
  return {
    depositMode: d.mode,
    requiresDeposit: d.mode !== DepositMode.None,
    depositAmount: d.mode === DepositMode.FixedAmount ? d.amount : null,
    depositPercent: d.mode === DepositMode.Percent ? Number(d.percent) : null,
    cancellationTiers: d.tiers
      .map((t) => ({ hoursBefore: Number(t.hours), penaltyPercent: Number(t.percent) }))
      .sort((a, b) => b.hoursBefore - a.hoursBefore),
    noShowPenaltyPercent: d.noShow.trim() === "" ? null : Number(d.noShow),
  };
}

/** One line for the service list: «بیعانه 20٪» / «پیش‌پرداخت کامل» / null. */
export function depositSummary(
  o: Pick<IServiceOffering, "depositMode" | "depositPercent" | "depositAmount" | "requiresDeposit">
): string | null {
  switch (o.depositMode) {
    case DepositMode.Percent:
      return o.depositPercent ? `بیعانه ${formatPercent(o.depositPercent)}` : null;
    case DepositMode.FullPrepayment:
      return "پیش‌پرداخت کامل";
    case DepositMode.FixedAmount:
      return o.depositAmount ? "بیعانه ثابت" : null;
    case DepositMode.None:
      return null;
    default:
      return o.requiresDeposit && o.depositAmount ? "بیعانه ثابت" : null;
  }
}
