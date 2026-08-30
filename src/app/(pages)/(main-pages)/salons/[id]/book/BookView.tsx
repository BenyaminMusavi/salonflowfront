"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import TopNavigation from "@/shared/components/composites/layout/top-navigation/TopNavigation";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryBranchServices } from "@/services/domains/salons/hooks/useQueryBranchServices";
import { useQueryAvailableDates } from "@/services/domains/salons/hooks/useQueryAvailableDates";
import { useQueryStaffAvailability } from "@/services/domains/salons/hooks/useQueryStaffAvailability";
import { useQueryCalculatePrice } from "@/services/domains/salons/hooks/useQueryCalculatePrice";
import { useQuerySalonAvailableSlots } from "@/services/domains/salons/hooks/useQuerySalonAvailableSlots";
import { useQueryStaffForOfferings } from "@/services/domains/staff-profile/hooks/useQueryStaffForOfferings";
import {
  IBranchService,
  ISalonBranch,
  ISalonBrowseSlot,
  IStaffAvailability,
} from "@/services/domains/salons/types/booking-browse.type";
import BookProgressHeader from "./components/BookProgressHeader";
import BookStickyCta from "./components/BookStickyCta";
import BookBranchStep from "./components/BookBranchStep";
import BookServicesStep from "./components/BookServicesStep";
import BookDateStep from "./components/BookDateStep";
import BookStaffStep from "./components/BookStaffStep";
import BookPriceStep from "./components/BookPriceStep";
import BookSlotsStep from "./components/BookSlotsStep";
import BookConfirmStep from "./components/BookConfirmStep";
import BookSuccessPanel from "./components/BookSuccessPanel";
import { useBookDraftPersistence } from "./hooks/useBookDraftPersistence";
import { useBookWizardNavigation } from "./hooks/useBookWizardNavigation";
import { useBookConfirm } from "./hooks/useBookConfirm";
import { resolveStaffFromSlotResponse } from "./utils/resolveSlotStaff";

export default function BookView() {
  const params = useParams<{ id: string }>();
  const salonPublicId = params?.id;

  const { data: salonRes, isLoading: salonLoading } =
    useQuerySalonById(salonPublicId);
  const salon = salonRes?.data;

  const branches: ISalonBranch[] = useMemo(
    () =>
      (salon?.branches ?? []).filter(
        (b): b is ISalonBranch =>
          typeof b.publicId === "string" && b.publicId.length > 0
      ),
    [salon?.branches]
  );

  const [step, setStep] = useState(1);
  const [branchPublicId, setBranchPublicId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState("");
  const [selectedServices, setSelectedServices] = useState<IBranchService[]>(
    []
  );
  const [date, setDate] = useState<string | null>(null);
  const [staff, setStaff] = useState<IStaffAvailability | null>(null);
  const [useFirstAvailable, setUseFirstAvailable] = useState(false);
  const [resolvedStaffPublicId, setResolvedStaffPublicId] = useState<
    string | null
  >(null);
  const [resolvedStaffName, setResolvedStaffName] = useState<string | null>(
    null
  );
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const [slotEndTime, setSlotEndTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Shared between useBookDraftPersistence's rehydrate effect and
  // useBookWizardNavigation's auto-skip-single-branch effect.
  const skipBranchHandledRef = useRef(false);

  const clearSlotAndStaffResolution = () => {
    setSlotTime(null);
    setSlotEndTime(null);
    setResolvedStaffPublicId(null);
    setResolvedStaffName(null);
  };

  const { data: branchServicesRes, isLoading: servicesLoading } =
    useQueryBranchServices(branchPublicId);

  const branchServices = useMemo(() => {
    const raw = branchServicesRes?.data ?? [];
    return raw.filter(
      (s) =>
        typeof s.offeringPublicId === "string" &&
        s.offeringPublicId.length > 0 &&
        typeof s.servicePublicId === "string" &&
        s.servicePublicId.length > 0
    );
  }, [branchServicesRes?.data]);

  const offeringPublicIds = useMemo(
    () => selectedServices.map((s) => s.offeringPublicId).filter(Boolean),
    [selectedServices]
  );

  const serviceTypePublicIds = useMemo(
    () => selectedServices.map((s) => s.servicePublicId).filter(Boolean),
    [selectedServices]
  );

  const primaryServiceTypePublicId = serviceTypePublicIds[0] ?? null;

  const { data: datesRes, isLoading: datesLoading } = useQueryAvailableDates(
    branchPublicId,
    primaryServiceTypePublicId
  );

  const { data: staffRes, isLoading: staffLoading } = useQueryStaffAvailability(
    branchPublicId,
    primaryServiceTypePublicId,
    date
  );

  const {
    data: priceRes,
    isLoading: priceLoading,
    isError: priceError,
    refetch: refetchPrice,
  } = useQueryCalculatePrice(
    branchPublicId,
    serviceTypePublicIds,
    useFirstAvailable ? null : staff?.staffPublicId,
    step >= 5
  );

  const { data: slotsRes, isLoading: slotsLoading } =
    useQuerySalonAvailableSlots({
      branchPublicId: branchPublicId ?? undefined,
      date: date ?? undefined,
      serviceTypePublicIds,
      staffProfilePublicId: useFirstAvailable ? null : staff?.staffPublicId,
      enabled: step >= 6,
    });

  const { data: staffProfilesRes } = useQueryStaffForOfferings(
    salonPublicId,
    offeringPublicIds,
    { enabled: offeringPublicIds.length > 0 && step >= 4 }
  );

  const price = priceRes?.data;
  const dates = datesRes?.data ?? [];
  const staffList = staffRes?.data ?? [];
  const slotsData = slotsRes?.data;
  const slots = slotsData?.slots ?? [];
  const staffProfiles = staffProfilesRes?.data ?? [];

  const staffLabel = useFirstAvailable
    ? resolvedStaffName
      ? `اولین زمان آزاد · ${resolvedStaffName}`
      : "اولین زمان آزاد"
    : staff?.fullName || resolvedStaffName || "—";

  const { draftReadyRef, persistDraftNow } = useBookDraftPersistence({
    salonPublicId,
    createdId,
    skipBranchHandledRef,
    step,
    branchPublicId,
    branchName,
    selectedServices,
    date,
    staff,
    useFirstAvailable,
    resolvedStaffPublicId,
    resolvedStaffName,
    slotTime,
    slotEndTime,
    notes,
    setStep,
    setBranchPublicId,
    setBranchName,
    setSelectedServices,
    setDate,
    setStaff,
    setUseFirstAvailable,
    setResolvedStaffPublicId,
    setResolvedStaffName,
    setSlotTime,
    setSlotEndTime,
    setNotes,
  });

  const { canGoNext, goNext, goBack } = useBookWizardNavigation({
    salonPublicId,
    branches,
    step,
    branchPublicId,
    selectedServices,
    date,
    staff,
    useFirstAvailable,
    price,
    slotTime,
    resolvedStaffPublicId,
    draftReadyRef,
    skipBranchHandledRef,
    setStep,
    setBranchPublicId,
    setBranchName,
    setError,
  });

  const { handleConfirm, isCreating, isLoggedIn } = useBookConfirm({
    salonPublicId,
    branchPublicId,
    date,
    slotTime,
    resolvedStaffPublicId,
    offeringPublicIds,
    selectedServices,
    notes,
    persistDraftNow,
    setError,
    setCreatedId,
    setStep,
  });

  const selectBranch = (branch: ISalonBranch) => {
    setBranchPublicId(branch.publicId);
    setBranchName(branch.name);
    setSelectedServices([]);
    setDate(null);
    setStaff(null);
    setUseFirstAvailable(false);
    clearSlotAndStaffResolution();
  };

  const toggleService = (svc: IBranchService) => {
    setSelectedServices((prev) => {
      const exists = prev.some(
        (s) => s.offeringPublicId === svc.offeringPublicId
      );
      if (exists) {
        return prev.filter((s) => s.offeringPublicId !== svc.offeringPublicId);
      }
      return [...prev, svc];
    });
    setDate(null);
    setStaff(null);
    setUseFirstAvailable(false);
    clearSlotAndStaffResolution();
  };

  const selectSlot = (slot: ISalonBrowseSlot) => {
    setSlotTime(slot.time);
    setSlotEndTime(slot.endTime);
    setError("");

    if (useFirstAvailable) {
      const resolved = resolveStaffFromSlotResponse({
        slot,
        slotsData,
        staffList,
        staffProfiles,
      });
      if (!resolved?.staffPublicId) {
        setResolvedStaffPublicId(null);
        setResolvedStaffName(null);
        setError(
          "پرسنل این ساعت از پاسخ سرور مشخص نشد. پرسنل مشخصی انتخاب کنید یا دوباره تلاش کنید."
        );
        return;
      }
      setResolvedStaffPublicId(resolved.staffPublicId);
      setResolvedStaffName(resolved.fullName);
      if (resolved.staff) setStaff(resolved.staff);
      return;
    }

    if (staff?.staffPublicId) {
      setResolvedStaffPublicId(staff.staffPublicId);
      setResolvedStaffName(staff.fullName);
      return;
    }

    setResolvedStaffPublicId(null);
    setResolvedStaffName(null);
    setError("شناسه پرسنل یافت نشد. پرسنل دیگری را انتخاب کنید.");
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

  if (createdId != null) {
    return (
      <BookSuccessPanel
        bookingId={createdId}
        salonId={salonPublicId ?? salon.id}
      />
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
            selectedBranchPublicId={branchPublicId}
            onSelect={selectBranch}
          />
        )}

        {step === 2 && (
          <BookServicesStep
            services={branchServices}
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
              clearSlotAndStaffResolution();
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
              clearSlotAndStaffResolution();
            }}
            onSelectStaff={(s) => {
              setUseFirstAvailable(false);
              setStaff(s);
              clearSlotAndStaffResolution();
              setResolvedStaffPublicId(s.staffPublicId);
              setResolvedStaffName(s.fullName);
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
          <BookSlotsStep
            slots={slots}
            selectedTime={slotTime}
            isLoading={slotsLoading}
            onSelect={selectSlot}
            onChangeDate={() => setStep(3)}
            onChangeStaff={() => setStep(4)}
          />
        )}

        {step === 7 && (
          <BookConfirmStep
            salonName={salon.name}
            branchName={branchName}
            services={selectedServices}
            date={date}
            slotTime={slotTime}
            slotEndTime={slotEndTime}
            staffLabel={staffLabel}
            price={price}
            notes={notes}
            onNotesChange={setNotes}
            isLoggedIn={isLoggedIn}
          />
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
