"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { useQuerySubscriptionPlans } from "@/services/domains/subscriptions/hooks/useQuerySubscriptionPlans";
import { useQuerySubscriptionMe } from "@/services/domains/subscriptions/hooks/useQuerySubscriptionMe";
import { useSubscriptionEntitlement } from "@/services/domains/subscriptions/hooks/useSubscriptionEntitlement";
import {
  useMutateCheckout,
  useMutateStartTrial,
} from "@/services/domains/subscriptions/hooks/useMutateSubscriptions";
import { ISubscriptionPlan } from "@/services/domains/subscriptions/types/subscriptions.type";
import {
  effectivePlanPrice,
  subscriptionStatusLabel,
} from "@/services/domains/subscriptions/utils/subscription-display";
import { formatToman } from "@/shared/utils/salonDisplay";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { cn } from "@/shared/utils/className";

export default function SubscriptionsView() {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const setRedirectUrl = useTokenStore((s) => s.setRedirectUrl);

  const { data: plansRes, isLoading: plansLoading, isError: plansError } =
    useQuerySubscriptionPlans();
  const { data: meRes } = useQuerySubscriptionMe();
  const {
    entitlement,
    canCreateSalon,
    isEntitled,
    maxSalons,
    ownedSalonCount,
    remainingSalonSlots,
    status,
    isLoading: entitlementLoading,
  } = useSubscriptionEntitlement();

  const { mutateAsync: startTrial, isPending: trialPending } =
    useMutateStartTrial();
  const { mutateAsync: checkout, isPending: checkoutPending } =
    useMutateCheckout();

  const plans = plansRes?.data ?? [];
  const subscription = meRes?.data;

  const [selectedPlan, setSelectedPlan] = useState<ISubscriptionPlan | null>(
    null
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [checkoutInvoiceId, setCheckoutInvoiceId] = useState<number | null>(
    null
  );

  const trialPlan = useMemo(() => {
    const withTrial = plans.filter((p) => (p.trialDays ?? 0) > 0);
    if (withTrial.length === 0) return plans[0] ?? null;
    return [...withTrial].sort(
      (a, b) => a.durationMonths - b.durationMonths || a.price - b.price
    )[0];
  }, [plans]);

  /** Group plans by name for tier display (e.g. Basic 4/8/12 months). */
  const tiers = useMemo(() => {
    const map = new Map<string, ISubscriptionPlan[]>();
    for (const plan of plans) {
      const key = plan.name.trim();
      const list = map.get(key) ?? [];
      list.push(plan);
      map.set(key, list);
    }
    return Array.from(map.entries()).map(([name, items]) => ({
      name,
      items: [...items].sort((a, b) => a.durationMonths - b.durationMonths),
    }));
  }, [plans]);

  const requireAuth = () => {
    if (!isLoggedIn) {
      setRedirectUrl(RouteAddress.SUBSCRIPTIONS.BASE);
      router.push(RouteAddress.AUTH.LOGIN.BASE);
      return false;
    }
    return true;
  };

  const handleTrial = async () => {
    setError("");
    setSuccessMsg("");
    if (!requireAuth() || !trialPlan) return;
    try {
      await startTrial({ planId: trialPlan.id });
      setSuccessMsg(
        `دوره آزمایشی ${trialPlan.trialDays ?? 30} روزه برای طرح «${trialPlan.name}» فعال شد.`
      );
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          "فعال‌سازی دوره آزمایشی ناموفق بود (ممکن است قبلاً استفاده شده باشد)."
        )
      );
    }
  };

  const openCheckout = (plan: ISubscriptionPlan) => {
    setSelectedPlan(plan);
    setPromoCode("");
    setCheckoutInvoiceId(null);
    setError("");
    setSuccessMsg("");
    setCheckoutOpen(true);
  };

  const handleCheckout = async () => {
    setError("");
    if (!requireAuth() || !selectedPlan) return;
    try {
      const res = await checkout({
        planId: selectedPlan.id,
        promoCode: promoCode.trim() || null,
      });
      setCheckoutInvoiceId(res.data?.id ?? null);
      setSuccessMsg(
        "فاکتور اشتراک ساخته شد و در وضعیت Pending است. پس از تأیید پرداخت توسط ادمین، اشتراک فعال می‌شود."
      );
    } catch (e) {
      setError(getApiErrorMessage(e, "ثبت سفارش اشتراک ناموفق بود."));
    }
  };

  return (
    <div className="flex flex-col gap-5 px-safe-area pb-32 pt-4">
      <TopNavigation>اشتراک پلتفرم</TopNavigation>

      <p className="text-sm text-foreground-muted">
        برای ایجاد سالن، ابتدا اشتراک billable (آزمایشی / فعال / مهلت) بگیرید.
        پرداخت فعلاً دستی است و ادمین فاکتور را تأیید می‌کند.
      </p>

      {/* Entitlement summary */}
      <section className="rounded-[20px] bg-surface-tertiary p-4">
        <h2 className="text-sm font-bold text-foreground">وضعیت entitlement</h2>
        {!isLoggedIn && (
          <p className="mt-2 text-xs text-foreground-muted">
            برای مشاهده وضعیت وارد شوید.
          </p>
        )}
        {isLoggedIn && entitlementLoading && (
          <p className="mt-2 text-xs text-foreground-muted">در حال بارگذاری…</p>
        )}
        {isLoggedIn && !entitlementLoading && (
          <div className="mt-3 flex flex-col gap-1.5 text-sm">
            <p>
              <span className="text-foreground-muted">وضعیت: </span>
              {subscriptionStatusLabel(status ?? subscription?.status)}
            </p>
            <p>
              <span className="text-foreground-muted">مجاز: </span>
              {isEntitled ? "بله" : "خیر"}
            </p>
            <p>
              <span className="text-foreground-muted">سالن‌ها: </span>
              {ownedSalonCount} / {maxSalons || "—"}
              {entitlement && (
                <span className="text-foreground-muted">
                  {" "}
                  (باقی‌مانده: {remainingSalonSlots})
                </span>
              )}
            </p>
            <p
              className={cn(
                "mt-1 text-xs font-semibold",
                canCreateSalon ? "text-primary" : "text-orange-400"
              )}
            >
              {canCreateSalon
                ? "می‌توانید سالن جدید ایجاد کنید."
                : "ایجاد سالن جدید فعلاً مسدود است."}
            </p>
          </div>
        )}
      </section>

      {error && (
        <p className="rounded-2xl bg-error/10 px-4 py-3 text-xs text-error">
          {error}
        </p>
      )}
      {successMsg && (
        <p className="rounded-2xl bg-primary/10 px-4 py-3 text-xs text-foreground">
          {successMsg}
        </p>
      )}

      {/* Trial CTA */}
      {trialPlan && (
        <button
          type="button"
          disabled={trialPending}
          onClick={handleTrial}
          className="rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          {trialPending
            ? "در حال فعال‌سازی…"
            : `شروع دوره آزمایشی ${trialPlan.trialDays ?? 30} روزه رایگان`}
        </button>
      )}

      {/* Plans */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-foreground">طرح‌ها</h2>
        {plansLoading && (
          <p className="text-sm text-foreground-muted">در حال بارگذاری طرح‌ها…</p>
        )}
        {plansError && (
          <p className="text-sm text-error">خطا در دریافت طرح‌ها</p>
        )}
        {!plansLoading && tiers.length === 0 && (
          <p className="text-sm text-foreground-muted">طرحی یافت نشد.</p>
        )}

        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="rounded-[24px] bg-surface-tertiary p-4"
          >
            <h3 className="text-[15px] font-bold text-foreground">
              {tier.name}
            </h3>
            <p className="mt-1 text-xs text-foreground-muted">
              تا {tier.items[0]?.maxSalons ?? "—"} سالن
              {tier.items[0]?.trialDays
                ? ` · ${tier.items[0].trialDays} روز آزمایشی`
                : ""}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {tier.items.map((plan) => {
                const price = effectivePlanPrice(plan);
                const hasCampaign =
                  typeof plan.campaignPrice === "number" &&
                  plan.campaignPrice < plan.price;
                return (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-background-secondary px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {plan.durationMonths} ماهه
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {hasCampaign && (
                          <span className="me-2 line-through opacity-60">
                            {formatToman(plan.price)}
                          </span>
                        )}
                        <span className="font-bold text-foreground">
                          {formatToman(price)} تومان
                        </span>
                        {plan.campaignName && (
                          <span className="ms-2 text-primary">
                            {plan.campaignName}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCheckout(plan)}
                      className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                    >
                      خرید طرح
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <BottomSheet
        open={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          setCheckoutInvoiceId(null);
        }}
      >
        {selectedPlan && (
          <div className="flex flex-col gap-4 pb-4">
            <h3 className="text-base font-bold text-foreground">
              خلاصه خرید — {selectedPlan.name}
            </h3>
            <div className="rounded-2xl bg-background-secondary p-4 text-sm">
              <p>
                مدت: <strong>{selectedPlan.durationMonths} ماه</strong>
              </p>
              <p className="mt-1">
                سقف سالن: <strong>{selectedPlan.maxSalons}</strong>
              </p>
              <p className="mt-1">
                مبلغ:{" "}
                <strong>
                  {formatToman(effectivePlanPrice(selectedPlan))} تومان
                </strong>
              </p>
              <p className="mt-3 text-xs text-foreground-muted">
                درگاه واقعی هنوز فعال نیست. با تأیید، فاکتور Pending ساخته
                می‌شود و ادمین بعداً آن را Paid می‌کند.
              </p>
            </div>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground-muted">کد تخفیف (اختیاری)</span>
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="rounded-2xl bg-background-secondary px-4 py-3 text-foreground outline-none"
                placeholder="مثلاً SAVE20"
                disabled={checkoutInvoiceId != null}
              />
            </label>

            {checkoutInvoiceId != null && (
              <p className="text-xs text-primary">
                شماره فاکتور: {checkoutInvoiceId}
              </p>
            )}

            {error && (
              <p className="rounded-2xl bg-error/10 px-3 py-2 text-xs text-error">
                {error}
              </p>
            )}

            {checkoutInvoiceId == null ? (
              <button
                type="button"
                disabled={checkoutPending}
                onClick={handleCheckout}
                className="rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
              >
                {checkoutPending ? "در حال ثبت…" : "ادامه و پرداخت"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="rounded-full bg-surface-tertiary py-3 text-sm font-bold text-foreground"
              >
                بستن
              </button>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
