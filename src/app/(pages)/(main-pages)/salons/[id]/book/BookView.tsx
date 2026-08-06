"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryBranchServices } from "@/services/domains/salons/hooks/useQueryBranchServices";
import { useQueryAvailableDates } from "@/services/domains/salons/hooks/useQueryAvailableDates";
import { useQueryStaffAvailability } from "@/services/domains/salons/hooks/useQueryStaffAvailability";
import { useQueryCalculatePrice } from "@/services/domains/salons/hooks/useQueryCalculatePrice";
import { useQuerySalonAvailableSlots } from "@/services/domains/salons/hooks/useQuerySalonAvailableSlots";
import { useQuerySalonOfferings } from "@/services/domains/salon-offering/hooks/useQuerySalonOfferings";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import { useCreateBooking } from "@/services/domains/booking/hooks/useCreateBooking";
import { resolveNumericSalonId } from "@/services/domains/salons/types/salon.type";
import {
  IBranchService,
  ISalonBranch,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";
import {
  enrichBranchServices,
  getApiErrorMessage,
  resolveStaffNumericId,
  toBookingStartTime,
} from "@/services/domains/booking/utils/booking-mappers";
import { formatToman } from "@/shared/utils/salonDisplay";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useMutateSwitchContext } from "@/services/domains/auth/hooks/useMutateSwitchContext";
import { cn } from "@/shared/utils/className";
import BookProgressHeader from "./components/BookProgressHeader";
import BookStickyCta from "./components/BookStickyCta";
import BookBranchStep from "./components/BookBranchStep";
import BookServicesStep from "./components/BookServicesStep";
import BookDateStep from "./components/BookDateStep";
import BookStaffStep from "./components/BookStaffStep";
import BookPriceStep from "./components/BookPriceStep";
import {
  clearBookDraft,
  loadBookDraft,
  saveBookDraft,
} from "./utils/bookDraft";

function formatFaDate(date: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("fa-IR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return date;
  }
}

export default function BookView() {
  const params = useParams<{ id: string }>();
  const salonPublicId = params?.id;
  const router = useRouter();

  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const setRedirectUrl = useTokenStore((s) => s.setRedirectUrl);
  const activeSalonContextId = useSalonContextStore((s) => s.salonId);
  const { mutateAsync: switchContext } = useMutateSwitchContext();
  const { mutateAsync: createBooking, isPending: isCreating } =
    useCreateBooking();

  const { data: salonRes, isLoading: salonLoading } =
    useQuerySalonById(salonPublicId);
  const salon = salonRes?.data;
  const numericSalonId = salon ? resolveNumericSalonId(salon) : undefined;

  const branches: ISalonBranch[] = salon?.branches ?? [];

  const [step, setStep] = useState(1);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [branchName, setBranchName] = useState("");
  const [selectedServices, setSelectedServices] = useState<IBranchService[]>(
    []
  );
  const [date, setDate] = useState<string | null>(null);
  const [staff, setStaff] = useState<IStaffAvailability | null>(null);
  const [useFirstAvailable, setUseFirstAvailable] = useState(false);
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const [slotEndTime, setSlotEndTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<number | null>(null);

  const draftReadyRef = useRef(false);
  const skipBranchHandledRef = useRef(false);

  // Rehydrate draft once per salon
  useEffect(() => {
    if (!salonPublicId || draftReadyRef.current) return;
    const draft = loadBookDraft(salonPublicId);
    draftReadyRef.current = true;
    if (!draft) return;

    setStep(draft.step);
    setBranchId(draft.branchId);
    setBranchName(draft.branchName);
    setSelectedServices(draft.selectedServices ?? []);
    setDate(draft.date);
    setStaff(draft.staff);
    setUseFirstAvailable(Boolean(draft.useFirstAvailable));
    setSlotTime(draft.slotTime);
    setSlotEndTime(draft.slotEndTime);
    setNotes(draft.notes ?? "");
    if (draft.branchId != null || draft.step > 1) {
      skipBranchHandledRef.current = true;
    }
  }, [salonPublicId]);

  // Persist draft
  useEffect(() => {
    if (!salonPublicId || !draftReadyRef.current || createdId != null) return;
    saveBookDraft(salonPublicId, {
      step,
      branchId,
      branchName,
      selectedServices,
      date,
      staff,
      useFirstAvailable,
      slotTime,
      slotEndTime,
      notes,
    });
  }, [
    salonPublicId,
    step,
    branchId,
    branchName,
    selectedServices,
    date,
    staff,
    useFirstAvailable,
    slotTime,
    slotEndTime,
    notes,
    createdId,
  ]);

  // Auto-select + auto-skip single branch
  useEffect(() => {
    if (!draftReadyRef.current || skipBranchHandledRef.current) return;
    if (branches.length !== 1) {
      if (branches.length > 1) skipBranchHandledRef.current = true;
      return;
    }

    const only = branches[0];
    skipBranchHandledRef.current = true;
    setBranchId(only.id);
    setBranchName(only.name);
    setStep((s) => (s === 1 ? 2 : s));
  }, [branches]);

  const { data: branchServicesRes, isLoading: servicesLoading } =
    useQueryBranchServices(branchId);

  const { data: offeringsRes } = useQuerySalonOfferings(
    numericSalonId ?? 0
  );

  const enrichedServices = useMemo(() => {
    const raw = branchServicesRes?.data ?? [];
    const offerings = offeringsRes?.data ?? [];
    return enrichBranchServices(raw, offerings);
  }, [branchServicesRes?.data, offeringsRes?.data]);

  const serviceTypeIds = useMemo(
    () =>
      selectedServices
        .map((s) => s.serviceTypeId)
        .filter((id): id is number => typeof id === "number" && id > 0),
    [selectedServices]
  );

  const offeringIds = useMemo(
    () =>
      selectedServices
        .map((s) => s.offeringId)
        .filter((id): id is number => typeof id === "number" && id > 0),
    [selectedServices]
  );

  const primaryServiceTypeId = serviceTypeIds[0] ?? null;

  const { data: datesRes, isLoading: datesLoading } = useQueryAvailableDates(
    branchId,
    primaryServiceTypeId
  );

  const { data: staffRes, isLoading: staffLoading } =
    useQueryStaffAvailability(branchId, primaryServiceTypeId, date);

  const { data: priceRes, isLoading: priceLoading, isError: priceError, refetch: refetchPrice } =
    useQueryCalculatePrice(
    branchId,
    serviceTypeIds,
    useFirstAvailable ? null : staff?.staffPublicId,
    step >= 5
  );

  const { data: slotsRes, isLoading: slotsLoading } =
    useQuerySalonAvailableSlots({
      branchId: branchId ?? undefined,
      date: date ?? undefined,
      serviceTypeIds,
      staffProfilePublicId: useFirstAvailable
        ? null
        : staff?.staffPublicId,
      enabled: step >= 6,
    });

  const { data: staffProfilesRes } = useQueryStaffForOfferings(
    salonPublicId,
    offeringIds,
    { enabled: offeringIds.length > 0 && step >= 4 }
  );

  const price = priceRes?.data;
  const dates = datesRes?.data ?? [];
  const staffList = staffRes?.data ?? [];
  const slots = slotsRes?.data?.slots ?? [];
  const staffProfiles = staffProfilesRes?.data ?? [];

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return branchId != null;
      case 2:
        return (
          selectedServices.length > 0 &&
          selectedServices.every(
            (s) => typeof s.serviceTypeId === "number" && s.serviceTypeId > 0
          )
        );
      case 3:
        return !!date;
      case 4:
        return useFirstAvailable || !!staff;
      case 5:
        return !!price;
      case 6:
        return !!slotTime;
      default:
        return true;
    }
  };

  const goNext = () => {
    setError("");
    if (step === 2) {
      const missingType = selectedServices.some(
        (s) => typeof s.serviceTypeId !== "number"
      );
      const missingOffering = selectedServices.some(
        (s) => typeof s.offeringId !== "number"
      );
      if (missingType) {
        setError(
          "شناسه نوع سرویس برای تاریخ‌ها در دسترس نیست. لطفاً بعداً دوباره تلاش کنید."
        );
        return;
      }
      if (missingOffering) {
        setError(
          "شناسه offering برای ثبت نهایی پیدا نشد. ممکن است کاتالوگ سالن ناقص باشد."
        );
        return;
      }
    }
    if (!canGoNext()) {
      setError("لطفاً این مرحله را تکمیل کنید.");
      return;
    }
    setStep((s) => Math.min(7, s + 1));
  };

  const goBack = () => {
    setError("");
    if (step === 1) {
      router.push(RouteAddress.SALONS.DETAILS(salonPublicId!));
      return;
    }
    // If single-branch was auto-skipped, back from services goes to salon detail
    if (step === 2 && branches.length === 1) {
      router.push(RouteAddress.SALONS.DETAILS(salonPublicId!));
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const selectBranch = (branch: ISalonBranch) => {
    setBranchId(branch.id);
    setBranchName(branch.name);
    setSelectedServices([]);
    setDate(null);
    setStaff(null);
    setUseFirstAvailable(false);
    setSlotTime(null);
    setSlotEndTime(null);
  };

  const toggleService = (svc: IBranchService) => {
    setSelectedServices((prev) => {
      const exists = prev.some(
        (s) => s.servicePublicId === svc.servicePublicId
      );
      if (exists) {
        return prev.filter((s) => s.servicePublicId !== svc.servicePublicId);
      }
      return [...prev, svc];
    });
    setDate(null);
    setStaff(null);
    setUseFirstAvailable(false);
    setSlotTime(null);
    setSlotEndTime(null);
  };

  const ensureCustomerContext = async () => {
    if (activeSalonContextId != null) {
      await switchContext({ salonId: null, branchId: null });
    }
  };

  const persistDraftNow = () => {
    if (!salonPublicId) return;
    saveBookDraft(salonPublicId, {
      step,
      branchId,
      branchName,
      selectedServices,
      date,
      staff,
      useFirstAvailable,
      slotTime,
      slotEndTime,
      notes,
    });
  };

  const handleConfirm = async () => {
    setError("");

    if (!isLoggedIn) {
      persistDraftNow();
      setRedirectUrl(RouteAddress.SALONS.BOOK(salonPublicId!));
      router.push(RouteAddress.AUTH.LOGIN.BASE);
      return;
    }

    if (
      numericSalonId == null ||
      branchId == null ||
      !date ||
      !slotTime ||
      (!staff && !useFirstAvailable)
    ) {
      setError("اطلاعات رزرو ناقص است.");
      return;
    }

    if (useFirstAvailable && !staff) {
      setError(
        "برای «اولین زمان آزاد» هنوز پرسنل از اسلات مشخص نشده است. لطفاً پرسنل را انتخاب کنید یا بعداً دوباره تلاش کنید."
      );
      return;
    }

    if (!staff) {
      setError("اطلاعات رزرو ناقص است.");
      return;
    }

    const staffId = resolveStaffNumericId(staff, staffProfiles);
    if (!staffId) {
      setError(
        "شناسه عددی پرسنل یافت نشد. پرسنل دیگری را انتخاب کنید یا بعداً تلاش کنید."
      );
      return;
    }

    if (
      offeringIds.length === 0 ||
      offeringIds.length !== selectedServices.length
    ) {
      setError("شناسه offering برای برخی خدمات یافت نشد.");
      return;
    }

    try {
      await ensureCustomerContext();
      const res = await createBooking({
        salonId: numericSalonId,
        branchId,
        startTime: toBookingStartTime(date, slotTime),
        notes: notes.trim() || null,
        services: offeringIds.map((offeringId) => ({
          offeringId,
          staffId,
        })),
      });
      clearBookDraft(salonPublicId);
      setCreatedId(res.data);
      setStep(7);
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          "ثبت نوبت ناموفق بود. موجودی کیف‌پول یا آزاد بودن اسلات را بررسی کنید."
        )
      );
    }
  };

  if (salonLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground-muted">
        در حال بارگذاری…
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-safe-area text-center text-sm text-error">
        سالن یافت نشد.
      </div>
    );
  }

  if (numericSalonId == null) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-safe-area text-center">
        <p className="text-sm text-error">
          شناسه عددی سالن برای ثبت رزرو در پاسخ جزئیات موجود نیست.
        </p>
        <Link
          href={RouteAddress.SALONS.DETAILS(salon.id)}
          className="text-sm text-primary"
        >
          بازگشت به جزئیات
        </Link>
      </div>
    );
  }

  if (createdId != null && step === 7) {
    return (
      <div className="flex flex-col gap-6 px-safe-area pb-24 pt-4">
        <TopNavigation>رزرو موفق</TopNavigation>
        <div className="rounded-[24px] bg-surface p-6 text-center">
          <p className="text-lg font-bold text-foreground">نوبت ثبت شد</p>
          <p className="mt-2 text-sm text-foreground-muted">
            شماره نوبت: {createdId}
          </p>
          <Link
            href={RouteAddress.RESERVATION.DETAILS(createdId)}
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            مشاهده نوبت
          </Link>
          <div className="mt-3">
            <Link
              href={RouteAddress.RESERVATION.BASE}
              className="text-sm text-foreground-muted"
            >
              همه نوبت‌ها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const showBranchChip = Boolean(branchName) && step > 1;

  return (
    <div className="flex flex-col pb-28">
      <TopNavigation>رزرو نوبت</TopNavigation>
      {salon.name ? (
        <p className="-mt-1 px-safe-area text-xs text-foreground-muted">
          {salon.name}
        </p>
      ) : null}

      <BookProgressHeader
        step={step}
        branchChip={showBranchChip ? branchName : null}
      />

      <div className="mt-4 flex flex-col gap-4 px-safe-area">
        {error && (
          <p className="rounded-2xl bg-error/10 px-4 py-3 text-xs text-error">
            {error}
          </p>
        )}

        {step === 1 && (
          <BookBranchStep
            branches={branches}
            selectedBranchId={branchId}
            onSelect={selectBranch}
          />
        )}

        {step === 2 && (
          <BookServicesStep
            services={enrichedServices}
            selectedServices={selectedServices}
            isLoading={servicesLoading}
            onToggle={toggleService}
          />
        )}

        {step === 3 && (
          <BookDateStep
            dates={dates}
            selectedDate={date}
            isLoading={datesLoading}
            onSelect={(nextDate) => {
              setDate(nextDate);
              setStaff(null);
              setUseFirstAvailable(false);
              setSlotTime(null);
              setSlotEndTime(null);
            }}
            onChangeServices={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <BookStaffStep
            staffList={staffList}
            selectedStaffPublicId={staff?.staffPublicId ?? null}
            useFirstAvailable={useFirstAvailable}
            isLoading={staffLoading}
            onSelectFirstAvailable={() => {
              setUseFirstAvailable(true);
              setStaff(null);
              setSlotTime(null);
              setSlotEndTime(null);
            }}
            onSelectStaff={(s) => {
              setUseFirstAvailable(false);
              setStaff(s);
              setSlotTime(null);
              setSlotEndTime(null);
            }}
            onChangeDate={() => setStep(3)}
          />
        )}

        {step === 5 && (
          <BookPriceStep
            price={price}
            isLoading={priceLoading}
            isError={priceError}
            onRetry={() => {
              void refetchPrice();
            }}
          />
        )}

        {step === 6 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">انتخاب ساعت</h2>
            {slotsLoading && (
              <p className="text-sm text-foreground-muted">در حال بارگذاری…</p>
            )}
            {!slotsLoading && slots.length === 0 && (
              <p className="text-sm text-foreground-muted">
                اسلات آزادی برای این روز یافت نشد.
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={`${slot.time}-${slot.endTime}`}
                  type="button"
                  onClick={() => {
                    setSlotTime(slot.time);
                    setSlotEndTime(slot.endTime);
                  }}
                  className={cn(
                    "rounded-2xl py-3 text-sm font-medium transition",
                    slotTime === slot.time
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground"
                  )}
                >
                  {slot.time.slice(0, 5)}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 7 && createdId == null && (
          <section className="flex flex-col gap-4">
            <h2 className="text-base font-bold text-foreground">تأیید رزرو</h2>
            <div className="rounded-[24px] bg-surface p-5 text-sm">
              <p>
                <span className="text-foreground-muted">سالن: </span>
                {salon.name}
              </p>
              <p className="mt-2">
                <span className="text-foreground-muted">شعبه: </span>
                {branchName}
              </p>
              <p className="mt-2">
                <span className="text-foreground-muted">خدمات: </span>
                {selectedServices.map((s) => s.name).join("، ")}
              </p>
              <p className="mt-2">
                <span className="text-foreground-muted">پرسنل: </span>
                {useFirstAvailable
                  ? "اولین زمان آزاد"
                  : staff?.fullName}
              </p>
              <p className="mt-2">
                <span className="text-foreground-muted">زمان: </span>
                {date && formatFaDate(date)} — {slotTime?.slice(0, 5)}
                {slotEndTime ? ` تا ${slotEndTime.slice(0, 5)}` : ""}
              </p>
              {price && (
                <>
                  <div className="my-3 h-px bg-border" />
                  <p>
                    پرداخت الان:{" "}
                    <strong>{formatToman(price.amountDueNow)} تومان</strong>
                  </p>
                  <p className="mt-1">
                    باقی‌مانده:{" "}
                    <strong>
                      {formatToman(price.remainingAfterDeposit)} تومان
                    </strong>
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    لغو رایگان تا {price.freeCancellationWindowHours} ساعت قبل
                  </p>
                </>
              )}
            </div>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground-muted">یادداشت (اختیاری)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="rounded-2xl border border-input-border bg-input px-4 py-3 text-foreground outline-none"
                placeholder="توضیحات برای سالن…"
              />
            </label>
            {!isLoggedIn && (
              <p className="text-xs text-foreground-muted">
                برای ثبت نهایی باید وارد حساب کاربری شوید.
              </p>
            )}
          </section>
        )}
      </div>

      <BookStickyCta
        step={step}
        canContinue={canGoNext()}
        isCreating={isCreating}
        isLoggedIn={isLoggedIn}
        onBack={goBack}
        onContinue={goNext}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
