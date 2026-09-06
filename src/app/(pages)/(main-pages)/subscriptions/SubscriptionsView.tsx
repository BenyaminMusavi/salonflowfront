"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretDownIcon,
  CaretUpIcon,
  CheckCircleIcon,
  CreditCardIcon,
  HandshakeIcon,
  PercentIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import BackHeader from "@/shared/components/composites/layout/back-header/BackHeader";
import { useQuerySubscriptionPlans } from "@/services/domains/subscriptions/hooks/useQuerySubscriptionPlans";
import {
  useMutateCheckout,
  useMutatePreviewCheckout,
} from "@/services/domains/subscriptions/hooks/useMutateSubscriptions";
import {
  ICheckoutPreviewResult,
  ISubscriptionPlan,
} from "@/services/domains/subscriptions/types/subscriptions.type";
import { effectivePlanPrice } from "@/services/domains/subscriptions/utils/subscription-display";
import { formatToman } from "@/shared/utils/salonDisplay";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { cn } from "@/shared/utils/className";
import { getLoginHref } from "@/shared/utils/authRedirect";

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "سالن فلو دقیقاً چه خدماتی ارائه می‌دهد؟",
    answer:
      "سالن فلو مدیریت نوبت‌دهی، مشتریان، کارکنان و گزارش‌های مالی سالن شما را در یک اپلیکیشن یکپارچه در اختیارتان می‌گذارد.",
  },
  {
    question: "با خرید اشتراک، به چه بخش‌هایی از اپ دسترسی خواهم داشت؟",
    answer:
      "با خرید اشتراک، پنل کامل مدیریت سالن شامل رزرو آنلاین، مدیریت کارکنان و گزارش‌گیری برای شما فعال می‌شود.",
  },
  {
    question: "آیا امکانات همه اشتراک‌ها یکسان است یا با مدت اشتراک فرق می‌کند؟",
    answer:
      "امکانات اصلی در همه طرح‌ها یکسان است؛ تفاوت اصلی در مدت زمان و صرفه‌جویی قیمتی طرح‌های بلندمدت‌تر است.",
  },
  {
    question: "آیا می‌توانم قبل از خرید، سالن فلو را امتحان کنم؟",
    answer:
      "بله، امکان استفاده آزمایشی پیش از خرید نهایی برای شما فراهم است تا با محیط کار آشنا شوید.",
  },
  {
    question: "آیا امکان لغو اشتراک وجود دارد؟",
    answer:
      "بله، می‌توانید از بخش پشتیبانی درخواست لغو اشتراک را ثبت کنید و طبق قوانین بازگشت وجه بررسی می‌شود.",
  },
  {
    question: "محتوای سالن فلو برای چه سطحی از دانش مالی مناسب است؟",
    answer:
      "سالن فلو برای همه سطوح طراحی شده و نیازی به دانش تخصصی مالی یا حسابداری ندارید.",
  },
];

/** Every plan the backend returns, ordered shortest-duration first — whatever exists is shown, nothing is filtered out. */
function sortPlansForDisplay(plans: ISubscriptionPlan[]) {
  return [...plans].sort(
    (a, b) => a.durationMonths - b.durationMonths || a.price - b.price
  );
}

export default function SubscriptionsView() {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  const { data: plansRes, isLoading: plansLoading, isError: plansError } =
    useQuerySubscriptionPlans();
  const { mutateAsync: checkout, isPending: checkoutPending } =
    useMutateCheckout();
  const { mutateAsync: previewCheckout, isPending: previewPending } =
    useMutatePreviewCheckout();

  const plans = plansRes?.data ?? [];
  const displayPlans = useMemo(() => sortPlansForDisplay(plans), [plans]);

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<number | null>(null);

  // The last successfully-validated code, tied to the plan+text it was checked against —
  // editing either one invalidates it until "ثبت" is pressed again.
  const [appliedPromo, setAppliedPromo] = useState<{
    planId: number;
    code: string;
    result: ICheckoutPreviewResult;
  } | null>(null);
  const [promoError, setPromoError] = useState("");

  const selectedPlan =
    displayPlans.find((p) => p.id === selectedPlanId) ?? displayPlans[0] ?? null;

  const trimmedPromoCode = promoCode.trim();
  const appliedPromoMatchesSelection =
    !!appliedPromo &&
    !!selectedPlan &&
    appliedPromo.planId === selectedPlan.id &&
    appliedPromo.code === trimmedPromoCode;

  // Discounts are never guessed client-side: outside of a matching preview, this is just
  // the plan's own price (with any campaign the backend already put on it).
  const totalPrice = selectedPlan
    ? appliedPromoMatchesSelection
      ? appliedPromo.result.finalPrice
      : effectivePlanPrice(selectedPlan)
    : null;

  const selectPlan = (planId: number) => {
    setSelectedPlanId(planId);
    setAppliedPromo(null);
    setPromoError("");
  };

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value);
    setAppliedPromo(null);
    setPromoError("");
  };

  const handleApplyPromoCode = async () => {
    setPromoError("");
    if (!selectedPlan) {
      setPromoError("ابتدا یک طرح اشتراک را انتخاب کنید.");
      return;
    }
    if (!trimmedPromoCode) {
      setAppliedPromo(null);
      return;
    }
    try {
      const res = await previewCheckout({
        planId: selectedPlan.id,
        promoCode: trimmedPromoCode,
      });
      if (!res.data?.valid) {
        setAppliedPromo(null);
        setPromoError("کد وارد شده معتبر نیست.");
        return;
      }
      setAppliedPromo({
        planId: selectedPlan.id,
        code: trimmedPromoCode,
        result: res.data,
      });
    } catch (e) {
      setAppliedPromo(null);
      setPromoError(getApiErrorMessage(e, "کد وارد شده معتبر نیست."));
    }
  };

  const handlePurchase = async () => {
    setError("");
    if (!isLoggedIn) {
      router.push(getLoginHref(RouteAddress.SUBSCRIPTIONS.BASE));
      return;
    }
    if (!selectedPlan) {
      setError("لطفاً یکی از طرح‌های اشتراک را انتخاب کنید.");
      return;
    }
    try {
      const res = await checkout({
        planId: selectedPlan.id,
        promoCode: promoCode.trim() || null,
      });
      setInvoiceId(res.data?.id ?? null);
      setInvoiceAmount(res.data?.amount ?? null);
    } catch (e) {
      setError(getApiErrorMessage(e, "ثبت سفارش اشتراک ناموفق بود."));
    }
  };

  return (
    <div className="flex flex-col gap-6 px-safe-area pb-40 pt-5">
      <BackHeader title="خرید اشتراک" fallbackHref={RouteAddress.PROFILE.BASE} />

      {invoiceId != null ? (
        <section className="rounded-[24px] bg-primary/10 p-5 text-center">
          <p className="text-sm font-bold text-foreground">
            فاکتور اشتراک شما ثبت شد.
          </p>
          <p className="mt-2 text-xs text-foreground-muted">
            شماره فاکتور: {invoiceId}
            {invoiceAmount != null
              ? ` — مبلغ: ${formatToman(invoiceAmount)} تومان`
              : ""}{" "}
            — پس از تأیید پرداخت توسط پشتیبانی، اشتراک شما فعال می‌شود.
          </p>
        </section>
      ) : (
        <>
          {/* Plans */}
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              انتخاب طرح اشتراک
            </h2>

            {plansLoading && (
              <p className="text-sm text-foreground-muted">
                در حال بارگذاری طرح‌ها…
              </p>
            )}
            {plansError && (
              <p className="text-sm text-error">خطا در دریافت طرح‌ها</p>
            )}
            {!plansLoading && !plansError && displayPlans.length === 0 && (
              <p className="text-sm text-foreground-muted">طرحی یافت نشد.</p>
            )}

            <div className="flex flex-col gap-3">
              {displayPlans.map((plan) => {
                const selected = selectedPlan?.id === plan.id;
                const price = effectivePlanPrice(plan);
                const hasCampaign =
                  typeof plan.campaignPrice === "number" &&
                  plan.campaignPrice < plan.price;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => selectPlan(plan.id)}
                    className={cn(
                      "flex flex-col gap-1 rounded-[20px] px-4 py-4 text-right transition",
                      selected
                        ? "bg-primary/15 ring-1 ring-primary"
                        : "bg-surface-tertiary"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[15px] font-bold text-foreground">
                        {plan.name} · {plan.durationMonths} ماهه
                      </span>
                      <span className="text-sm">
                        {hasCampaign && (
                          <span className="me-2 text-xs text-error line-through">
                            {formatToman(plan.price)}
                          </span>
                        )}
                        <span className="font-bold text-foreground">
                          {formatToman(price)} تومان
                        </span>
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-foreground-muted">
                        {plan.description}
                      </p>
                    )}
                    {hasCampaign && plan.campaignName && (
                      <p className="mt-1 text-xs text-primary">
                        {plan.campaignName}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Payment methods (decorative / disabled) */}
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              روش‌های پرداخت
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex cursor-not-allowed items-center gap-3 rounded-[16px] bg-surface-tertiary p-4 opacity-60">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
                  <CreditCardIcon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-foreground">
                    پرداخت آنلاین با کارت بانکی
                  </p>
                  <p className="mt-0.5 text-[12px] text-foreground-muted">
                    پرداخت امن از طریق درگاه بانکی
                  </p>
                </div>
              </div>
              <div className="flex cursor-not-allowed items-center gap-3 rounded-[16px] bg-surface-tertiary p-4 opacity-60">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
                  <ReceiptIcon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-foreground">
                    پرداخت کارت به کارت
                  </p>
                  <p className="mt-0.5 text-[12px] text-foreground-muted">
                    ارسال رسید واریز برای بررسی توسط پشتیبانی
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Discount code accordion */}
          <section className="rounded-[20px] bg-surface-tertiary p-4">
            <button
              type="button"
              onClick={() => setDiscountOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 text-right"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <PercentIcon size={18} className="text-primary" />
                کد تخفیف دارید؟
              </span>
              {discountOpen ? (
                <CaretUpIcon size={18} className="text-foreground-muted" />
              ) : (
                <CaretDownIcon size={18} className="text-foreground-muted" />
              )}
            </button>
            {discountOpen && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => handlePromoCodeChange(e.target.value)}
                    placeholder="کد تخفیف را وارد کنید"
                    className="flex-1 rounded-2xl bg-background-secondary px-4 py-3 text-foreground outline-none"
                  />
                  <button
                    type="button"
                    disabled={previewPending || !trimmedPromoCode}
                    onClick={handleApplyPromoCode}
                    className="shrink-0 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-40"
                  >
                    {previewPending ? "در حال بررسی…" : "ثبت"}
                  </button>
                </div>
                {promoError && (
                  <p className="text-xs text-error">{promoError}</p>
                )}
                {appliedPromoMatchesSelection && appliedPromo && (
                  <p className="text-xs text-primary">
                    کد تخفیف معتبر است
                    {appliedPromo.result.campaignName
                      ? ` (${appliedPromo.result.campaignName})`
                      : ""}
                    — {formatToman(appliedPromo.result.discountAmount)} تومان
                    تخفیف اعمال شد.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Consultation (decorative / disabled) */}
          <section className="flex items-center gap-3 rounded-[20px] bg-surface-tertiary p-4 opacity-60">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-tertiary">
              <HandshakeIcon size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-foreground">
                برای خرید نیاز به مشاوره دارید؟
              </p>
              <p className="mt-0.5 text-[12px] text-foreground-muted">
                این بخش به‌زودی فعال می‌شود.
              </p>
            </div>
          </section>

          {/* FAQ accordion */}
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              در مورد خرید اشتراک سوالی دارید؟
            </h2>
            <div className="flex flex-col gap-2">
              {FAQ_ITEMS.map((item, i) => {
                const open = openFaqIndex === i;
                return (
                  <div
                    key={item.question}
                    className="rounded-[16px] bg-surface-tertiary p-4"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(open ? null : i)}
                      className="flex w-full items-center justify-between gap-3 text-right"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        {open && (
                          <CheckCircleIcon
                            size={16}
                            weight="fill"
                            className="shrink-0 text-primary"
                          />
                        )}
                        {item.question}
                      </span>
                      {open ? (
                        <CaretUpIcon
                          size={16}
                          className="shrink-0 text-foreground-muted"
                        />
                      ) : (
                        <CaretDownIcon
                          size={16}
                          className="shrink-0 text-foreground-muted"
                        />
                      )}
                    </button>
                    {open && (
                      <p className="mt-3 text-xs leading-6 text-foreground-muted">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {error && (
            <p className="rounded-2xl bg-error/10 px-4 py-3 text-xs text-error">
              {error}
            </p>
          )}
        </>
      )}

      {invoiceId == null && (
        <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center bg-background/95 p-4 backdrop-blur">
          <div className="flex w-full max-w-[600px] flex-col gap-2">
            <p className="text-center text-xs text-foreground-muted">
              مبلغ قابل پرداخت:{" "}
              <span className="font-bold text-foreground">
                {totalPrice != null ? `${formatToman(totalPrice)} تومان` : "—"}
              </span>
            </p>
            <button
              type="button"
              disabled={checkoutPending || !selectedPlan}
              onClick={handlePurchase}
              className="rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              {checkoutPending
                ? "در حال ثبت…"
                : isLoggedIn
                  ? "خرید اشتراک"
                  : "ورود و خرید اشتراک"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
